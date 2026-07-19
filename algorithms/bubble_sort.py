"""Bubble Sort step generator for SortViz."""


def generate_steps(arr):
    """Generates step-by-step state snapshots for algorithm visualization.

    Args:
        arr (list[int]): The input array of integers to sort.

    Returns:
        list[dict]: A list of dictionary objects representing the state at each step.
    """
    """Generates step-by-step states for Bubble Sort."""
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
        swapped = False

        for j in range(n - 1 - i):
            stats["comparisons"] += 1

            # Build barStates: sorted indices + comparing pair
            bar_states = {str(k): "default" for k in range(n)}
            for s in sorted_indices:
                bar_states[str(s)] = "sorted"
            bar_states[str(j)] = "comparing"
            bar_states[str(j + 1)] = "comparing"

            steps.append({
                "arr": a[:],
                "barStates": bar_states,
                "dsType": "array",
                "dsData": {
                    "highlights": {str(j): "comparing", str(j + 1): "comparing"},
                    "markers": {},
                    "regions": {
                        "sorted": [n - i, n - 1] if i > 0 else [],
                        "unsorted": [0, n - 1 - i]
                    }
                },
                "message": f"Pass {i+1}: Comparing {a[j]} and {a[j+1]} — {'need to swap!' if a[j] > a[j+1] else 'already in order.'}",
                "operation": "compare",
                "codeLine": 2,
                "stats": {**stats}
            })

            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                stats["swaps"] += 1
                swapped = True

                bar_states_swap = {str(k): "default" for k in range(n)}
                for s in sorted_indices:
                    bar_states_swap[str(s)] = "sorted"
                bar_states_swap[str(j)] = "swapping"
                bar_states_swap[str(j + 1)] = "swapping"

                steps.append({
                    "arr": a[:],
                    "barStates": bar_states_swap,
                    "dsType": "array",
                    "dsData": {
                        "highlights": {str(j): "swapping", str(j + 1): "swapping"},
                        "markers": {},
                        "regions": {
                            "sorted": [n - i, n - 1] if i > 0 else [],
                            "unsorted": [0, n - 1 - i]
                        }
                    },
                    "message": f"Pass {i+1}: Swapped {a[j]} ↔ {a[j+1]} — the larger value bubbles right.",
                    "operation": "swap",
                    "codeLine": 3,
                    "stats": {**stats}
                })

        sorted_indices.add(n - 1 - i)

        if not swapped:
            for k in range(n - 1 - i):
                sorted_indices.add(k)
            break

    # Final step: all sorted
    sorted_indices.update(range(n))
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
        "message": "Bubble Sort complete. Array is sorted.",
        "operation": "sorted",
        "codeLine": 6,
        "stats": {**stats}
    })

    return steps
