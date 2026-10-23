(function() {
    const disco = document.querySelector('[data-disco]');
    if (!disco) return;
    const closeButton = disco.querySelector('[data-disco-close]');
    const audio = disco.querySelector('audio');
    let switches = [];
    let cooldownUntil = 0;
    let timer;
    let opener;

    function stop() {
        if (disco.hidden) return;
        const restoreFocus = disco.contains(document.activeElement);
        clearTimeout(timer);
        disco.hidden = true;
        audio.pause();
        audio.currentTime = 0;
        if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
    }

    window.addEventListener('theme-changed', () => {
        const now = performance.now();
        if (!disco.hidden || now < cooldownUntil) return;
        switches = switches.filter(time => now - time <= 3000);
        switches.push(now);
        if (switches.length < 5) return;
        switches = [];
        cooldownUntil = now + 30000;
        opener = document.activeElement;
        disco.hidden = false;
        closeButton.focus({ preventScroll: true });
        audio.volume = 0.3;
        audio.play().catch(() => {});
        timer = setTimeout(stop, 8000);
    });
    closeButton.addEventListener('click', stop);
    audio.addEventListener('ended', stop);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') stop();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    window.addEventListener('pagehide', stop);
})();
