"""Insertion Sort step generator for SortViz."""


def generate_steps(arr):
    """Generates step-by-step state snapshots for algorithm visualization.

    Args:
        arr (list[int]): The input array of integers to sort.

    Returns:
        list[dict]: A list of dictionary objects representing the state at each step.
    """
    """Generates step-by-step states for Insertion Sort."""
    a = arr.copy()
    n = len(a)
    steps = []
    stats = {"comparisons": 0, "swaps": 0}

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

    for i in range(1, n):
        key = a[i]
        j = i - 1

        # Show the key being selected
        bar_states_sel = {str(k): "default" for k in range(n)}
        for s in range(i):
            bar_states_sel[str(s)] = "sorted"
        bar_states_sel[str(i)] = "comparing"

        steps.append({
            "arr": a[:],
            "barStates": bar_states_sel,
            "dsType": "array",
            "dsData": {
                "highlights": {str(i): "comparing"},
                "markers": {str(i): "KEY"},
                "regions": {
                    "sorted": [0, i - 1],
                    "unsorted": [i, n - 1]
                }
            },
            "message": f"Picking up {key} — need to insert it into the sorted region [0..{i-1}].",
            "operation": "compare",
            "codeLine": 1,
            "stats": {**stats}
        })

        while j >= 0 and a[j] > key:
            stats["comparisons"] += 1

            # Compare step
            bar_states_cmp = {str(k): "default" for k in range(n)}
            for s in range(i):
                if s != j and s != j + 1:
                    bar_states_cmp[str(s)] = "sorted"
            bar_states_cmp[str(j)] = "comparing"
            bar_states_cmp[str(j + 1)] = "swapping"

            steps.append({
                "arr": a[:],
                "barStates": bar_states_cmp,
                "dsType": "array",
                "dsData": {
                    "highlights": {str(j): "comparing", str(j + 1): "swapping"},
                    "markers": {str(i): "KEY"},
                    "regions": {
                        "sorted": [0, i - 1] if i > 0 else [],
                        "unsorted": [i, n - 1]
                    }
                },
                "message": f"Is {key} < {a[j]}? Yes — need to shift {a[j]} right to make room.",
                "operation": "compare",
                "codeLine": 3,
                "stats": {**stats}
            })

            # Shift element right
            a[j + 1] = a[j]
            stats["swaps"] += 1

            bar_states_shf = {str(k): "default" for k in range(n)}
            for s in range(i):
                if s != j and s != j + 1:
                    bar_states_shf[str(s)] = "sorted"
            bar_states_shf[str(j)] = "comparing"
            bar_states_shf[str(j + 1)] = "swapping"

            steps.append({
                "arr": a[:],
                "barStates": bar_states_shf,
                "dsType": "array",
                "dsData": {
                    "highlights": {str(j): "comparing", str(j + 1): "swapping"},
                    "markers": {str(i): "KEY"},
                    "regions": {
                        "sorted": [0, i - 1] if i > 0 else [],
                        "unsorted": [i, n - 1]
                    }
                },
                "message": f"Shifted {a[j]} one position right → slot {j+1}.",
                "operation": "swap",
                "codeLine": 4,
                "stats": {**stats}
            })

            j -= 1

        # Count the final comparison that exits the while loop
        if j >= 0:
            stats["comparisons"] += 1

        # Place key
        a[j + 1] = key

    # Final step: all sorted
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
        "message": "Insertion Sort complete. Array is sorted.",
        "operation": "sorted",
        "codeLine": 7,
        "stats": {**stats}
    })

    return steps
