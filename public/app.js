(() => {
  const SESSION_KEY = 'vinhxhub_session_id';
  const LANG_KEY = 'vinhxhub_lang';

  const VIEW_PATHS = {
    runner: '/questrunner',
    spoofer: '/badgespoofer',
    donate: '/donate',
    faq: '/faq',
  };

  const I18N = {
    vi: {
      'nav.aria': 'Điều hướng chính',
      'nav.runner': 'Quest Runner',
      'nav.spoofer': 'Badge Spoofer',
      'nav.donate': 'Donate',
      'nav.faq': 'FAQ',
      'auth.logout': 'Thoát',
      'auth.logoutTitle': 'Đăng xuất',
      'auth.ephemeralChip': 'Token chỉ dùng tạm thời, không lưu lại',
      'auth.title': 'Xác thực Token.',
      'auth.subtitle': 'Nhập Discord User Token để kiểm tra tài khoản, tự động nhận và chạy song song toàn bộ Quest.',
      'auth.tokenLabel': 'Discord Token',
      'auth.tokenPlaceholder': 'Dán Discord Token tại đây…',
      'auth.toggleTokenAria': 'Hiện hoặc ẩn token',
      'auth.verifyBtn': 'Kiểm tra Token',
      'auth.verifyingBtn': 'Đang kiểm tra…',
      'auth.emptyTokenError': 'Vui lòng nhập Discord Token.',
      'auth.requireAuthToast': 'Vui lòng xác thực Discord Token trước.',
      'auth.loggedOutToast': 'Đã đăng xuất.',
      'confirm.chip': 'Xác nhận tài khoản Discord',
      'confirm.title': 'Đây có phải tài khoản của bạn?',
      'confirm.subtitle': 'Kiểm tra ảnh đại diện và UID trước khi vào bảng điều khiển.',
      'confirm.cancel': 'Đổi token khác',
      'confirm.enter': 'Xác nhận & Vào ngay',
      'changelog.releaseTag': 'CHỨC NĂNG CHÍNH',
      'changelog.changes': 'Tính năng',
      'changelog.item1': 'Auto Quest Runner: tự nhận và chạy song song toàn bộ Quest (Video, Play, Stream, Activity) theo thời gian thực.',
      'changelog.item2': 'Badge Spoofer: gửi sự kiện Game Time & Game Variety qua /api/v9/science với số game và số giờ tùy chỉnh.',
      'changelog.item3': 'Xác thực an toàn: đối chiếu ảnh đại diện + UID trước khi vào, phiên chỉ lưu tạm trong RAM server.',
      'changelog.item4': 'Hỗ trợ song ngữ VI/EN, VietQR Donate và trang FAQ minh bạch cơ chế bảo mật.',
      'dash.title': 'Bảng điều khiển Quest',
      'dash.subtitle': 'Tự động nhận quest mới và chạy song song ở tốc độ an toàn tối đa.',
      'dash.refresh': 'Làm mới',
      'dash.startAll': 'Chạy tất cả',
      'dash.stop': 'Dừng lại',
      'dash.statTotal': 'Tổng Quest',
      'dash.statActive': 'Đang chạy song song',
      'dash.statCompleted': 'Đã hoàn thành',
      'dash.questListTitle': 'Danh sách nhiệm vụ',
      'dash.availableCount': '{n} khả dụng',
      'dash.emptyQuests': 'Tài khoản hiện không có Discord Quest khả dụng.',
      'dash.statusDone': 'Hoàn thành',
      'dash.statusEnrolled': 'Đang nhận',
      'dash.statusUnenrolled': 'Chưa nhận',
      'dash.statusUnsupported': 'Không hỗ trợ',
      'dash.enrollBtn': 'Nhận Quest',
      'dash.runOneBtn': 'Chạy riêng',
      'dash.enrolledToast': 'Đã nhận: {name}',
      'dash.logReady': 'Sẵn sàng. Nhấn "Chạy tất cả" để bắt đầu.',
      'spoofer.subtitle': 'Gửi sự kiện launch_game và running_game_heartbeat tới /api/v9/science theo số game và thời gian tùy chỉnh.',
      'spoofer.gameCountLabel': 'Số lượng game',
      'spoofer.availableSuffix': 'khả dụng',
      'spoofer.hoursLabel': 'Thời gian mỗi game (giờ)',
      'spoofer.totalEstimate': 'Tổng thời gian ước tính:',
      'spoofer.hoursUnit': 'giờ',
      'spoofer.cookieLabel': 'Cookie cf_clearance (tùy chọn — dùng nếu Discord trả về 403)',
      'spoofer.fpLabel': 'Executable Fingerprint (tùy chọn)',
      'spoofer.startBtn': 'Bắt đầu Spoof',
      'spoofer.stopBtn': 'Dừng Spoof',
      'spoofer.logReady': 'Nhập số game và số giờ rồi bấm "Bắt đầu Spoof".',
      'donate.title': 'Ủng hộ phát triển',
      'donate.subtitle': 'Nếu công cụ giúp bạn tiết kiệm thời gian làm Discord Quest, bạn có thể ủng hộ tác giả qua chuyển khoản ngân hàng ACB bên dưới.',
      'donate.bankLabel': 'Ngân hàng',
      'donate.bankName': 'ACB — Ngân hàng TMCP Á Châu',
      'donate.ownerLabel': 'Chủ tài khoản',
      'donate.accLabel': 'Số tài khoản',
      'donate.memoLabel': 'Nội dung chuyển khoản',
      'donate.amountLabel': 'Chọn nhanh số tiền (tùy chọn)',
      'donate.customAmount': 'Tùy nhập',
      'donate.qrCaption': 'Quét bằng ứng dụng ngân hàng hoặc ví điện tử hỗ trợ VietQR',
      'faq.title': 'Câu hỏi & Bằng chứng An toàn',
      'faq.subtitle': 'Tất cả cơ chế xử lý token, lưu trữ phiên và giới hạn tốc độ đều minh bạch dựa trên mã nguồn thực tế.',
      'faq.q1': 'Token có bị lưu vào ổ đĩa hay cơ sở dữ liệu không?',
      'faq.a1': 'Không. Backend lưu phiên làm việc bằng cấu trúc Map tạm thời trong RAM (const sessions = new Map()). Không có file log, database hay dịch vụ bên thứ ba nào nhận hoặc lưu trữ token của bạn.',
      'faq.q2': 'Trình duyệt lưu gì khi giữ phiên sau khi F5?',
      'faq.a2': 'Trình duyệt chỉ lưu duy nhất mã phiên ngẫu nhiên UUID (vinhxhub_session_id) trong localStorage. Discord Token gốc không bao giờ được lưu trong localStorage, cookie hay DOM.',
      'faq.q3': 'Khi bấm Thoát hoặc không dùng nữa thì sao?',
      'faq.a3': 'Khi bấm Thoát (/api/auth/logout), server lập tức hủy mọi tác vụ đang chạy qua AbortController, đóng luồng SSE và xóa sạch phiên khỏi RAM. Ngoài ra, phiên không hoạt động tự động bị xóa sau 6 giờ.',
      'faq.q4': 'Cơ chế chống Rate Limit và bảo vệ tài khoản?',
      'faq.a4': 'Quest Runner dùng cấu hình Parallel Safe Turbo: tự đọc retry_after khi gặp HTTP 429, thêm độ trễ ngẫu nhiên (jitter ±1.5s) cho mỗi heartbeat 16.5s và cho phép dừng khẩn cấp bất cứ lúc nào.',
      'faq.q5': 'Web kết nối tới những máy chủ nào?',
      'faq.a5': 'Chỉ gọi trực tiếp API chính thức của Discord (discord.com/api/v9), danh sách game công khai từ Discord CDN (cdn.discordapp.com/detectables/games.json) và thông số client windows từ cordapi.dolfi.es (có fallback tĩnh).',
      'faq.q6': 'Các lớp bảo vệ HTTP trên server là gì?',
      'faq.a6': 'Express bật sẵn header chống nhúng iframe (X-Frame-Options: DENY), chống đoán MIME (X-Content-Type-Options: nosniff), giới hạn Referrer-Policy và giới hạn payload JSON tối đa 128KB.',
      'common.clearLog': 'Xóa log',
      'common.copy': 'Sao chép',
      'common.copied': 'Đã chép',
    },
    en: {
      'nav.aria': 'Primary navigation',
      'nav.runner': 'Quest Runner',
      'nav.spoofer': 'Badge Spoofer',
      'nav.donate': 'Donate',
      'nav.faq': 'FAQ',
      'auth.logout': 'Log out',
      'auth.logoutTitle': 'Log out',
      'auth.ephemeralChip': 'Token stays in memory only, never saved',
      'auth.title': 'Verify Token.',
      'auth.subtitle': 'Enter your Discord User Token to inspect your account, auto-enroll, and run all Quests in parallel.',
      'auth.tokenLabel': 'Discord Token',
      'auth.tokenPlaceholder': 'Paste Discord Token here…',
      'auth.toggleTokenAria': 'Show or hide token',
      'auth.verifyBtn': 'Verify Token',
      'auth.verifyingBtn': 'Verifying…',
      'auth.emptyTokenError': 'Please enter a Discord Token.',
      'auth.requireAuthToast': 'Please verify your Discord Token first.',
      'auth.loggedOutToast': 'Logged out.',
      'confirm.chip': 'Confirm Discord account',
      'confirm.title': 'Is this your account?',
      'confirm.subtitle': 'Check your avatar and UID before entering the dashboard.',
      'confirm.cancel': 'Use another token',
      'confirm.enter': 'Confirm & Enter',
      'changelog.releaseTag': 'CORE FEATURES',
      'changelog.changes': 'Features',
      'changelog.item1': 'Auto Quest Runner: auto-enrolls and executes all Quests (Video, Play, Stream, Activity) in parallel with live telemetry.',
      'changelog.item2': 'Badge Spoofer: dispatches Game Time & Game Variety events to /api/v9/science with custom game count and hours.',
      'changelog.item3': 'Safe Verification: confirms Avatar + UID before entry; sessions remain strictly ephemeral in server RAM.',
      'changelog.item4': 'Bilingual VI/EN interface, dynamic VietQR Donate, and a transparent Security FAQ.',
      'dash.title': 'Quest Dashboard',
      'dash.subtitle': 'Automatically enroll new quests and execute them in parallel at maximum safe speed.',
      'dash.refresh': 'Refresh',
      'dash.startAll': 'Run All',
      'dash.stop': 'Stop',
      'dash.statTotal': 'Total Quests',
      'dash.statActive': 'Running Parallel',
      'dash.statCompleted': 'Completed',
      'dash.questListTitle': 'Quest Queue',
      'dash.availableCount': '{n} available',
      'dash.emptyQuests': 'No Discord Quests are currently available on this account.',
      'dash.statusDone': 'Completed',
      'dash.statusEnrolled': 'Enrolled',
      'dash.statusUnenrolled': 'Not enrolled',
      'dash.statusUnsupported': 'Unsupported',
      'dash.enrollBtn': 'Enroll',
      'dash.runOneBtn': 'Run Solo',
      'dash.enrolledToast': 'Enrolled: {name}',
      'dash.logReady': 'Ready. Click "Run All" to begin.',
      'spoofer.subtitle': 'Dispatches launch_game and running_game_heartbeat events to /api/v9/science with custom game count and hours.',
      'spoofer.gameCountLabel': 'Game count',
      'spoofer.availableSuffix': 'available',
      'spoofer.hoursLabel': 'Hours per game',
      'spoofer.totalEstimate': 'Estimated total playtime:',
      'spoofer.hoursUnit': 'hrs',
      'spoofer.cookieLabel': 'cf_clearance cookie (optional — use if Discord returns 403)',
      'spoofer.fpLabel': 'Executable Fingerprint (optional)',
      'spoofer.startBtn': 'Start Spoofer',
      'spoofer.stopBtn': 'Stop Spoofer',
      'spoofer.logReady': 'Set game count and hours, then click "Start Spoofer".',
      'donate.title': 'Support Development',
      'donate.subtitle': 'If this tool saves you time on Discord Quests, you can support the author via ACB bank transfer below.',
      'donate.bankLabel': 'Bank',
      'donate.bankName': 'ACB — Asia Commercial Joint Stock Bank',
      'donate.ownerLabel': 'Account Holder',
      'donate.accLabel': 'Account Number',
      'donate.memoLabel': 'Transfer Memo',
      'donate.amountLabel': 'Quick Amount (optional)',
      'donate.customAmount': 'Custom',
      'donate.qrCaption': 'Scan with any banking app or e-wallet supporting VietQR',
      'faq.title': 'FAQ & Safety Evidence',
      'faq.subtitle': 'Every token-handling rule, session lifecycle, and rate-limit safeguard is verifiable directly from the source code.',
      'faq.q1': 'Is my Discord token ever saved to disk or a database?',
      'faq.a1': 'No. The backend stores active sessions solely in an in-memory JavaScript Map (const sessions = new Map()). No log files, databases, or third-party trackers receive or store your token.',
      'faq.q2': 'What does the browser store to keep my session on reload?',
      'faq.a2': 'Only a random UUID session identifier (vinhxhub_session_id) is saved in localStorage. Your actual Discord token never enters localStorage, cookies, or the DOM.',
      'faq.q3': 'What happens when I log out or leave the site?',
      'faq.a3': 'Clicking Log out (/api/auth/logout) immediately aborts all running tasks via AbortController, closes SSE streams, and deletes the session from server RAM. Idle sessions also auto-expire after 6 hours.',
      'faq.q4': 'How does it prevent rate limits and protect my account?',
      'faq.a4': 'Quest Runner uses the Parallel Safe Turbo profile: it automatically obeys Discord HTTP 429 retry_after headers, adds randomized jitter (±1.5s) to 16.5s heartbeats, and supports instant abort at any time.',
      'faq.q5': 'Which external servers does the app contact?',
      'faq.a5': 'Only the official Discord API (discord.com/api/v9), the public Discord detectable games CDN (cdn.discordapp.com/detectables/games.json), and cordapi.dolfi.es for Windows client properties (with static fallback).',
      'faq.q6': 'What HTTP security headers are enforced?',
      'faq.a6': 'Express enforces X-Frame-Options: DENY (anti-clickjacking), X-Content-Type-Options: nosniff, strict-origin-when-cross-origin Referrer-Policy, and a 128KB JSON payload limit.',
      'common.clearLog': 'Clear log',
      'common.copy': 'Copy',
      'common.copied': 'Copied',
    },
  };

  const state = {
    lang: 'vi',
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
    viewFaq: document.getElementById('view-faq'),
    navRunner: document.getElementById('nav-runner'),
    navSpoofer: document.getElementById('nav-spoofer'),
    navDonate: document.getElementById('nav-donate'),
    navFaq: document.getElementById('nav-faq'),
    btnLang: document.getElementById('btn-lang'),
    langLabel: document.getElementById('lang-label'),
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
    tokenInputWrap: document.getElementById('token-input-wrap'),
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

  function resolveViewFromPath(pathname) {
    const clean = (pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';
    if (clean === '/badgespoofer') return 'spoofer';
    if (clean === '/donate') return 'donate';
    if (clean === '/faq') return 'faq';
    if (clean === '/questrunner' || clean === '/badgespoofer/questrunner' || clean === '/') return 'runner';
    return 'runner';
  }

  function t(key, vars = {}) {
    const dict = I18N[state.lang] || I18N.vi;
    let str = dict[key] ?? I18N.vi[key] ?? key;
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
    return str;
  }

  function applyTranslations() {
    document.documentElement.lang = state.lang;
    els.langLabel.textContent = state.lang === 'vi' ? 'VI / EN' : 'EN / VI';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = t(el.dataset.i18nTitle);
    });

    if (!els.authError.hidden && !els.tokenInput.value.trim()) {
      els.authError.textContent = t('auth.emptyTokenError');
    }

    updateSpoofEstimate();
    if (state.sessionId) {
      renderQuests();
    }
  }

  function setLanguage(lang) {
    state.lang = lang === 'en' ? 'en' : 'vi';
    try {
      localStorage.setItem(LANG_KEY, state.lang);
    } catch {
      // ignore
    }
    applyTranslations();
  }

  function loadInitialLanguage() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'vi') {
        state.lang = saved;
      }
    } catch {
      // ignore
    }
    applyTranslations();
  }

  function saveSessionId(id) {
    try {
      if (id) localStorage.setItem(SESSION_KEY, id);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
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
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    els.toastRegion.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  function triggerAuthError(message) {
    els.authError.textContent = message;
    els.authError.hidden = false;
    els.authError.style.animation = 'none';
    void els.authError.offsetWidth;
    els.authError.style.animation = '';

    els.tokenInputWrap.classList.add('is-invalid');
    els.tokenInputWrap.classList.remove('is-shaking');
    void els.tokenInputWrap.offsetWidth;
    els.tokenInputWrap.classList.add('is-shaking');
  }

  function clearAuthError() {
    els.authError.hidden = true;
    els.tokenInputWrap.classList.remove('is-invalid', 'is-shaking');
  }

  function switchView(view, updateUrl = true) {
    state.activeView = view;
    els.navRunner.classList.toggle('is-active', view === 'runner');
    els.navSpoofer.classList.toggle('is-active', view === 'spoofer');
    els.navDonate.classList.toggle('is-active', view === 'donate');
    els.navFaq.classList.toggle('is-active', view === 'faq');

    if (updateUrl) {
      const targetPath = VIEW_PATHS[view] || '/questrunner';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view }, '', targetPath);
      }
    }

    const isPublic = view === 'donate' || view === 'faq';
    els.viewDonate.hidden = view !== 'donate';
    els.viewFaq.hidden = view !== 'faq';

    if (isPublic) {
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
        showToast(t('auth.requireAuthToast'));
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
    ts.textContent = entry.ts || new Date().toLocaleTimeString(state.lang === 'en' ? 'en-GB' : 'vi-VN', { hour12: false });

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
    const minUnit = state.lang === 'en' ? 'm' : 'p';
    return s > 0 ? `${m}${minUnit} ${s}s` : `${m}${minUnit}`;
  }

  function renderQuests() {
    const quests = state.quests;
    const completed = quests.filter((q) => q.completed).length;
    const completable = quests.filter((q) => q.completable && !q.completed).length;
    const active = quests.filter((q) => q.enrolled && !q.completed && q.completable).length;

    els.statTotal.textContent = String(quests.length);
    els.statActive.textContent = String(active);
    els.statCompleted.textContent = String(completed);
    els.questFilterCount.textContent = t('dash.availableCount', { n: completable });

    els.questsList.innerHTML = '';

    if (quests.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'editorial-block quest-card';
      empty.innerHTML = `<p class="muted">${t('dash.emptyQuests')}</p>`;
      els.questsList.appendChild(empty);
      return;
    }

    for (const q of quests) {
      const isRunningCard = state.running && q.enrolled && !q.completed && q.completable;
      const card = document.createElement('article');
      card.className = `editorial-block quest-card ${isRunningCard ? 'is-running' : ''}`;
      card.dataset.questId = q.id;

      const statusText = q.completed
        ? t('dash.statusDone')
        : q.enrolled
        ? q.taskType || t('dash.statusEnrolled')
        : q.completable
        ? t('dash.statusUnenrolled')
        : t('dash.statusUnsupported');

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
          btnEnroll.textContent = t('dash.enrollBtn');
          btnEnroll.addEventListener('click', () => enrollSingleQuest(q));
          actions.appendChild(btnEnroll);
        }
        const btnRunOne = document.createElement('button');
        btnRunOne.type = 'button';
        btnRunOne.className = 'btn-ghost-sm';
        btnRunOne.textContent = t('dash.runOneBtn');
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
      showToast(t('dash.enrolledToast', { name: q.name }));
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
    switchView(state.activeView, false);
  }

  async function restoreSessionOnLoad() {
    const savedId = loadSessionId();
    if (!savedId) {
      els.userPill.hidden = true;
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'X-Session-Id': savedId },
      });
      if (!res.ok) {
        saveSessionId(null);
        els.userPill.hidden = true;
        return;
      }
      const data = await res.json();
      applyAuthenticatedSession(data);
    } catch {
      saveSessionId(null);
      els.userPill.hidden = true;
    }
  }

  els.btnLang.addEventListener('click', () => {
    setLanguage(state.lang === 'vi' ? 'en' : 'vi');
  });

  els.navRunner.addEventListener('click', () => switchView('runner'));
  els.navSpoofer.addEventListener('click', () => switchView('spoofer'));
  els.navDonate.addEventListener('click', () => switchView('donate'));
  els.navFaq.addEventListener('click', () => switchView('faq'));

  window.addEventListener('popstate', () => {
    switchView(resolveViewFromPath(window.location.pathname), false);
  });

  els.tokenInput.addEventListener('input', () => {
    if (els.tokenInput.value.trim()) {
      clearAuthError();
    }
  });

  els.btnToggleToken.addEventListener('click', () => {
    const isPwd = els.tokenInput.type === 'password';
    els.tokenInput.type = isPwd ? 'text' : 'password';
  });

  els.authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = els.tokenInput.value.trim();
    clearAuthError();

    if (!token) {
      triggerAuthError(t('auth.emptyTokenError'));
      els.tokenInput.focus();
      return;
    }

    const spinner = els.btnConnect.querySelector('.spinner');
    const label = els.btnConnect.querySelector('.btn-label');
    const arrow = els.btnConnect.querySelector('.btn-arrow');
    els.btnConnect.disabled = true;
    spinner.hidden = false;
    if (arrow) arrow.hidden = true;
    label.textContent = t('auth.verifyingBtn');

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
      triggerAuthError(err.message);
    } finally {
      els.btnConnect.disabled = false;
      spinner.hidden = true;
      if (arrow) arrow.hidden = false;
      label.textContent = t('auth.verifyBtn');
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
    showToast(t('auth.loggedOutToast'));
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
    const locale = state.lang === 'en' ? 'en-US' : 'vi-VN';
    els.spoofTotalHours.textContent = `${(count * hours).toLocaleString(locale)} ${t('spoofer.hoursUnit')}`;
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
      btn.textContent = t('common.copied');
      setTimeout(() => {
        btn.textContent = t('common.copy');
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

  loadInitialLanguage();
  const initialView = resolveViewFromPath(window.location.pathname);
  switchView(initialView, false);
  restoreSessionOnLoad();
})();
