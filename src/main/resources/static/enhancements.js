// enhancements.js - progressive enhancement utilities (reveal animations, minor a11y helpers)
(function() {
  function revealOnScroll() {
    var elements = [].slice.call(document.querySelectorAll('[data-reveal]'));
    if (!elements.length) return;

    // Respect reduced motion
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      elements.forEach(function(el){ el.classList.add('revealed'); });
      return;
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
      elements.forEach(function(el) { io.observe(el); });
    } else {
      // Fallback: reveal all
      elements.forEach(function(el){ el.classList.add('revealed'); });
    }
  }

  function focusMainIfHash() {
    if (window.location.hash) {
      var main = document.getElementById('main-content');
      if (main) main.setAttribute('tabindex','-1');
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    revealOnScroll();
    focusMainIfHash();
  });
})();

