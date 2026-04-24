// ═══════════════════════════════════════════════════
//  ScholarBot — Claude-powered Chat Engine
// ═══════════════════════════════════════════════════

const STEPS = ['gpa', 'income', 'category', 'gender', 'state', 'course', 'year'];
const STEP_LABELS = ['GPA', 'Income', 'Category', 'Gender', 'State', 'Course', 'Year'];

let busy = false;
let collectedFields = [];
let currentThreadId = Date.now().toString();

// ─── Init ────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved, false);
  document.getElementById('input').addEventListener('input', onInputChange);
  document.getElementById('input').focus();

  // Success Stardust Global Trigger
  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-premium') || e.target.closest('.sch-apply')) {
      triggerStardust(e.clientX, e.clientY);
    }
  });

  // Hide splash screen after premium animation completes (about 2.8s)
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.add('fade-out');
      document.querySelector('.layout').classList.add('reveal');
      setTimeout(() => splash.remove(), 1300);
    }
  }, 2800);

  // Show welcome screen by default, but render history in sidebar
  // Init Hyper-Space Idle Animation
  initWarpDrive();
  resetIdleTimer();

  window.addEventListener('auth-changed', () => {
    startNewChat();
  });
});

function onInputChange() {
  const val = document.getElementById('input').value.trim();
  document.getElementById('send-btn').disabled = !val || busy;
  grow(document.getElementById('input'));
}

// ─── Theme ────────────────────────────────────────────
function applyTheme(t, save = true) {
  document.documentElement.setAttribute('data-theme', t);
  const sun = document.querySelector('.icon-sun');
  const moon = document.querySelector('.icon-moon');
  const lbl = document.getElementById('theme-label');
  if (t === 'dark') {
    sun.style.display = 'block';
    moon.style.display = 'none';
    lbl.textContent = 'Light mode';
  } else {
    sun.style.display = 'none';
    moon.style.display = 'block';
    lbl.textContent = 'Dark mode';
  }
  if (save) localStorage.setItem('theme', t);
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}

// ─── Sidebar ────────────────────────────────────────────
// Sidebar is now permanently visible. Toggle functions removed.


// ─── Send ────────────────────────────────────────────
function onKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
}

function grow(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 200) + 'px';
}

async function send() {
  if (busy) return;
  const input = document.getElementById('input');
  const msg = input.value.trim();
  if (!msg) return;

  hideWelcome();
  appendUserMsg(msg);
  input.value = '';
  input.style.height = 'auto';
  document.getElementById('send-btn').disabled = true;
  busy = true;

  const typing = appendTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();

    await delay(400 + Math.random() * 300);
    typing.remove();

    if (data.reset) {
      collectedFields = [];
      updateProgressUI(0);
    }

    if (data.collected_fields) {
      collectedFields = data.collected_fields;
      const count = collectedFields.length;
      updateProgressUI(count);
      const pill = document.getElementById('profile-pill');
      if (count > 0) {
        pill.style.display = 'flex';
        document.getElementById('profile-pill-text').textContent = `${count}/7 collected`;
      }
    }

    appendBotMsg(data.reply);

    if (data.scholarships && data.scholarships.length > 0) {
      await delay(200);
      appendScholarships(data.scholarships);
    }

    // Save the full profile to localStorage once we have all results
    if (data.show_results) {
      const profileRes = await fetch('/api/profile');
      const profileData = await profileRes.json();
      if (Object.keys(profileData).length > 0) {
        localStorage.setItem(getSavedProfileKey(), JSON.stringify(profileData));
      }
    }

    saveToThread(msg, data.reply, data.scholarships);

  } catch (err) {
    typing.remove();
    appendBotMsg('⚠️ Connection error. Please try again.');
    console.error(err);
  } finally {
    busy = false;
    document.getElementById('send-btn').disabled = false;
    input.focus();
  }
}

function injectMessage(text) {
  const input = document.getElementById('input');
  input.value = text;
  grow(input);
  document.getElementById('send-btn').disabled = false;
  send();
  closeSidebar();
}

async function startNewChat() {
  await fetch('/api/reset', { method: 'POST' });

  // Restore saved profile into the Flask session so the bot remembers them
  const savedProfile = getSavedProfile();
  if (savedProfile && Object.keys(savedProfile).length > 0) {
    await fetch('/api/profile/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedProfile)
    });
  }

  currentThreadId = Date.now().toString();
  renderRecentSearches();
  collectedFields = [];
  updateProgressUI(0);
  document.getElementById('profile-pill').style.display = 'none';

  const msgs = document.getElementById('messages');
  msgs.innerHTML = '';

  // Re-inject welcome screen
  msgs.innerHTML = `
    <div class="welcome" id="welcome">
      <div class="welcome-icon">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <h1>How can I help you?</h1>
      <p>I'm ScholarBot — your AI guide to Indian scholarships. Chat naturally, I understand everything.</p>
      <div class="suggestion-grid">
        <button class="suggestion btn-premium" onclick="injectMessage('Hi! Help me find scholarships')">
          <span class="suggestion-icon">🎓</span><span>Find my scholarships</span>
        </button>
        <button class="suggestion btn-premium" onclick="injectMessage('What documents do I need for scholarships?')">
          <span class="suggestion-icon">📄</span><span>Documents required</span>
        </button>
        <button class="suggestion btn-premium" onclick="injectMessage('Explain the NSP portal and how to apply')">
          <span class="suggestion-icon">🌐</span><span>NSP portal guide</span>
        </button>
        <button class="suggestion btn-premium" onclick="injectMessage('What scholarships exist for girls in engineering?')">
          <span class="suggestion-icon">👩‍💻</span><span>Girls in engineering</span>
        </button>
        <button class="suggestion btn-premium" onclick="injectMessage('I am SC category student with 75% marks, income 2 lakh. What can I get?')">
          <span class="suggestion-icon">⚡</span><span>Quick profile match</span>
        </button>
        <button class="suggestion btn-premium" onclick="injectMessage('Scholarships list show chei (English/Telugu mixed)')">
          <span class="suggestion-icon">🗣️</span><span>English & Telugu</span>
        </button>
      </div>
    </div>`;

  closeSidebar();
}

// ─── DOM helpers ────────────────────────────────────────────
function hideWelcome() {
  const w = document.getElementById('welcome');
  if (w) {
    w.style.transition = 'opacity .2s';
    w.style.opacity = '0';
    setTimeout(() => w.remove(), 200);
  }
}

function appendUserMsg(text) {
  const wrap = document.createElement('div');
  wrap.className = 'msg-wrap';
  wrap.innerHTML = `
    <div class="msg-row user">
      <div class="avatar">You</div>
      <div class="bubble">${escHtml(text).replace(/\n/g, '<br>')}</div>
    </div>`;
  document.getElementById('messages').appendChild(wrap);
  scrollBottom();
}

function appendBotMsg(markdown) {
  const wrap = document.createElement('div');
  wrap.className = 'msg-wrap';
  wrap.innerHTML = `
    <div class="msg-row bot">
      <div class="avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
      </div>
      <div class="bubble">${renderMd(markdown)}</div>
    </div>`;
  document.getElementById('messages').appendChild(wrap);
  scrollBottom();
}

function appendTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'msg-wrap';
  wrap.innerHTML = `
    <div class="typing-row">
      <div class="avatar" style="background:var(--accent);color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
      </div>
      <div class="typing-dots">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>
    </div>`;
  document.getElementById('messages').appendChild(wrap);
  scrollBottom();
  return wrap;
}

function appendScholarships(list) {
  const section = document.createElement('div');
  section.className = 'cards-section';
  section.innerHTML = `<div class="cards-section-title">Your Scholarship Matches (${list.length})</div>
    <div class="cards-grid" id="cards-grid"></div>`;
  document.getElementById('messages').appendChild(section);

  const grid = section.querySelector('#cards-grid');
  list.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'sch-card';
    card.style.animationDelay = `${i * 0.07}s`;

    const tags = (s.reasons || []).map((r, ri) => {
      const cls = (r.includes('%') || r.toLowerCase().includes('match')) ? 'match-scan' : 'sch-tag';
      return `<span class="${cls}">${escHtml(r)}</span>`;
    }).join('');

    card.innerHTML = `
      <div class="sch-card-head">
        <div class="sch-icon">🏆</div>
        <div class="sch-info">
          <div class="sch-name">${escHtml(s.name)}</div>
          <div class="sch-provider">${escHtml(s.provider)}</div>
        </div>
      </div>
      <div class="sch-body">
        <div class="sch-amount">${escHtml(s.amount || 'Varies')}</div>
        <div class="sch-deadline">Deadline: ${escHtml(s.deadline || 'Ongoing')}</div>
      </div>
      <div class="sch-tags">${tags}</div>
      <div class="sch-actions">
        <a href="${s.link}" target="_blank" class="sch-apply">Apply Now</a>
        <button onclick="trackScholarship(${s.id})" class="sch-track-btn">📌 Track</button>
      </div>`;
    grid.appendChild(card);
  });

  scrollBottom();
}

// ─── Progress UI ────────────────────────────────────────────
function updateProgressUI(count) {
  const wrap = document.getElementById('progress-bar-wrap');
  const fill = document.getElementById('progress-fill');
  const row = document.getElementById('progress-steps-row');

  if (count === 0) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = 'block';
  fill.style.width = `${Math.min(count / 7 * 100, 100)}%`;

  // Filled steps go left, unfilled steps go right
  const doneSteps = STEPS.filter(s => collectedFields.includes(s));
  const pendingSteps = STEPS.filter(s => !collectedFields.includes(s));
  const orderedSteps = [...doneSteps, ...pendingSteps];

  row.innerHTML = orderedSteps.map((s) => {
    const isDone = collectedFields.includes(s);
    const cls = isDone ? 'ps done' : 'ps';
    const dotCls = isDone ? 'ps-dot done' : 'ps-dot';
    return `<div class="${cls}"><div class="${dotCls}"></div>${STEP_LABELS[STEPS.indexOf(s)]}</div>`;
  }).join('');
}

// ─── Utilities ────────────────────────────────────────────
function scrollBottom() {
  const m = document.getElementById('messages');
  setTimeout(() => { m.scrollTop = m.scrollHeight; }, 60);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function escHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMd(text) {
  if (!text) return '';
  let t = text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Bullets (• or - or *)
    .replace(/^[•\-]\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*?<\/li>\n?)+/gs, (m) => `<ul>${m}</ul>`)
    // Newlines to <br>
    .replace(/\n/g, '<br>');
  return t;
}

// ─── Chat History ──────────────────────────────────────────
function getThreadKey() {
  return window.currentUser ? 'chatThreads_' + window.currentUser.email : 'chatThreads_guest';
}

function getSavedProfileKey() {
  return window.currentUser ? 'savedProfile_' + window.currentUser.email : 'savedProfile_guest';
}

function getSavedProfile() {
  try {
    return JSON.parse(localStorage.getItem(getSavedProfileKey()) || 'null');
  } catch { return null; }
}

function saveToThread(userMsg, botReply, scholarships) {
  let threads = JSON.parse(localStorage.getItem(getThreadKey()) || '{}');
  if (!threads[currentThreadId]) {
    threads[currentThreadId] = {
      id: currentThreadId,
      title: userMsg.substring(0, 25) + (userMsg.length > 25 ? '...' : ''),
      msgs: [],
      time: Date.now()
    };
  }
  threads[currentThreadId].msgs.push({ userMsg, botReply, scholarships });
  threads[currentThreadId].time = Date.now();

  // Keep 5 latest
  let all = Object.values(threads).sort((a, b) => b.time - a.time);
  if (all.length > 5) {
    all = all.slice(0, 5);
    let newThreads = {};
    all.forEach(t => newThreads[t.id] = t);
    localStorage.setItem(getThreadKey(), JSON.stringify(newThreads));
  } else {
    localStorage.setItem(getThreadKey(), JSON.stringify(threads));
  }
  renderRecentSearches();
}

function renderRecentSearches() {
  let container = document.getElementById('recent-searches-list');
  if (!container) return;
  let threads = JSON.parse(localStorage.getItem(getThreadKey()) || '{}');
  let all = Object.values(threads).sort((a, b) => b.time - a.time);

  // Preserve collapse state across re-renders
  const wasCollapsed = container.classList.contains('history-collapsed');

  let html = '<div class="nav-label history-header" style="margin-top:20px; display:flex; align-items:center; justify-content:space-between; padding-right:4px;">'
    + '<span>Previous Chats</span>'
    + '<div style="display:flex; align-items:center; gap:4px;">'
    + (all.length > 0
      ? '<button class="clear-all-btn" onclick="clearAllHistory()" title="Clear all history">'
      + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>'
      + 'Clear all</button>'
      : '')
    + '<button class="history-toggle-btn" onclick="toggleHistorySection()" title="Toggle history">'
    + '<svg class="history-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>'
    + '</button>'
    + '</div>'
    + '</div>';

  html += '<div class="history-list-body">';
  if (all.length === 0) {
    html += '<div class="history-empty">No chats yet. Start a conversation!</div>';
  } else {
    all.forEach(t => {
      let activeCls = (t.id === currentThreadId) ? 'nav-item history-item active' : 'nav-item history-item';
      html += '<div class="history-item-wrap">'
        + '<button class="' + activeCls + '" onclick="loadThread(\'' + t.id + '\')">'
        + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
        + '<span class="history-title">' + escHtml(t.title) + '</span>'
        + '</button>'
        + '<button class="delete-chat-btn" onclick="deleteThread(\'' + t.id + '\')" title="Delete this chat">'
        + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>'
        + '</button>'
        + '</div>';
    });
  }
  html += '</div>';

  container.style.display = 'block';
  container.innerHTML = html;

  // Restore collapse state
  if (wasCollapsed) container.classList.add('history-collapsed');
}

function toggleHistorySection() {
  const container = document.getElementById('recent-searches-list');
  container.classList.toggle('history-collapsed');
}

function deleteThread(id) {
  let threads = JSON.parse(localStorage.getItem(getThreadKey()) || '{}');
  delete threads[id];
  localStorage.setItem(getThreadKey(), JSON.stringify(threads));

  // If the deleted thread was active, start a fresh chat
  if (id === currentThreadId) {
    startNewChat();
  } else {
    renderRecentSearches();
  }
}

function clearAllHistory() {
  if (!confirm('Clear all chat history? This cannot be undone.')) return;
  localStorage.removeItem(getThreadKey());
  startNewChat();
}

window.loadThread = async function (id) {
  let threads = JSON.parse(localStorage.getItem(getThreadKey()) || '{}');
  let t = threads[id];
  if (!t) return;

  currentThreadId = id;
  // Reset backend session
  await fetch('/api/reset', { method: 'POST' });
  collectedFields = [];
  updateProgressUI(0);
  document.getElementById('profile-pill').style.display = 'none';

  const msgs = document.getElementById('messages');
  msgs.innerHTML = '';

  t.msgs.forEach(m => {
    appendUserMsg(m.userMsg);
    appendBotMsg(m.botReply);
    if (m.scholarships && m.scholarships.length > 0) {
      appendScholarships(m.scholarships);
    }
  });
  renderRecentSearches();
  closeSidebar();
};

// ─── Hyper-Space Idle Animation ─────────────────────────────

let idleTimer;
const IDLE_TIME = 120000; // 2 mins

window.resetIdleTimer = function () {
  clearTimeout(idleTimer);
  const layout = document.querySelector('.layout');
  if (layout) layout.classList.remove('is-idle');

  idleTimer = setTimeout(() => {
    if (layout) layout.classList.add('is-idle');
  }, IDLE_TIME);
};

// Listen to user activity to reset the timer
['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, resetIdleTimer);
});

window.initWarpDrive = function () {
  const canvas = document.getElementById('warpCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const numStars = 400;
  const stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * w - w / 2,
      y: Math.random() * h - h / 2,
      z: Math.random() * w
    });
  }

  function draw() {
    requestAnimationFrame(draw);
    const layout = document.querySelector('.layout');
    // Only draw and animate if the layout has is-idle
    if (!layout || !layout.classList.contains('is-idle')) return;

    // slight clear for trail effect
    ctx.fillStyle = 'rgba(10, 10, 15, 0.4)';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    for (let i = 0; i < numStars; i++) {
      let s = stars[i];
      s.z -= 4; // speed

      if (s.z <= 0) {
        s.x = Math.random() * w - w / 2;
        s.y = Math.random() * h - h / 2;
        s.z = w;
      }

      let sx = s.x * (w / s.z) + cx;
      let sy = s.y * (w / s.z) + cy;
      let size = (1 - s.z / w) * 2;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  draw();
};


// ─── Voice Input ───────────────────────────────────────
let recognition = null;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN'; // Optimized for Indian English/Hinglish

  recognition.onstart = () => {
    document.getElementById('voice-btn').classList.add('recording');
  };

  recognition.onend = () => {
    document.getElementById('voice-btn').classList.remove('recording');
  };

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    const input = document.getElementById('input');
    input.value = text;
    grow(input);
    document.getElementById('send-btn').disabled = false;
    send();
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    document.getElementById('voice-btn').classList.remove('recording');
  };
}

window.toggleVoiceInput = function () {
  if (!recognition) {
    alert('Voice Input is not supported by your browser.');
    return;
  }
  try {
    recognition.start();
  } catch (e) {
    recognition.stop();
  }
};

window.trackScholarship = async function (id) {
  if (!window.currentUser) {
    alert('Please login to track your scholarships!');
    toggleAuthModal();
    return;
  }

  try {
    const res = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scholarship_id: id, status: 'Saved' })
    });
    const data = await res.json();
    if (data.success) {
      alert('📌 Scholarship added to your dashboard!');
    }
  } catch (err) {
    console.error(err);
  }
};
