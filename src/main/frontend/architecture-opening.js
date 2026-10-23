export const HIRE_HOLD = 2100;
export const HIRE_ENTRY = 1400;
export const RECOMMENDATION_INTERVAL = 2800;
export const RECOMMENDATIONS_DURATION = RECOMMENDATION_INTERVAL * 5;
export const ARCHITECTURE_ENTRY = 1500;

export function createChapters(compact = false, recommendationCount = 5) {
    let start = 0;
    return [
        ['recommendations', RECOMMENDATION_INTERVAL * recommendationCount],
        ['experience', compact ? 5000 : 6000],
        ['architecture', compact ? 4000 : 8000 + ARCHITECTURE_ENTRY],
        ['stack', compact ? 3000 : 4500],
        ['ai', compact ? 3000 : 4500],
        ['hire', HIRE_ENTRY + HIRE_HOLD]
    ].map(([id, duration]) => {
        const chapter = { id, start, duration };
        start += duration;
        return chapter;
    });
}

export const CHAPTERS = createChapters();
export const DURATION = CHAPTERS.at(-1).start + CHAPTERS.at(-1).duration;
export const COMPACT_CHAPTERS = createChapters(true);
export const COMPACT_DURATION = COMPACT_CHAPTERS.at(-1).start + COMPACT_CHAPTERS.at(-1).duration;
export const COMPACT_QUERY = '(max-width: 900px), (pointer: coarse) and (max-width: 1000px)';
export const STORAGE_KEY = 'portfolio.engineering-story.seen';

export function chapterAt(time, chapters = CHAPTERS) {
    return chapters.findLastIndex(chapter => time >= chapter.start);
}

export function architectureLevelAt(time) {
    time = Math.max(0, time - ARCHITECTURE_ENTRY);
    const duration = CHAPTERS.find(chapter => chapter.id === 'architecture').duration - ARCHITECTURE_ENTRY;
    if (time >= duration * 0.78) return 3;
    if (time >= duration * 0.51) return 2;
    if (time >= duration * 0.24) return 1;
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
    const quoteWindow = dialog.querySelector('.intro-quote-window');
    const quotes = [...dialog.querySelectorAll('[data-intro-quote]')];
    const quoteButtons = [...dialog.querySelectorAll('[data-intro-quote-button]')];
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
    let activeQuote = -1;
    let quoteTransition = 0;

    function configurePlayback() {
        compact = compactViewport.matches;
        chapters = createChapters(compact, quotes.length);
        duration = chapters.at(-1).start + chapters.at(-1).duration;
        dialog.dataset.motion = compact ? 'compact' : 'full';
        document.querySelectorAll('[data-intro-replay] small').forEach(label => { label.textContent = `${Math.floor(duration / 1000)}s`; });
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
        quoteTransition++;
        effects.forEach(effect => {
            try { effect.commitStyles(); } catch {}
            effect.cancel();
        });
        effects = [];
        portal.replaceChildren();
        dialog.querySelectorAll('[data-intro-effect]').forEach(element => element.remove());
    }

    function resetPanel(panel) {
        [panel, ...panel.querySelectorAll('[style]')].forEach(element => {
            ['transform', 'opacity', 'transform-origin', 'background-color', 'background-position', 'border-color', 'color', 'filter', 'stroke', 'stroke-width', 'clip-path', 'box-shadow'].forEach(property => element.style.removeProperty(property));
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

    function morphElements(sources, panel, duration = 750) {
        const destinations = sharedElements(panel);
        sources.forEach(({ element: source, rect: from }, key) => {
            const destination = destinations.get(key);
            if (!destination) return;
            const { element: target, rect: to } = destination;
            const tile = document.createElement('div');
            const thread = key === 'story-thread';
            tile.className = thread ? 'intro-morph intro-thread-morph' : 'intro-morph';
            tile.dataset.shared = key;
            tile.setAttribute('aria-hidden', 'true');
            if (!thread) {
                const label = document.createElement('span');
                label.textContent = source.dataset.morphLabel || source.textContent.trim();
                const sourceSize = parseFloat(getComputedStyle(source.querySelector('strong, b') || source).fontSize);
                const targetLabel = target.querySelector('strong, b') || target;
                const targetSize = parseFloat(getComputedStyle(targetLabel).fontSize);
                const labelRect = targetLabel.getBoundingClientRect();
                Object.assign(label.style, { position: 'absolute', transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap' });
                tile.append(label);
                animate(label, [
                    { left: `${from.width / 2}px`, top: `${from.height / 2}px`, fontSize: `${sourceSize}px` },
                    { left: `${labelRect.left - to.left + labelRect.width / 2}px`, top: `${labelRect.top - to.top + labelRect.height / 2}px`, fontSize: `${targetSize}px` }
                ], { duration: duration * 0.8, easing: 'cubic-bezier(0.22, 0.8, 0.2, 1)' });
            }
            Object.assign(tile.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
            portal.append(tile);
            source.style.opacity = '0';
            const destinationFrame = { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px)`, width: `${to.width}px`, height: `${to.height}px`, borderRadius: getComputedStyle(target).borderRadius };
            const flight = animate(tile, [
                { transform: 'translate(0, 0)', width: `${from.width}px`, height: `${from.height}px`, borderRadius: getComputedStyle(source).borderRadius, opacity: 1, offset: 0, easing: 'cubic-bezier(0.22, 0.8, 0.2, 1)' },
                { ...destinationFrame, opacity: 1, offset: 0.8 },
                { ...destinationFrame, opacity: 0, offset: 1 }
            ], { duration, easing: 'linear' });
            animate(target, [{ opacity: 0, offset: 0 }, { opacity: 0, offset: 0.75 }, { opacity: 1, offset: 1 }], { duration, easing: 'linear' });
            flight.finished.then(() => tile.remove()).catch(() => tile.remove());
        });
    }

    function energize(element, delay = 0, color = 'var(--intro-teal)') {
        const energy = document.createElement('span');
        energy.className = 'intro-energy';
        energy.dataset.introEffect = '';
        energy.setAttribute('aria-hidden', 'true');
        energy.style.color = color;
        const beam = document.createElement('span');
        beam.className = 'intro-energy-beam';
        energy.append(beam);
        element.append(energy);
        animate(energy, [{ opacity: 0.08 }, { opacity: compact ? 0.4 : 0.7, offset: 0.4 }, { opacity: 0.08 }], { duration: 2600, delay, iterations: Infinity, easing: 'ease-in-out' });
        animate(beam, [{ transform: 'translateX(-150%)', opacity: 0 }, { opacity: 0.16, offset: 0.3 }, { transform: 'translateX(350%)', opacity: 0 }], { duration: 2600, delay, iterations: Infinity, easing: 'ease-in-out' });
    }

    function frameArrival(source, panel) {
        if (!source) return;
        const image = panel.querySelector('.portrait img');
        const to = image.getBoundingClientRect();
        const from = source.rect;
        const bridge = document.createElement('div');
        bridge.className = 'intro-arrival-bridge';
        portal.append(bridge);
        const destination = { left: `${to.left - 10}px`, top: `${to.top - 10}px`, width: `${to.width + 20}px`, height: `${to.height + 20}px`, borderRadius: getComputedStyle(image).borderRadius };
        const flight = animate(bridge, [
            { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, borderRadius: '16px', opacity: 0, offset: 0 },
            { left: `${from.left}px`, top: `${from.top + from.height / 2}px`, width: `${from.width}px`, height: '2px', borderRadius: '2px', opacity: 1, offset: 0.23, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
            { left: destination.left, top: destination.top, width: destination.width, height: '2px', borderRadius: '2px', opacity: 1, offset: 0.5, easing: 'cubic-bezier(0.22, 0.8, 0.2, 1)' },
            { ...destination, opacity: 0.8, borderColor: getComputedStyle(document.body).getPropertyValue('--color-accent'), offset: 0.85 },
            { ...destination, opacity: 0, offset: 1 }
        ], { duration: HIRE_ENTRY, easing: 'linear' });
        flight.finished.then(() => bridge.remove()).catch(() => bridge.remove());
    }

    function updateQuoteProgress(time) {
        quoteButtons.forEach((button, index) => {
            const progress = Math.max(0, Math.min(1, (time - index * RECOMMENDATION_INTERVAL) / RECOMMENDATION_INTERVAL));
            button.querySelector('i').style.transform = `scaleX(${progress})`;
        });
    }

    function showQuote(index, moving = true) {
        if (index === activeQuote) return;
        const previous = quotes[activeQuote];
        const outgoingOpacity = previous ? getComputedStyle(previous.querySelector('blockquote')).opacity : 1;
        const outgoingCaptionOpacity = previous ? getComputedStyle(previous.querySelector('figcaption')).opacity : 1;
        const stale = new Set(quotes.flatMap(quote => quote.getAnimations({ subtree: true })));
        stale.forEach(effect => effect.cancel());
        effects = effects.filter(effect => !stale.has(effect));
        const currentTransition = ++quoteTransition;
        activeQuote = index;
        const current = quotes[index];
        quoteWindow.scrollTop = 0;
        quotes.forEach(quote => {
            quote.hidden = quote !== current && (!moving || quote !== previous);
            quote.inert = quote !== current;
            quote.toggleAttribute('data-current', quote === current);
            if (quote !== current) quote.setAttribute('aria-hidden', 'true');
        });
        resetPanel(current);
        quoteButtons.forEach((button, order) => {
            if (order === index) button.setAttribute('aria-current', 'true');
            else button.removeAttribute('aria-current');
        });
        updateQuoteProgress((clock?.currentTime || 0) - chapters[0].start);
        if (!moving || motion.matches) return;
        if (previous) animate(previous.querySelector('blockquote'), [{ opacity: outgoingOpacity }, { opacity: 0 }], { duration: 180, easing: 'linear' });
        if (previous) animate(previous.querySelector('figcaption'), [{ opacity: outgoingCaptionOpacity }, { opacity: 0 }], { duration: 180, easing: 'linear' });
        const reveal = animate(current, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
        animate(current.querySelector('blockquote'), [{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: previous ? 220 : 100 });
        animate(current.querySelector('figcaption'), [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: 300 });
        animate(current, [{ backgroundPosition: '0% 50%' }, { backgroundPosition: '100% 50%' }], { duration: RECOMMENDATION_INTERVAL, easing: 'linear' });
        reveal.finished.then(() => {
            if (currentTransition !== quoteTransition) return;
            if (previous) previous.hidden = true;
            reveal.cancel();
            effects = effects.filter(effect => effect !== reveal);
        }).catch(() => {});
    }

    function choreograph(panel, index) {
        const { id, duration } = chapters[index];
        if (id === 'recommendations') {
            showQuote(Math.min(quotes.length - 1, Math.max(0, Math.floor(((clock?.currentTime || 0) - chapters[index].start) / RECOMMENDATION_INTERVAL))));
        }
        if (id === 'stack') {
            panel.querySelectorAll('.language-tile, .stack-lane, .stack-ai-seed').forEach((block, order) => {
                energize(block, 500 + order * 350, order === 0 ? 'var(--intro-coral)' : order === 1 ? 'var(--intro-violet)' : 'var(--intro-teal)');
            });
        }
        if (compact) {
            if (id === 'architecture') panel.querySelectorAll('.c4-overview li').forEach((card, order) => energize(card, order * 450, 'var(--intro-blue)'));
            if (id === 'ai') animate(panel.querySelector('.verification-gate'), [{ color: 'var(--intro-teal)' }, { color: 'var(--intro-amber)', offset: 0.5 }, { color: 'var(--intro-teal)' }], { duration: 1200, delay: 1000, easing: 'ease-in-out' });
            const cards = panel.querySelectorAll('.c4-overview li, .language-tile, .stack-lane, .agent-branches > div, .experience-track li');
            cards.forEach((card, order) => {
                animate(card, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 350, delay: 80 + order * 70 });
            });
            return;
        }
        if (id === 'recommendations') {
            animate(panel.querySelector('.story-spine'), [{ transform: 'scaleY(0)', transformOrigin: 'top' }, { transform: 'scaleY(1)', transformOrigin: 'top' }], { duration: 1000, delay: 100 });
        }
        if (id === 'architecture') {
            const architectureTime = fraction => ARCHITECTURE_ENTRY + (duration - ARCHITECTURE_ENTRY) * fraction;
            panel.querySelectorAll('.context-person, .system-core').forEach((block, order) => {
                animate(block, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: 150 + order * 180 });
                energize(block, 300 + order * 450, 'var(--intro-blue)');
            });
            panel.querySelectorAll('.driving-adapters > span, .clean-application, .clean-domain, .driven-adapters > span').forEach((block, order) => {
                animate(block, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 350, delay: architectureTime(0.51) + order * 100 });
                energize(block, architectureTime(0.51) + order * 180, order === 3 ? 'var(--intro-teal)' : 'var(--intro-blue)');
            });
            panel.querySelectorAll('.code-line').forEach((line, order) => {
                animate(line, [{ opacity: 0, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 250, delay: architectureTime(0.78) + order * 55 });
                animate(line, [{ backgroundColor: '#7ed4c400' }, { backgroundColor: '#7ed4c426', offset: 0.35 }, { backgroundColor: '#7ed4c400' }], { duration: 1400, delay: architectureTime(0.78) + order * 140, iterations: Infinity, easing: 'ease-in-out' });
            });
            const step = panel.querySelector('.c4-window').clientHeight;
            animate(panel.querySelector('.c4-world'), [
                { transform: 'translateY(0)', offset: 0 },
                { transform: 'translateY(0)', offset: architectureTime(0.16) / duration, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
                { transform: `translateY(-${step}px)`, offset: architectureTime(0.24) / duration },
                { transform: `translateY(-${step}px)`, offset: architectureTime(0.43) / duration, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
                { transform: `translateY(-${step * 2}px)`, offset: architectureTime(0.51) / duration },
                { transform: `translateY(-${step * 2}px)`, offset: architectureTime(0.69) / duration, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
                { transform: `translateY(-${step * 3}px)`, offset: architectureTime(0.78) / duration },
                { transform: `translateY(-${step * 3}px)`, offset: 1 }
            ], { duration, easing: 'linear' });
            const routes = [
                [[130, 55], [205, 55], [355, 55], [430, 55]],
                [[130, 175], [205, 175], [355, 175], [430, 175]],
                [[355, 65], [385, 65], [400, 165], [430, 165]]
            ];
            panel.querySelectorAll('[data-network-packet]').forEach((packet, order) => {
                animate(packet, routes[order].map(([x, y], index) => ({ transform: `translate(${x}px, ${y}px)`, opacity: index === 0 || index === 3 ? 0 : 1 })), { delay: architectureTime(0.24) + order * 160, duration: 1100, iterations: Infinity, easing: 'linear' });
            });
            panel.querySelectorAll('.network-service rect, .network-topic rect').forEach((node, order) => {
                animate(node, [{ filter: 'drop-shadow(0 0 0px #7ed4c400)' }, { filter: 'drop-shadow(0 0 6px #7ed4c499)', offset: 0.4 }, { filter: 'drop-shadow(0 0 0px #7ed4c400)' }], { duration: 1800, delay: architectureTime(0.24) + order * 160, iterations: Infinity, easing: 'ease-in-out' });
            });
        }
        if (id === 'stack') panel.querySelectorAll('.stack-lane').forEach((lane, order) => {
            animate(lane, [{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }], { delay: 350 + order * 400, duration: 500 });
            lane.querySelectorAll('b').forEach((tag, tagIndex) => {
                animate(tag, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { delay: 550 + order * 400 + tagIndex * 120, duration: 350 });
            });
        });
        if (id === 'ai') {
            panel.querySelectorAll('.agent-branches > div').forEach((node, order) => {
                animate(node, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { delay: 400 + order * 450, duration: 500 });
            });
            animate(panel.querySelector('.verification-gate'), [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: 2100 });
            animate(panel.querySelector('.verification-gate'), [{ color: 'var(--intro-teal)' }, { color: 'var(--intro-amber)', offset: 0.5 }, { color: 'var(--intro-teal)' }], { duration: 1400, delay: 2400, easing: 'ease-in-out' });
        }
        if (id === 'experience') {
            const track = panel.querySelector('.experience-track');
            const distance = Math.max(0, track.scrollHeight - panel.querySelector('.experience-window').clientHeight);
            animate(track, [
                { transform: 'translateY(0)', offset: 0 },
                { transform: 'translateY(0)', offset: 0.3 },
                { transform: `translateY(-${distance}px)`, offset: 0.9 },
                { transform: `translateY(-${distance}px)`, offset: 1 }
            ], { duration, easing: 'linear' });
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
        const blending = moving && !motion.matches && previous && previous !== panel;
        dialog.dataset.static = String(!moving || motion.matches);
        panels.forEach(candidate => {
            if (candidate !== panel && (!blending || candidate !== previous)) candidate.hidden = true;
        });
        resetPanel(panel);
        if (chapters[index].id === 'recommendations') {
            activeQuote = -1;
            quoteWindow.scrollTop = 0;
            quotes.forEach(quote => {
                quote.hidden = false;
                quote.inert = false;
                quote.removeAttribute('aria-hidden');
                quote.removeAttribute('data-current');
            });
        }
        dialog.dataset.arrival = final && blending ? 'bridging' : 'ready';
        if (compact && !final) dialog.scrollTop = 0;
        dialog.style.removeProperty('background-color');
        if (final) {
            window.scrollTo({ top: 0, behavior: 'instant' });
            positionFinalPanel();
            finalPanel.querySelector('.eyebrow').textContent = hireGreeting;
            const background = getComputedStyle(document.body).backgroundColor;
            if (moving && !motion.matches) {
                animate(dialog, [{ backgroundColor: getComputedStyle(dialog).backgroundColor }, { backgroundColor: background }], { duration: 640, delay: blending ? 320 : 0, easing: 'ease-in-out' });
                frameArrival(sources.get('opencode'), panel);
                animate(panel.querySelector('.portrait img'), [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 650, delay: 560 });
                animate(panel.querySelector('.portrait figcaption'), [{ opacity: 0 }, { opacity: 1 }], { duration: 350, delay: 900 });
                panel.querySelectorAll('.hero-heading, .hero-description, .hero-experience, .hero-actions').forEach((element, order) => {
                    animate(element, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: 650 + order * 100 });
                });
            } else {
                dialog.style.backgroundColor = background;
            }
        }
        chapterButtons.forEach((button, buttonIndex) => {
            if (buttonIndex === index) button.setAttribute('aria-current', 'step');
            else button.removeAttribute('aria-current');
        });
        dialog.dataset.chapter = chapters[index].id;
        dialog.querySelector('[data-intro-status]').textContent = chapterButtons[index].getAttribute('aria-label');
        if (!moving || motion.matches) return;
        if (blending) {
            if (previous.contains(document.activeElement)) pauseButton.focus({ preventScroll: true });
            previous.inert = true;
            previous.setAttribute('aria-hidden', 'true');
            const previousCopy = previous.querySelector('.intro-act-copy');
            if (previousCopy) animate(previousCopy, [{ opacity: getComputedStyle(previousCopy).opacity, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 180 });
            if (final && previous.dataset.introAct === 'ai') {
                const hub = previous.querySelector('.opencode-hub').getBoundingClientRect();
                previous.querySelectorAll('.human-direction, .agent-branches > div, .verification-gate').forEach(element => {
                    const rect = element.getBoundingClientRect();
                    const x = (hub.left + hub.width / 2 - rect.left - rect.width / 2) * 0.25;
                    const y = (hub.top + hub.height / 2 - rect.top - rect.height / 2) * 0.25;
                    animate(element, [{ transform: 'none', opacity: 1 }, { transform: `translate(${x}px, ${y}px)`, opacity: 0 }], { duration: 300 });
                });
            }
            const exit = animate(previous, [{ opacity: getComputedStyle(previous).opacity }, { opacity: 0 }], { duration: final ? 320 : compact ? 160 : 400, easing: 'linear' });
            exit.finished.then(() => {
                if (currentTransition !== transition) return;
                previous.hidden = true;
                if (final) dialog.dataset.arrival = 'ready';
            }).catch(() => {});
            if (!compact && !final) morphElements(sources, panel);
        }
        animate(panel, final ? [{ opacity: 0, offset: 0 }, { opacity: 0, offset: 0.36 }, { opacity: 1, offset: 0.68 }, { opacity: 1, offset: 1 }] : [{ opacity: 0 }, { opacity: 1 }], { duration: final ? HIRE_ENTRY : compact ? 350 : 650, delay: blending && !final ? 100 : 0, easing: final ? 'linear' : 'cubic-bezier(0.22, 0.8, 0.2, 1)' });
        if (compact) {
            choreograph(panel, index);
            return;
        }
        panel.querySelectorAll('.intro-act-copy > *').forEach((element, order) => {
            animate(element, final ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { delay: (blending ? 220 : 100) + order * 60, duration: 500 });
        });
        choreograph(panel, index);
    }

    function tick() {
        if (!dialog.open || closing) return;
        const time = clock?.currentTime || 0;
        showChapter(Math.max(0, chapterAt(time, chapters)));
        if (chapters[active].id === 'recommendations') {
            const elapsed = time - chapters[active].start;
            showQuote(Math.min(quotes.length - 1, Math.floor(elapsed / RECOMMENDATION_INTERVAL)));
            updateQuoteProgress(elapsed);
        }
        if (chapters[active].id === 'architecture' && !compact) {
            const level = architectureLevelAt(time - chapters[active].start);
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
        dialog.querySelectorAll('[data-intro-effect]').forEach(element => element.remove());
        ['clip-path', 'opacity'].forEach(property => dialog.style.removeProperty(property));
        dialog.querySelector('.intro-reveal-line').style.removeProperty('transform');
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
            const reveal = fold && active === panels.length - 1;
            const exit = dialog.animate(reveal ? [{ clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 100% 0)' }] : [{ opacity: 1 }, { opacity: 0 }], { duration: reveal ? 1100 : 200, easing: reveal ? 'cubic-bezier(0.76, 0, 0.24, 1)' : 'linear', fill: 'forwards' });
            if (reveal) {
                const line = dialog.querySelector('.intro-reveal-line');
                effects.push(line.animate([{ transform: 'translateY(calc(100dvh - 3px))', opacity: 0 }, { opacity: 1, offset: 0.1 }, { transform: 'translateY(-3px)', opacity: 0 }], { duration: 1100, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', fill: 'both' }));
            }
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
    quoteButtons.forEach((button, index) => button.addEventListener('click', () => {
        if (closing) return;
        if (clock) clock.currentTime = chapters[0].start + index * RECOMMENDATION_INTERVAL;
        showQuote(index, running && !motion.matches);
        updateQuoteProgress(index * RECOMMENDATION_INTERVAL);
    }));
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
