import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { gsap } from 'gsap';
import { createOpening, squarePosition } from './opening.js';

const canvas = document.getElementById('hero-scene-canvas');
if (canvas) initializeScene(canvas);

async function initializeScene(canvas) {
    const figure = canvas.closest('.hero-scene');
    const stage = canvas.parentElement;
    const playButton = figure.querySelector('[data-scene-play]');
    const controlsElement = figure.querySelector('[data-scene-controls]');
    const nextButton = figure.querySelector('[data-scene-next]');
    const resetButton = figure.querySelector('[data-scene-reset]');
    const status = figure.querySelector('[data-scene-status]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const opening = createOpening();
    const pieces = new Map();
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
        return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 10);
    camera.position.set(0.72, 0.76, -0.95);
    const orbit = new OrbitControls(camera, canvas);
    orbit.target.set(0, 0.035, 0);
    orbit.enablePan = false;
    orbit.enableZoom = false;
    orbit.enableDamping = false;
    orbit.enableRotate = window.matchMedia('(pointer: fine)').matches;
    if (!orbit.enableRotate) canvas.style.touchAction = 'pan-y';
    orbit.rotateSpeed = 0.45;
    orbit.minPolarAngle = 0.48;
    orbit.maxPolarAngle = 1.12;
    orbit.minAzimuthAngle = 1.65;
    orbit.maxAzimuthAngle = 4.05;
    orbit.update();

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04).texture;
    scene.environment = environment;
    room.dispose();
    pmrem.dispose();

    const key = new THREE.DirectionalLight(0xfff1dc, 3.6);
    key.position.set(-0.45, 0.9, -0.45);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = key.shadow.camera.bottom = -0.5;
    key.shadow.camera.right = key.shadow.camera.top = 0.5;
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 3;
    key.shadow.bias = -0.0001;
    key.shadow.normalBias = 0.0005;
    scene.add(key);
    const fill = new THREE.HemisphereLight(0xc8d8ff, 0x151c32, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x8eb5ff, 2);
    rim.position.set(0.35, 0.5, 0.6);
    scene.add(rim);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.ShadowMaterial({ opacity: 0.19 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.001;
    floor.receiveShadow = true;
    scene.add(floor);

    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x7aa2f7, transparent: true, opacity: 0.23, depthWrite: false });
    const markers = [0, 1].map(() => {
        const marker = new THREE.Mesh(new THREE.PlaneGeometry(0.061, 0.061), markerMaterial);
        marker.rotation.x = -Math.PI / 2;
        marker.position.y = 0.0187;
        marker.visible = false;
        scene.add(marker);
        return marker;
    });

    let ply = 0;
    let playing = false;
    let active = null;
    let delay = null;
    let visible = true;
    let ready = false;
    let disposed = false;
    let frame = 0;
    let view = 0;
    let lastWidth = 0, lastHeight = 0;

    function render() {
        frame = 0;
        if (disposed || !visible || document.hidden) return;
        const width = Math.max(1, stage.clientWidth);
        const height = Math.max(1, stage.clientHeight);
        if (width !== lastWidth || height !== lastHeight) {
            lastWidth = width;
            lastHeight = height;
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
    }
    function requestRender() {
        if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(render);
    }
    function updateTheme() {
        const light = document.documentElement.classList.contains('light');
        fill.intensity = light ? 2.5 : 1.6;
        renderer.toneMappingExposure = light ? 1.05 : 1.2;
        floor.material.opacity = light ? 0.2 : 0.1;
        markerMaterial.color.set(light ? 0x1a73e8 : 0x7aa2f7);
        requestRender();
    }
    function updateUI(manual = false) {
        figure.dataset.ply = String(ply);
        figure.dataset.fen = opening.snapshots[ply].fen;
        figure.dataset.playing = String(playing);
        figure.classList.toggle('is-paused', !playing);
        playButton.textContent = playing ? playButton.dataset.pause : ply === opening.moves.length ? playButton.dataset.replay : playButton.dataset.play;
        nextButton.disabled = ply === opening.moves.length;
        figure.querySelectorAll('[data-scene-ply]').forEach(button => {
            const index = Number(button.dataset.scenePly);
            if (index === ply) button.setAttribute('aria-current', 'step');
            else button.removeAttribute('aria-current');
        });
        const move = ply ? opening.moves[ply - 1] : null;
        const label = move ? `${Math.ceil(ply / 2)}.${ply % 2 ? '' : '..'} ${move.san}` : figure.dataset.start;
        figure.querySelector('[data-scene-notation]').textContent = label;
        if (manual) status.textContent = label;
    }
    function highlight(move) {
        markers.forEach((marker, index) => {
            marker.visible = Boolean(move);
            if (move) {
                const position = squarePosition(index ? move.to : move.from);
                marker.position.x = position.x;
                marker.position.z = position.z;
            }
        });
    }
    function applySnapshot(index) {
        for (const piece of pieces.values()) {
            piece.visible = false;
            piece.scale.setScalar(1);
            piece.position.y = 0.017;
        }
        for (const { id, square } of opening.snapshots[index].pieces) {
            const piece = pieces.get(id);
            const position = squarePosition(square);
            piece.position.set(position.x, 0.017, position.z);
            piece.visible = true;
            piece.userData.square = square;
        }
        highlight(index ? opening.moves[index - 1] : null);
        requestRender();
    }
    function stop() {
        playing = false;
        active?.kill();
        delay?.kill();
        active = null;
        delay = null;
        applySnapshot(ply);
        updateUI();
    }
    function animateMove(manual = false) {
        if (ply >= opening.moves.length || !ready) return;
        const move = opening.moves[ply];
        const mover = pieces.get(move.id);
        const destination = squarePosition(move.to);
        const duration = reducedMotion.matches ? 0 : 1.05;
        highlight(move);
        active = gsap.timeline({
            paused: true,
            onUpdate: requestRender,
            onComplete() {
                active = null;
                ply++;
                applySnapshot(ply);
                if (ply === opening.moves.length) playing = false;
                updateUI(manual);
                if (playing) delay = gsap.delayedCall(0.85, () => { delay = null; animateMove(); });
            }
        });
        if (move.capturedId) {
            const captured = pieces.get(move.capturedId);
            active.to(captured.scale, { x: 0.001, y: 0.001, z: 0.001, duration: duration * 0.3, ease: 'power2.in' }, 0.35 * duration);
            active.set(captured, { visible: false }, 0.65 * duration);
        }
        active.to(mover.position, { x: destination.x, z: destination.z, duration, ease: 'power2.inOut' }, 0);
        active.to(mover.position, { y: move.piece === 'n' ? 0.065 : 0.023, duration: duration * 0.45, ease: 'sine.out' }, 0);
        active.to(mover.position, { y: 0.017, duration: duration * 0.55, ease: 'sine.in' }, duration * 0.45);
        if (move.rook) {
            const rookPosition = squarePosition(move.rook.to);
            active.to(pieces.get(move.rook.id).position, { x: rookPosition.x, z: rookPosition.z, duration, ease: 'power2.inOut' }, 0);
        }
        active.play();
    }
    function start() {
        if (ply === opening.moves.length) { ply = 0; applySnapshot(0); }
        playing = true;
        updateUI();
        if (!visible || document.hidden) return;
        if (active) active.resume();
        else if (delay) delay.resume();
        else animateMove();
    }
    function updateVisibility() {
        if (!ready) return;
        if (visible && !document.hidden) {
            requestRender();
            if (playing) start();
        } else {
            active?.pause();
            delay?.pause();
        }
    }

    const resizeObserver = new ResizeObserver(requestRender);
    resizeObserver.observe(stage);
    const themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateVisibility(); });
    visibilityObserver.observe(stage);
    orbit.addEventListener('change', requestRender);
    orbit.addEventListener('start', () => gsap.killTweensOf(camera.position));
    document.addEventListener('visibilitychange', updateVisibility);
    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches && ready) { stop(); requestRender(); }
    });

    function fallback() {
        if (disposed) return;
        disposed = true;
        ready = false;
        active?.kill();
        delay?.kill();
        gsap.killTweensOf(camera.position);
        if (frame) cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        themeObserver.disconnect();
        visibilityObserver.disconnect();
        document.removeEventListener('visibilitychange', updateVisibility);
        orbit.dispose();
        figure.classList.remove('is-rendered');
        controlsElement.hidden = true;
        figure.querySelector('[data-scene-playback]').hidden = true;
        figure.dataset.ready = 'false';
        const geometries = new Set(), materials = new Set(), textures = new Set();
        scene.traverse(object => {
            if (object.geometry) geometries.add(object.geometry);
            for (const material of object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : []) {
                materials.add(material);
                for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
            }
        });
        geometries.forEach(geometry => geometry.dispose());
        materials.forEach(material => material.dispose());
        textures.forEach(texture => texture.dispose());
        environment.dispose();
        renderer.dispose();
    }
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fallback(); });
    window.addEventListener('pagehide', event => { if (!event.persisted) fallback(); }, { once: true });

    try {
        const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
        const asset = await loader.loadAsync(figure.dataset.model);
        if (disposed) return;
        asset.scene.updateMatrixWorld(true);
        const children = [...asset.scene.children];
        const board = children.find(child => child.name === 'Chessboard');
        if (!board) throw new Error('Chessboard asset is missing');
        scene.add(board);
        const kinds = { King: 'k', Queen: 'q', Bishop: 'b', Knight: 'n', Castle: 'r', Pawn_Body: 'p' };
        const groups = new Map();
        for (const node of children) {
            const match = /^(King|Queen|Bishop|Knight|Castle|Pawn_Body)_([WB])/.exec(node.name);
            if (!match) continue;
            const key = (match[2] === 'W' ? 'w' : 'b') + kinds[match[1]];
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(node);
        }
        for (const [kind, nodes] of groups) {
            nodes.sort((a, b) => b.position.x - a.position.x);
            const identities = opening.initial.filter(piece => piece.color + piece.type === kind).sort((a, b) => a.square.localeCompare(b.square));
            if (nodes.length !== identities.length) throw new Error('Chess set has an unexpected piece count');
            nodes.forEach((node, index) => {
                const bounds = new THREE.Box3().setFromObject(node);
                const center = bounds.getCenter(new THREE.Vector3());
                node.position.x -= center.x;
                node.position.z -= center.z;
                node.position.y -= bounds.min.y;
                const group = new THREE.Group();
                group.add(node);
                scene.add(group);
                pieces.set(identities[index].id, group);
            });
        }
        if (pieces.size !== 32) throw new Error('Chess set is incomplete');
        const moveList = figure.querySelector('[data-scene-moves]');
        opening.moves.forEach((move, index) => {
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.scenePly = String(index + 1);
            button.textContent = (index % 2 ? '' : `${Math.floor(index / 2) + 1}.`) + move.san;
            button.setAttribute('aria-label', `${Math.floor(index / 2) + 1}.${index % 2 ? '..' : ''} ${move.san}`);
            item.append(button);
            moveList.append(item);
        });
        scene.traverse(object => {
            if (!object.isMesh || object === floor || markers.includes(object)) return;
            object.castShadow = true;
            object.receiveShadow = true;
            for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
                if ('transmission' in material) material.transmission = 0;
                material.envMapIntensity = 1.1;
                material.roughness = Math.max(material.roughness ?? 1, 0.2);
            }
        });
        ready = true;
        figure.dataset.ready = 'true';
        figure.classList.add('is-rendered');
        controlsElement.hidden = false;
        figure.querySelector('[data-scene-playback]').hidden = false;
        applySnapshot(0);
        updateTheme();
        updateUI();

        playButton.addEventListener('click', () => {
            if (playing) { playing = false; active?.pause(); delay?.pause(); updateUI(); }
            else start();
        });
        resetButton.addEventListener('click', () => { stop(); ply = 0; applySnapshot(0); updateUI(true); });
        nextButton.addEventListener('click', () => { stop(); animateMove(true); });
        figure.querySelectorAll('[data-scene-ply]').forEach(button => {
            button.addEventListener('click', () => {
                stop();
                ply = Number(button.dataset.scenePly);
                applySnapshot(ply);
                updateUI(true);
            });
        });
        figure.querySelector('[data-scene-view]').addEventListener('click', () => {
            const views = [[0.72, 0.76, -0.95], [-0.72, 0.8, -0.95], [0.04, 1.15, -0.65]];
            const [x, y, z] = views[++view % views.length];
            gsap.to(camera.position, { x, y, z, duration: reducedMotion.matches ? 0 : 0.8, ease: 'power2.inOut', onUpdate() { orbit.update(); requestRender(); } });
        });
        if (!reducedMotion.matches) {
            playing = true;
            updateUI();
            delay = gsap.delayedCall(1.2, () => { delay = null; if (visible && !document.hidden) animateMove(); });
        }
    } catch {
        fallback();
    }
}
