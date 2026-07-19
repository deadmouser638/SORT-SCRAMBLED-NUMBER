/* ═══════════════════════════════════════════════════════════════
   MINI DEMO — Auto-playing bubble sort on landing page hero
   ═══════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    const container = document.getElementById('demo-bars');
    if (!container) return;

    const BAR_COUNT = 15;
    const STEP_DELAY = 100; // ms between steps
    const PAUSE_BEFORE_RESTART = 1500;

    // Bar state colors matching the design system
    const COLORS = {
        default:   { bg: '#8B5CF6', shadow: '0 0 8px rgba(139, 92, 246, 0.35)' },
        comparing: { bg: '#EF4444', shadow: '0 0 10px rgba(239, 68, 68, 0.4)' },
        swapping:  { bg: '#F59E0B', shadow: '0 0 10px rgba(245, 158, 11, 0.4)' },
        sorted:    { bg: '#22C55E', shadow: '0 0 10px rgba(34, 197, 94, 0.35)' },
    };

    let bars = [];
    let animationId = null;

    /** Generate a random array */
    function generateArray() {
        return Array.from({ length: BAR_COUNT }, () =>
            Math.floor(Math.random() * 85) + 15
        );
    }

    /** Render bars into the container */
    function renderBars(arr, states) {
        if (bars.length === 0) {
            container.innerHTML = '';
            arr.forEach((val, i) => {
                const bar = document.createElement('div');
                bar.className = 'demo-bar';
                container.appendChild(bar);
                bars.push(bar);
            });
        }

        arr.forEach((val, i) => {
            const state = (states && states[i]) || 'default';
            const color = COLORS[state] || COLORS.default;
            bars[i].style.height = val + '%';
            bars[i].style.background = color.bg;
            bars[i].style.boxShadow = color.shadow;
        });
    }

    /** Bubble sort step generator */
    function* bubbleSortSteps(arr) {
        const a = [...arr];
        const n = a.length;

        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - 1 - i; j++) {
                // Comparing
                const states = {};
                for (let k = n - i; k < n; k++) states[k] = 'sorted';
                states[j] = 'comparing';
                states[j + 1] = 'comparing';
                yield { arr: [...a], states };

                if (a[j] > a[j + 1]) {
                    // Swapping
                    [a[j], a[j + 1]] = [a[j + 1], a[j]];
                    const swapStates = { ...states };
                    swapStates[j] = 'swapping';
                    swapStates[j + 1] = 'swapping';
                    yield { arr: [...a], states: swapStates };
                }
            }
        }

        // Final sorted state
        const finalStates = {};
        for (let i = 0; i < n; i++) finalStates[i] = 'sorted';
        yield { arr: [...a], states: finalStates };
    }

    /** Run the animation loop */
    async function runDemo() {
        while (true) {
            const arr = generateArray();
            renderBars(arr, {});

            await sleep(500);

            const steps = bubbleSortSteps(arr);
            for (const step of steps) {
                renderBars(step.arr, step.states);
                await sleep(STEP_DELAY);
            }

            await sleep(PAUSE_BEFORE_RESTART);
        }
    }

    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    // Start the demo
    runDemo();
})();
