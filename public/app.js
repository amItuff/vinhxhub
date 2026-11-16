(() => {
  const SESSION_KEY = 'vinhxhub_session_id';

  const state = {
    sessionId: null,
    pendingAuth: null,
    user: null,
    quests: [],
    running: false,
    spooferRunning: false,
    activeView: 'runner',
    eventSource: null,
  };

  const els = {
    viewAuth: document.getElementById('view-auth'),
    viewDashboard: document.getElementById('view-dashboard'),
    viewSpoofer: document.getElementById('view-spoofer'),
    viewDonate: document.getElementById('view-donate'),
    navRunner: document.getElementById('nav-runner'),
    navSpoofer: document.getElementById('nav-spoofer'),
    navDonate: document.getElementById('nav-donate'),
    userPill: document.getElementById('user-pill'),
    userAvatarBox: document.getElementById('user-avatar-box'),
    userDisplayName: document.getElementById('user-display-name'),
    userUidInfo: document.getElementById('user-uid-info'),
    btnLogout: document.getElementById('btn-logout'),
    authStepInput: document.getElementById('auth-step-input'),
    authStepConfirm: document.getElementById('auth-step-confirm'),
    confirmAvatarBox: document.getElementById('confirm-avatar-box'),
    confirmUsername: document.getElementById('confirm-username'),
    confirmUid: document.getElementById('confirm-uid'),
    btnCancelConfirm: document.getElementById('btn-cancel-confirm'),
    btnConfirmEnter: document.getElementById('btn-confirm-enter'),
    authForm: document.getElementById('auth-form'),
    tokenInput: document.getElementById('token-input'),
    btnToggleToken: document.getElementById('btn-toggle-token'),
    btnConnect: document.getElementById('btn-connect'),
    authError: document.getElementById('auth-error'),
    btnRefresh: document.getElementById('btn-refresh'),
    btnStartAll: document.getElementById('btn-start-all'),
    btnStop: document.getElementById('btn-stop'),
    statTotal: document.getElementById('stat-total'),
    statActive: document.getElementById('stat-active'),
    statCompleted: document.getElementById('stat-completed'),
    questFilterCount: document.getElementById('quest-filter-count'),
    questsList: document.getElementById('quests-list'),
    terminalLog: document.getElementById('terminal-log'),
    btnClearLog: document.getElementById('btn-clear-log'),
    engineStatusDot: document.getElementById('engine-status-dot'),
    spooferForm: document.getElementById('spoofer-form'),
    spoofMaxGames: document.getElementById('spoof-max-games'),
    spoofCount: document.getElementById('spoof-count'),
    spoofHours: document.getElementById('spoof-hours'),
    spoofTotalHours: document.getElementById('spoof-total-hours'),
    spoofCookie: document.getElementById('spoof-cookie'),
    spoofFp: document.getElementById('spoof-fp'),
    spoofProgressLabel: document.getElementById('spoof-progress-label'),
    spoofProgressPct: document.getElementById('spoof-progress-pct'),
    spoofProgressBar: document.getElementById('spoof-progress-bar'),
    btnSpoofStart: document.getElementById('btn-spoof-start'),
    btnSpoofStop: document.getElementById('btn-spoof-stop'),
    spooferStatusDot: document.getElementById('spoofer-status-dot'),
    spooferLog: document.getElementById('spoofer-log'),
    btnClearSpoofLog: document.getElementById('btn-clear-spoof-log'),
    amountPresets: document.getElementById('amount-presets'),
    vietqrImg: document.getElementById('vietqr-img'),
    toastRegion: document.getElementById('toast-region'),
  };

  function saveSessionId(id) {
    try {
      if (id) localStorage.setItem(SESSION_KEY, id);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore storage errors
    }
  }

  function loadSessionId() {
    try {
      return localStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  }

  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    els.toastRegion.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  function switchView(view) {
    state.activeView = view;
    els.navRunner.classList.toggle('is-active', view === 'runner');
    els.navSpoofer.classList.toggle('is-active', view === 'spoofer');
    els.navDonate.classList.toggle('is-active', view === 'donate');

    els.viewDonate.hidden = view !== 'donate';
    if (view === 'donate') {
      els.viewAuth.hidden = true;
      els.viewDashboard.hidden = true;
      els.viewSpoofer.hidden = true;
      return;
    }

    const authed = Boolean(state.sessionId);
    if (!authed) {
      els.viewAuth.hidden = false;
      els.viewDashboard.hidden = true;
      els.viewSpoofer.hidden = true;
      if (view === 'spoofer') {
        showToast('Vui lòng xác thực Discord Token trước.');
      }
      return;
    }

    els.viewAuth.hidden = true;
    els.viewDashboard.hidden = view !== 'runner';
    els.viewSpoofer.hidden = view !== 'spoofer';
  }

  function appendLog(container, entry) {
    const line = document.createElement('div');
    line.className = `log-line log-${entry.level || 'info'}`;

    const ts = document.createElement('span');
    ts.className = 'log-ts';
    ts.textContent = entry.ts || new Date().toLocaleTimeString('vi-VN', { hour12: false });

    const msg = document.createElement('span');
    msg.className = 'log-msg';
    msg.textContent = entry.message;

    line.appendChild(ts);
    line.appendChild(msg);
    container.appendChild(line);
    container.scrollTop = container.scrollHeight;
  }

  function setRunnerUI(running) {
    state.running = running;
    els.btnStartAll.hidden = running;
    els.btnStop.hidden = !running;
    els.engineStatusDot.classList.toggle('dot-pulse', running);
    renderQuests();
  }

  function setSpooferUI(running) {
    state.spooferRunning = running;
    els.btnSpoofStart.hidden = running;
    els.btnSpoofStop.hidden = !running;
    els.spooferStatusDot.classList.toggle('dot-pulse', running);
    els.spoofProgressBar.classList.toggle('is-active', running);
  }

  function formatDuration(sec) {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}p ${s}s` : `${m}p`;
  }

  function renderQuests() {
    const quests = state.quests;
    const completed = quests.filter((q) => q.completed).length;
    const completable = quests.filter((q) => q.completable && !q.completed).length;
    const active = quests.filter((q) => q.enrolled && !q.completed && q.completable).length;

    els.statTotal.textContent = String(quests.length);
    els.statActive.textContent = String(active);
    els.statCompleted.textContent = String(completed);
    els.questFilterCount.textContent = `${completable} khả dụng`;

    els.questsList.innerHTML = '';

    if (quests.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'surface-card quest-card';
      empty.innerHTML = '<p class="muted">Tài khoản hiện không có Discord Quest khả dụng.</p>';
      els.questsList.appendChild(empty);
      return;
    }

    for (const q of quests) {
      const isRunningCard = state.running && q.enrolled && !q.completed && q.completable;
      const card = document.createElement('article');
      card.className = `surface-card quest-card ${isRunningCard ? 'is-running' : ''}`;
      card.dataset.questId = q.id;

      const statusText = q.completed
        ? 'Hoàn thành'
        : q.enrolled
        ? q.taskType || 'Đang nhận'
        : q.completable
        ? 'Chưa nhận'
        : 'Không hỗ trợ';

      const pct = q.completed ? 100 : q.progressPct;
      const doneVal = q.completed ? q.secondsNeeded : q.secondsDone;

      card.innerHTML = `
        <div class="quest-top">
          <div>
            <h3 class="quest-title"></h3>
            <div class="quest-sub"></div>
          </div>
          <span class="task-badge ${q.completed ? 'is-done' : ''}"></span>
        </div>
        <div class="progress-meta">
          <span class="progress-time">${formatDuration(doneVal)} / ${formatDuration(q.secondsNeeded)}</span>
          <span class="progress-pct">${pct}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${q.completed ? 'is-done' : (isRunningCard ? 'is-active' : '')}" style="width: ${pct}%"></div>
        </div>
        <div class="quest-actions"></div>
      `;

      card.querySelector('.quest-title').textContent = q.name;
      card.querySelector('.quest-sub').textContent = q.reward || q.gameTitle || 'Discord Quest';
      card.querySelector('.task-badge').textContent = statusText;

      const actions = card.querySelector('.quest-actions');
      if (!q.completed && q.completable) {
        if (!q.enrolled) {
          const btnEnroll = document.createElement('button');
          btnEnroll.type = 'button';
          btnEnroll.className = 'btn-ghost-sm';
          btnEnroll.textContent = 'Nhận Quest';
          btnEnroll.addEventListener('click', () => enrollSingleQuest(q));
          actions.appendChild(btnEnroll);
        }
        const btnRunOne = document.createElement('button');
        btnRunOne.type = 'button';
        btnRunOne.className = 'btn-ghost-sm';
        btnRunOne.textContent = 'Chạy riêng';
        btnRunOne.disabled = state.running;
        btnRunOne.addEventListener('click', () => startRunner([q.id]));
        actions.appendChild(btnRunOne);
      }

      els.questsList.appendChild(card);
    }
  }

  async function apiFetch(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (state.sessionId) {
      headers['X-Session-Id'] = state.sessionId;
    }
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  }

  async function loadQuests() {
    try {
      const data = await apiFetch('/api/quests');
      state.quests = data.quests || [];
      setRunnerUI(Boolean(data.running));
    } catch (err) {
      showToast(err.message);
    }
  }

  async function loadSpooferGames() {
    try {
      const data = await apiFetch('/api/spoofer/games');
      els.spoofMaxGames.textContent = String(data.total);
      els.spoofCount.max = String(data.total);
    } catch {
      els.spoofMaxGames.textContent = '—';
    }
  }

  async function enrollSingleQuest(q) {
    try {
      await apiFetch(`/api/quests/${q.id}/enroll`, {
        method: 'POST',
        body: JSON.stringify({
          trafficMetadataRaw: q.trafficMetadataRaw,
          trafficMetadataSealed: q.trafficMetadataSealed,
        }),
      });
      showToast(`Đã nhận: ${q.name}`);
      await loadQuests();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function startRunner(questIds = null) {
    try {
      await apiFetch('/api/quests/start', {
        method: 'POST',
        body: JSON.stringify({ questIds }),
      });
      setRunnerUI(true);
    } catch (err) {
      showToast(err.message);
    }
  }

  async function stopRunner() {
    try {
      await apiFetch('/api/quests/stop', { method: 'POST' });
      setRunnerUI(false);
    } catch (err) {
      showToast(err.message);
    }
  }

  function connectEvents() {
    if (state.eventSource) {
      state.eventSource.close();
    }
    const es = new EventSource(`/api/events?sessionId=${encodeURIComponent(state.sessionId)}`);
    state.eventSource = es;

    es.addEventListener('log', (e) => {
      appendLog(els.terminalLog, JSON.parse(e.data));
    });

    es.addEventListener('runner_state', (e) => {
      const data = JSON.parse(e.data);
      setRunnerUI(Boolean(data.running));
      if (!data.running) loadQuests();
    });

    es.addEventListener('quest_progress', (e) => {
      const data = JSON.parse(e.data);
      const target = state.quests.find((q) => q.id === data.id);
      if (target) {
        target.secondsDone = data.secondsDone;
        target.progressPct = data.progressPct;
        target.completed = Boolean(data.completed);
        renderQuests();
      }
    });

    es.addEventListener('quest_completed', () => {
      loadQuests();
    });

    es.addEventListener('spoofer_log', (e) => {
      appendLog(els.spooferLog, JSON.parse(e.data));
    });

    es.addEventListener('spoofer_state', (e) => {
      const data = JSON.parse(e.data);
      setSpooferUI(Boolean(data.running));
    });

    es.addEventListener('spoofer_progress', (e) => {
      const data = JSON.parse(e.data);
      els.spoofProgressLabel.textContent = `${data.sentGames} / ${data.totalGames} game`;
      els.spoofProgressPct.textContent = `${data.pct}%`;
      els.spoofProgressBar.style.width = `${data.pct}%`;
      if (data.pct >= 100) {
        els.spoofProgressBar.classList.add('is-done');
      }
    });
  }

  function applyAuthenticatedSession(authData) {
    state.sessionId = authData.sessionId;
    state.user = authData.user;
    saveSessionId(authData.sessionId);

    els.userDisplayName.textContent = authData.user.globalName || authData.user.username;
    els.userUidInfo.textContent = `UID ${authData.user.id}`;
    if (authData.user.avatarUrl) {
      els.userAvatarBox.innerHTML = `<img src="${authData.user.avatarUrl}" alt="" />`;
    } else {
      els.userAvatarBox.textContent = (authData.user.username || 'U')[0].toUpperCase();
    }
    els.userPill.hidden = false;

    connectEvents();
    loadQuests();
    loadSpooferGames();
    switchView(state.activeView === 'donate' ? 'donate' : 'runner');
  }

  async function restoreSessionOnLoad() {
    const savedId = loadSessionId();
    if (!savedId) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'X-Session-Id': savedId },
      });
      if (!res.ok) {
        saveSessionId(null);
        return;
      }
      const data = await res.json();
      applyAuthenticatedSession(data);
    } catch {
      saveSessionId(null);
    }
  }

  els.navRunner.addEventListener('click', () => switchView('runner'));
  els.navSpoofer.addEventListener('click', () => switchView('spoofer'));
  els.navDonate.addEventListener('click', () => switchView('donate'));

  els.btnToggleToken.addEventListener('click', () => {
    const isPwd = els.tokenInput.type === 'password';
    els.tokenInput.type = isPwd ? 'text' : 'password';
  });

  els.authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = els.tokenInput.value.trim();
    els.authError.hidden = true;

    if (!token) {
      els.authError.textContent = 'Vui lòng nhập Discord Token.';
      els.authError.hidden = false;
      return;
    }

    const spinner = els.btnConnect.querySelector('.spinner');
    const label = els.btnConnect.querySelector('.btn-label');
    els.btnConnect.disabled = true;
    spinner.hidden = false;
    label.textContent = 'Đang kiểm tra…';

    try {
      const res = await apiFetch('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      state.pendingAuth = res;
      els.confirmUsername.textContent = res.user.globalName || res.user.username;
      els.confirmUid.textContent = `UID: ${res.user.id}`;
      if (res.user.avatarUrl) {
        els.confirmAvatarBox.innerHTML = `<img src="${res.user.avatarUrl}" alt="" />`;
      } else {
        els.confirmAvatarBox.textContent = (res.user.username || 'U')[0].toUpperCase();
      }
      els.tokenInput.value = '';
      els.authStepInput.hidden = true;
      els.authStepConfirm.hidden = false;
    } catch (err) {
      els.authError.textContent = err.message;
      els.authError.hidden = false;
    } finally {
      els.btnConnect.disabled = false;
      spinner.hidden = true;
      label.textContent = 'Kiểm tra Token';
    }
  });

  els.btnCancelConfirm.addEventListener('click', async () => {
    if (state.pendingAuth?.sessionId) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'X-Session-Id': state.pendingAuth.sessionId },
      }).catch(() => {});
    }
    state.pendingAuth = null;
    els.authStepConfirm.hidden = true;
    els.authStepInput.hidden = false;
  });

  els.btnConfirmEnter.addEventListener('click', () => {
    if (!state.pendingAuth) return;
    const authData = state.pendingAuth;
    state.pendingAuth = null;
    els.authStepConfirm.hidden = true;
    els.authStepInput.hidden = false;
    applyAuthenticatedSession(authData);
  });

  els.btnLogout.addEventListener('click', async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    if (state.eventSource) {
      state.eventSource.close();
      state.eventSource = null;
    }
    saveSessionId(null);
    state.sessionId = null;
    state.user = null;
    state.quests = [];
    setRunnerUI(false);
    setSpooferUI(false);
    els.userPill.hidden = true;
    switchView('runner');
    showToast('Đã đăng xuất.');
  });

  els.btnRefresh.addEventListener('click', loadQuests);
  els.btnStartAll.addEventListener('click', () => startRunner(null));
  els.btnStop.addEventListener('click', stopRunner);
  els.btnClearLog.addEventListener('click', () => {
    els.terminalLog.innerHTML = '';
  });

  function updateSpoofEstimate() {
    const count = Math.max(0, Number(els.spoofCount.value) || 0);
    const hours = Math.max(0, Number(els.spoofHours.value) || 0);
    els.spoofTotalHours.textContent = `${(count * hours).toLocaleString('vi-VN')} giờ`;
  }
  els.spoofCount.addEventListener('input', updateSpoofEstimate);
  els.spoofHours.addEventListener('input', updateSpoofEstimate);

  els.spooferForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    els.spoofProgressBar.classList.remove('is-done');
    els.spoofProgressBar.style.width = '0%';
    try {
      await apiFetch('/api/spoofer/start', {
        method: 'POST',
        body: JSON.stringify({
          gameCount: Number(els.spoofCount.value) || 50,
          hoursPerGame: Number(els.spoofHours.value) || 1,
          cookie: els.spoofCookie.value.trim(),
          fingerprint: els.spoofFp.value.trim(),
        }),
      });
      setSpooferUI(true);
    } catch (err) {
      showToast(err.message);
    }
  });

  els.btnSpoofStop.addEventListener('click', async () => {
    try {
      await apiFetch('/api/spoofer/stop', { method: 'POST' });
      setSpooferUI(false);
    } catch (err) {
      showToast(err.message);
    }
  });

  els.btnClearSpoofLog.addEventListener('click', () => {
    els.spooferLog.innerHTML = '';
  });

  document.querySelectorAll('.btn-copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      const prev = btn.textContent;
      btn.textContent = 'Đã chép';
      setTimeout(() => {
        btn.textContent = prev;
      }, 1400);
    });
  });

  els.amountPresets.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      els.amountPresets.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const amt = btn.dataset.amount;
      const base = 'https://img.vietqr.io/image/970416-33689707-compact2.png';
      const params = new URLSearchParams({
        addInfo: 'donate vinhx hehe',
        accountName: 'NGUYEN NGOC TRI VINH',
      });
      if (amt) params.set('amount', amt);
      els.vietqrImg.src = `${base}?${params.toString()}`;
    });
  });

  restoreSessionOnLoad();
})();
