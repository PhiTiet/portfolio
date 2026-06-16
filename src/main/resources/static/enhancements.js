(function() {
  document.addEventListener('alpine:init', function() {
    Alpine.data('reveal', function(delay) {
      return {
        show: false,
        init: function() {
          revealAfterDelay(this, delay);
        }
      };
    });

    Alpine.data('scrollReveal', function(delay) {
      return {
        show: false,
        atBottom: false,
        init: function() {
          revealAfterDelay(this, delay);
        }
      };
    });
  });

  function revealAfterDelay(component, delay) {
    setTimeout(function() {
      component.show = true;
    }, Number(delay) || 0);
  }

  function focusMainIfHash() {
    if (!window.location.hash) {
      return;
    }

    var main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
    }
  }

  function currentSectionHash() {
    var sections = document.querySelectorAll('section[id]');
    var offset = window.scrollY + window.innerHeight / 3;

    for (var i = sections.length - 1; i >= 0; i--) {
      if (sections[i].offsetTop <= offset) {
        return '#' + sections[i].id;
      }
    }

    return '';
  }

  function initLangSwitchLinks() {
    document.querySelectorAll('[data-lang-switch]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = link.getAttribute('href') + currentSectionHash();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    focusMainIfHash();
    initLangSwitchLinks();
  });
})();
