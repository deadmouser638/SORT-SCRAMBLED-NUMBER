# Sort Scramble - Developer Handoff Guide

**To:** Shubh (Lead Developer, Phase 2)
**From:** DevOps & Architecture Team
**Date:** March 15, 2026
**Subject:** Codebase State & Remaining Modules (Compare & Race)

---

## 🏗️ 1. Current State of the Codebase

The project is a premium, high-performance Sorting Algorithm Visualizer. It has undergone rigorous QA, structural formatting, and a luxury UI/UX overhaul. The repository is pristine, thoroughly documented, and strictly production-ready.

### ⚙️ Tech Stack & Architecture
*   **Backend:** Python 3 + Flask. We use standard REST API patterns.
*   **Production Server:** `waitress` WSGI server (`run_prod.py`). Werkzeug development server is strictly disabled in production via `.env`.
*   **Frontend:** Vanilla JavaScript, HTML5, Vanilla CSS. **No React, No Tailwind.**
*   **Style System:** Custom CSS variables in `main.css`. The aesthetic is a premium "abyssal dark" glassmorphism theme using `Outfit` and `Playfair Display` fonts, neon gradients, and heavy backdrop filters.
*   **Asset Management:** Cache-busting query strings (`?v=1.1`) are hardcoded into all `base.html` assets to prevent browser caching issues during rapid development.

### 🛡️ DevSecOps & QA (Completed)
*   **CI/CD Pipeline:** GitHub Actions (`.github/workflows/ci.yml`) is active. Pushes to `main` trigger automated `pytest` suites.
*   **API Security:** All POST endpoints (`/api/sort`, `/api/benchmark`) strictly validate input types (integers only) and cap array sizes (`n <= 1000`) to prevent Denial of Service (DoS) and integer overflow exploits.
*   **Frontend Resilience:** All JavaScript `fetch` calls are wrapped in `try/catch` logic. If the Python backend fails or times out, the UI gracefully throws sweetalert/custom notification popups instead of freezing.
*   **Clean Repository:** No leftover debug logging, no `.pyc` caches, and no local `.env` files are tracked. Standard Git flows apply.

### 📂 Directory Structure
```text
/
├── algorithms/      # Core sorting logic (bubble, merge, quick, etc.)
├── static/
│   ├── css/         # Modular CSS (main, landing, visualizer, race, compare)
│   ├── img/         # Premium background assets (background-1.jpeg, etc.)
│   └── js/          # Modular Vanilla JS controllers
├── templates/       # Jinja2 HTML views (landing, visualizer, base, etc.)
├── test/            # Pytest suites
├── app.py           # Flask REST API Controller
├── run_prod.py      # Waitress Production Entrypoint
├── requirements.txt # Strictly pinned PIP dependencies
└── .env.example     # Template for environment variables
```

---

## 🚀 2. What Is Left To Do

We have successfully built the **Landing**, **Visualizer** (Main Engine), **Benchmark**, and **Learn** functionality. 

**Your primary focus is implementing the final two core modules: `Compare` and `Race`.** You also have a few minor UX touchups remaining on the backlog.

### Priority 1: The "Compare" Module (`templates/compare.html` & `static/js/comparison.js`)
*   **Goal:** Allow users to place two different sorting algorithms side-by-side on the exact same dataset to visually compare their efficiency.
*   **Backend Needs:** You might need to adjust `app.py` or just fire two distinct `fetch('/api/sort')` requests from the frontend simultaneously.
*   **Frontend Needs:** A dual-pane layout. Two canvases or twin DOM-bar containers. The playback transport (Play/Pause/Scrub) must perfectly synchronize both visualizers simultaneously.

### Priority 2: The "Race" Module (`templates/race.html` & `static/js/race.js`)
*   **Goal:** A dramatic 6-way grid where 6 algorithms sort the same array simultaneously.
*   **Backend Needs:** The `/api/sort` endpoint is already optimized, but firing 6 requests at once might require batching or web-workers if the browser threads choke. 
*   **Frontend Needs:** A 3x2 grid of mini-visualizers. When the race finishes, a premium glowing overlay should display the final 1st-to-6th placement rankings based on algorithm step counts.

### Backlog UX Polish
*   **Visualizer Space Management:** Condense headers and refactor input controls on `visualizer.html` to eliminate scrolling on 1080p displays. Make it a true fullscreen dashboard.
*   **Real Code Panel:** Add a "Python Code" tab that switches the pseudocode view into actual syntax.
*   **Cross-Page State:** Remember the user's selected array size/speed via URL Query Params across pages.

---

## 🤖 3. AI Prompts for Shubh

To accelerate your work, you can feed these highly optimized prompts directly to your AI coding agents (like Claude, GPT-4, or Antigravity) when you start working.

### Prompt 1: Building the Compare Module
> "I need to build the 'Compare' module for my Sorting Visualizer. The architecture uses vanilla JS, HTML, and a Python Flask backend. I have a working `/api/sort` endpoint that returns timeline arrays. 
> 
> **Instructions:**
> 1. Overhaul `templates/compare.html` to feature a beautiful, premium dual-pane split layout. Use the existing CSS glassmorphism theme from `main.css`.
> 2. Write `static/js/comparison.js` to initialize two independent sorting canvases.
> 3. Implement a single master Transport Control (Play, Pause, Progress Slider). When the user clicks play, fetch the sorting animations for algorithm A and algorithm B, and animate them side-by-side in perfect unison so the user can easily see which algorithm completes the array first.
> 4. Do NOT use React. Use strict Vanilla JS and `requestAnimationFrame`. Maintain error-handling `try/catch` logic for all fetch calls."

### Prompt 2: Building the Race Module
> "I need to build the 'Race' module for my sorting platform. 
> 
> **Instructions:**
> 1. Design a 3x2 grid layout in `templates/race.html` using CSS grid. Each pod should contain a mini sorting visualization canvas. 
> 2. In `static/js/race.js`, generate a single scrambled array of size N. Simultaneously fetch sorting tracking data from my Flask backend for Bubble, Selection, Insertion, Merge, Quick, and Heap sort algorithms using that exact same array.
> 3. Animate all 6 canvases at exactly the same speed.
> 4. **Crucial:** Track when each algorithm finishes. As they complete, dynamically render a premium, glowing overlay on their respective pod showing '1st Place', '2nd Place', etc. 
> 5. Ensure the design matches our ultra-premium glassmorphism aesthetic. Do not use generic styling."

### Prompt 3: Refactoring Visualizer UX
> "Currently, my `visualizer.html` page requires users to scroll vertically on a 1080p laptop because the header and control docks are too large. 
> 
> Act as a senior UI/UX engineer. Rewrite the DOM structure and CSS to condense the vertical height. The main sorting canvas, the pseudocode tracker, and the transport controls must fit perfectly on a single un-scrollable 1080p viewport window. Move the configuration controls (Array Size, Speed) into a compact, absolutely positioned floating glassmorphism widget overlay."

---
*Good luck, Shubh! The infrastructure is rock solid. Focus purely on making the Javascript animations smooth and the UI logic flawless.*
