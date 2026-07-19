/**
 * race.js
 * Part of the Sort Scramble Visualization Engine.
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const sizeInput = document.getElementById('race-size');
        const sizeValDisplay = document.getElementById('race-size-val');
        const btnStartRace = document.getElementById('btn-start-race');

        const resultsArea = document.getElementById('race-results');
        const leaderboardContainer = document.getElementById('race-leaderboard');

        // All panels
        const panels = document.querySelectorAll('.race-panel[data-algo], [data-algo]'); // In case .race-panel isn't used exactly
        
        let raceInterval = null;
        let algorithmsData = {};
        let finishedCount = 0;
        let leaderboard = [];

        // Formatting Helpers
        const getOrdinal = (n) => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };

        // Update size display
        if (sizeInput && sizeValDisplay) {
            sizeInput.addEventListener('input', () => {
                sizeValDisplay.textContent = sizeInput.value;
            });
            // Init
            sizeValDisplay.textContent = sizeInput.value;
        }

        /**
         * Generates random array based on size
         */
        function generateRandomArray(size) {
            return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
        }

        /**
         * Render mini bars for an algorithm
         */
        function renderMiniBars(container, arr, barStates = {}) {
            if (!container) return;
            container.innerHTML = '';
            if (!arr || arr.length === 0) return;

            const maxVal = Math.max(...arr, 1);
            
            arr.forEach((val, idx) => {
                const heightPct = (val / maxVal) * 100;
                const state = barStates[idx] || 'default';

                const barDiv = document.createElement('div');
                barDiv.className = 'bar';
                barDiv.style.height = `${heightPct}%`;
                barDiv.setAttribute('data-state', state);

                container.appendChild(barDiv);
            });
        }

        if (btnStartRace) {
            btnStartRace.addEventListener('click', async () => {
                const size = parseInt(sizeInput ? sizeInput.value : 50, 10);
                const arr = generateRandomArray(size);

                btnStartRace.disabled = true;
                if (resultsArea) resultsArea.style.display = 'none';
                if (leaderboardContainer) leaderboardContainer.innerHTML = '';
                
                leaderboard = [];
                finishedCount = 0;
                algorithmsData = {};

                if (raceInterval) {
                    clearInterval(raceInterval);
                    raceInterval = null;
                }

                const fetchPromises = [];
                const algoNames = [];

                // Reset UI and prepare fetch
                panels.forEach(panel => {
                    const algo = panel.getAttribute('data-algo');
                    if (!algo) return;
                    
                    algoNames.push(algo);

                    const statusEl = document.getElementById(`race-status-${algo}`);
                    const progressEl = document.getElementById(`race-progress-${algo}`);
                    const barsEl = document.getElementById(`race-bars-${algo}`);

                    if (statusEl) {
                        statusEl.textContent = 'Waiting...';
                        statusEl.className = 'race-panel-status'; // Reset any rank classes
                        statusEl.style.color = ''; // Fix color reset bug
                    }
                    if (progressEl) progressEl.style.width = '0%';
                    if (barsEl) barsEl.innerHTML = '';

                    algorithmsData[algo] = {
                        name: algo,
                        steps: [],
                        currentStep: 0,
                        totalSteps: 0,
                        finished: false,
                        statusEl,
                        progressEl,
                        barsEl
                    };

                    fetchPromises.push(
                        fetch('/api/sort', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ algorithm: algo, array: arr })
                        }).then(r => r.json()).then(data => {
                            algorithmsData[algo].steps = data.steps || [];
                            algorithmsData[algo].totalSteps = (data.steps || []).length;
                            algorithmsData[algo].name = data.info ? (data.info.name || algo) : algo;
                            
                            if (statusEl) statusEl.textContent = 'Ready';
                            
                            // Initial render state
                            if (data.steps && data.steps.length > 0) {
                                renderMiniBars(barsEl, data.steps[0].arr, data.steps[0].barStates);
                            }
                        }).catch(err => {
                            console.error(`Error fetching ${algo}:`, err);
                            if (statusEl) statusEl.textContent = 'Error';
                            algorithmsData[algo].finished = true; // Skip failed ones
                        })
                    );
                });

                if (fetchPromises.length === 0) {
                    alert('No algorithms configured for the race.');
                    btnStartRace.disabled = false;
                    return;
                }

                try {
                    // Fetch all simultaneously
                    await Promise.all(fetchPromises);
                    
                    // Start Race Loop
                    panels.forEach(panel => {
                        const algo = panel.getAttribute('data-algo');
                        const data = algorithmsData[algo];
                        if (data && !data.finished && data.statusEl) {
                            data.statusEl.textContent = 'Racing...';
                        }
                    });

                    raceInterval = setInterval(raceTick, 50);

                } catch (err) {
                    console.error("Failed to fetch algorithms for race:", err);
                    alert("An error occurred starting the race.");
                    btnStartRace.disabled = false;
                }
            });
        }

        function raceTick() {
            let allFinished = true;

            Object.entries(algorithmsData).forEach(([algo, data]) => {
                if (data.finished) return;

                allFinished = false;

                if (data.currentStep < data.totalSteps - 1) {
                    data.currentStep++;
                    
                    const stepState = data.steps[data.currentStep];
                    if (stepState) {
                        renderMiniBars(data.barsEl, stepState.arr, stepState.barStates);
                    }
                    
                    // Update progress
                    const p = Math.min(100, Math.floor((data.currentStep / (data.totalSteps - 1 || 1)) * 100));
                    if (data.progressEl) data.progressEl.style.width = `${p}%`;
                }

                // Check if just finished
                if (data.currentStep >= data.totalSteps - 1) {
                    data.finished = true;
                    // Ensure bar is filled
                    if (data.progressEl) data.progressEl.style.width = `100%`;
                    
                    finishedCount++;
                    
                    const rank = getOrdinal(finishedCount);
                    if (data.statusEl) {
                        data.statusEl.textContent = `Finished: ${rank}`;
                        // Add some color coding for top 3
                        if (finishedCount === 1) data.statusEl.style.color = 'gold';
                        else if (finishedCount === 2) data.statusEl.style.color = 'silver';
                        else if (finishedCount === 3) data.statusEl.style.color = '#cd7f32'; // bronze
                    }

                    leaderboard.push({
                        algo: algo,
                        name: data.name,
                        rank: rank,
                        totalSteps: data.totalSteps
                    });
                }
            });

            if (allFinished) {
                if (raceInterval !== null) {
                    clearInterval(raceInterval);
                    raceInterval = null;
                }
                finishRace();
            }
        }

        function finishRace() {
            if (btnStartRace) btnStartRace.disabled = false;
            if (resultsArea) resultsArea.style.display = 'block';
            
            if (leaderboardContainer) {
                leaderboardContainer.innerHTML = '';
                
                leaderboard.forEach((entry) => {
                    const li = document.createElement('li');
                    li.className = 'leaderboard-entry'; // Matches .race-leaderboard li style automatically

                    // Use flexbox already defined in CSS for .race-leaderboard li
                    li.style.display = 'flex';
                    li.style.justifyContent = 'space-between';
                    li.style.alignItems = 'center';
                    li.style.padding = '12px 16px';
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.innerHTML = `<strong>${entry.rank}</strong> - ${entry.name}`;
                    
                    const stepsSpan = document.createElement('span');
                    stepsSpan.textContent = `${entry.totalSteps} steps`;
                    stepsSpan.style.backgroundColor = 'var(--primary, #007bff)';
                    stepsSpan.style.color = 'white';
                    stepsSpan.style.padding = '3px 8px';
                    stepsSpan.style.borderRadius = '12px';
                    stepsSpan.style.fontSize = '0.85em';
                    
                    li.appendChild(nameSpan);
                    li.appendChild(stepsSpan);
                    
                    leaderboardContainer.appendChild(li);
                });
            }
        }
    });

})();
