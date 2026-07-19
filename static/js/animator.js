/**
 * animator.js
 * Part of the Sort Scramble Visualization Engine.
 */

/* ═══════════════════════════════════════════════════════════════
   animator.js — Plays back pre-computed Step arrays
   with completion celebration effects
   ═══════════════════════════════════════════════════════════════ */

const Animator = (() => {
    let steps = [];
    let index = 0;
    let playing = false;
    let timerId = null;
    let speed = 200;        // ms between steps (lower = faster)

    // ── DOM refs ────────────────────────────────────────────
    const playIcon   = document.getElementById('play-icon');
    const pauseIcon  = document.getElementById('pause-icon');
    const progressEl = document.getElementById('progress-fill');
    const messageBar = document.getElementById('message-bar');
    const vizContainer = document.getElementById('viz-container');
    const statComparisons = document.getElementById('stat-comparisons');
    const statSwaps  = document.getElementById('stat-swaps');
    const statStep   = document.getElementById('stat-step');
    const postSortOverlay = document.getElementById('post-sort-overlay');
    const psAlgoName = document.getElementById('ps-algo-name');
    const psArraySize = document.getElementById('ps-array-size');
    const psComparisons = document.getElementById('ps-comparisons');
    const psSwaps = document.getElementById('ps-swaps');

    // ── Core ────────────────────────────────────────────────
    function loadSteps(newSteps) {
        stop();
        clearCelebration();
        steps = newSteps;
        index = 0;
        document.body.classList.add('is-sorting');
        renderCurrent();
    }

    function renderCurrent() {
        if (steps.length === 0) return;
        const step = steps[index];

        Renderer.renderBars(step);
        Renderer.renderDS(step);
        if (typeof Pseudocode !== 'undefined') Pseudocode.updateFromStep(step);
        updateStats(step);
        updateProgress();
        messageBar.textContent = step.message || '';
        

    }

    function updateStats(step) {
        const s = step.stats || {};
        animateStatValue(statComparisons, s.comparisons ?? 0);
        animateStatValue(statSwaps, s.swaps ?? 0);
        statStep.textContent = `${index + 1} / ${steps.length}`;
    }

    function animateStatValue(el, newVal) {
        const oldVal = el.textContent;
        el.textContent = newVal;
        if (String(newVal) !== String(oldVal)) {
            el.classList.add('stat-bump');
            setTimeout(() => el.classList.remove('stat-bump'), 200);
        }
    }

    function updateProgress() {
        const pct = steps.length > 1
            ? (index / (steps.length - 1)) * 100
            : 100;
        progressEl.style.width = `${pct}%`;
    }

    // ── Playback Controls ──────────────────────────────────
    function play() {
        if (steps.length === 0) return;
        if (index >= steps.length - 1) {
            index = 0;  // restart
            clearCelebration();
        }
        playing = true;
        document.body.classList.add('is-sorting');
        showPauseIcon();
        tick();
    }

    function tick() {
        if (!playing || index >= steps.length - 1) {
            stop();
            if (index >= steps.length - 1 && steps.length > 0) {
                celebrate();
            }
            return;
        }
        index++;
        renderCurrent();
        timerId = setTimeout(tick, speed);
    }

    function pause() {
        playing = false;
        clearTimeout(timerId);
        timerId = null;
        showPlayIcon();
    }

    function stop() {
        pause();
    }

    function togglePlay() {
        playing ? pause() : play();
    }

    function stepForward() {
        if (index < steps.length - 1) {
            pause();
            index++;
            renderCurrent();
            if (index >= steps.length - 1) {
                celebrate();
            }
        }
    }

    function stepBack() {
        if (index > 0) {
            pause();
            clearCelebration();
            index--;
            renderCurrent();
        }
    }

    function reset() {
        pause();
        clearCelebration();
        document.body.classList.remove('is-sorting');
        if (postSortOverlay) postSortOverlay.classList.remove('is-visible');
        index = 0;
        if (steps.length > 0) {
            renderCurrent();
        }
    }

    function setSpeed(value) {
        speed = Math.round(500 - (value / 100) * 490);
    }

    // ── Celebration ─────────────────────────────────────────
    function celebrate() {
        document.body.classList.remove('is-sorting');
        document.body.classList.add('is-complete');

        // Cascade glow on each bar
        const bars = document.querySelectorAll('.bar');
        bars.forEach((bar, i) => {
            setTimeout(() => {
                bar.classList.add('bar--celebrate');
            }, i * 40);
        });

        // Flash the viz container border
        vizContainer.classList.add('viz--celebrate');

        // Update message with celebration
        messageBar.innerHTML = '<span class="msg-complete">Sorting complete!</span>';
        


        // Show Post-Sort actions after a short delay
        setTimeout(() => {
            if (postSortOverlay && steps.length > 0) {
                const finalStep = steps[steps.length - 1];
                const stats = finalStep.stats || { comparisons: 0, swaps: 0 };
                
                // Populate stats
                const algoName = document.getElementById('algo-title')?.textContent || 'Algorithm';
                if (psAlgoName) psAlgoName.textContent = algoName;
                if (psArraySize) psArraySize.textContent = finalStep.array.length;
                if (psComparisons) psComparisons.textContent = stats.comparisons;
                if (psSwaps) psSwaps.textContent = stats.swaps;

                postSortOverlay.classList.add('is-visible');
            }
        }, 1200); // Wait for the glow cascade to finish
    }

    function clearCelebration() {
        document.body.classList.remove('is-complete');
        vizContainer.classList.remove('viz--celebrate');
        document.querySelectorAll('.bar--celebrate').forEach(b =>
            b.classList.remove('bar--celebrate')
        );
    }

    // ── Icon toggling ──────────────────────────────────────
    function showPlayIcon() {
        playIcon.style.display = '';
        pauseIcon.style.display = 'none';
    }

    function showPauseIcon() {
        playIcon.style.display = 'none';
        pauseIcon.style.display = '';
    }

    // ── State queries ──────────────────────────────────────
    function isPlaying() { return playing; }
    function hasSteps()  { return steps.length > 0; }

    // ── Public API ─────────────────────────────────────────
    return {
        loadSteps,
        play,
        pause,
        togglePlay,
        stepForward,
        stepBack,
        reset,
        setSpeed,
        isPlaying,
        hasSteps
    };
})();

