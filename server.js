const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = 'https://discord.com/api/v9';
const FALLBACK_BUILD_NUMBER = 504649;
const BUILD_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const SUPPORTED_TASKS = [
  'WATCH_VIDEO',
  'PLAY_ON_DESKTOP',
  'STREAM_ON_DESKTOP',
  'PLAY_ACTIVITY',
  'WATCH_VIDEO_ON_MOBILE',
];

const SPEED_PROFILES = {
  turbo: {
    label: 'Safe Turbo',
    parallel: true,
    videoSpeed: 9,
    videoIntervalMs: 850,
    maxFuture: 10,
    heartbeatIntervalMs: 16500,
    heartbeatJitterMs: 1500,
    enrollDelayMs: 900,
  },
  standard: {
    label: 'Standard',
    parallel: true,
    videoSpeed: 7,
    videoIntervalMs: 1000,
    maxFuture: 10,
    heartbeatIntervalMs: 20000,
    heartbeatJitterMs: 500,
    enrollDelayMs: 3000,
  },
  safe: {
    label: 'Ultra-Safe',
    parallel: false,
    videoSpeed: 5,
    videoIntervalMs: 1200,
    maxFuture: 9,
    heartbeatIntervalMs: 25000,
    heartbeatJitterMs: 2000,
    enrollDelayMs: 3500,
  },
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9175 Chrome/128.0.6613.186 Electron/32.2.7 Safari/537.36';

let cachedBuildNumber = {
  value: FALLBACK_BUILD_NUMBER,
  fetchedAt: 0,
};

// In-memory ephemeral sessions (never written to disk)
const sessions = new Map();

app.use(express.json({ limit: '64kb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error('ABORTED'));
    const timer = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(new Error('ABORTED'));
        },
        { once: true }
      );
    }
  });

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function fetchLatestBuildNumber() {
  const now = Date.now();
  if (now - cachedBuildNumber.fetchedAt < BUILD_CACHE_TTL_MS && cachedBuildNumber.fetchedAt > 0) {
    return cachedBuildNumber.value;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://discord.com/app', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return FALLBACK_BUILD_NUMBER;
    const html = await res.text();
    const matches = [...html.matchAll(/\/assets\/([a-f0-9]+)\.js/g)].map((m) => m[1]);
    const candidates = matches.slice(-5);

    for (const hash of candidates) {
      try {
        const ac = new AbortController();
        const at = setTimeout(() => ac.abort(), 6000);
        const jsRes = await fetch(`https://discord.com/assets/${hash}.js`, {
          headers: { 'User-Agent': USER_AGENT },
          signal: ac.signal,
        });
        clearTimeout(at);
        if (!jsRes.ok) continue;
        const jsText = await jsRes.text();
        const bnMatch = jsText.match(/buildNumber["\s:]+["\s]*(\d{5,7})/);
        if (bnMatch) {
          const bn = parseInt(bnMatch[1], 10);
          cachedBuildNumber = { value: bn, fetchedAt: Date.now() };
          return bn;
        }
      } catch {
        continue;
      }
    }
  } catch {
    // Fallback silently
  }

  cachedBuildNumber = { value: FALLBACK_BUILD_NUMBER, fetchedAt: Date.now() };
  return FALLBACK_BUILD_NUMBER;
}

function makeSuperProperties(buildNumber) {
  const payload = {
    os: 'Windows',
    browser: 'Discord Client',
    release_channel: 'stable',
    client_version: '1.0.9175',
    os_version: '10.0.26100',
    os_arch: 'x64',
    app_arch: 'x64',
    system_locale: 'en-US',
    browser_user_agent: USER_AGENT,
    browser_version: '32.2.7',
    client_build_number: buildNumber,
    native_build_number: 59498,
    client_event_source: null,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function buildDiscordHeaders(token, buildNumber) {
  return {
    Authorization: token,
    'Content-Type': 'application/json',
    Accept: '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent': USER_AGENT,
    'X-Super-Properties': makeSuperProperties(buildNumber),
    'X-Discord-Locale': 'en-US',
    'X-Discord-Timezone': 'Asia/Ho_Chi_Minh',
    Origin: 'https://discord.com',
    Referer: 'https://discord.com/channels/@me',
  };
}

async function discordRequest(session, method, endpoint, body = null, signal = null) {
  const headers = buildDiscordHeaders(session.token, session.buildNumber);
  const options = {
    method,
    headers,
    signal: signal || undefined,
  };
  if (body !== null) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, ok: res.ok, data: json, raw: text };
}

// ─── Quest Parsers (camelCase & snake_case) ──────────────────────────────────

function pick(obj, ...keys) {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

function getTaskConfig(quest) {
  const cfg = quest?.config || {};
  return pick(cfg, 'taskConfig', 'task_config', 'taskConfigV2', 'task_config_v2') || null;
}

function getQuestName(quest) {
  const cfg = quest?.config || {};
  const msgs = cfg.messages || {};
  const name = pick(msgs, 'questName', 'quest_name');
  if (name) return String(name).trim();
  const game = pick(msgs, 'gameTitle', 'game_title');
  if (game) return String(game).trim();
  if (cfg.application?.name) return String(cfg.application.name).trim();
  return `Quest#${quest?.id || '?'}`;
}

function getExpiresAt(quest) {
  return pick(quest?.config || {}, 'expiresAt', 'expires_at') || null;
}

function getUserStatus(quest) {
  const us = pick(quest, 'userStatus', 'user_status');
  return us && typeof us === 'object' ? us : {};
}

function getTaskType(quest) {
  const tc = getTaskConfig(quest);
  if (!tc || !tc.tasks) return null;
  for (const t of SUPPORTED_TASKS) {
    if (tc.tasks[t] !== undefined && tc.tasks[t] !== null) return t;
  }
  return null;
}

function isCompletable(quest) {
  const expires = getExpiresAt(quest);
  if (expires) {
    const expMs = Date.parse(expires);
    if (!Number.isNaN(expMs) && expMs <= Date.now()) return false;
  }
  return getTaskType(quest) !== null;
}

function isEnrolled(quest) {
  const us = getUserStatus(quest);
  return Boolean(pick(us, 'enrolledAt', 'enrolled_at'));
}

function isCompleted(quest) {
  const us = getUserStatus(quest);
  return Boolean(pick(us, 'completedAt', 'completed_at'));
}

function getSecondsNeeded(quest) {
  const tc = getTaskConfig(quest);
  const taskType = getTaskType(quest);
  if (!tc || !taskType) return 0;
  return tc.tasks[taskType]?.target || 0;
}

function getSecondsDone(quest) {
  const taskType = getTaskType(quest);
  if (!taskType) return 0;
  const us = getUserStatus(quest);
  const progress = us.progress || {};
  return progress[taskType]?.value || 0;
}

function getEnrolledAt(quest) {
  const us = getUserStatus(quest);
  return pick(us, 'enrolledAt', 'enrolled_at') || null;
}

function normalizeQuest(quest) {
  const taskType = getTaskType(quest);
  const needed = getSecondsNeeded(quest);
  const done = getSecondsDone(quest);
  const cfg = quest?.config || {};
  const msgs = cfg.messages || {};
  const rewards = cfg.rewardsConfig?.rewards || cfg.rewards_config?.rewards || [];
  const rewardLabel =
    rewards[0]?.messages?.name ||
    rewards[0]?.messages?.name_with_article ||
    pick(msgs, 'questName', 'quest_name') ||
    'Discord Reward';

  return {
    id: quest.id,
    name: getQuestName(quest),
    gameTitle: pick(msgs, 'gameTitle', 'game_title') || cfg.application?.name || '',
    reward: rewardLabel,
    taskType,
    completable: isCompletable(quest),
    enrolled: isEnrolled(quest),
    completed: isCompleted(quest),
    enrolledAt: getEnrolledAt(quest),
    expiresAt: getExpiresAt(quest),
    secondsNeeded: needed,
    secondsDone: Math.min(needed, Math.floor(done)),
    progressPct: needed > 0 ? Math.min(100, Math.round((done / needed) * 100)) : 0,
    trafficMetadataRaw: quest.traffic_metadata_raw || null,
    trafficMetadataSealed: quest.traffic_metadata_sealed || null,
  };
}

// ─── SSE Broadcast ───────────────────────────────────────────────────────────

function emitEvent(session, event, payload) {
  const line = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of session.sseClients) {
    try {
      client.write(line);
    } catch {
      session.sseClients.delete(client);
    }
  }
}

function pushLog(session, level, message, questId = null) {
  emitEvent(session, 'log', {
    ts: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
    level,
    message,
    questId,
  });
}

// ─── Quest Runner Engine ─────────────────────────────────────────────────────

async function enrollQuest(session, quest, signal) {
  const name = getQuestName(quest);
  const qid = quest.id;

  for (let attempt = 1; attempt <= 3; attempt++) {
    if (signal.aborted) return false;
    try {
      const r = await discordRequest(
        session,
        'POST',
        `/quests/${qid}/enroll`,
        {
          location: 11,
          is_targeted: false,
          metadata_raw: null,
          metadata_sealed: null,
          traffic_metadata_raw: quest.traffic_metadata_raw || null,
          traffic_metadata_sealed: quest.traffic_metadata_sealed || null,
        },
        signal
      );

      if (r.status === 429) {
        const retryAfter = (r.data?.retry_after || 5) + 1;
        pushLog(session, 'warn', `Rate limited khi nhận "${name}" (${attempt}/3) — chờ ${retryAfter}s`, qid);
        await sleep(retryAfter * 1000, signal);
        continue;
      }

      if (r.status === 200 || r.status === 201 || r.status === 204) {
        pushLog(session, 'ok', `Đã nhận quest: ${name}`, qid);
        return true;
      }

      pushLog(session, 'warn', `Không thể nhận "${name}" (HTTP ${r.status})`, qid);
      return false;
    } catch (err) {
      if (err.message === 'ABORTED') return false;
      pushLog(session, 'error', `Lỗi nhận "${name}": ${err.message}`, qid);
      return false;
    }
  }
  return false;
}

async function runVideoQuest(session, quest, profile, signal) {
  const qid = quest.id;
  const name = getQuestName(quest);
  const needed = getSecondsNeeded(quest);
  let done = getSecondsDone(quest);
  const enrolledStr = getEnrolledAt(quest);
  const enrolledTs = enrolledStr ? Date.parse(enrolledStr) / 1000 : Date.now() / 1000;

  pushLog(session, 'info', `Bắt đầu Video: ${name} (${Math.floor(done)}/${needed}s)`, qid);

  while (done < needed && !signal.aborted) {
    const nowSec = Date.now() / 1000;
    const maxAllowed = nowSec - enrolledTs + profile.maxFuture;
    const diff = maxAllowed - done;
    const step = Math.min(profile.videoSpeed, Math.max(1, Math.floor(diff)));
    const nextTs = Math.min(needed, done + step);

    if (diff >= 1) {
      try {
        const jitterFraction = nextTs < needed ? Math.random() * 0.45 : 0;
        const r = await discordRequest(
          session,
          'POST',
          `/quests/${qid}/video-progress`,
          { timestamp: Math.min(needed, nextTs + jitterFraction) },
          signal
        );

        if (r.status === 200) {
          done = nextTs;
          const pct = needed > 0 ? Math.min(100, Math.round((done / needed) * 100)) : 100;
          emitEvent(session, 'quest_progress', {
            id: qid,
            secondsDone: Math.floor(done),
            secondsNeeded: needed,
            progressPct: pct,
            completed: Boolean(r.data?.completed_at) || done >= needed,
          });

          if (r.data?.completed_at || done >= needed) {
            pushLog(session, 'ok', `Hoàn thành: ${name}`, qid);
            emitEvent(session, 'quest_completed', { id: qid, name });
            return;
          }
        } else if (r.status === 429) {
          const retryAfter = (r.data?.retry_after || 5) + 1;
          pushLog(session, 'warn', `[${name}] Rate limited — chờ ${retryAfter}s`, qid);
          await sleep(retryAfter * 1000, signal);
          continue;
        } else {
          pushLog(session, 'warn', `[${name}] Video progress HTTP ${r.status}`, qid);
        }
      } catch (err) {
        if (err.message === 'ABORTED') return;
        pushLog(session, 'error', `[${name}] Lỗi: ${err.message}`, qid);
      }
    }

    if (nextTs >= needed) break;
    await sleep(profile.videoIntervalMs, signal);
  }

  if (!signal.aborted) {
    try {
      await discordRequest(session, 'POST', `/quests/${qid}/video-progress`, { timestamp: needed }, signal);
      emitEvent(session, 'quest_progress', {
        id: qid,
        secondsDone: needed,
        secondsNeeded: needed,
        progressPct: 100,
        completed: true,
      });
      pushLog(session, 'ok', `Hoàn thành: ${name}`, qid);
      emitEvent(session, 'quest_completed', { id: qid, name });
    } catch {
      // ignore on abort
    }
  }
}

async function runHeartbeatQuest(session, quest, profile, signal) {
  const qid = quest.id;
  const name = getQuestName(quest);
  const taskType = getTaskType(quest);
  const needed = getSecondsNeeded(quest);
  let done = getSecondsDone(quest);
  const pid = randomInt(1000, 30000);
  const streamKey = taskType === 'PLAY_ACTIVITY' ? 'call:0:1' : `call:0:${pid}`;

  const remMin = Math.max(0, Math.ceil((needed - done) / 60));
  pushLog(session, 'info', `Bắt đầu ${taskType}: ${name} (~${remMin} phút còn lại)`, qid);

  while (done < needed && !signal.aborted) {
    try {
      const r = await discordRequest(
        session,
        'POST',
        `/quests/${qid}/heartbeat`,
        { stream_key: streamKey, terminal: false },
        signal
      );

      if (r.status === 200) {
        const pData = r.data?.progress;
        if (pData && pData[taskType]?.value !== undefined) {
          done = pData[taskType].value;
        }
        const pct = needed > 0 ? Math.min(100, Math.round((done / needed) * 100)) : 100;
        emitEvent(session, 'quest_progress', {
          id: qid,
          secondsDone: Math.floor(done),
          secondsNeeded: needed,
          progressPct: pct,
          completed: Boolean(r.data?.completed_at) || done >= needed,
        });

        pushLog(session, 'progress', `[${name}] ${Math.floor(done)}/${needed}s (${pct}%)`, qid);

        if (r.data?.completed_at || done >= needed) {
          await discordRequest(
            session,
            'POST',
            `/quests/${qid}/heartbeat`,
            { stream_key: streamKey, terminal: true }
          ).catch(() => {});
          pushLog(session, 'ok', `Hoàn thành: ${name}`, qid);
          emitEvent(session, 'quest_completed', { id: qid, name });
          return;
        }
      } else if (r.status === 429) {
        const retryAfter = (r.data?.retry_after || 10) + 1;
        pushLog(session, 'warn', `[${name}] Rate limited — chờ ${retryAfter}s`, qid);
        await sleep(retryAfter * 1000, signal);
        continue;
      } else {
        pushLog(session, 'warn', `[${name}] Heartbeat HTTP ${r.status}`, qid);
      }
    } catch (err) {
      if (err.message === 'ABORTED') break;
      pushLog(session, 'error', `[${name}] Lỗi heartbeat: ${err.message}`, qid);
    }

    const jitter = randomInt(-profile.heartbeatJitterMs, profile.heartbeatJitterMs);
    await sleep(Math.max(10000, profile.heartbeatIntervalMs + jitter), signal);
  }

  // Send terminal: true on stop/completion
  await discordRequest(
    session,
    'POST',
    `/quests/${qid}/heartbeat`,
    { stream_key: streamKey, terminal: true }
  ).catch(() => {});
}

async function startRunner(session, { speedMode = 'turbo', autoAccept = true, questIds = null }) {
  if (session.running) return;
  const profile = SPEED_PROFILES[speedMode] || SPEED_PROFILES.turbo;
  const abortController = new AbortController();
  session.running = true;
  session.abortController = abortController;
  session.speedMode = speedMode;

  emitEvent(session, 'runner_state', { running: true, speedMode });
  pushLog(session, 'info', `Khởi chạy engine chế độ ${profile.label} (${profile.parallel ? 'Song song' : 'Tuần tự'})`);

  try {
    let res = await discordRequest(session, 'GET', '/quests/@me', null, abortController.signal);
    if (res.status === 429) {
      const retryAfter = (res.data?.retry_after || 5) + 1;
      pushLog(session, 'warn', `Rate limited khi tải quests — chờ ${retryAfter}s`);
      await sleep(retryAfter * 1000, abortController.signal);
      res = await discordRequest(session, 'GET', '/quests/@me', null, abortController.signal);
    }

    if (!res.ok) {
      pushLog(session, 'error', `Không thể tải danh sách quest (HTTP ${res.status})`);
      return;
    }

    let quests = Array.isArray(res.data) ? res.data : res.data?.quests || [];

    if (autoAccept) {
      const unaccepted = quests.filter(
        (q) =>
          !isEnrolled(q) &&
          !isCompleted(q) &&
          isCompletable(q) &&
          (!questIds || questIds.includes(q.id))
      );

      if (unaccepted.length > 0) {
        pushLog(session, 'info', `Tìm thấy ${unaccepted.length} quest chưa nhận — đang auto-accept...`);
        for (const q of unaccepted) {
          if (abortController.signal.aborted) break;
          await enrollQuest(session, q, abortController.signal);
          await sleep(profile.enrollDelayMs, abortController.signal);
        }
        await sleep(1000, abortController.signal);
        const refreshed = await discordRequest(session, 'GET', '/quests/@me', null, abortController.signal);
        if (refreshed.ok) {
          quests = Array.isArray(refreshed.data) ? refreshed.data : refreshed.data?.quests || [];
        }
      }
    }

    const actionable = quests.filter(
      (q) =>
        isEnrolled(q) &&
        !isCompleted(q) &&
        isCompletable(q) &&
        (!questIds || questIds.includes(q.id))
    );

    if (actionable.length === 0) {
      pushLog(session, 'info', 'Không có quest khả dụng nào cần thực thi.');
      return;
    }

    pushLog(session, 'info', `Đang xử lý ${actionable.length} quest...`);

    const executeOne = async (q, index) => {
      if (profile.parallel && index > 0) {
        await sleep(index * randomInt(350, 650), abortController.signal);
      }
      const taskType = getTaskType(q);
      if (taskType === 'WATCH_VIDEO' || taskType === 'WATCH_VIDEO_ON_MOBILE') {
        await runVideoQuest(session, q, profile, abortController.signal);
      } else if (
        taskType === 'PLAY_ON_DESKTOP' ||
        taskType === 'STREAM_ON_DESKTOP' ||
        taskType === 'PLAY_ACTIVITY'
      ) {
        await runHeartbeatQuest(session, q, profile, abortController.signal);
      }
    };

    if (profile.parallel) {
      await Promise.allSettled(actionable.map((q, idx) => executeOne(q, idx)));
    } else {
      for (let i = 0; i < actionable.length; i++) {
        if (abortController.signal.aborted) break;
        await executeOne(actionable[i], i);
      }
    }

    if (!abortController.signal.aborted) {
      pushLog(session, 'ok', 'Đã hoàn tất toàn bộ hàng đợi quest.');
    }
  } catch (err) {
    if (err.message !== 'ABORTED') {
      pushLog(session, 'error', `Lỗi engine: ${err.message}`);
    }
  } finally {
    session.running = false;
    session.abortController = null;
    emitEvent(session, 'runner_state', { running: false, speedMode });
  }
}

// ─── Middleware ──────────────────────────────────────────────────────────────

function requireSession(req, res, next) {
  const sid = req.headers['x-session-id'] || req.query.sessionId;
  if (!sid || !sessions.has(sid)) {
    return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }
  const session = sessions.get(sid);
  session.lastSeen = Date.now();
  req.session = session;
  req.sessionId = sid;
  next();
}

// ─── API Routes ──────────────────────────────────────────────────────────────

app.post('/api/auth/verify', async (req, res) => {
  const rawToken = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
  if (!rawToken || rawToken.length < 20) {
    return res.status(400).json({ error: 'Token Discord không hợp lệ.' });
  }

  const buildNumber = await fetchLatestBuildNumber();
  const tempSession = { token: rawToken, buildNumber };

  try {
    const userRes = await discordRequest(tempSession, 'GET', '/users/@me');
    if (!userRes.ok) {
      return res.status(401).json({
        error: `Xác thực thất bại (HTTP ${userRes.status}). Kiểm tra lại Discord Token.`,
      });
    }

    const user = userRes.data;
    const sessionId = crypto.randomUUID();
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : null;

    sessions.set(sessionId, {
      token: rawToken,
      buildNumber,
      user: {
        id: user.id,
        username: user.username,
        globalName: user.global_name || user.username,
        avatarUrl,
      },
      running: false,
      abortController: null,
      speedMode: 'turbo',
      sseClients: new Set(),
      lastSeen: Date.now(),
    });

    res.json({
      sessionId,
      buildNumber,
      user: sessions.get(sessionId).user,
    });
  } catch (err) {
    res.status(502).json({ error: `Không thể kết nối tới Discord: ${err.message}` });
  }
});

app.post('/api/auth/logout', requireSession, (req, res) => {
  if (req.session.abortController) {
    req.session.abortController.abort();
  }
  for (const client of req.session.sseClients) {
    try {
      client.end();
    } catch {
      // ignore
    }
  }
  sessions.delete(req.sessionId);
  res.json({ ok: true });
});

app.get('/api/quests', requireSession, async (req, res) => {
  try {
    const r = await discordRequest(req.session, 'GET', '/quests/@me');
    if (r.status === 429) {
      return res.status(429).json({
        error: 'Đang bị Discord giới hạn tần suất.',
        retryAfter: r.data?.retry_after || 5,
      });
    }
    if (!r.ok) {
      return res.status(r.status).json({ error: `Lỗi tải quests (HTTP ${r.status})` });
    }
    const rawQuests = Array.isArray(r.data) ? r.data : r.data?.quests || [];
    const normalized = rawQuests.map(normalizeQuest);
    res.json({
      quests: normalized,
      running: req.session.running,
      speedMode: req.session.speedMode,
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.post('/api/quests/:id/enroll', requireSession, async (req, res) => {
  const qid = req.params.id;
  try {
    const r = await discordRequest(req.session, 'POST', `/quests/${qid}/enroll`, {
      location: 11,
      is_targeted: false,
      metadata_raw: null,
      metadata_sealed: null,
      traffic_metadata_raw: req.body?.trafficMetadataRaw || null,
      traffic_metadata_sealed: req.body?.trafficMetadataSealed || null,
    });
    if (!r.ok) {
      return res.status(r.status).json({ error: `Enroll thất bại (HTTP ${r.status})` });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.post('/api/quests/start', requireSession, (req, res) => {
  if (req.session.running) {
    return res.status(409).json({ error: 'Engine đang chạy.' });
  }
  const { speedMode = 'turbo', autoAccept = true, questIds = null } = req.body || {};
  startRunner(req.session, { speedMode, autoAccept, questIds });
  res.json({ ok: true, running: true });
});

app.post('/api/quests/stop', requireSession, (req, res) => {
  if (req.session.abortController) {
    req.session.abortController.abort();
    pushLog(req.session, 'warn', 'Đã dừng engine theo yêu cầu người dùng.');
  }
  res.json({ ok: true, running: false });
});

app.get('/api/events', requireSession, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  req.session.sseClients.add(res);
  res.write(`event: runner_state\ndata: ${JSON.stringify({ running: req.session.running, speedMode: req.session.speedMode })}\n\n`);

  const keepAlive = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(keepAlive);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(keepAlive);
    req.session.sseClients.delete(res);
  });
});

// Cleanup stale sessions every 30 minutes
setInterval(() => {
  const cutoff = Date.now() - 6 * 60 * 60 * 1000;
  for (const [sid, session] of sessions.entries()) {
    if (session.lastSeen < cutoff) {
      if (session.abortController) session.abortController.abort();
      sessions.delete(sid);
    }
  }
}, 30 * 60 * 1000);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Discord Quest Runner server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
