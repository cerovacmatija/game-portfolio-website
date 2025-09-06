// script.js - SPA loader + theme toggle + UI wiring

// ---------- Utility: detect internal links ----------
function isInternalLink(href) {
  if (!href) return false;
  // treat same-origin relative links as internal
  try {
    const u = new URL(href, location.href);
    return u.origin === location.origin;
  } catch (e) {
    return false;
  }
}

// main content container
const content = document.getElementById('content');

// Load HTML fragment (partial) into #content
async function loadPage(url, push = true) {
  try {
    const res = await fetch(url, {cache: "no-store"});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // If this file is a full HTML doc, extract body content;
    // if it's already a fragment, this still works (no body found => use raw)
    let bodyContent = html;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const body = doc.querySelector('body');
      if (body) bodyContent = body.innerHTML;
    } catch (err) {
      // fallback: use raw html
    }

    content.innerHTML = bodyContent;

    // If URL contains a hash (#id), scroll into view after load
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const id = url.slice(hashIndex + 1);
      // allow small delay for layout
      setTimeout(() => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      // ensure top of page
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // push history
    if (push) history.pushState(null, '', url);

    // initialize dynamic behaviors in loaded content
    initContentFeatures();

  } catch (err) {
    content.innerHTML = `<div style="padding:2rem;color:#faa;background:#300;border-radius:8px;">
      Error loading <strong>${url}</strong>: ${err.message}
    </div>`;
    console.error('loadPage error', err);
  }
}

// initialize features that must be wired after content insertion
function initContentFeatures() {
  // wire any anchors inside content to SPA loader (internal only)
  content.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    // ignore external and mailto
    if (!isInternalLink(href) || href.startsWith('mailto:')) return;

    // if link points to same page hash (#...), let it behave normally
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const targetHref = a.getAttribute('href');
      loadPage(targetHref);
    });
  });

  // wire toggle-contrib buttons (if any)
  content.querySelectorAll('.toggle-contrib').forEach(btn => {
    btn.addEventListener('click', () => {
      const list = btn.nextElementSibling;
      if (list) list.classList.toggle('hidden');
    });
  });

  // wire view detail buttons that may exist inside loaded content:
  content.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-open-modal');
      const modal = document.getElementById(id);
      if (modal) modal.style.display = 'flex';
    });
  });

  // wire modal close buttons inside content
  content.querySelectorAll('.modal .close').forEach(x => {
    x.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) modal.style.display = 'none';
    });
  });

  // enable clicking outside modal to close
  content.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  });

  // wire game-card elements that use scrollToGame
  content.querySelectorAll('.game-card[data-scroll-to]').forEach(gc => {
    gc.addEventListener('click', () => {
      const id = gc.getAttribute('data-scroll-to');
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// handle header nav clicks (delegated)
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (!a) return;
  e.preventDefault();
  const href = a.getAttribute('href');
  if (!href) return;
  loadPage(href);
});

// handle browser back/forward
window.addEventListener('popstate', () => {
  const path = location.pathname.replace(/^\//, '') || 'home.html';
  loadPage(path, false);
});

// theme toggle wiring
function applyThemeButtonState() {
  const btn = document.getElementById('mode-toggle');
  if (!btn) return;
  if (document.body.classList.contains('lightmode')) btn.textContent = '☀️';
  else btn.textContent = '🌙';
}
function toggleTheme() {
  if (document.body.classList.contains('lightmode')) {
    document.body.classList.remove('lightmode');
    document.body.classList.add('darkmode');
    localStorage.setItem('theme','dark');
  } else {
    document.body.classList.remove('darkmode');
    document.body.classList.add('lightmode');
    localStorage.setItem('theme','light');
  }
  applyThemeButtonState();
}

// wire theme button
document.addEventListener('DOMContentLoaded', () => {
  // ensure existing body class present (index.html inlined early script already applied),
  // if none set, default to dark
  if (!document.body.classList.contains('lightmode') && !document.body.classList.contains('darkmode')) {
    document.body.classList.add('darkmode');
  }

  const toggle = document.getElementById('mode-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      toggleTheme();
    });
  }
  applyThemeButtonState();

  // load initial page (based on current path), default to home.html
  const initial = (location.pathname === '/' || location.pathname === '/index.html') ? 'home.html' : location.pathname.replace(/^\//,'');
  loadPage(initial || 'home.html', false);
});
