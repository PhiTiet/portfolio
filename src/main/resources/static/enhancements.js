(function() {
  function focusMainIfHash() {
    if (window.location.hash) {
      var main = document.getElementById('main-content');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
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
  });
})();
