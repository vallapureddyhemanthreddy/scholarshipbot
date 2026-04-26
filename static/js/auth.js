window.currentUser = null;

const PROFILE_LABELS = {
  gpa: { icon: '📚', label: 'GPA', fmt: v => `${parseFloat(v).toFixed(1)}/10` },
  income: { icon: '💰', label: 'Family Income', fmt: v => `₹${(parseFloat(v)/100000).toFixed(1)}L/year` },
  category: { icon: '📋', label: 'Category', fmt: v => v },
  gender: { icon: '👤', label: 'Gender', fmt: v => v },
  state: { icon: '🗺️', label: 'State', fmt: v => v },
  course: { icon: '🎓', label: 'Course', fmt: v => v },
  year: { icon: '📅', label: 'Year', fmt: v => `Year ${parseInt(v)}` }
};

document.addEventListener('DOMContentLoaded', () => {
  fetchCurrentUser();
});

async function fetchCurrentUser() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      window.currentUser = data.user;
    } else {
      window.currentUser = null;
    }
  } catch (err) {
    window.currentUser = null;
  }
  updateAuthUI();
  window.dispatchEvent(new Event('auth-changed'));
}

function updateAuthUI() {
  const btnIcon = document.getElementById('account-icon');
  if (!btnIcon) return;

  if (window.currentUser) {
    btnIcon.style.color = 'var(--accent)';
    document.getElementById('dropdown-username').innerText = window.currentUser.username;
    document.getElementById('dropdown-role').innerText = window.currentUser.role === 'Admin' ? '🛡️ Admin' : '👤 User';
    document.getElementById('admin-panel-btn').style.display =
      window.currentUser.role === 'Admin' ? 'block' : 'none';
    document.getElementById('tracker-panel-btn').style.display = 'block';
    document.getElementById('notif-btn').style.display = 'flex';
    fetchNotifications();
  } else {
    btnIcon.style.color = 'currentColor';
    document.getElementById('tracker-panel-btn').style.display = 'none';
    document.getElementById('notif-btn').style.display = 'none';
  }
}

window.openAccountMenu = function(e) {
  if (e) e.stopPropagation();
  if (window.currentUser) {
    const dropdown = document.getElementById('account-dropdown');
    const isOpen = dropdown.style.display === 'block';
    dropdown.style.display = isOpen ? 'none' : 'block';
    const btnRect = document.getElementById('account-btn').getBoundingClientRect();
    dropdown.style.top = (btnRect.bottom + 8) + 'px';
    dropdown.style.right = (window.innerWidth - btnRect.right) + 'px';
  } else {
    toggleAuthModal();
  }
};

document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('account-dropdown');
  const btn = document.getElementById('account-btn');
  if (dropdown && dropdown.style.display === 'block' && !dropdown.contains(e.target) && !btn.contains(e.target)) {
    dropdown.style.display = 'none';
  }

  const nd = document.getElementById('notif-dropdown');
  const nb = document.getElementById('notif-btn');
  if (nd && nd.style.display === 'block' && !nd.contains(e.target) && !nb.contains(e.target)) {
    nd.style.display = 'none';
  }
});

// ─── AUTH MODAL ─────────────────────────────────────────────
window.toggleAuthModal = function() {
  const modal = document.getElementById('auth-modal');
  modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
};

window.switchAuthTab = function(tab) {
  const isLogin = tab === 'login';
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-signup').classList.toggle('active', !isLogin);
  document.getElementById('login-form').style.display = isLogin ? 'block' : 'none';
  document.getElementById('signup-form').style.display = isLogin ? 'none' : 'block';
  document.getElementById('auth-title').innerText = isLogin ? 'Login' : 'Sign Up';
  document.getElementById('auth-error').style.display = 'none';
};

function showAuthError(msg) {
  const errDiv = document.getElementById('auth-error');
  errDiv.innerText = msg;
  errDiv.style.display = 'block';
}

window.handleLogin = async function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      window.currentUser = data.user;
      toggleAuthModal();
      updateAuthUI();
      window.dispatchEvent(new Event('auth-changed'));
    } else {
      showAuthError(data.error || 'Login failed');
    }
  } catch (err) { showAuthError('Connection error'); }
};

window.handleSignup = async function(e) {
  e.preventDefault();
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      window.currentUser = data.user;
      toggleAuthModal();
      updateAuthUI();
      window.dispatchEvent(new Event('auth-changed'));
    } else {
      showAuthError(data.error || 'Signup failed');
    }
  } catch (err) { showAuthError('Connection error'); }
};

window.handleLogout = async function() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.currentUser = null;
  document.getElementById('account-dropdown').style.display = 'none';
  updateAuthUI();
  window.dispatchEvent(new Event('auth-changed'));
};

// ─── PROFILE DETAILS MODAL ──────────────────────────────────
window.openProfileDetails = function() {
  document.getElementById('account-dropdown').style.display = 'none';
  const savedProfile = getSavedProfile ? getSavedProfile() : null;
  const modal = document.getElementById('profile-details-modal');

  if (!savedProfile || Object.keys(savedProfile).length === 0) {
    document.getElementById('profile-details-body').innerHTML =
      `<div style="color:var(--text-3);text-align:center;padding:20px 0;">
         No profile saved yet. Chat with ScholarBot and provide your details first.
       </div>`;
  } else {
    const rows = Object.entries(PROFILE_LABELS).map(([key, meta]) => {
      const val = savedProfile[key];
      if (!val && val !== 0) return '';
      return `<div class="profile-detail-row">
        <span class="profile-detail-icon">${meta.icon}</span>
        <div>
          <div class="profile-detail-label">${meta.label}</div>
          <div class="profile-detail-val">${meta.fmt(val)}</div>
        </div>
      </div>`;
    }).join('');
    document.getElementById('profile-details-body').innerHTML = rows;
  }

  modal.style.display = 'flex';
};

window.closeProfileDetails = function() {
  document.getElementById('profile-details-modal').style.display = 'none';
};

window.openAdminPanel = function() {
  document.getElementById('account-dropdown').style.display = 'none';
  document.getElementById('admin-modal').style.display = 'flex';
  backToScholarshipList();
};

window.closeAdminPanel = function() {
  document.getElementById('admin-modal').style.display = 'none';
};

async function loadAdminScholarships() {
  try {
    const res = await fetch('/api/admin/scholarships');
    const records = await res.json();
    const list = document.getElementById('admin-scholarship-list');

    if (!Array.isArray(records) || records.length === 0) {
      list.innerHTML = '<div style="color:var(--text-3);padding:12px;">No scholarships found.</div>';
      return;
    }

    list.innerHTML = records.map(s => `
      <div class="admin-sch-row">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(s.name)}</div>
          <div style="font-size:11.5px;color:var(--text-3);">${escHtml(s.provider)} · ${escHtml(s.amount || '—')} · ${escHtml(s.category)} · ${escHtml(s.gender)} · ${escHtml(s.state)}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          <button class="admin-action-btn edit-btn" onclick="openEditScholarship(${s.id})">Edit</button>
          <button class="admin-action-btn delete-btn" onclick="deleteScholarship(${s.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

window.openEditScholarship = async function(id) {
  const res = await fetch('/api/admin/scholarships');
  const records = await res.json();
  const s = records.find(r => r.id === id);
  if (!s) return;

  const content = document.querySelector('#admin-modal .admin-content');
  content.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <button onclick="backToScholarshipList()" class="back-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </button>
      <h3 style="margin:0;">Edit Scholarship <span style="font-size:12px;color:var(--text-3);font-weight:400;">#${s.id}</span></h3>
    </div>
    <form onsubmit="submitEditScholarship(event, ${s.id})" class="admin-add-form">
      <input type="text" class="modal-input" name="name" placeholder="Scholarship Name" value="${escAttr(s.name)}" required>
      <input type="text" class="modal-input" name="provider" placeholder="Provider" value="${escAttr(s.provider)}" required>
      <div style="display:flex;gap:10px;">
        <input type="number" class="modal-input" name="min_gpa" placeholder="Min GPA" step="0.1" value="${s.min_gpa}">
        <input type="number" class="modal-input" name="max_income" placeholder="Max Income" value="${s.max_income}">
      </div>
      <div style="display:flex;gap:10px;">
        <input type="text" class="modal-input" name="category" placeholder="Category (All/SC/ST/OBC)" value="${escAttr(s.category)}">
        <input type="text" class="modal-input" name="gender" placeholder="Gender (All/Male/Female)" value="${escAttr(s.gender)}">
      </div>
      <input type="text" class="modal-input" name="state" placeholder="State (All or state name)" value="${escAttr(s.state)}">
      <input type="text" class="modal-input" name="deadline" placeholder="Deadline" value="${escAttr(s.deadline || '')}">
      <input type="text" class="modal-input" name="amount" placeholder="Amount (e.g. ₹50,000/year)" value="${escAttr(s.amount || '')}">
      <input type="url" class="modal-input" name="link" placeholder="Apply Link URL" value="${escAttr(s.link || '')}">
      <input type="text" class="modal-input" name="course" placeholder="Course (All/B.Tech/B.Sc...)" value="${escAttr(s.course)}">
      <div style="display:flex;gap:10px;">
        <input type="number" class="modal-input" name="min_year" placeholder="Min Year" value="${s.min_year}">
        <input type="number" class="modal-input" name="max_year" placeholder="Max Year" value="${s.max_year}">
      </div>
      <textarea class="modal-input" name="description" placeholder="Description" rows="3" style="resize:vertical;">${escHtml(s.description || '')}</textarea>
      <textarea class="modal-input" name="documents_required" placeholder="Documents Required" rows="2" style="resize:vertical;">${escHtml(s.documents_required || '')}</textarea>
      <div style="display:flex;gap:10px;margin-top:4px;">
        <button type="submit" class="modal-btn">💾 Save Changes</button>
        <button type="button" class="modal-btn" onclick="backToScholarshipList()" style="background:var(--bg-hover);color:var(--text);">Cancel</button>
      </div>
    </form>`;

  // Scroll modal back to top
  const modalEl = document.querySelector('#admin-modal .modal');
  if (modalEl) modalEl.scrollTop = 0;
};

window.backToScholarshipList = function() {
  const content = document.querySelector('#admin-modal .admin-content');
  content.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <h3 style="margin:0;">Add New Scholarship</h3>
      <button onclick="fetchLiveScholarships()" class="modal-btn" style="background:var(--accent);display:flex;align-items:center;gap:6px;width:auto;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 2.6-6.4L2 9"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 1 0-2.6 6.4l3.5-3.5"/></svg>
        Fetch Live Scholarships
      </button>
    </div>
    
    <div id="scrape-queue-wrap" style="display:none;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h4 style="margin:0;color:var(--text-2);font-size:13px;display:flex;align-items:center;gap:6px;">
          <span class="pulse-dot" style="width:8px;height:8px;background:var(--success);border-radius:50%;display:inline-block;"></span>
          Scraped Scholarships Queue
        </h4>
        <button onclick="closeScrapeQueue()" style="background:none;border:none;color:var(--text-3);cursor:pointer;">✕</button>
      </div>
      <div id="scrape-queue-list"></div>
    </div>

    <form id="add-scholarship-form" onsubmit="handleAddScholarship(event)" class="admin-add-form">
      <input type="text" id="add-name" class="modal-input" placeholder="Scholarship Name" required>
      <input type="text" id="add-provider" class="modal-input" placeholder="Provider" required>
      <div style="display:flex;gap:10px;">
        <input type="number" id="add-min_gpa" class="modal-input" placeholder="Min GPA (e.g 7.5)" step="0.1">
        <input type="number" id="add-max_income" class="modal-input" placeholder="Max Income">
      </div>
      <input type="text" id="add-amount" class="modal-input" placeholder="Amount (e.g. ₹50,000/year)">
      <input type="url" id="add-link" class="modal-input" placeholder="Apply Link URL">
      <button type="submit" class="modal-btn">Add Scholarship</button>
    </form>
    <div id="edit-scholarship-form-wrap" style="display:none;"></div>
    <h3 style="margin-top:24px;margin-bottom:10px;">All Scholarships <span id="scholarship-count" style="font-size:12px;color:var(--text-3);"></span></h3>
    <div id="admin-scholarship-list" class="admin-list"></div>`;
  loadAdminScholarships();
};

let scrapedCache = [];

window.fetchLiveScholarships = async function() {
  const btn = document.querySelector('button[onclick="fetchLiveScholarships()"]');
  if (btn) btn.innerHTML = '<span class="typing-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></span> Fetching...';
  
  try {
    const res = await fetch('/api/admin/scrape-scholarships');
    const data = await res.json();
    scrapedCache = data;
    
    document.getElementById('scrape-queue-wrap').style.display = 'block';
    renderScrapeQueue();
  } catch (e) {
    alert('Failed to fetch live scholarships.');
  } finally {
    if (btn) btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 2.6-6.4L2 9"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 1 0-2.6 6.4l3.5-3.5"/></svg> Fetch Live Scholarships';
  }
};

window.renderScrapeQueue = function() {
  const list = document.getElementById('scrape-queue-list');
  if (scrapedCache.length === 0) {
    list.innerHTML = '<div style="font-size:12px;color:var(--text-3);">Queue empty. All approved or none found.</div>';
    return;
  }
  
  list.innerHTML = scrapedCache.map((s, idx) => `
    <div class="admin-sch-row" style="background:var(--bg-card);border:1px solid rgba(255,255,255,0.05);margin-bottom:8px;">
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--success);">${escHtml(s.name)}</div>
        <div style="font-size:11px;color:var(--text-3);">${escHtml(s.provider)} · ${escHtml(s.amount)} · Deadline: ${escHtml(s.deadline)}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button class="admin-action-btn" style="color:var(--bg);background:var(--success);border:none;font-weight:600;" onclick="approveScraped(${idx})">Approve & Add</button>
      </div>
    </div>
  `).join('');
};

window.closeScrapeQueue = function() {
  document.getElementById('scrape-queue-wrap').style.display = 'none';
  scrapedCache = [];
};

window.approveScraped = async function(idx) {
  const s = scrapedCache[idx];
  if (!s) return;
  
  try {
    await fetch('/api/admin/scholarships', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s)
    });
    
    // Remove from queue
    scrapedCache.splice(idx, 1);
    renderScrapeQueue();
    loadAdminScholarships();
  } catch(e) {
    alert('Failed to approve scholarship');
  }
};



window.submitEditScholarship = async function(e, id) {
  e.preventDefault();
  const form = e.target;
  const data = {};
  new FormData(form).forEach((v, k) => data[k] = v);

  await fetch('/api/admin/scholarships/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  document.getElementById('edit-scholarship-form-wrap').style.display = 'none';
  loadAdminScholarships();
};

window.deleteScholarship = async function(id) {
  if (!confirm('Delete this scholarship permanently?')) return;
  await fetch('/api/admin/scholarships/' + id, { method: 'DELETE' });
  document.getElementById('edit-scholarship-form-wrap').style.display = 'none';
  loadAdminScholarships();
};

window.handleAddScholarship = async function(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById('add-name').value,
    provider: document.getElementById('add-provider').value,
    min_gpa: document.getElementById('add-min_gpa').value,
    max_income: document.getElementById('add-max_income').value,
    amount: document.getElementById('add-amount').value,
    link: document.getElementById('add-link').value
  };
  await fetch('/api/admin/scholarships', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  e.target.reset();
  loadAdminScholarships();
};

function escAttr(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── TRACKER PANEL ─────────────────────────────────────────────
window.openTrackerPanel = function() {
  document.getElementById('account-dropdown').style.display = 'none';
  document.getElementById('tracker-modal').style.display = 'flex';
  loadTrackerScholarships();
};

window.closeTrackerPanel = function() {
  document.getElementById('tracker-modal').style.display = 'none';
};

async function loadTrackerScholarships() {
  try {
    const res = await fetch('/api/my-applications');
    const records = await res.json();
    const list = document.getElementById('tracker-scholarship-list');

    if (!Array.isArray(records) || records.length === 0) {
      list.innerHTML = `
        <div style="color:var(--text-3);padding:32px 16px;text-align:center;">
          <div style="font-size:32px;margin-bottom:12px;">📌</div>
          No tracked scholarships yet.<br>Matches you save in chat will appear here.
        </div>`;
      return;
    }

    list.innerHTML = records.map(s => `
      <div class="admin-sch-row">
        <div class="admin-sch-main">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
             <strong style="color:var(--text)">${s.name}</strong>
             <span class="status-pill status-${s.status.toLowerCase()}">${s.status}</span>
          </div>
          <div style="font-size:12px;color:var(--text-3);margin-top:2px;">
            ${s.provider} • Added on ${new Date(s.added_on).toLocaleDateString()}
          </div>
        </div>
        <div class="admin-sch-actions" style="display:flex;gap:8px;margin-top:10px;">
          <select class="tracker-select" onchange="updateTrackStatus(${s.id}, this.value)">
            <option value="Saved" ${s.status === 'Saved' ? 'selected' : ''}>Saved</option>
            <option value="Applied" ${s.status === 'Applied' ? 'selected' : ''}>Applied</option>
            <option value="Awarded" ${s.status === 'Awarded' ? 'selected' : ''}>Awarded</option>
            <option value="Rejected" ${s.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
          ${s.status === 'Saved' ? `<a href="${s.link}" target="_blank" class="modal-btn" style="padding:6px 12px;font-size:12px;width:auto;">Apply</a>` : ''}
          <button class="modal-btn delete-btn" onclick="untrackScholarship(${s.id})" style="padding:6px 12px;font-size:12px;width:auto;background:rgba(239, 68, 68, 0.1);color:#ef4444;border-color:rgba(239, 68, 68, 0.2);">Remove</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

window.updateTrackStatus = async function(trackId, status) {
  try {
    // Note: trackId here is the id in user_applications table (returned as id in our JOIN)
    // Wait, in my JOIN I used a.id as track_id
    // Let me re-check the SQL.
    // SELECT a.id as track_id, a.status, a.added_on, s.* 
    // In JS, I am passing s.id which is the scholarship_id.
    // I should pass s.id to /api/track to update.
    const res = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scholarship_id: trackId, status: status })
    });
    const data = await res.json();
    if (data.success) {
      loadTrackerScholarships(); // Refresh
    }
  } catch (err) {
    console.error(err);
  }
};

window.untrackScholarship = async function(id) {
  if (!confirm('Remove this scholarship from your dashboard?')) return;
  try {
    const res = await fetch('/api/untrack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scholarship_id: id })
    });
    const data = await res.json();
    if (data.success) {
      loadTrackerScholarships();
    }
  } catch (err) {
    console.error(err);
  }
};

// ─── NOTIFICATIONS ─────────────────────────────────────────────
window.toggleNotifMenu = function(e) {
  if (e) e.stopPropagation();
  const nd = document.getElementById('notif-dropdown');
  const isOpen = nd.style.display === 'block';
  
  if (!isOpen) {
    nd.style.display = 'block';
    const btnRect = document.getElementById('notif-btn').getBoundingClientRect();
    nd.style.top = (btnRect.bottom + 8) + 'px';
    nd.style.right = (window.innerWidth - btnRect.right) + 'px';
    markNotifsAsRead();
  } else {
    nd.style.display = 'none';
  }
};

async function fetchNotifications() {
  if (!window.currentUser) return;
  try {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    const list = document.getElementById('notif-list');
    const badge = document.getElementById('notif-badge');
    
    const unreadCount = data.filter(n => !n.is_read).length;
    badge.innerText = unreadCount > 9 ? '9+' : unreadCount;
    badge.style.display = unreadCount > 0 ? 'block' : 'none';

    if (data.length === 0) {
      list.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-3);font-size:13px;">No notifications yet</div>`;
      return;
    }

    list.innerHTML = data.map(n => `
      <div class="notif-item ${!n.is_read ? 'unread' : ''} ${n.type}">
        ${n.message}
        <div style="font-size:10px;color:var(--text-3);margin-top:4px;">${new Date(n.created_at).toLocaleString()}</div>
      </div>
    `).join('');
  } catch (err) { console.error(err); }
}

async function markNotifsAsRead() {
  await fetch('/api/notifications/read', { method: 'POST' });
  setTimeout(() => {
     document.getElementById('notif-badge').style.display = 'none';
  }, 1000);
}

