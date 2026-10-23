(function() {
    var theme = localStorage.getItem('theme');
    if (theme === 'light' || (theme !== 'dark' && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        document.documentElement.classList.add('light');
    }
})();
