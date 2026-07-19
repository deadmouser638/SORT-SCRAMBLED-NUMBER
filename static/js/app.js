/**
 * app.js
 * Part of the Sort Scramble Visualization Engine.
 */

/* ═══════════════════════════════════════════════════════════════
   app.js — Entry point: fetches from Flask API, wires everything
   ═══════════════════════════════════════════════════════════════ */

const App = (() => {
    let algoInfo = {};  // cached ALGO_INFO from server

    // ── Initialization ─────────────────────────────────────
    async function init() {
        // Fetch algorithm info from server
        try {
            const resp = await fetch('/api/info');
            algoInfo = await resp.json();
        } catch (err) {
            console.warn('Could not fetch /api/info, using defaults', err);
            algoInfo = getDefaultInfo();
        }

        Controls.init();

        // Load default algo info
        onAlgoChange('bubble');

        // Generate initial random array
        const arr = Controls.generateRandomArray(15);
        document.getElementById('array-input').value = arr.join(', ');
        loadInitialState(arr);
    }

    // ── Sort ────────────────────────────────────────────────
    async function sort() {
        const algo = Controls.getCurrentAlgo();
        const arr = Controls.getArray();

        document.getElementById('message-bar').textContent = 'Generating steps...';
        document.getElementById('message-bar').style.color = ''; // Reset color

        try {
            const resp = await fetch('/api/sort', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ algorithm: algo, array: arr })
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                throw new Error(errData.error || `Server error: ${resp.status}`);
            }

            const data = await resp.json();

            if (data.info) {
                Controls.updateInfoCard(data.info);
            }

            Animator.loadSteps(data.steps);
            Animator.play();
        } catch (err) {
            console.error('Sort error:', err);
            const msgBar = document.getElementById('message-bar');
            msgBar.textContent = `Error: ${err.message}`;
            msgBar.style.color = '#FF6B6B'; // Red error text
        }
    }

    // ── Algorithm Change ───────────────────────────────────
    function onAlgoChange(algo) {
        const info = algoInfo[algo];
        Controls.updateInfoCard(info);
        if (typeof Pseudocode !== 'undefined') Pseudocode.setAlgorithm(algo);
    }

    // ── Show initial unsorted bars (no animation) ──────────
    function loadInitialState(arr) {
        const n = arr.length;
        const step = {
            arr: arr,
            barStates: {},
            dsType: 'array',
            dsData: { highlights: {}, markers: {}, regions: {} },
            message: 'Select an algorithm and click SORT to begin.',
            operation: 'compare',
            stats: { comparisons: 0, swaps: 0 }
        };
        for (let i = 0; i < n; i++) {
            step.barStates[String(i)] = 'default';
        }
        Renderer.renderBars(step);
        Renderer.renderDS(step);
        if (typeof Pseudocode !== 'undefined') Pseudocode.setAlgorithm(Controls.getCurrentAlgo());
        document.getElementById('message-bar').textContent = step.message;
        document.getElementById('message-bar').style.color = ''; // Reset color
        document.getElementById('stat-comparisons').textContent = '0';
        document.getElementById('stat-swaps').textContent = '0';
        document.getElementById('stat-step').textContent = '0 / 0';
        document.getElementById('progress-fill').style.width = '0%';
    }

    // ── Fallback info if server unreachable ─────────────────
    function getDefaultInfo() {
        return {
            bubble:    { name:'Bubble Sort',    best:'O(n)',      average:'O(n²)',    worst:'O(n²)',    space:'O(1)',     stable:true,  ds:'Array',                      description:'Compares adjacent elements and swaps if out of order.' },
            selection: { name:'Selection Sort', best:'O(n²)',    average:'O(n²)',    worst:'O(n²)',    space:'O(1)',     stable:false, ds:'Array + Min Pointer',        description:'Finds minimum in unsorted region, swaps to front.' },
            insertion: { name:'Insertion Sort', best:'O(n)',      average:'O(n²)',    worst:'O(n²)',    space:'O(1)',     stable:true,  ds:'Array (Sorted + Unsorted)',  description:'Inserts each element into correct position in sorted region.' },
            merge:     { name:'Merge Sort',     best:'O(n log n)',average:'O(n log n)',worst:'O(n log n)',space:'O(n)',   stable:true,  ds:'Auxiliary Arrays (L + R)',    description:'Divides, sorts halves, merges using auxiliary arrays.' },
            quick:     { name:'Quick Sort',     best:'O(n log n)',average:'O(n log n)',worst:'O(n²)',    space:'O(log n)',stable:false, ds:'Recursion Call Stack',        description:'Picks pivot, partitions around it, sorts recursively.' },
            radix:     { name:'Radix Sort',     best:'O(nk)',     average:'O(nk)',     worst:'O(nk)',    space:'O(n+k)',  stable:true,  ds:'10 Digit Buckets (0-9)',      description:'Sorts by digit position using 10 buckets.' }
        };
    }

    // ── Public API ─────────────────────────────────────────
    return { init, sort, onAlgoChange, loadInitialState };
})();

// ── Boot ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());

