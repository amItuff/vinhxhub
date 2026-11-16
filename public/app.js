(() => {
  const state = {
    sessionId: null,
    user: null,
    buildNumber: null,
    quests: [],
    running: false,
    activeView: 'runner',
    eventSource: null,
  };

  const els = {
    viewAuth: document.getElementById('view-auth'),
    viewDashboard: document.getElementById('view-dashboard'),
    viewDonate: document.getElementById('view-donate'),
    navRunner: document.getElementById('nav-runner'),
    navDonate: document.getElementById('nav-donate'),
    userPill: document.getElementById('user-pill'),
    userAvatarBox: document.getElementById('user-avatar-box'),
    userDisplayName: document.getElementById('user-display-name'),
    userBuildInfo: document.getElementById('user-build-info'),
    btnLogout: document.getElementById('btn-logout'),
    authForm: document.getElementById('auth-form'),
    tokenInput: document.getElementById('token-input'),
    btnToggleToken: document.getElementById('btn-toggle-token'),
    btnConnect: document.getElementById('btn-connect'),
    authError: document.getElementById('auth-error'),
    btnRefresh: document.getElementById('btn-refresh'),
    btnStartAll: document.getElementById('btn-start-all'),
    btnStop: document.getElementById('btn-stop'),
    speedSelect: document.getElementById('speed-select'),
    toggleAutoAccept: document.getElementById('toggle-auto-accept'),
    statTotal: document.getElementById('stat-total'),
    statActive: document.getElementById('stat-active'),
    statCompleted: document.getElementById('stat-completed'),
    questFilterCount: document.getElementById('quest-filter-count'),
    questsList: document.getElementById('quests-list'),
    terminalLog: document.getElementById('terminal-log'),
    btnClearLog: document.getElementById('btn-clear-log'),
    engineStatusDot: document.getElementById('engine-status-dot'),
    amountPresets: document.getElementById('amount-presets'),
    vietqrImg: document.getElementById('vietqr-img'),
    toastRegion: document.getElementById('toast-region'),
  };

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
    els.navDonate.classList.toggle('is-active', view === 'donate');

    els.viewDonate.hidden = view !== 'donate';
    if (view === 'donate') {
      els.viewAuth.hidden = true;
      els.viewDashboard.hidden = true;
    } else {
      const authed = Boolean(state.sessionId);
      els.viewAuth.hidden = authed;
      els.viewDashboard.hidden = !authed;
    }
  }

  function appendLog(entry) {
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
    els.terminalLog.appendChild(line);
    els.terminalLog.scrollTop = els.terminalLog.scrollHeight;
  }

  function setRunnerUI(running) {
    state.running = running;
    els.btnStartAll.hidden = running;
    els.btnStop.hidden = !running;
    els.speedSelect.disabled = running;
    els.engineStatusDot.classList.toggle('dot-pulse', running);
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
      const card = document.createElement('article');
      card.className = 'surface-card quest-card';
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
          <div class="progress-fill ${q.completed ? 'is-done' : ''}" style="width: ${pct}%"></div>
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
      renderQuests();
    } catch (err) {
      showToast(err.message);
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
        body: JSON.stringify({
          speedMode: els.speedSelect.value,
          autoAccept: els.toggleAutoAccept.checked,
          questIds,
        }),
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
      const data = JSON.parse(e.data);
      appendLog(data);
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
  }

  els.navRunner.addEventListener('click', () => switchView('runner'));
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
    label.textContent = 'Đang xác thực…';

    try {
      const res = await apiFetch('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      state.sessionId = res.sessionId;
      state.user = res.user;
      state.buildNumber = res.buildNumber;

      els.userDisplayName.textContent = res.user.globalName || res.user.username;
      els.userBuildInfo.textContent = `Build ${res.buildNumber}`;
      if (res.user.avatarUrl) {
        els.userAvatarBox.innerHTML = `<img src="${res.user.avatarUrl}" alt="" />`;
      } else {
        els.userAvatarBox.textContent = (res.user.username || 'U')[0].toUpperCase();
      }
      els.userPill.hidden = false;
      els.tokenInput.value = '';

      connectEvents();
      await loadQuests();
      switchView('runner');
    } catch (err) {
      els.authError.textContent = err.message;
      els.authError.hidden = false;
    } finally {
      els.btnConnect.disabled = false;
      spinner.hidden = true;
      label.textContent = 'Kết nối & Vào bảng nhiệm vụ';
    }
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
    state.sessionId = null;
    state.user = null;
    state.quests = [];
    setRunnerUI(false);
    els.userPill.hidden = true;
    switchView('runner');
    showToast('Đã đăng xuất và xóa token khỏi RAM.');
  });

  els.btnRefresh.addEventListener('click', loadQuests);
  els.btnStartAll.addEventListener('click', () => startRunner(null));
  els.btnStop.addEventListener('click', stopRunner);
  els.btnClearLog.addEventListener('click', () => {
    els.terminalLog.innerHTML = '';
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
})();
