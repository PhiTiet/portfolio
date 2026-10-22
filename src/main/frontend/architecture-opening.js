export const HIRE_HOLD = 1500;
export const HIRE_ENTRY = 500;
export const CHAPTERS = [
    { id: 'architecture', start: 0, duration: 11000 },
    { id: 'stack', start: 11000, duration: 6500 },
    { id: 'ai', start: 17500, duration: 6500 },
    { id: 'experience', start: 24000, duration: 8000 },
    { id: 'hire', start: 32000, duration: HIRE_ENTRY + HIRE_HOLD }
];
export const DURATION = CHAPTERS.at(-1).start + CHAPTERS.at(-1).duration;
export const COMPACT_CHAPTERS = [
    { id: 'architecture', start: 0, duration: 5000 },
    { id: 'stack', start: 5000, duration: 4000 },
    { id: 'ai', start: 9000, duration: 4500 },
    { id: 'experience', start: 13500, duration: 4500 },
    { id: 'hire', start: 18000, duration: HIRE_ENTRY + HIRE_HOLD }
];
export const COMPACT_DURATION = COMPACT_CHAPTERS.at(-1).start + COMPACT_CHAPTERS.at(-1).duration;
export const COMPACT_QUERY = '(max-width: 700px), (pointer: coarse) and (max-width: 1000px)';
export const STORAGE_KEY = 'portfolio.engineering-story.seen';

export function chapterAt(time, chapters = CHAPTERS) {
    return chapters.findLastIndex(chapter => time >= chapter.start);
}

export function architectureLevelAt(time) {
    if (time >= 8580) return 3;
    if (time >= 5610) return 2;
    if (time >= 2640) return 1;
    return 0;
}

export function shouldAutoplay({ reducedMotion, seen, hash, navigationType }) {
    return !reducedMotion && !seen && !hash && navigationType === 'navigate';
}

export function initializeOpening(dialog) {
    if (typeof dialog.showModal !== 'function') return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compactViewport = window.matchMedia(COMPACT_QUERY);
    const panels = [...dialog.querySelectorAll('[data-intro-act]')];
    const chapterButtons = [...dialog.querySelectorAll('[data-intro-chapter]')];
    const pauseButton = dialog.querySelector('[data-intro-pause]');
    const closeButton = dialog.querySelector('[data-intro-close]');
    const progress = dialog.querySelector('.intro-progress > span');
    const portal = dialog.querySelector('.intro-portal');
    const hero = document.querySelector('.hero > .container > .hero-layout');
    const finalPanel = panels[panels.length - 1];
    const hireGreeting = finalPanel.querySelector('.eyebrow').textContent;
    let compact = false;
    let chapters = CHAPTERS;
    let duration = DURATION;
    let clock;
    let effects = [];
    let frame;
    let active = -1;
    let running = false;
    let closing = false;
    let suspended = false;
    let run = 0;
    let transition = 0;
    let opener;

    function configurePlayback() {
        compact = compactViewport.matches;
        chapters = compact ? COMPACT_CHAPTERS : CHAPTERS;
        duration = compact ? COMPACT_DURATION : DURATION;
        dialog.dataset.motion = compact ? 'compact' : 'full';
        document.querySelectorAll('[data-intro-replay] small').forEach(label => { label.textContent = `${duration / 1000}s`; });
    }

    function positionFinalPanel() {
        if (!dialog.open || active !== panels.length - 1) return;
        const rect = hero.getBoundingClientRect();
        Object.assign(finalPanel.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    }

    const resizeObserver = new ResizeObserver(positionFinalPanel);
    resizeObserver.observe(hero);
    window.addEventListener('resize', positionFinalPanel);

    function remember() {
        try { sessionStorage.setItem(STORAGE_KEY, 'true'); } catch {}
    }

    function animate(element, frames, options) {
        const effect = element.animate(frames, { duration: 900, easing: 'cubic-bezier(0.22, 0.8, 0.2, 1)', fill: 'both', ...options });
        effects.push(effect);
        if (!running || document.hidden) effect.pause();
        return effect;
    }

    function freezeEffects() {
        effects.forEach(effect => {
            try { effect.commitStyles(); } catch {}
            effect.cancel();
        });
        effects = [];
        portal.replaceChildren();
    }

    function resetPanel(panel) {
        [panel, ...panel.querySelectorAll('[style]')].forEach(element => {
            ['transform', 'opacity', 'transform-origin'].forEach(property => element.style.removeProperty(property));
        });
        panel.hidden = false;
        panel.inert = false;
        panel.removeAttribute('aria-hidden');
    }

    function sharedElements(panel) {
        const elements = new Map();
        panel?.querySelectorAll('[data-shared]').forEach(element => {
            const rect = element.getBoundingClientRect();
            const clip = element.closest('.c4-window')?.getBoundingClientRect();
            if (clip && (rect.bottom <= clip.top || rect.top >= clip.bottom)) return;
            if (rect.width && rect.height && rect.bottom > 0 && rect.top < window.innerHeight) {
                elements.set(element.dataset.shared, { element, rect });
            }
        });
        return elements;
    }

    function morphElements(sources, panel, duration = 1250) {
        const destinations = sharedElements(panel);
        sources.forEach(({ element: source, rect: from }, key) => {
            const destination = destinations.get(key);
            if (!destination) return;
            const { element: target, rect: to } = destination;
            const tile = document.createElement('div');
            tile.className = 'intro-morph';
            tile.dataset.shared = key;
            const label = document.createElement('span');
            label.textContent = source.dataset.morphLabel || source.textContent.trim();
            const sourceSize = parseFloat(getComputedStyle(source.querySelector('strong, b') || source).fontSize);
            const targetSize = parseFloat(getComputedStyle(target.querySelector('strong, b') || target).fontSize);
            label.style.fontSize = `${sourceSize}px`;
            tile.append(label);
            Object.assign(tile.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
            portal.append(tile);
            source.style.opacity = '0';
            const destinationTransform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})`;
            const flight = animate(tile, [
                { transform: 'translate(0, 0) scale(1, 1)', opacity: 1, offset: 0, easing: 'cubic-bezier(0.76, 0, 0.24, 1)' },
                { transform: destinationTransform, opacity: 1, offset: 0.85 },
                { transform: destinationTransform, opacity: 0, offset: 1 }
            ], { duration, easing: 'linear' });
            animate(label, [{ transform: 'scale(1, 1)' }, { transform: `scale(${targetSize / sourceSize / (to.width / from.width)}, ${targetSize / sourceSize / (to.height / from.height)})` }], { duration: duration * 0.85, easing: 'cubic-bezier(0.76, 0, 0.24, 1)' });
            animate(target, [{ opacity: 0, offset: 0 }, { opacity: 0, offset: 0.8 }, { opacity: 1, offset: 1 }], { duration: duration + 50, easing: 'linear' });
            flight.finished.then(() => tile.remove()).catch(() => tile.remove());
        });
    }

    function choreograph(panel, index) {
        if (compact) return;
        if (index === 0) {
            const step = panel.querySelector('.c4-window').clientHeight;
            animate(panel.querySelector('.c4-world'), [
                { transform: 'translateY(0)', offset: 0 },
                { transform: 'translateY(0)', offset: 0.16, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
                { transform: `translateY(-${step}px)`, offset: 0.24 },
                { transform: `translateY(-${step}px)`, offset: 0.43, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
                { transform: `translateY(-${step * 2}px)`, offset: 0.51 },
                { transform: `translateY(-${step * 2}px)`, offset: 0.69, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
                { transform: `translateY(-${step * 3}px)`, offset: 0.78 },
                { transform: `translateY(-${step * 3}px)`, offset: 1 }
            ], { duration: CHAPTERS[0].duration, easing: 'linear' });
            const routes = [
                [[130, 55], [205, 55], [355, 55], [430, 55]],
                [[130, 175], [205, 175], [355, 175], [430, 175]],
                [[355, 65], [385, 65], [400, 165], [430, 165]]
            ];
            panel.querySelectorAll('[data-network-packet]').forEach((packet, order) => {
                animate(packet, routes[order].map(([x, y], index) => ({ transform: `translate(${x}px, ${y}px)`, opacity: index === 0 || index === 3 ? 0 : 1 })), { delay: 2450 + order * 150, duration: 1000, iterations: 2, easing: 'linear' });
            });
        }
        if (index === 1) panel.querySelectorAll('.stack-lane').forEach((lane, order) => {
            animate(lane, [{ opacity: 0, transform: 'translateX(60px)' }, { opacity: 1, transform: 'none' }], { delay: 400 + order * 200 });
        });
        if (index === 2) {
            panel.querySelectorAll('.agent-branches > div, .verification-gate, .workflow-trace > span').forEach((node, order) => {
                animate(node, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { delay: 650 + order * 300, duration: 700 });
            });
        }
        if (index === 3) {
            const track = panel.querySelector('.experience-track');
            const distance = Math.max(0, track.scrollHeight - panel.querySelector('.experience-window').clientHeight);
            animate(track, [
                { transform: 'translateY(0)', offset: 0 },
                { transform: 'translateY(0)', offset: 0.15 },
                { transform: `translateY(-${distance}px)`, offset: 0.9 },
                { transform: `translateY(-${distance}px)`, offset: 1 }
            ], { duration: CHAPTERS[index].duration, easing: 'linear' });
        }
    }

    function showChapter(index, moving = true) {
        if (index === active) return;
        const previous = panels[active];
        const sources = sharedElements(previous);
        freezeEffects();
        const currentTransition = ++transition;
        active = index;
        const panel = panels[index];
        const final = index === panels.length - 1;
        const gentle = final || compact || (previous?.dataset.introAct === 'ai' && index === 3);
        const blending = moving && !motion.matches && previous && previous !== panel;
        dialog.dataset.static = String(!moving || motion.matches);
        panels.forEach(candidate => {
            if (candidate !== panel && (!blending || candidate !== previous)) candidate.hidden = true;
        });
        resetPanel(panel);
        dialog.style.removeProperty('background-color');
        if (final) {
            window.scrollTo({ top: 0, behavior: 'instant' });
            positionFinalPanel();
            finalPanel.querySelector('.eyebrow').textContent = hireGreeting;
            const background = getComputedStyle(document.body).backgroundColor;
            if (moving && !motion.matches) {
                animate(dialog, [{ backgroundColor: getComputedStyle(dialog).backgroundColor }, { backgroundColor: background }], { duration: HIRE_ENTRY });
            } else {
                dialog.style.backgroundColor = background;
            }
        }
        chapterButtons.forEach((button, buttonIndex) => {
            if (buttonIndex === index) button.setAttribute('aria-current', 'step');
            else button.removeAttribute('aria-current');
        });
        dialog.dataset.chapter = CHAPTERS[index].id;
        dialog.querySelector('[data-intro-status]').textContent = panel.querySelector('.intro-kicker').textContent;
        if (!moving || motion.matches) return;
        if (blending) {
            if (previous.contains(document.activeElement)) pauseButton.focus({ preventScroll: true });
            previous.inert = true;
            previous.setAttribute('aria-hidden', 'true');
            const exit = animate(previous, gentle ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-48px) scale(0.96)' }], { duration: final ? HIRE_ENTRY : gentle ? 160 : 1000, easing: gentle ? 'linear' : 'cubic-bezier(0.22, 0.8, 0.2, 1)' });
            exit.finished.then(() => { if (currentTransition === transition) previous.hidden = true; }).catch(() => {});
            if (!gentle) morphElements(sources, panel);
        }
        animate(panel, gentle ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(48px) scale(1.025)' }, { opacity: 1, transform: 'none' }], { duration: final ? HIRE_ENTRY : gentle ? 450 : 1250, delay: blending && !final ? gentle ? 100 : 120 : 0 });
        if (compact) return;
        panel.querySelectorAll('.intro-act-copy > *').forEach((element, order) => {
            animate(element, gentle ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { delay: gentle ? 80 + order * 50 : 250 + order * 90, duration: gentle ? 450 : 800 });
        });
        choreograph(panel, index);
    }

    function tick() {
        if (!dialog.open || closing) return;
        const time = clock?.currentTime || 0;
        showChapter(Math.max(0, chapterAt(time, chapters)));
        if (active === 0 && !compact) {
            const level = architectureLevelAt(time);
            dialog.querySelectorAll('[data-c4-level]').forEach((element, index) => element.toggleAttribute('data-current', index === level));
        }
        if (running && !document.hidden) frame = requestAnimationFrame(tick);
    }

    function updatePlayback() {
        pauseButton.textContent = running ? dialog.dataset.pause : dialog.dataset.play;
        dialog.dataset.playing = String(running);
    }

    function setPlaying(value) {
        running = value;
        cancelAnimationFrame(frame);
        if (value && dialog.dataset.static === 'true' && !motion.matches) {
            const index = active;
            active = -1;
            showChapter(index);
        }
        const play = value && !document.hidden;
        [clock, ...effects].filter(Boolean).forEach(effect => {
            if (effect.playState !== 'finished') play ? effect.play() : effect.pause();
        });
        updatePlayback();
        if (play) tick();
    }

    function stop() {
        run++;
        transition++;
        cancelAnimationFrame(frame);
        clock?.cancel();
        clock = null;
        effects.forEach(effect => effect.cancel());
        effects = [];
        portal.replaceChildren();
        running = false;
        closing = false;
        suspended = false;
    }

    async function finish(fold = false, destination = null) {
        if (!dialog.open || closing) return;
        closing = true;
        running = false;
        remember();
        cancelAnimationFrame(frame);
        clock?.pause();
        effects.forEach(effect => { if (effect.playState !== 'finished') effect.pause(); });
        if (!motion.matches) {
            if (active === panels.length - 1 && !destination) {
                positionFinalPanel();
                finalPanel.querySelector('.eyebrow').textContent = hero.querySelector('.eyebrow').textContent;
            }
            const exit = dialog.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fold ? 650 : 200, fill: 'forwards' });
            effects.push(exit);
            await exit.finished.catch(() => {});
        }
        dialog.close();
        stop();
        if (destination) {
            window.location.hash = destination;
            const target = document.getElementById(destination);
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
            target.scrollIntoView({ block: 'start', behavior: 'instant' });
        } else if (opener?.isConnected && opener.matches('[data-intro-replay]')) opener.focus({ preventScroll: true });
        else {
            const heading = document.querySelector('.hero h1');
            heading.setAttribute('tabindex', '-1');
            heading.focus({ preventScroll: true });
        }
    }

    function start() {
        if (dialog.open) return;
        opener = document.activeElement;
        stop();
        configurePlayback();
        active = -1;
        remember();
        dialog.showModal();
        dialog.scrollTop = 0;
        closeButton.focus({ preventScroll: true });
        pauseButton.hidden = motion.matches;
        closeButton.querySelector('span').textContent = motion.matches ? dialog.dataset.enter : dialog.dataset.skip;
        if (motion.matches) {
            progress.style.transform = 'scaleX(1)';
            showChapter(CHAPTERS.length - 1, false);
            updatePlayback();
            return;
        }
        progress.style.transform = '';
        running = true;
        clock = progress.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration, fill: 'forwards', easing: 'linear' });
        const currentRun = run;
        clock.finished.then(() => { if (currentRun === run) finish(true); }).catch(() => {});
        showChapter(0);
        updatePlayback();
        tick();
    }

    closeButton.addEventListener('click', () => finish());
    pauseButton.addEventListener('click', () => setPlaying(!running));
    chapterButtons.forEach((button, index) => button.addEventListener('click', () => {
        if (closing) return;
        if (clock) clock.currentTime = chapters[index].start;
        showChapter(index, running && !motion.matches);
        dialog.scrollTop = 0;
    }));
    dialog.querySelectorAll('[data-intro-destination]').forEach(link => link.addEventListener('click', event => {
        event.preventDefault();
        finish(false, link.dataset.introDestination);
    }));
    dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
    dialog.addEventListener('close', stop);
    document.querySelectorAll('[data-intro-replay]').forEach(button => {
        button.hidden = false;
        button.addEventListener('click', start);
    });
    configurePlayback();
    compactViewport.addEventListener('change', () => { if (!dialog.open) configurePlayback(); });
    document.addEventListener('visibilitychange', () => {
        if (!dialog.open || closing) return;
        if (document.hidden) {
            suspended = running;
            setPlaying(false);
        } else if (suspended) {
            suspended = false;
            setPlaying(true);
        }
    });
    motion.addEventListener('change', () => { if (motion.matches && dialog.open) finish(); });
    window.addEventListener('pagehide', () => { dialog.close(); stop(); resizeObserver.disconnect(); });
    let seen = false;
    try { seen = sessionStorage.getItem(STORAGE_KEY) === 'true'; } catch {}
    const navigationType = performance.getEntriesByType('navigation')[0]?.type || 'navigate';
    if (shouldAutoplay({ reducedMotion: motion.matches, seen, hash: window.location.hash, navigationType })) start();
}

if (typeof document !== 'undefined') {
    document.querySelectorAll('.architecture-intro').forEach(dialog => {
        try { initializeOpening(dialog); } catch { dialog.close(); }
    });
}
