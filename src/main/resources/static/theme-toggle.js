(function() {
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.dataset.theme = 'dark';
    } else {
      root.classList.remove('dark');
      root.dataset.theme = 'light';
    }
    const btn = document.getElementById('themeToggle');
    if (btn) {
      const isDark = theme === 'dark';
      btn.setAttribute('aria-pressed', String(isDark));
      const lightIcon = btn.querySelector('.theme-icon-light');
      const darkIcon = btn.querySelector('.theme-icon-dark');
      if (lightIcon && darkIcon) {
        if (isDark) {
          lightIcon.classList.add('hidden');
          darkIcon.classList.remove('hidden');
        } else {
          darkIcon.classList.add('hidden');
          lightIcon.classList.remove('hidden');
        }
      }
    }
  }

  function preferred() {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch(e) { return 'light'; }
  }

  document.addEventListener('DOMContentLoaded', function() {
    applyTheme(document.documentElement.classList.contains('dark') ? 'dark' : preferred());

    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', function() {
      const isDark = document.documentElement.classList.toggle('dark');
      const theme = isDark ? 'dark' : 'light';
      try { localStorage.setItem('theme', theme); } catch(e) {}
      applyTheme(theme);
    });

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', function(e) {
      try {
        if (!localStorage.getItem('theme')) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      } catch(err) {}
    });
  });
})();
