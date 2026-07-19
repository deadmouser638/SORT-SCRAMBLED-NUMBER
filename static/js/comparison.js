/**
 * comparison.js
 * Part of the Sort Scramble Visualization Engine.
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        // Elements
        const algo1Select = document.getElementById('compare-algo1');
        const algo2Select = document.getElementById('compare-algo2');
        const arrayInput = document.getElementById('compare-array');
        const btnRandom = document.getElementById('compare-random');
        const btnCompare = document.getElementById('btn-compare');

        // Transport Controls
        const transportContainer = document.getElementById('compare-transport');
        const btnPlay = document.getElementById('compare-play');
        const btnStepFwd = document.getElementById('compare-step-fwd');
        const btnStepBack = document.getElementById('compare-step-back');
        const btnReset = document.getElementById('compare-reset');

        // Output Panels
        const leftBars = document.getElementById('compare-left-bars');
        const leftStats = document.getElementById('panel-left-stats');
        const leftTitle = document.getElementById('panel-left-name');
        
        const rightBars = document.getElementById('compare-right-bars');
        const rightStats = document.getElementById('panel-right-stats');
        const rightTitle = document.getElementById('panel-right-name');

        // State
        let currentStep = 0;
        let leftSteps = [];
        let rightSteps = [];
        let globalMaxVal = 1; // Centralized scale for comparison
        let isPlaying = false;
        let animationId = null;
        let lastTimestamp = 0;
        const speedMs = 150; // Delay between steps when playing

        /**
         * Parses the comma-separated string into an array of integers.
         */
        function parseArrayInput(val) {
            return val
                .split(',')
                .map(s => parseInt(s.trim(), 10))
                .filter(n => !isNaN(n));
        }

        // Generate Random Array
        btnRandom.addEventListener('click', () => {
            const arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 100) + 1);
            arrayInput.value = arr.join(', ');
        });

        // Start Comparison
        btnCompare.addEventListener('click', async () => {
            let arr = parseArrayInput(arrayInput.value);
            
            // Auto-generate if empty to avoid fetch errors and improve UX
            if (arr.length === 0) {
                const randomArr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 100) + 1);
                arrayInput.value = randomArr.join(', ');
                arr = randomArr;
            }

            const algo1 = algo1Select.value;
            const algo2 = algo2Select.value;

            btnCompare.disabled = true;
            leftBars.innerHTML = '<div class="loading-spinner"></div>';
            rightBars.innerHTML = '<div class="loading-spinner"></div>';
            
            stopAutoPlay();
            currentStep = 0;

            try {
                // Fetch steps for both algorithms in parallel
                const [res1, res2] = await Promise.all([
                    fetch('/api/sort', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ algorithm: algo1, array: arr })
                    }).then(r => r.json()),
                    fetch('/api/sort', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ algorithm: algo2, array: arr })
                    }).then(r => r.json())
                ]);

                leftSteps = res1.steps || [];
                rightSteps = res2.steps || [];
                
                // Calculate global max value for synchronized scaling
                globalMaxVal = Math.max(...arr, 1);
                
                // Update Panel Titles
                leftTitle.textContent = res1.info ? res1.info.name : algo1.toUpperCase();
                rightTitle.textContent = res2.info ? res2.info.name : algo2.toUpperCase();

                transportContainer.style.display = 'flex';
                updateRender();
            } catch (err) {
                console.error('Failed to fetch sorting steps:', err);
                alert('An error occurred while fetching the algorithm steps.');
            } finally {
                btnCompare.disabled = false;
            }
        });

        /**
         * Render the visualization bars and stats for a given step.
         */
        function renderPanel(containerBars, containerStats, stepData) {
            if (!stepData) return;

            // Update Stats
            const stats = stepData.stats || { comparisons: 0, swaps: 0 };
            containerStats.innerHTML = `
                <span><strong>Comparisons:</strong> ${stats.comparisons}</span>
                <span><strong>Swaps:</strong> ${stats.swaps}</span>
            `;

            // Update Bars
            containerBars.innerHTML = '';
            const arr = stepData.arr;
            const barStates = stepData.barStates || {};
            
            arr.forEach((val, idx) => {
                const heightPct = (val / globalMaxVal) * 100;
                const state = barStates[idx] || 'default';

                const barDiv = document.createElement('div');
                barDiv.className = 'bar';
                barDiv.style.height = `${heightPct}%`;
                barDiv.setAttribute('data-state', state);

                // Add value label tooltip
                barDiv.title = `Value: ${val}`;

                containerBars.appendChild(barDiv);
            });
        }

        /**
         * Update both panels based on the `currentStep` index.
         * If an algorithm finishes early, stick to its final step.
         */
        function updateRender() {
            const lStep = leftSteps[Math.min(currentStep, leftSteps.length - 1)];
            const rStep = rightSteps[Math.min(currentStep, rightSteps.length - 1)];

            renderPanel(leftBars, leftStats, lStep);
            renderPanel(rightBars, rightStats, rStep);

            // Update button states
            btnStepBack.disabled = (currentStep === 0);
            
            const maxSteps = Math.max(leftSteps.length, rightSteps.length);
            const isFinished = currentStep >= maxSteps - 1;
            
            btnStepFwd.disabled = isFinished;
            if (isFinished && isPlaying) {
                stopAutoPlay();
            }
        }

        // --- Transport Controls ---

        btnStepFwd.addEventListener('click', () => {
            const maxSteps = Math.max(leftSteps.length, rightSteps.length);
            if (currentStep < maxSteps - 1) {
                currentStep++;
                updateRender();
            }
        });

        btnStepBack.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateRender();
            }
        });

        btnReset.addEventListener('click', () => {
            stopAutoPlay();
            currentStep = 0;
            updateRender();
        });

        btnPlay.addEventListener('click', () => {
            if (isPlaying) {
                stopAutoPlay();
            } else {
                startAutoPlay();
            }
        });

        function startAutoPlay() {
            const maxSteps = Math.max(leftSteps.length, rightSteps.length);
            if (currentStep >= maxSteps - 1) return; // Already at end

            isPlaying = true;
            btnPlay.innerHTML = '<i data-lucide="pause" style="width:18px;height:18px"></i>';
            if (window.lucide) window.lucide.createIcons();
            lastTimestamp = performance.now();
            animationId = requestAnimationFrame(autoPlayLoop);
        }

        function stopAutoPlay() {
            isPlaying = false;
            btnPlay.innerHTML = '<i data-lucide="play" style="width:18px;height:18px"></i>';
            if (window.lucide) window.lucide.createIcons();
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }

        function autoPlayLoop(timestamp) {
            if (!isPlaying) return;

            const elapsed = timestamp - lastTimestamp;
            if (elapsed > speedMs) {
                const maxSteps = Math.max(leftSteps.length, rightSteps.length);
                if (currentStep < maxSteps - 1) {
                    currentStep++;
                    updateRender();
                    lastTimestamp = timestamp;
                } else {
                    stopAutoPlay();
                    return;
                }
            }
            animationId = requestAnimationFrame(autoPlayLoop);
        }

        // Initialize empty state message
        leftBars.innerHTML = '<p class="text-muted">Select algorithms and click compare to start.</p>';
        rightBars.innerHTML = '<p class="text-muted">Select algorithms and click compare to start.</p>';
    });
})();
