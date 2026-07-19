import os
import time
from flask import Flask, render_template, request, jsonify

# Configuration and Modules
from config.settings import config
from algorithms import ALGO_INFO

# -- Import algorithm step generators -----------------------------------------
try:
    from algorithms.bubble_sort import generate_steps as bubble_steps
except ImportError:
    bubble_steps = None

try:
    from algorithms.selection_sort import generate_steps as selection_steps
except ImportError:
    selection_steps = None

try:
    from algorithms.insertion_sort import generate_steps as insertion_steps
except ImportError:
    insertion_steps = None

try:
    from algorithms.merge_sort import generate_steps as merge_steps
except ImportError:
    merge_steps = None

try:
    from algorithms.quick_sort import generate_steps as quick_steps
except ImportError:
    quick_steps = None

try:
    from algorithms.radix_sort import generate_steps as radix_steps
except ImportError:
    radix_steps = None


# -- Flask App ----------------------------------------------------------------
app = Flask(__name__)
app.config.from_object(config)

ALGORITHMS = {
    "bubble": bubble_steps,
    "selection": selection_steps,
    "insertion": insertion_steps,
    "merge": merge_steps,
    "quick": quick_steps,
    "radix": radix_steps,
}


def mock_steps(arr):
    """Fallback mock if algorithm file is not ready yet."""
    n = len(arr)
    sorted_arr = sorted(arr)
    return [
        {
            "arr": arr[:],
            "barStates": {str(i): "default" for i in range(n)},
            "dsType": "array",
            "dsData": {"highlights": {}, "markers": {}, "regions": {}},
            "message": "Algorithm not implemented yet. Showing initial state.",
            "operation": "compare",
            "stats": {"comparisons": 0, "swaps": 0},
        },
        {
            "arr": sorted_arr,
            "barStates": {str(i): "sorted" for i in range(n)},
            "dsType": "array",
            "dsData": {"highlights": {}, "markers": {}, "regions": {}},
            "message": "Sorting complete!",
            "operation": "sorted",
            "stats": {"comparisons": 0, "swaps": 0},
        },
    ]


# -- Page Routes ---------------------------------------------------------------

@app.route("/")
def landing():
    return render_template("landing.html", active_page="landing")


@app.route("/visualizer")
def visualizer():
    return render_template("visualizer.html", active_page="visualizer")


@app.route("/benchmark")
def benchmark():
    return render_template("benchmark.html", active_page="benchmark")


@app.route("/learn")
def learn():
    return render_template("learn.html", active_page="learn")


@app.route("/compare")
def compare():
    return render_template("compare.html", active_page="compare")


@app.route("/race")
def race():
    return render_template("race.html", active_page="race")


# -- API Routes ----------------------------------------------------------------

@app.route("/api/info")
def info():
    return jsonify(ALGO_INFO)


@app.route("/api/sort", methods=["POST"])
def sort():
    """
    Endpoint to fetch algorithm steps for visualization based on the requested algorithm.
    Includes basic validation to prevent unhandled AttributeError crashes.
    """
    data = request.get_json(silent=True) or {}
    algo = data.get("algorithm", "bubble")
    arr = data.get("array", [])

    step_fn = ALGORITHMS.get(algo)
    if step_fn is None:
        steps = mock_steps(arr)
    else:
        steps = step_fn(arr)

    return jsonify({"steps": steps, "info": ALGO_INFO.get(algo, {})})


@app.route("/api/benchmark", methods=["POST"])
def api_benchmark():
    """Run benchmark across all algorithms for a given array size and pattern."""
    data = request.get_json()
    size = min(int(data.get("size", 50)), 1000)
    pattern = data.get("pattern", "random")
    iterations = min(int(data.get("iterations", 50)), 100)

    import random

    # Generate array based on pattern
    if pattern == "sorted":
        arr = list(range(1, size + 1))
    elif pattern == "reversed":
        arr = list(range(size, 0, -1))
    elif pattern == "nearly_sorted":
        arr = list(range(1, size + 1))
        swaps = max(1, size // 10)
        for _ in range(swaps):
            i, j = random.randint(0, size - 1), random.randint(0, size - 1)
            arr[i], arr[j] = arr[j], arr[i]
    elif pattern == "few_unique":
        unique_vals = [random.randint(1, max(5, size // 5)) for _ in range(min(5, size))]
        arr = [random.choice(unique_vals) for _ in range(size)]
    else:  # random
        arr = [random.randint(1, size * 10) for _ in range(size)]

    results = []
    for algo_name, step_fn in ALGORITHMS.items():
        if step_fn is None:
            continue

        times: list[float] = []
        last_steps = None
        for _ in range(iterations):
            copy_arr = list(arr)
            start = time.perf_counter()
            steps = step_fn(copy_arr)
            elapsed = (time.perf_counter() - start) * 1000.0  # ms
            times.append(elapsed)
            last_steps = steps

        final_stats = last_steps[-1]["stats"] if last_steps else {}
        avg_ms = sum(times) / len(times) if times else 0.0
        
        results.append({
            "algorithm": algo_name,
            "name": ALGO_INFO.get(algo_name, {}).get("name", algo_name),
            "avg_ms": round(float(avg_ms), 3),
            "min_ms": round(float(min(times)), 3) if times else 0.0,
            "max_ms": round(float(max(times)), 3) if times else 0.0,
            "comparisons": final_stats.get("comparisons", 0),
            "swaps": final_stats.get("swaps", 0),
            "steps": len(last_steps) if last_steps else 0,
            "info": ALGO_INFO.get(algo_name, {}),
        })

    # Sort by avg_ms for ranking
    results.sort(key=lambda r: r["avg_ms"])

    return jsonify({
        "results": results,
        "array_size": size,
        "pattern": pattern,
        "iterations": iterations,
    })


# -- Error Handlers ------------------------------------------------------------

@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html", active_page=""), 404


# -- Run -----------------------------------------------------------------------

if __name__ == "__main__":
    # ---------------------------------------------------------
    # SECURE DEPLOYMENT NOTE:
    # Port mapping and debug execution defaults are safely
    # inherited from the application config mapping context.
    # ---------------------------------------------------------
    app.run(debug=app.config["DEBUG"], port=app.config["PORT"])
