(function() {
  function focusMainIfHash() {
    if (window.location.hash) {
      var target = document.getElementById(window.location.hash.slice(1));
      if (target) {
        if (target.tagName === 'DETAILS') target.open = true;
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }
  }

  function findCurrentSection() {
    var sections = document.querySelectorAll('section[id]');
    var current = null;
    var offset = window.scrollY + window.innerHeight / 3;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= offset) {
        current = sections[i];
      }
    }
    return current;
  }

  function initLangSwitchLinks() {
    document.querySelectorAll('[data-lang-switch]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var section = findCurrentSection();
        var hash = section ? '#' + section.id : '';
        window.location.href = link.getAttribute('href') + hash;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    focusMainIfHash();
    initLangSwitchLinks();
    var sections = document.querySelectorAll('main > div > section[id]');
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.nav-link[href^="#"]').forEach(function(link) {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
        var content = entry.target.querySelector('.section-layout');
        if (content && !content.dataset.revealed) {
          content.classList.add('reveal');
          content.dataset.revealed = 'true';
        }
      });
    }, { rootMargin: '-15% 0px -25% 0px', threshold: 0 });
    sections.forEach(function(section) { observer.observe(section); });
    window.addEventListener('hashchange', focusMainIfHash);
  });
})();
