/**
 * pseudocode.js
 * Part of the Sort Scramble Visualization Engine.
 */

/* ═══════════════════════════════════════════════════════════════
   pseudocode.js — Pseudocode panel with real-time line highlighting
   Inspired by VisuAlgo's code synchronization
   ═══════════════════════════════════════════════════════════════ */

const Pseudocode = (() => {
    const codeBlock = document.getElementById('pseudocode-block');
    const algoNameEl = document.getElementById('pseudocode-algo-name');

    // ── Pseudocode definitions for each algorithm ──────────
    const codes = {
        bubble: [
            'for i = 0 to n-2:',
            '  for j = 0 to n-2-i:',
            '    if arr[j] > arr[j+1]:',
            '      swap(arr[j], arr[j+1])',
            '  // largest bubbles to end',
            '  if no swaps: break  // sorted!',
            'done — array is sorted',
        ],
        selection: [
            'for i = 0 to n-2:',
            '  min_idx = i',
            '  for j = i+1 to n-1:',
            '    if arr[j] < arr[min_idx]:',
            '      min_idx = j',
            '  swap(arr[i], arr[min_idx])',
            'done — array is sorted',
        ],
        insertion: [
            'for i = 1 to n-1:',
            '  key = arr[i]',
            '  j = i - 1',
            '  while j >= 0 and arr[j] > key:',
            '    arr[j+1] = arr[j]   // shift right',
            '    j = j - 1',
            '  arr[j+1] = key        // insert',
            'done — array is sorted',
        ],
        merge: [
            'mergeSort(arr, low, high):',
            '  if low < high:',
            '    mid = (low + high) / 2',
            '    mergeSort(arr, low, mid)',
            '    mergeSort(arr, mid+1, high)',
            '    merge(arr, low, mid, high)',
            '',
            'merge(L, R):',
            '  compare L[i] vs R[j]',
            '  place smaller into result',
            '  copy remaining elements',
            'done — array is sorted',
        ],
        quick: [
            'quickSort(arr, low, high):',
            '  if low < high:',
            '    pivot = arr[high]',
            '    i = low - 1',
            '    for j = low to high-1:',
            '      if arr[j] <= pivot:',
            '        i++; swap(arr[i], arr[j])',
            '    swap(arr[i+1], arr[high])',
            '    // pivot placed at arr[i+1]',
            '    quickSort(left of pivot)',
            '    quickSort(right of pivot)',
            'done — array is sorted',
        ],
        radix: [
            'for each digit d (LSD to MSD):',
            '  create 10 buckets (0-9)',
            '  for each element:',
            '    place in bucket[digit_d]',
            '  collect from buckets 0..9',
            'done — array is sorted',
        ]
    };

    // ── Operation-to-line mapping per algorithm ───────────
    // Maps step.operation values to pseudocode line indices
    const lineMap = {
        bubble: {
            'compare': 2,       // if arr[j] > arr[j+1]
            'swap': 3,          // swap(arr[j], arr[j+1])
            'no_swap': 2,       // comparison — no swap needed
            'pass_done': 4,     // largest bubbles to end
            'sorted': 6,        // done
            'final': 6,
        },
        selection: {
            'compare': 3,       // if arr[j] < arr[min_idx]
            'new_min': 4,       // min_idx = j
            'scan': 2,          // for j = i+1 to n-1
            'swap': 5,          // swap(arr[i], arr[min_idx])
            'sorted': 6,
            'final': 6,
        },
        insertion: {
            'pick_key': 1,      // key = arr[i]
            'compare': 3,       // while j >= 0 and arr[j] > key
            'shift': 4,         // arr[j+1] = arr[j]
            'swap': 4,          // shift right
            'insert': 6,        // arr[j+1] = key
            'sorted': 7,
            'final': 7,
        },
        merge: {
            'divide': 2,        // mid = (low + high) / 2
            'recurse_left': 3,  // mergeSort(arr, low, mid)
            'recurse_right': 4, // mergeSort(arr, mid+1, high)
            'merge': 5,         // merge(arr, low, mid, high)
            'compare': 8,       // compare L[i] vs R[j]
            'place': 9,         // place smaller into result
            'copy_remaining': 10, // copy remaining
            'swap': 9,
            'sorted': 11,
            'final': 11,
        },
        quick: {
            'choose_pivot': 2,  // pivot = arr[high]
            'compare': 5,       // if arr[j] <= pivot
            'swap': 6,          // i++; swap(arr[i], arr[j])
            'partition': 4,     // for j = low to high-1
            'place_pivot': 7,   // swap(arr[i+1], arr[high])
            'recurse': 9,       // quickSort(left)
            'sorted': 11,
            'final': 11,
        },
        radix: {
            'distribute': 3,    // place in bucket[digit_d]
            'collect': 4,       // collect from buckets
            'digit_pass': 0,    // for each digit d
            'compare': 3,
            'swap': 3,
            'sorted': 5,
            'final': 5,
        }
    };

    // ── Human-readable algo names ────────────────────────
    const algoNames = {
        bubble: 'Bubble Sort',
        selection: 'Selection Sort',
        insertion: 'Insertion Sort',
        merge: 'Merge Sort',
        quick: 'Quick Sort',
        radix: 'Radix Sort'
    };

    let currentAlgo = 'bubble';

    // ── Render pseudocode with highlighted line ───────────
    function render(algo, activeLine) {
        if (!codeBlock) return;

        currentAlgo = algo || currentAlgo;
        const lines = codes[currentAlgo] || [];

        codeBlock.innerHTML = '';
        lines.forEach((line, i) => {
            const lineEl = document.createElement('div');
            lineEl.className = 'pseudo-line' + (i === activeLine ? ' pseudo-line--active' : '');

            const numEl = document.createElement('span');
            numEl.className = 'pseudo-num';
            numEl.textContent = (i + 1).toString().padStart(2, ' ');

            const textEl = document.createElement('span');
            textEl.className = 'pseudo-text';
            textEl.textContent = line;

            lineEl.appendChild(numEl);
            lineEl.appendChild(textEl);
            codeBlock.appendChild(lineEl);
        });

        // Scroll active line into view
        if (activeLine !== undefined && activeLine !== null) {
            const activeEl = codeBlock.querySelector('.pseudo-line--active');
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }

    // ── Set algorithm (called on algo change) ─────────────
    function setAlgorithm(algo) {
        currentAlgo = algo;
        if (algoNameEl) algoNameEl.textContent = algoNames[algo] || algo;
        render(algo, null);
    }

    // ── Update from step (called by animator) ─────────────
    function updateFromStep(step) {
        const operation = step.operation || 'compare';
        // Use codeLine from backend if provided, else map from operation
        let activeLine = step.codeLine;
        if (activeLine === undefined || activeLine === null) {
            const map = lineMap[currentAlgo];
            activeLine = map ? (map[operation] ?? map['compare'] ?? 0) : 0;
        }
        render(currentAlgo, activeLine);
    }

    return { render, setAlgorithm, updateFromStep };
})();

