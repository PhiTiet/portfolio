(function() {
  function focusMainIfHash() {
    if (window.location.hash) {
      var main = document.getElementById('main-content');
      if (main) main.setAttribute('tabindex','-1');
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    focusMainIfHash();
  });
})();
