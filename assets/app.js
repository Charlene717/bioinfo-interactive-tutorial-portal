/* ============================================================
   Bioinformatics Interactive Tutorial Portal — app.js
   Reads inline JSON from <script id="portal-data"> so the page
   works equally well from file:// and GitHub Pages (no fetch).
   If you also serve subjects.json as a file, you can swap this
   for a fetch — but the inline version is the authoritative one.
   ============================================================ */
const LS = { lang:'biportal_lang', theme:'biportal_theme', mode:'biportal_mode' };
const state = {
  lang:  localStorage.getItem(LS.lang)  || 'zh',
  theme: localStorage.getItem(LS.theme) || 'auto',
  mode:  localStorage.getItem(LS.mode)  || 'github',
  data:  null,
};

init();

function init() {
  applyTheme(state.theme);
  applyLang(state.lang);
  applyMode(state.mode);

  document.getElementById('langToggle').addEventListener('click', () => {
    state.lang = (state.lang === 'zh') ? 'en' : 'zh';
    localStorage.setItem(LS.lang, state.lang);
    applyLang(state.lang); renderAll();
  });
  document.getElementById('themeToggle').addEventListener('click', () => {
    state.theme = (state.theme === 'auto') ? 'light'
                : (state.theme === 'light') ? 'dark' : 'auto';
    localStorage.setItem(LS.theme, state.theme);
    applyTheme(state.theme);
  });
  document.getElementById('modeToggle').addEventListener('click', () => {
    state.mode = (state.mode === 'github') ? 'local' : 'github';
    localStorage.setItem(LS.mode, state.mode);
    applyMode(state.mode); renderAll();
  });

  // Read inlined JSON — works on file:// AND http(s)://
  const dataEl = document.getElementById('portal-data');
  if (!dataEl) {
    document.querySelector('#tracksContainer').innerHTML =
      '<div class="container" style="padding:60px 20px;text-align:center;color:var(--fg-mute)">' +
      '&#9888;&#65039; Missing &lt;script id="portal-data"&gt; in HTML.</div>';
    return;
  }
  try {
    state.data = JSON.parse(dataEl.textContent);
  } catch (err) {
    document.querySelector('#tracksContainer').innerHTML =
      '<div class="container" style="padding:60px 20px;text-align:center;color:var(--fg-mute)">' +
      '&#9888;&#65039; Failed to parse portal-data: ' + err + '</div>';
    return;
  }

  if (state.data.githubUser) {
    document.getElementById('repoLink').href =
      `https://github.com/${state.data.githubUser}`;
  }
  if (state.data.subjects?.length) {
    document.getElementById('statCourses').textContent = state.data.subjects.length;
  }
  renderAll();
}

function applyTheme(t) { document.body.dataset.theme = t; }
function applyLang(l) {
  document.body.dataset.lang = l;
  document.documentElement.lang = (l === 'en') ? 'en' : 'zh-Hant';
  document.querySelectorAll('[data-i18n-zh]').forEach(el => {
    const t = (l === 'en') ? el.dataset.i18nEn : el.dataset.i18nZh;
    if (t != null) el.textContent = t;
  });
}
function applyMode(m) { document.body.dataset.mode = m; }

function renderAll() {
  if (!state.data) return;
  renderTrackNav();
  renderPathway();
  renderFeatured();
  renderTracks();
}

function renderTrackNav() {
  const nav = document.querySelector('.nav-tracks');
  nav.innerHTML = '';
  state.data.groups.forEach(g => {
    const a = document.createElement('a');
    a.className = 'nav-link';
    a.href = `#track-${g.id}`;
    a.style.setProperty('--g-accent', g.accent);
    const name = (state.lang === 'en') ? g.nameEn : g.nameZh;
    a.innerHTML = `<span class="nav-letter">${g.id}</span><span>${escapeHtml(name)}</span>`;
    nav.appendChild(a);
  });
}

function renderPathway() {
  const ol = document.getElementById('pathway');
  ol.innerHTML = '';
  state.data.groups.forEach(g => {
    const a = document.createElement('a');
    a.className = 'path-step';
    a.href = `#track-${g.id}`;
    a.style.setProperty('--g-accent', g.accent);
    const name    = (state.lang === 'en') ? g.nameEn   : g.nameZh;
    const tag     = (state.lang === 'en') ? g.taglineEn: g.taglineZh;
    const count   = state.data.subjects.filter(s => s.group === g.id).length;
    const stepWd  = (state.lang === 'en') ? 'STEP'    : '階段';
    const modWd   = (state.lang === 'en') ? 'modules' : '門';
    a.innerHTML =
      `<span class="step-meta"><span class="step-letter">${g.id}</span> &middot; ${stepWd} &middot; ${count} ${modWd}</span>` +
      `<span class="step-name">${escapeHtml(name)}</span>` +
      `<span class="step-tag">${escapeHtml(tag || '')}</span>`;
    ol.appendChild(a);
  });
}

function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  grid.innerHTML = '';
  (state.data.featured || []).forEach(slug => {
    const s = state.data.subjects.find(x => x.slug === slug);
    if (!s) return;
    const g = state.data.groups.find(x => x.id === s.group);
    if (!g) return;
    grid.appendChild(buildFeaturedCard(s, g));
  });
}

function buildFeaturedCard(s, g) {
  const a = document.createElement('a');
  a.className = 'f-card';
  a.style.setProperty('--g-accent', g.accent);
  a.href = resolveUrl(s);
  a.target = '_blank';
  a.rel = 'noopener noreferrer';

  const name    = (state.lang === 'en') ? s.nameEn : s.nameZh;
  const nameAlt = (state.lang === 'en') ? s.nameZh : s.nameEn;
  const desc    = (state.lang === 'en') ? s.descEn : s.descZh;
  const gName   = (state.lang === 'en') ? g.nameEn : g.nameZh;
  const open    = (state.lang === 'en') ? 'Open module' : '進入模組';

  a.innerHTML =
    `<div class="f-meta">` +
      `<span class="f-group">${g.id} &middot; ${escapeHtml(gName)}</span>` +
      statusPill(s.status) +
    `</div>` +
    `<h4 class="f-title">${escapeHtml(name)}</h4>` +
    `<div class="f-alt">${escapeHtml(nameAlt)}</div>` +
    `<p class="f-desc">${escapeHtml(desc || '')}</p>` +
    `<div class="f-foot"><span class="f-open">${open}` +
      ` <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M9 7h8v8"/></svg>` +
    `</span></div>`;
  return a;
}

function renderTracks() {
  const root = document.getElementById('tracksContainer');
  root.innerHTML = '';
  state.data.groups.forEach(g => {
    const subjects = state.data.subjects.filter(s => s.group === g.id);
    if (subjects.length === 0) return;

    const section = document.createElement('section');
    section.className = 'track';
    section.id = `track-${g.id}`;
    section.style.setProperty('--g-accent', g.accent);

    const gName     = (state.lang === 'en') ? g.nameEn    : g.nameZh;
    const gNameAlt  = (state.lang === 'en') ? g.nameZh    : g.nameEn;
    const gTag      = (state.lang === 'en') ? g.taglineEn : g.taglineZh;
    const gIntro    = (state.lang === 'en') ? g.introEn   : g.introZh;
    const trackLbl  = (state.lang === 'en') ? `Track ${g.id}` : `主題軸 ${g.id}`;

    section.innerHTML =
      `<div class="container">` +
        `<header class="track-header">` +
          `<div class="track-letter">${g.id}</div>` +
          `<div class="track-meta">` +
            `<span class="track-eyebrow">${trackLbl}</span>` +
            `<h2 class="track-title">${escapeHtml(gName)}<span class="alt">${escapeHtml(gNameAlt)}</span></h2>` +
            `<p class="track-tagline">${escapeHtml(gTag || '')}</p>` +
            `<p class="track-intro">${escapeHtml(gIntro || '')}</p>` +
          `</div>` +
        `</header>` +
        `<div class="course-grid"></div>` +
      `</div>`;

    const grid = section.querySelector('.course-grid');
    subjects.forEach((s, idx) => grid.appendChild(buildCourseCard(s, g, idx + 1)));
    root.appendChild(section);
  });
}

function buildCourseCard(s, g, ordinal) {
  const a = document.createElement('a');
  a.className = 'course-card';
  a.dataset.status = s.status;
  a.style.setProperty('--g-accent', g.accent);
  a.href = resolveUrl(s);
  a.target = '_blank';
  a.rel = 'noopener noreferrer';

  const code    = `${g.id}·${String(ordinal).padStart(2, '0')}`;
  const name    = (state.lang === 'en') ? s.nameEn : s.nameZh;
  const nameAlt = (state.lang === 'en') ? s.nameZh : s.nameEn;
  const desc    = (state.lang === 'en') ? s.descEn : s.descZh;
  const open    = (state.lang === 'en') ? 'Open' : '進入模組';

  a.innerHTML =
    `<div class="c-meta"><span class="c-code">${code}</span>${statusPill(s.status)}</div>` +
    `<h3 class="c-title">${escapeHtml(name)}</h3>` +
    `<div class="c-alt">${escapeHtml(nameAlt)}</div>` +
    `<p class="c-desc">${escapeHtml(desc || '')}</p>` +
    `<div class="c-foot">` +
      `<code class="c-slug">${escapeHtml(s.slug)}</code>` +
      `<span class="c-open">${open}` +
        ` <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M9 7h8v8"/></svg>` +
      `</span>` +
    `</div>`;
  return a;
}

function statusPill(status) {
  const map = {
    deployed: { zh: '已上線', en: 'Live' },
    wip:      { zh: '修訂中', en: 'In revision' },
    planning: { zh: '規劃中', en: 'Planned' },
  };
  const lbl = map[status];
  const text = lbl ? (state.lang === 'en' ? lbl.en : lbl.zh) : status;
  return `<span class="c-status c-status-${status}"><span class="dot"></span>${escapeHtml(text)}</span>`;
}

function resolveUrl(s) {
  const user = state.data.githubUser || 'charlene717';
  const githubUrl = `https://${user}.github.io/${s.slug}/`;
  if (state.mode === 'local') return s.localPath || githubUrl;
  return githubUrl;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
