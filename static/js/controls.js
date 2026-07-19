/**
 * controls.js
 * Part of the Sort Scramble Visualization Engine.
 */

/* ═══════════════════════════════════════════════════════════════
   controls.js — DOM event listeners for UI controls
   ═══════════════════════════════════════════════════════════════ */

const Controls = (() => {
    // ── DOM refs ────────────────────────────────────────────
    const algoButtons  = document.querySelectorAll('.algo-btn');
    const btnSort      = document.getElementById('btn-sort');
    const btnPlay      = document.getElementById('btn-play');
    const btnReset     = document.getElementById('btn-reset');
    const btnStepFwd   = document.getElementById('btn-step-fwd');
    const btnStepBack  = document.getElementById('btn-step-back');
    const btnRandom    = document.getElementById('btn-random');
    const btnReplay    = document.getElementById('btn-replay');

    const sizeSlider   = document.getElementById('size-slider');
    const sizeValue    = document.getElementById('size-value');
    const speedSlider  = document.getElementById('speed-slider');
    const arrayInput   = document.getElementById('array-input');
    const presetBtns   = document.querySelectorAll('[data-preset]');

    // Info card refs
    const infoBest    = document.getElementById('info-best');
    const infoAvg     = document.getElementById('info-avg');
    const infoWorst   = document.getElementById('info-worst');
    const infoSpace   = document.getElementById('info-space');
    const infoStable  = document.getElementById('info-stable');
    const infoDS      = document.getElementById('info-ds');
    const algoTitle   = document.getElementById('algo-title');
    const algoDsTag   = document.getElementById('algo-ds-tag');
    const algoDesc    = document.getElementById('algo-desc');

    // ── State ──────────────────────────────────────────────
    let currentAlgo = 'bubble';

    // ── Algorithm Selection ────────────────────────────────
    function initAlgoButtons() {
        algoButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                algoButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentAlgo = btn.dataset.algo;
                App.onAlgoChange(currentAlgo);
            });
        });
    }

    // ── Update Info Card ───────────────────────────────────
    function updateInfoCard(info) {
        if (!info) return;
        infoBest.textContent   = info.best || '';
        infoAvg.textContent    = info.average || '';
        infoWorst.textContent  = info.worst || '';
        infoSpace.textContent  = info.space || '';
        infoStable.textContent = info.stable ? 'Yes' : 'No';
        infoDS.textContent     = info.ds || '';
        algoTitle.textContent  = info.name || '';
        algoDsTag.textContent  = info.ds || '';
        algoDesc.textContent   = info.description || '';
    }

    // ── Transport Controls ─────────────────────────────────
    function initTransport() {
        btnSort.addEventListener('click', () => App.sort());
        btnPlay.addEventListener('click', () => Animator.togglePlay());
        btnReset.addEventListener('click', () => Animator.reset());
        btnStepFwd.addEventListener('click', () => Animator.stepForward());
        btnStepBack.addEventListener('click', () => Animator.stepBack());
        


        if (btnReplay) {
            btnReplay.addEventListener('click', () => {
                Animator.reset();
                App.sort();
            });
        }
    }

    // ── Input Controls ─────────────────────────────────────
    function initInputControls() {
        btnRandom.addEventListener('click', () => {
            const size = parseInt(sizeSlider.value, 10);
            const arr = generateRandomArray(size);
            arrayInput.value = arr.join(', ');
            App.loadInitialState(arr);
        });

        // Size slider → number input sync
        sizeSlider.addEventListener('input', () => {
            sizeValue.value = sizeSlider.value;
        });

        // Number input → slider sync (keyboard-editable)
        sizeValue.addEventListener('change', () => {
            let val = parseInt(sizeValue.value, 10);
            if (isNaN(val)) val = 15;
            val = Math.max(5, Math.min(50, val));
            sizeValue.value = val;
            sizeSlider.value = val;
        });

        speedSlider.addEventListener('input', () => {
            Animator.setSpeed(parseInt(speedSlider.value, 10));
        });

        // Set initial speed
        Animator.setSpeed(parseInt(speedSlider.value, 10));
    }

    // ── Preset Arrays ──────────────────────────────────────
    function initPresets() {
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const size = parseInt(sizeSlider.value, 10);
                let arr;
                switch (btn.dataset.preset) {
                    case 'sorted':
                        arr = Array.from({ length: size }, (_, i) => i + 1);
                        break;
                    case 'reverse':
                        arr = Array.from({ length: size }, (_, i) => size - i);
                        break;
                    case 'nearly':
                        arr = Array.from({ length: size }, (_, i) => i + 1);
                        // swap ~10% of elements
                        for (let s = 0; s < Math.ceil(size * 0.1); s++) {
                            const a = Math.floor(Math.random() * size);
                            const b = Math.floor(Math.random() * size);
                            [arr[a], arr[b]] = [arr[b], arr[a]];
                        }
                        break;
                    case 'random':
                    default:
                        arr = generateRandomArray(size);
                }
                arrayInput.value = arr.join(', ');
                App.loadInitialState(arr);
            });
        });
    }

    // ── Keyboard Shortcuts ─────────────────────────────────
    function initKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    Animator.togglePlay();
                    break;
                case 'ArrowRight':
                    Animator.stepForward();
                    break;
                case 'ArrowLeft':
                    Animator.stepBack();
                    break;
                case 'KeyR':
                    Animator.reset();
                    break;
                case 'Enter':
                    App.sort();
                    break;
            }
        });
    }

    // ── Helpers ─────────────────────────────────────────────
    function generateRandomArray(size) {
        return Array.from({ length: size }, () =>
            Math.floor(Math.random() * 99) + 1
        );
    }

    function getArray() {
        const raw = arrayInput.value.trim();
        if (!raw) return generateRandomArray(parseInt(sizeSlider.value, 10));

        const arr = raw.split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n) && n >= 0);

        return arr.length > 0 ? arr : generateRandomArray(parseInt(sizeSlider.value, 10));
    }

    function getCurrentAlgo() {
        return currentAlgo;
    }

    // ── Initialize ─────────────────────────────────────────
    function init() {
        initAlgoButtons();
        initTransport();
        initInputControls();
        initPresets();
        initKeyboard();
    }

    // ── Public API ─────────────────────────────────────────
    return {
        init,
        updateInfoCard,
        getArray,
        getCurrentAlgo,
        generateRandomArray
    };
})();

