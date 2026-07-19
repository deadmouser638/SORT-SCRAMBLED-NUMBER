/**
 * learn.js — Learn Page with Flowchart, Algorithm Cards, and Properties Matrix
 * All content is hardcoded — no API calls needed.
 */
(function () {
  'use strict';

  // ── Algorithm Colors ──────────────────────────────────────────
  const COLORS = {
    bubble:    '#FF6B6B',
    selection: '#FFA06B',
    insertion: '#FFD93D',
    merge:     '#6BCB77',
    quick:     '#4D96FF',
    radix:     '#9B59B6',
  };

  // ── Algorithm Deep-Dive Data ──────────────────────────────────
  const ALGORITHMS = [
    {
      key: 'bubble',
      name: 'Bubble Sort',
      avgComplexity: 'O(n\u00B2)',
      analogy: 'Imagine bubbles rising in a glass of soda \u2014 the lightest (smallest) elements "bubble up" to the top. You keep scanning left to right, swapping neighbors that are out of order, until no more swaps are needed.',
      steps: [
        'Start at the beginning of the array.',
        'Compare each pair of adjacent elements.',
        'If the left element is larger, swap them.',
        'After each full pass, the largest unsorted element is in its correct position.',
        'Repeat until a full pass has no swaps \u2014 the array is sorted.',
      ],
      strengths: [
        'Extremely simple to understand and implement',
        'Adaptive \u2014 detects already-sorted arrays in O(n)',
        'Stable \u2014 preserves order of equal elements',
        'In-place \u2014 uses O(1) extra memory',
      ],
      weaknesses: [
        'Very slow on large datasets (O(n\u00B2) average)',
        'Many unnecessary comparisons even with optimizations',
        'Not practical for production use beyond small arrays',
      ],
      best: 'O(n)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)', space: 'O(1)',
      realWorld: 'Used in teaching and when simplicity matters more than speed. Useful for nearly-sorted data where the early-exit optimization makes it almost linear.',
    },
    {
      key: 'selection',
      name: 'Selection Sort',
      avgComplexity: 'O(n\u00B2)',
      analogy: 'Like sorting a hand of playing cards by repeatedly finding the smallest card in the unsorted portion and placing it at the front. You scan, pick the minimum, place it, and repeat.',
      steps: [
        'Find the minimum element in the unsorted portion.',
        'Swap it with the first unsorted element.',
        'The sorted portion grows by one.',
        'Repeat until the entire array is sorted.',
      ],
      strengths: [
        'Simple to understand and implement',
        'Performs minimal number of swaps \u2014 exactly n-1',
        'Good when swap operations are expensive (e.g., writing to flash memory)',
        'In-place \u2014 uses O(1) extra memory',
      ],
      weaknesses: [
        'Always O(n\u00B2) \u2014 even on sorted arrays',
        'Not adaptive \u2014 does the same work regardless of input pattern',
        'Not stable \u2014 can change relative order of equal elements',
      ],
      best: 'O(n\u00B2)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)', space: 'O(1)',
      realWorld: 'Rarely used in practice but valuable for teaching. Ideal when you need to minimize the number of writes (e.g., sorting data on EEPROM or flash storage where write cycles are limited).',
    },
    {
      key: 'insertion',
      name: 'Insertion Sort',
      avgComplexity: 'O(n\u00B2)',
      analogy: 'Like sorting cards in your hand as you receive them \u2014 each new card gets inserted into its correct position among the cards you already hold. The left portion is always sorted.',
      steps: [
        'Start with the second element (first is already "sorted").',
        'Pick the current element as the "key".',
        'Compare the key with elements to its left, shifting larger elements right.',
        'Insert the key into the gap created.',
        'Move to the next element and repeat.',
      ],
      strengths: [
        'Very efficient on small or nearly-sorted data \u2014 O(n) best case',
        'Stable and adaptive',
        'In-place with O(1) extra space',
        'Online \u2014 can sort data as it arrives',
        'Used internally by Timsort (Python, Java) for small subarrays',
      ],
      weaknesses: [
        'O(n\u00B2) on reverse-sorted or random data',
        'Expensive shifting operations for large arrays',
        'Not suitable for large datasets alone',
      ],
      best: 'O(n)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)', space: 'O(1)',
      realWorld: 'The go-to algorithm for small arrays (n < 50). Used as the base case in hybrid sorts like Timsort (Python\'s built-in sort) and Introsort (C++ STL). Excellent for live/streaming data.',
    },
    {
      key: 'merge',
      name: 'Merge Sort',
      avgComplexity: 'O(n log n)',
      analogy: 'Like organizing a messy bookshelf by splitting it in half, sorting each half separately, then merging them back together by picking the smaller book from either side. The splitting continues recursively until you have single books.',
      steps: [
        'Divide the array into two halves.',
        'Recursively sort each half.',
        'Merge the two sorted halves by comparing elements from each.',
        'The merge step creates a sorted auxiliary array.',
        'Continue until the entire array is merged and sorted.',
      ],
      strengths: [
        'Guaranteed O(n log n) \u2014 no worst-case degradation',
        'Stable \u2014 preserves order of equal elements',
        'Parallelizable \u2014 the two halves can be sorted independently',
        'Works well with linked lists (no extra space needed)',
        'Predictable performance regardless of input pattern',
      ],
      weaknesses: [
        'Requires O(n) auxiliary space for arrays',
        'Not in-place \u2014 memory overhead can be significant',
        'Slower than Quick Sort in practice due to cache behavior',
        'More complex to implement correctly',
      ],
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)',
      realWorld: 'Used when stability is required (database sorting, external sorting of large files). The basis for Timsort. Preferred for linked lists where O(n) space is not an issue. Used in external sorting (sorting data that doesn\'t fit in memory).',
    },
    {
      key: 'quick',
      name: 'Quick Sort',
      avgComplexity: 'O(n log n)',
      analogy: 'Like organizing a group of people by height \u2014 pick one person as a "pivot," move everyone shorter to the left and everyone taller to the right. Then repeat the process for each group independently.',
      steps: [
        'Choose a pivot element (often the last or a random element).',
        'Partition: move elements smaller than pivot to the left, larger to the right.',
        'Place the pivot at its final sorted position.',
        'Recursively apply to the left and right sub-arrays.',
        'Base case: sub-arrays of size 0 or 1 are already sorted.',
      ],
      strengths: [
        'Fastest in practice for random data \u2014 excellent cache performance',
        'In-place \u2014 only O(log n) stack space for recursion',
        'Small constant factors make it faster than Merge Sort in practice',
        'Highly optimizable with pivot strategies (median-of-3, random)',
      ],
      weaknesses: [
        'Worst case O(n\u00B2) on already-sorted or reverse-sorted input (with naive pivot)',
        'Not stable \u2014 relative order of equal elements may change',
        'Recursive \u2014 deep recursion on degenerate inputs',
        'Performance depends heavily on pivot selection',
      ],
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n\u00B2)', space: 'O(log n)',
      realWorld: 'The default sorting algorithm in many standard libraries (C qsort, Java arrays). Used as the primary algorithm in Introsort (falls back to Heap Sort if recursion depth is too high). Best choice for general-purpose in-memory sorting of arrays.',
    },
    {
      key: 'radix',
      name: 'Radix Sort',
      avgComplexity: 'O(nk)',
      analogy: 'Like sorting a stack of papers by ZIP code \u2014 first sort by the last digit, then by the second-to-last, then by the third-to-last. After processing all digits, the papers are in perfect order. No comparisons between elements needed!',
      steps: [
        'Find the maximum number to determine the number of digits (k).',
        'Starting from the least significant digit (ones place):',
        'Distribute all numbers into 10 buckets (0-9) based on the current digit.',
        'Collect numbers from buckets back into the array (maintaining order).',
        'Move to the next digit and repeat until all digits are processed.',
      ],
      strengths: [
        'Not comparison-based \u2014 can break the O(n log n) barrier',
        'O(nk) where k is the number of digits \u2014 nearly linear for limited-range integers',
        'Stable \u2014 maintains relative order',
        'Extremely fast for uniform-length integers or strings',
      ],
      weaknesses: [
        'Only works with integers or fixed-length strings',
        'Requires O(n + k) extra space for buckets',
        'Not in-place',
        'Performance depends on the number of digits (k)',
        'Not effective for floating-point or variable-length keys',
      ],
      best: 'O(nk)', average: 'O(nk)', worst: 'O(nk)', space: 'O(n + k)',
      realWorld: 'Used in databases for integer/string indexing, postal services for ZIP code sorting, and parallel computing where digit-based distribution is natural. Preferred when the key range is known and not too large relative to n.',
    },
  ];

  // ── Render Decision Flowchart ─────────────────────────────────
  function renderFlowchart() {
    const container = document.getElementById('flowchart');

    container.innerHTML = `
      <div class="flow-node flow-question">Is the data nearly sorted?</div>
      <div class="flow-connector"><div class="flow-arrow"></div></div>
      <div class="flow-branch">
        <div class="flow-branch-arm">
          <span class="flow-label flow-label--yes">Yes</span>
          <div class="flow-connector"><div class="flow-arrow"></div></div>
          <a href="/visualizer?algo=insertion" class="flow-node flow-answer">
            Insertion Sort
            <span class="flow-answer-subtitle">Adaptive O(n) on nearly-sorted data</span>
          </a>
        </div>
        <div class="flow-branch-arm">
          <span class="flow-label flow-label--no">No</span>
          <div class="flow-connector"><div class="flow-arrow"></div></div>
          <div class="flow-node flow-question">Is stability required?</div>
          <div class="flow-connector"><div class="flow-arrow"></div></div>
          <div class="flow-branch">
            <div class="flow-branch-arm">
              <span class="flow-label flow-label--yes">Yes</span>
              <div class="flow-connector"><div class="flow-arrow"></div></div>
              <div class="flow-node flow-question">Need guaranteed O(n log n)?</div>
              <div class="flow-connector"><div class="flow-arrow"></div></div>
              <div class="flow-branch">
                <div class="flow-branch-arm">
                  <span class="flow-label flow-label--yes">Yes</span>
                  <div class="flow-connector"><div class="flow-arrow"></div></div>
                  <a href="/visualizer?algo=merge" class="flow-node flow-answer">
                    Merge Sort
                    <span class="flow-answer-subtitle">Stable, guaranteed O(n log n)</span>
                  </a>
                </div>
                <div class="flow-branch-arm">
                  <span class="flow-label flow-label--no">No</span>
                  <div class="flow-connector"><div class="flow-arrow"></div></div>
                  <a href="/visualizer?algo=bubble" class="flow-node flow-answer">
                    Bubble Sort
                    <span class="flow-answer-subtitle">Stable but O(n\u00B2) \u2014 small data only</span>
                  </a>
                </div>
              </div>
            </div>
            <div class="flow-branch-arm">
              <span class="flow-label flow-label--no">No</span>
              <div class="flow-connector"><div class="flow-arrow"></div></div>
              <div class="flow-node flow-question">Array size &lt; 50?</div>
              <div class="flow-connector"><div class="flow-arrow"></div></div>
              <div class="flow-branch">
                <div class="flow-branch-arm">
                  <span class="flow-label flow-label--yes">Yes</span>
                  <div class="flow-connector"><div class="flow-arrow"></div></div>
                  <a href="/visualizer?algo=selection" class="flow-node flow-answer">
                    Selection Sort
                    <span class="flow-answer-subtitle">Minimal swaps, simple for small n</span>
                  </a>
                </div>
                <div class="flow-branch-arm">
                  <span class="flow-label flow-label--no">No</span>
                  <div class="flow-connector"><div class="flow-arrow"></div></div>
                  <a href="/visualizer?algo=quick" class="flow-node flow-answer">
                    Quick Sort
                    <span class="flow-answer-subtitle">Fastest in practice, O(n log n) avg</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flow-connector" style="margin-top:24px"><div class="flow-arrow"></div></div>
      <div class="flow-node flow-question">Non-comparison based? (integers only)</div>
      <div class="flow-connector"><div class="flow-arrow"></div></div>
      <div class="flow-branch">
        <div class="flow-branch-arm">
          <span class="flow-label flow-label--yes">Yes</span>
          <div class="flow-connector"><div class="flow-arrow"></div></div>
          <a href="/visualizer?algo=radix" class="flow-node flow-answer">
            Radix Sort
            <span class="flow-answer-subtitle">O(nk) \u2014 linear for bounded integers</span>
          </a>
        </div>
        <div class="flow-branch-arm">
          <span class="flow-label flow-label--no">No</span>
          <div class="flow-connector"><div class="flow-arrow"></div></div>
          <div class="flow-node flow-question" style="border-color: #64748b; opacity: 0.7;">
            Use the comparison-based results above
          </div>
        </div>
      </div>
    `;
  }

  // ── Render Algorithm Cards ────────────────────────────────────
  function renderAlgoCards() {
    const container = document.getElementById('algo-cards');

    container.innerHTML = ALGORITHMS.map((algo, idx) => `
      <div class="algo-card" id="card-${algo.key}">
        <div class="algo-card-header" onclick="toggleCard('${algo.key}')">
          <div class="algo-card-color" style="background: ${COLORS[algo.key]}">
            ${String(idx + 1).padStart(2, '0')}
          </div>
          <span class="algo-card-name">${algo.name}</span>
          <span class="algo-card-complexity">${algo.avgComplexity}</span>
          <i data-lucide="chevron-down" class="algo-card-chevron"></i>
        </div>
        <div class="algo-card-body">

          <span class="card-section-label">Real-World Analogy</span>
          <div class="card-analogy">${algo.analogy}</div>

          <span class="card-section-label">How It Works</span>
          <ol class="card-steps">
            ${algo.steps.map(s => `<li>${s}</li>`).join('')}
          </ol>

          <span class="card-section-label">Strengths & Weaknesses</span>
          <div class="card-pros-cons">
            <ul class="card-pros">
              ${algo.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
            <ul class="card-cons">
              ${algo.weaknesses.map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>

          <span class="card-section-label">Complexity</span>
          <div class="card-complexity-grid">
            <div class="complexity-cell">
              <span class="complexity-cell-label">Best</span>
              <span class="complexity-cell-value">${algo.best}</span>
            </div>
            <div class="complexity-cell">
              <span class="complexity-cell-label">Average</span>
              <span class="complexity-cell-value">${algo.average}</span>
            </div>
            <div class="complexity-cell">
              <span class="complexity-cell-label">Worst</span>
              <span class="complexity-cell-value">${algo.worst}</span>
            </div>
            <div class="complexity-cell">
              <span class="complexity-cell-label">Space</span>
              <span class="complexity-cell-value">${algo.space}</span>
            </div>
          </div>

          <span class="card-section-label">When to Use in Practice</span>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;">
            ${algo.realWorld}
          </p>

          <a href="/visualizer?algo=${algo.key}" class="card-cta">
            <i data-lucide="play" class="card-cta-icon"></i>
            Try ${algo.name} in Visualizer
          </a>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  // Global toggle function
  window.toggleCard = function (key) {
    const card = document.getElementById('card-' + key);
    card.classList.toggle('expanded');
  };

  // ── Render Properties Matrix ──────────────────────────────────
  function renderPropertiesMatrix() {
    const table = document.getElementById('properties-table');

    const properties = [
      {
        name: 'In-Place',
        desc: 'Sorts without needing extra memory proportional to input size',
        values: { bubble: true, selection: true, insertion: true, merge: false, quick: true, radix: false },
      },
      {
        name: 'Stable',
        desc: 'Preserves relative order of elements with equal keys',
        values: { bubble: true, selection: false, insertion: true, merge: true, quick: false, radix: true },
      },
      {
        name: 'Adaptive',
        desc: 'Runs faster on partially sorted input',
        values: { bubble: true, selection: false, insertion: true, merge: false, quick: false, radix: false },
      },
      {
        name: 'O(n log n) Guaranteed',
        desc: 'Worst-case time complexity is O(n log n)',
        values: { bubble: false, selection: false, insertion: false, merge: true, quick: false, radix: null },
      },
      {
        name: 'Online',
        desc: 'Can sort data as it arrives (streaming)',
        values: { bubble: false, selection: false, insertion: true, merge: false, quick: false, radix: false },
      },
      {
        name: 'Low Overhead',
        desc: 'Minimal setup and small constant factors',
        values: { bubble: true, selection: true, insertion: true, merge: false, quick: true, radix: false },
      },
      {
        name: 'Cache Friendly',
        desc: 'Good locality of reference for CPU cache performance',
        values: { bubble: true, selection: true, insertion: true, merge: false, quick: true, radix: false },
      },
    ];

    const algoKeys = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'radix'];
    const algoNames = { bubble: 'Bubble', selection: 'Selection', insertion: 'Insertion', merge: 'Merge', quick: 'Quick', radix: 'Radix' };

    let html = '<thead><tr><th>Property</th>';
    algoKeys.forEach(k => {
      html += `<th><span class="algo-color-dot" style="background:${COLORS[k]};display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;"></span>${algoNames[k]}</th>`;
    });
    html += '</tr></thead><tbody>';

    properties.forEach(prop => {
      html += `<tr><td title="${prop.desc}">${prop.name}</td>`;
      algoKeys.forEach(k => {
        const val = prop.values[k];
        if (val === null) {
          html += '<td><i data-lucide="minus" class="prop-na" style="width:16px;height:16px;"></i></td>';
        } else if (val) {
          html += '<td><i data-lucide="check" class="prop-yes" style="width:16px;height:16px;"></i></td>';
        } else {
          html += '<td><i data-lucide="x" class="prop-no" style="width:16px;height:16px;"></i></td>';
        }
      });
      html += '</tr>';
    });

    html += '</tbody>';
    table.innerHTML = html;

    if (window.lucide) lucide.createIcons();
  }

  // ── Initialize ────────────────────────────────────────────────
  renderFlowchart();
  renderAlgoCards();
  renderPropertiesMatrix();

})();
