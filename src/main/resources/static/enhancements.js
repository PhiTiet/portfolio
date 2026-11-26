(function() {
  document.addEventListener('alpine:init', function() {
    Alpine.data('photoCarousel', function() {
      var timer;
      var observer;
      var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      var motionChanged;
      return {
        active: 0,
        paused: false,
        hovered: false,
        focused: false,
        visible: false,
        reducedMotion: motion.matches,
        init() {
          observer = new IntersectionObserver(entries => {
            this.visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.25;
            this.sync();
          }, { threshold: 0.25 });
          observer.observe(this.$el);
          motionChanged = event => {
            this.reducedMotion = event.matches;
            this.sync();
          };
          motion.addEventListener('change', motionChanged);
        },
        sync() {
          clearInterval(timer);
          if (this.paused || this.hovered || this.focused || !this.visible || this.reducedMotion || document.hidden) return;
          timer = setInterval(() => {
            this.active = (this.active + 1) % this.$el.querySelectorAll('.photo-slide').length;
          }, 5000);
        },
        go(index) {
          this.active = index;
          this.sync();
        },
        destroy() {
          clearInterval(timer);
          observer.disconnect();
          motion.removeEventListener('change', motionChanged);
        }
      };
    });
  });

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

  var REVEAL_TARGETS = [
    '.section-heading', '#recommendations .section-body', '.career-entry', '.skill-item', '.expertise-card',
    '.project-group-title', '.project-card', '.oss-list li', '.certificate-card',
    '.hobbies-layout > *', '.contact-intro', '.contact-form-panel'
  ].join(', ');

  function initScrollReveal() {
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches || !('IntersectionObserver' in window)) return;
    var targets = document.getElementById('main-content').querySelectorAll(REVEAL_TARGETS);
    var reveal = function(target, delay) {
      target.style.setProperty('--reveal-delay', delay + 'ms');
      target.setAttribute('data-revealed', '');
    };
    var observer = new IntersectionObserver(function(entries) {
      entries.filter(function(entry) { return entry.isIntersecting; }).forEach(function(entry, index) {
        reveal(entry.target, Math.min(index, 4) * 80);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '-64px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function(target) {
      target.setAttribute('data-scroll-reveal', '');
      observer.observe(target);
    });
    document.documentElement.classList.add('scroll-motion');
    motion.addEventListener('change', function(event) {
      if (!event.matches) return;
      observer.disconnect();
      targets.forEach(function(target) { reveal(target, 0); });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    focusMainIfHash();
    initLangSwitchLinks();
    initScrollReveal();
    var sections = document.querySelectorAll('main > div > section[id]');
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.nav-link[href^="#"]').forEach(function(link) {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -25% 0px', threshold: 0 });
    sections.forEach(function(section) { observer.observe(section); });
    window.addEventListener('hashchange', focusMainIfHash);
  });
})();
