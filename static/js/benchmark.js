/**
 * benchmark.js — Full Benchmark Page Logic
 * Calls POST /api/benchmark, renders Chart.js charts, tables, and analysis.
 */
(function () {
  'use strict';

  // ── Algorithm Colors ──────────────────────────────────────────
  const ALGO_COLORS = {
    bubble:    '#FF6B6B',
    selection: '#FFA06B',
    insertion: '#FFD93D',
    merge:     '#6BCB77',
    quick:     '#4D96FF',
    radix:     '#9B59B6',
  };

  const PATTERNS = ['random', 'nearly_sorted', 'reversed', 'few_unique'];
  const PATTERN_LABELS = {
    random: 'Random',
    nearly_sorted: 'Nearly Sorted',
    reversed: 'Reversed',
    few_unique: 'Few Unique',
  };

  // ── DOM References ────────────────────────────────────────────
  const sizeSlider   = document.getElementById('bench-size');
  const sizeVal      = document.getElementById('bench-size-val');
  const itersSlider  = document.getElementById('bench-iters');
  const itersVal     = document.getElementById('bench-iters-val');
  const patternSel   = document.getElementById('bench-pattern');
  const btnRun       = document.getElementById('btn-run-benchmark');
  const btnMatrix    = document.getElementById('btn-run-matrix');
  const loadingEl    = document.getElementById('benchmark-loading');
  const loadingText  = document.getElementById('loading-text');
  const loadingBar   = document.getElementById('loading-progress');
  const resultsEl    = document.getElementById('benchmark-results');
  const matrixPanel  = document.getElementById('matrix-panel');

  let execChart = null;
  let opsChart  = null;
  let growthChart = null;

  // ── Slider Sync ───────────────────────────────────────────────
  sizeSlider.addEventListener('input', () => { sizeVal.textContent = sizeSlider.value; });
  itersSlider.addEventListener('input', () => { itersVal.textContent = itersSlider.value; });

  // ── API Call ──────────────────────────────────────────────────
  async function runBenchmark(size, pattern, iterations) {
    const res = await fetch('/api/benchmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ size, pattern, iterations }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server error: ${res.status}`);
    }
    return res.json();
  }

  // ── Show / Hide Loading ───────────────────────────────────────
  function showLoading(msg, progress) {
    loadingEl.style.display = 'flex';
    loadingText.textContent = msg || 'Running benchmark...';
    loadingBar.style.width = (progress || 0) + '%';
  }
  function hideLoading() {
    loadingEl.style.display = 'none';
  }

  // ── Run Single Pattern Benchmark ──────────────────────────────
  btnRun.addEventListener('click', async () => {
    const size = parseInt(sizeSlider.value);
    const pattern = patternSel.value;
    const iterations = parseInt(itersSlider.value);

    btnRun.disabled = true;
    btnMatrix.disabled = true;
    matrixPanel.style.display = 'none';
    showLoading(`Running 6 algorithms on ${size} elements (${PATTERN_LABELS[pattern]})...`, 20);

    try {
      const data = await runBenchmark(size, pattern, iterations);
      showLoading('Rendering results...', 90);

      resultsEl.style.display = 'block';
      renderSummaryCards(data.results);
      renderExecTimeChart(data.results);
      renderOperationsChart(data.results);
      renderGrowthCurves(size);
      renderComparisonTable(data.results);
      renderAnalysisReport(data.results, size, pattern);

      hideLoading();

      // Smooth scroll to results
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      console.error('Benchmark failed:', err);
      hideLoading();
      alert(`Benchmark Error: ${err.message}`);
    } finally {
      btnRun.disabled = false;
      btnMatrix.disabled = false;
    }
  });

  // ── Run Full Pattern Matrix ───────────────────────────────────
  btnMatrix.addEventListener('click', async () => {
    const size = parseInt(sizeSlider.value);
    const iterations = parseInt(itersSlider.value);

    btnRun.disabled = true;
    btnMatrix.disabled = true;

    const matrixData = {};
    let firstResults = null;

    try {
      for (let i = 0; i < PATTERNS.length; i++) {
        const pattern = PATTERNS[i];
        const progress = Math.round(((i) / PATTERNS.length) * 80);
        showLoading(`Pattern ${i + 1}/${PATTERNS.length}: ${PATTERN_LABELS[pattern]}...`, progress);

        const data = await runBenchmark(size, pattern, iterations);
        matrixData[pattern] = data.results;

        if (i === 0) firstResults = data.results;
      }

      showLoading('Building heatmap...', 95);

      resultsEl.style.display = 'block';
      renderSummaryCards(firstResults);
      renderExecTimeChart(firstResults);
      renderOperationsChart(firstResults);
      renderGrowthCurves(size);
      renderPatternMatrix(matrixData, size);
      renderComparisonTable(firstResults);
      renderAnalysisReport(firstResults, size, 'random');

      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      console.error('Matrix Benchmark failed:', err);
      alert(`Matrix Error: ${err.message}`);
    } finally {
      hideLoading();
      btnRun.disabled = false;
      btnMatrix.disabled = false;
    }
  });

  // ── Render Summary Cards ──────────────────────────────────────
  function renderSummaryCards(results) {
    if (!results.length) return;

    const fastest = results[0];
    const slowest = results[results.length - 1];
    const ratio = (slowest.avg_ms / fastest.avg_ms).toFixed(1);

    document.getElementById('fastest-algo').textContent = fastest.name;
    document.getElementById('fastest-time').textContent = fastest.avg_ms.toFixed(3) + ' ms';
    document.getElementById('slowest-algo').textContent = slowest.name;
    document.getElementById('slowest-time').textContent = slowest.avg_ms.toFixed(3) + ' ms';
    document.getElementById('speed-diff').textContent = ratio + 'x faster';

    // Fewest total operations
    const sorted = [...results].sort((a, b) => (a.comparisons + a.swaps) - (b.comparisons + b.swaps));
    const fewest = sorted[0];
    document.getElementById('fewest-ops-algo').textContent = fewest.name;
    document.getElementById('fewest-ops-count').textContent =
      (fewest.comparisons + fewest.swaps).toLocaleString() + ' ops';

    // Re-init Lucide icons for new content
    if (window.lucide) lucide.createIcons();
  }

  // ── Render Execution Time Bar Chart ───────────────────────────
  function renderExecTimeChart(results) {
    const ctx = document.getElementById('chart-exec-time');
    if (execChart) execChart.destroy();

    execChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: results.map(r => r.name),
        datasets: [{
          label: 'Avg Time (ms)',
          data: results.map(r => r.avg_ms),
          backgroundColor: results.map(r => ALGO_COLORS[r.algorithm] + 'CC'),
          borderColor: results.map(r => ALGO_COLORS[r.algorithm]),
          borderWidth: 2,
          borderRadius: 6,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e1e2e',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: ctx => `${ctx.parsed.x.toFixed(3)} ms`,
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Time (ms)', color: '#64748b' },
            ticks: { color: '#64748b' },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
          y: {
            ticks: { color: '#e2e8f0', font: { weight: 600 } },
            grid: { display: false },
          },
        },
      },
    });
  }

  // ── Render Operations Chart ───────────────────────────────────
  function renderOperationsChart(results) {
    const ctx = document.getElementById('chart-operations');
    if (opsChart) opsChart.destroy();

    opsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: results.map(r => r.name),
        datasets: [
          {
            label: 'Comparisons',
            data: results.map(r => r.comparisons),
            backgroundColor: 'rgba(77, 150, 255, 0.7)',
            borderColor: '#4D96FF',
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: 'Swaps',
            data: results.map(r => r.swaps),
            backgroundColor: 'rgba(255, 107, 107, 0.7)',
            borderColor: '#FF6B6B',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', usePointStyle: true, pointStyle: 'rectRounded' },
          },
          tooltip: {
            backgroundColor: '#1e1e2e',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
          },
        },
        scales: {
          x: {
            ticks: { color: '#e2e8f0', font: { size: 11 } },
            grid: { display: false },
          },
          y: {
            title: { display: true, text: 'Count', color: '#64748b' },
            ticks: { color: '#64748b' },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
        },
      },
    });
  }

  // ── Render Growth Curves ──────────────────────────────────────
  function renderGrowthCurves(maxN) {
    const ctx = document.getElementById('chart-growth');
    if (growthChart) growthChart.destroy();

    const points = 50;
    const step = Math.max(1, Math.floor(maxN / points));
    const labels = [];
    for (let n = step; n <= maxN; n += step) labels.push(n);

    const curves = [
      { label: 'O(n)',        fn: n => n,                color: '#6BCB77', dash: [] },
      { label: 'O(n log n)',  fn: n => n * Math.log2(n), color: '#4D96FF', dash: [5, 3] },
      { label: 'O(n^2)',      fn: n => n * n,            color: '#FF6B6B', dash: [8, 4] },
      { label: 'O(n * k)',    fn: n => n * Math.ceil(Math.log10(n * 10)), color: '#9B59B6', dash: [3, 3] },
    ];

    growthChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: curves.map(c => ({
          label: c.label,
          data: labels.map(n => c.fn(n)),
          borderColor: c.color,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: c.dash,
          pointRadius: 0,
          tension: 0.3,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: '#94a3b8', usePointStyle: true, pointStyle: 'line' },
          },
          tooltip: {
            backgroundColor: '#1e1e2e',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              title: ctx => `n = ${ctx[0].label}`,
              label: ctx => `${ctx.dataset.label}: ${Math.round(ctx.parsed.y).toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Input Size (n)', color: '#64748b' },
            ticks: { color: '#64748b', maxTicksLimit: 10 },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
          y: {
            title: { display: true, text: 'Operations', color: '#64748b' },
            ticks: { color: '#64748b', callback: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
        },
      },
    });
  }

  // ── Render Pattern Matrix ─────────────────────────────────────
  function renderPatternMatrix(matrixData, size) {
    matrixPanel.style.display = 'block';
    const table = document.getElementById('matrix-table');

    // Collect all times for normalization
    const allTimes = [];
    PATTERNS.forEach(p => {
      matrixData[p].forEach(r => allTimes.push(r.avg_ms));
    });
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);

    function heatClass(val) {
      if (maxTime === minTime) return 'heat-1';
      const ratio = (val - minTime) / (maxTime - minTime);
      if (ratio < 0.15) return 'heat-1';
      if (ratio < 0.3)  return 'heat-2';
      if (ratio < 0.5)  return 'heat-3';
      if (ratio < 0.7)  return 'heat-4';
      if (ratio < 0.85) return 'heat-5';
      return 'heat-6';
    }

    // Get algorithm names from first pattern
    const algoNames = matrixData[PATTERNS[0]].map(r => ({ key: r.algorithm, name: r.name }));

    let html = '<thead><tr><th>Algorithm</th>';
    PATTERNS.forEach(p => { html += `<th>${PATTERN_LABELS[p]}</th>`; });
    html += '</tr></thead><tbody>';

    algoNames.forEach(algo => {
      html += `<tr><td><span class="algo-color-dot" style="background:${ALGO_COLORS[algo.key]}"></span>${algo.name}</td>`;
      PATTERNS.forEach(p => {
        const result = matrixData[p].find(r => r.algorithm === algo.key);
        const val = result ? result.avg_ms : 0;
        const cls = heatClass(val);
        html += `<td class="${cls}"><div class="matrix-cell"><span class="matrix-cell-value">${val.toFixed(3)}</span><span class="matrix-cell-unit">ms</span></div></td>`;
      });
      html += '</tr>';
    });

    html += '</tbody>';
    table.innerHTML = html;
  }

  // ── Render Comparison Table ───────────────────────────────────
  function renderComparisonTable(results) {
    const table = document.getElementById('comparison-table');

    let html = `<thead><tr>
      <th>#</th><th>Algorithm</th><th>Time</th><th>Comparisons</th><th>Swaps</th>
      <th>Best</th><th>Average</th><th>Worst</th><th>Space</th><th>Stable</th>
    </tr></thead><tbody>`;

    results.forEach((r, i) => {
      const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-default';
      const info = r.info || {};
      html += `<tr>
        <td><span class="rank-badge ${rankClass}">${i + 1}</span></td>
        <td><span class="algo-color-dot" style="background:${ALGO_COLORS[r.algorithm]}"></span>${r.name}</td>
        <td><strong>${r.avg_ms.toFixed(3)} ms</strong></td>
        <td>${r.comparisons.toLocaleString()}</td>
        <td>${r.swaps.toLocaleString()}</td>
        <td><span class="complexity-badge">${info.best || '-'}</span></td>
        <td><span class="complexity-badge">${info.average || '-'}</span></td>
        <td><span class="complexity-badge">${info.worst || '-'}</span></td>
        <td><span class="complexity-badge">${info.space || '-'}</span></td>
        <td class="${info.stable ? 'stable-yes' : 'stable-no'}">${info.stable ? 'Yes' : 'No'}</td>
      </tr>`;
    });

    html += '</tbody>';
    table.innerHTML = html;
  }

  // ── Render Analysis Report ────────────────────────────────────
  function renderAnalysisReport(results, size, pattern) {
    const cards = document.getElementById('analysis-cards');
    if (!results.length) return;

    const fastest = results[0];
    const slowest = results[results.length - 1];
    const ratio = (slowest.avg_ms / fastest.avg_ms).toFixed(1);

    // Find most efficient (fewest comparisons)
    const mostEfficient = [...results].sort((a, b) => a.comparisons - b.comparisons)[0];

    // Find stable algorithms in top 3
    const stableInTop3 = results.slice(0, 3).filter(r => r.info && r.info.stable);

    // Recommendation based on size
    let recommendation = '';
    if (size <= 50) {
      recommendation = `For small arrays (n=${size}), the overhead of O(n log n) algorithms may not justify their complexity. <strong>Insertion Sort</strong> is often the practical choice due to low overhead and cache efficiency.`;
    } else if (size <= 200) {
      recommendation = `For medium arrays (n=${size}), <strong>${fastest.name}</strong> emerges as the best choice. The gap between O(n^2) and O(n log n) starts becoming significant at this size.`;
    } else {
      recommendation = `For larger arrays (n=${size}), O(n log n) algorithms clearly dominate. <strong>${fastest.name}</strong> is the winner. O(n^2) algorithms like Bubble Sort become impractical beyond n=500.`;
    }

    const insights = [
      {
        icon: 'trophy',
        title: 'Winner',
        text: `<strong>${fastest.name}</strong> was ${ratio}x faster than ${slowest.name} on ${size} elements with <strong>${PATTERN_LABELS[pattern]}</strong> input. It completed in ${fastest.avg_ms.toFixed(3)} ms with ${fastest.comparisons.toLocaleString()} comparisons.`,
      },
      {
        icon: 'brain',
        title: 'Efficiency Analysis',
        text: `<strong>${mostEfficient.name}</strong> used the fewest comparisons (${mostEfficient.comparisons.toLocaleString()}). Fewer comparisons means the algorithm makes better decisions about element ordering.`,
      },
      {
        icon: 'shield',
        title: 'Stability Note',
        text: stableInTop3.length > 0
          ? `Among the top 3 performers, <strong>${stableInTop3.map(r => r.name).join(' and ')}</strong> ${stableInTop3.length === 1 ? 'is' : 'are'} stable — they preserve the relative order of equal elements. This matters when sorting by multiple keys.`
          : `None of the top 3 performers are stable sorts. If you need stability (preserving relative order of equal elements), consider <strong>Merge Sort</strong> or <strong>Insertion Sort</strong>.`,
      },
      {
        icon: 'lightbulb',
        title: 'Recommendation',
        text: recommendation,
      },
    ];

    cards.innerHTML = insights.map(ins => `
      <div class="analysis-card">
        <div class="analysis-card-icon"><i data-lucide="${ins.icon}"></i></div>
        <div class="analysis-card-body">
          <div class="analysis-card-title">${ins.title}</div>
          <div class="analysis-card-text">${ins.text}</div>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

})();
