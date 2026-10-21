import { createOpening } from './opening.js';

const paths = {
    p: '<circle cx="24" cy="12" r="7"/><path d="M18 19h12l-2 6 6 12H14l6-12z"/>',
    r: '<path d="M12 7h6v6h4V7h4v6h4V7h6v13l-6 5 3 12H15l3-12-6-5z"/>',
    n: '<path d="m15 35 3-12-7 1-2-7L21 7l1-4 9 7c8 7 7 18 4 27H15z"/><path d="m13 17 9-2M21 7l-1 6" fill="none"/>',
    b: '<path d="M24 4c-2 4-11 8-11 16 0 4 3 7 7 8l-5 9h18l-5-9c4-1 7-4 7-8 0-8-9-12-11-16z"/><path d="m25 12-5 9" fill="none"/>',
    q: '<path d="m12 15 7 6 5-10 5 10 7-6-5 16 3 6H14l3-6z"/><circle cx="11" cy="12" r="3"/><circle cx="24" cy="8" r="3"/><circle cx="37" cy="12" r="3"/>',
    k: '<path d="M24 4v9M19 8h10" fill="none"/><path d="M24 17c-8-9-17-3-13 5l7 10-4 5h20l-4-5 7-10c4-8-5-14-13-5z"/>'
};

export function boardTransform(square) {
    return `translate(${(square.charCodeAt(0) - 97) * 100}%, ${(8 - Number(square[1])) * 100}%)`;
}

export function pieceArtwork(type, color) {
    const fill = color === 'w' ? '#fff0d5' : '#3a4764';
    const stroke = '#20283e';
    const eye = color === 'w' ? stroke : '#e4eafa';
    return `<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${paths[type]}<rect x="11" y="36" width="26" height="6" rx="3"/></g><circle cx="${type === 'n' ? 27 : 21}" cy="${type === 'p' ? 12 : 25}" r="1.3" fill="${eye}"/>${type === 'n' ? '' : `<circle cx="27" cy="${type === 'p' ? 12 : 25}" r="1.3" fill="${eye}"/>`}</svg>`;
}

export function initializeScene(figure) {
    const board = figure.querySelector('[data-chess-board]');
    const opening = createOpening();
    const pieces = new Map();
    const moves = figure.querySelector('[data-scene-moves]');
    const playButton = figure.querySelector('[data-scene-play]');
    const nextButton = figure.querySelector('[data-scene-next]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let position = 0;
    let playing = !reducedMotion.matches;
    let visible = false;
    let timer;

    const highlights = [0, 1].map(() => {
        const element = document.createElement('span');
        element.className = 'chess-highlight';
        element.hidden = true;
        board.append(element);
        return element;
    });

    for (const piece of opening.initial) {
        const element = document.createElement('span');
        element.className = 'chess-piece';
        element.dataset.piece = piece.id;
        element.innerHTML = pieceArtwork(piece.type, piece.color);
        board.append(element);
        pieces.set(piece.id, element);
    }

    opening.moves.forEach((move, index) => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `${index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ` : ''}${move.san}`;
        button.addEventListener('click', () => {
            playing = false;
            setPosition(index + 1);
            schedule();
        });
        item.append(button);
        moves.append(item);
    });

    function setPosition(next, animate = false, announce = true) {
        board.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
        const snapshot = opening.snapshots[next];
        const squares = new Map(snapshot.pieces.map(piece => [piece.id, piece.square]));
        for (const [id, element] of pieces) {
            const square = squares.get(id);
            const from = { transform: element.style.transform, opacity: element.style.opacity || '1' };
            element.style.opacity = square ? '1' : '0';
            if (square) element.style.transform = boardTransform(square);
            if (animate && !reducedMotion.matches && (from.transform !== element.style.transform || from.opacity !== element.style.opacity)) {
                element.style.zIndex = square ? '2' : '1';
                const animation = element.animate([from, { transform: element.style.transform, opacity: element.style.opacity }], { duration: 480, easing: 'cubic-bezier(0.22, 0.8, 0.3, 1)' });
                animation.finished.then(() => { element.style.zIndex = ''; }).catch(() => {});
            }
        }
        position = next;
        const move = opening.moves[position - 1];
        highlights.forEach((element, index) => {
            element.hidden = !move;
            if (move) element.style.transform = boardTransform(index === 0 ? move.from : move.to);
        });
        const notation = move ? `${Math.ceil(position / 2)}${position % 2 ? '.' : '…'} ${move.san}` : figure.dataset.start;
        figure.querySelector('[data-scene-notation]').textContent = notation;
        if (announce) figure.querySelector('[data-scene-status]').textContent = notation;
        [...moves.querySelectorAll('button')].forEach((button, index) => {
            if (index === position - 1) button.setAttribute('aria-current', 'step');
            else button.removeAttribute('aria-current');
        });
        if (position === opening.moves.length) playing = false;
        nextButton.disabled = position === opening.moves.length;
        updateButton();
    }

    function updateButton() {
        playButton.textContent = position === opening.moves.length ? playButton.dataset.replay : playing ? playButton.dataset.pause : playButton.dataset.play;
    }

    function schedule() {
        clearTimeout(timer);
        updateButton();
        if (!playing || !visible || document.hidden) return;
        timer = setTimeout(() => {
            const bounds = board.getBoundingClientRect();
            if (!playing || document.hidden || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
            setPosition(position + 1, true, false);
            schedule();
        }, 1700);
    }

    playButton.addEventListener('click', () => {
        if (position === opening.moves.length) setPosition(0);
        playing = !playing;
        schedule();
    });
    figure.querySelector('[data-scene-reset]').addEventListener('click', () => {
        playing = false;
        setPosition(0);
        schedule();
    });
    nextButton.addEventListener('click', () => {
        playing = false;
        setPosition(position + 1, true);
        schedule();
    });
    reducedMotion.addEventListener('change', () => {
        playing = false;
        setPosition(position, false, false);
        schedule();
    });
    document.addEventListener('visibilitychange', schedule);
    const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        schedule();
    }, { threshold: 0.15 });
    observer.observe(figure);
    setPosition(0, false, false);
    figure.querySelector('[data-scene-playback]').hidden = false;
}

if (typeof document !== 'undefined') {
    document.querySelectorAll('.chess-scene').forEach(initializeScene);
}
