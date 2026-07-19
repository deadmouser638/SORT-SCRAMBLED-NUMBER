"""Selection Sort step generator for SortViz."""


def generate_steps(arr):
    """Generates step-by-step state snapshots for algorithm visualization.

    Args:
        arr (list[int]): The input array of integers to sort.

    Returns:
        list[dict]: A list of dictionary objects representing the state at each step.
    """
    """Generates step-by-step states for Selection Sort."""
    a = arr.copy()
    n = len(a)
    steps = []
    stats = {"comparisons": 0, "swaps": 0}
    sorted_indices = set()

    if n <= 1:
        bar_states = {str(i): "sorted" for i in range(n)}
        steps.append({
            "arr": a[:],
            "barStates": bar_states,
            "dsType": "array",
            "dsData": {
                "highlights": {},
                "markers": {},
                "regions": {"sorted": [0, n - 1] if n > 0 else [], "unsorted": []}
            },
            "message": "Array is already sorted." if n > 0 else "Empty array.",
            "operation": "sorted",
            "stats": {**stats}
        })
        return steps

    for i in range(n - 1):
        min_idx = i

        for j in range(i + 1, n):
            stats["comparisons"] += 1

            bar_states = {str(k): "default" for k in range(n)}
            for s in sorted_indices:
                bar_states[str(s)] = "sorted"
            bar_states[str(min_idx)] = "selected"
            bar_states[str(j)] = "comparing"

            steps.append({
                "arr": a[:],
                "barStates": bar_states,
                "dsType": "array",
                "dsData": {
                    "highlights": {str(min_idx): "selected", str(j): "comparing"},
                    "markers": {str(min_idx): "MIN", str(i): "i"},
                    "regions": {
                        "sorted": [0, i - 1] if i > 0 else [],
                        "unsorted": [i, n - 1]
                    }
                },
                "message": f"Searching for minimum in unsorted region. Current min={a[min_idx]}. Checking {a[j]} — {'new min found!' if a[j] < a[min_idx] else 'not smaller.'}",
                "operation": "compare",
                "codeLine": 3,
                "stats": {**stats}
            })

            if a[j] < a[min_idx]:
                min_idx = j

        if min_idx != i:
            a[i], a[min_idx] = a[min_idx], a[i]
            stats["swaps"] += 1

            bar_states_swap = {str(k): "default" for k in range(n)}
            for s in sorted_indices:
                bar_states_swap[str(s)] = "sorted"
            bar_states_swap[str(i)] = "swapping"
            bar_states_swap[str(min_idx)] = "swapping"

            steps.append({
                "arr": a[:],
                "barStates": bar_states_swap,
                "dsType": "array",
                "dsData": {
                    "highlights": {str(i): "swapping", str(min_idx): "swapping"},
                    "markers": {str(i): "i", str(min_idx): "MIN"},
                    "regions": {
                        "sorted": [0, i - 1] if i > 0 else [],
                        "unsorted": [i, n - 1]
                    }
                },
                "message": f"Found minimum {a[i]} — swapping it to position {i} to extend sorted region.",
                "operation": "swap",
                "codeLine": 5,
                "stats": {**stats}
            })

        sorted_indices.add(i)

    # Final step: all sorted
    sorted_indices.add(n - 1)
    bar_states_final = {str(k): "sorted" for k in range(n)}
    steps.append({
        "arr": a[:],
        "barStates": bar_states_final,
        "dsType": "array",
        "dsData": {
            "highlights": {},
            "markers": {},
            "regions": {"sorted": [0, n - 1], "unsorted": []}
        },
        "message": "Selection Sort complete. Array is sorted.",
        "operation": "sorted",
        "codeLine": 6,
        "stats": {**stats}
    })

    return steps
