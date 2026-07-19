"""Radix Sort step generator for SortViz."""

DIGIT_LABELS = {0: "ones", 1: "tens", 2: "hundreds", 3: "thousands"}


def generate_steps(arr):
    """Generates step-by-step state snapshots for algorithm visualization.

    Args:
        arr (list[int]): The input array of integers to sort.

    Returns:
        list[dict]: A list of dictionary objects representing the state at each step.
    """
    """Generates step-by-step states for Radix Sort (LSD)."""
    a = arr.copy()
    n = len(a)
    steps = []
    stats = {"comparisons": 0, "swaps": 0}

    if n <= 1:
        bar_states = {str(i): "sorted" for i in range(n)}
        steps.append({
            "arr": a[:],
            "barStates": bar_states,
            "dsType": "buckets",
            "dsData": {
                "buckets": [[] for _ in range(10)],
                "currentDigit": 0,
                "digitLabel": "ones",
                "phase": "collect"
            },
            "message": "Array is already sorted." if n > 0 else "Empty array.",
            "operation": "sorted",
            "stats": {**stats}
        })
        return steps

    max_val = max(a)
    num_digits = len(str(max_val)) if max_val > 0 else 1

    for d in range(num_digits):
        digit_label = DIGIT_LABELS.get(d, f"10^{d}")
        buckets = [[] for _ in range(10)]

        # Distribute phase: one step per element
        for i in range(n):
            digit = (a[i] // (10 ** d)) % 10
            buckets[digit].append(a[i])
            stats["swaps"] += 1

            bar_states = {str(k): "default" for k in range(n)}
            bar_states[str(i)] = "bucket"

            steps.append({
                "arr": a[:],
                "barStates": bar_states,
                "dsType": "buckets",
                "dsData": {
                    "buckets": [b[:] for b in buckets],
                    "currentDigit": d,
                    "digitLabel": digit_label,
                    "phase": "distribute"
                },
                "message": f"Placing {a[i]} into bucket {digit} ({digit_label} digit)",
                "operation": "distribute",
                "codeLine": 3,
                "stats": {**stats}
            })

        # Collect phase: flatten buckets back into array
        idx = 0
        for bucket in buckets:
            for val in bucket:
                a[idx] = val
                idx += 1
        stats["swaps"] += 1

        bar_states_collect = {str(k): "default" for k in range(n)}
        steps.append({
            "arr": a[:],
            "barStates": bar_states_collect,
            "dsType": "buckets",
            "dsData": {
                "buckets": [b[:] for b in buckets],
                "currentDigit": d,
                "digitLabel": digit_label,
                "phase": "collect"
            },
            "message": f"Collected buckets after {digit_label} pass",
            "operation": "collect",
            "codeLine": 4,
            "stats": {**stats}
        })

    # Final step: all sorted
    bar_states_final = {str(k): "sorted" for k in range(n)}
    steps.append({
        "arr": a[:],
        "barStates": bar_states_final,
        "dsType": "buckets",
        "dsData": {
            "buckets": [[] for _ in range(10)],
            "currentDigit": num_digits - 1,
            "digitLabel": DIGIT_LABELS.get(num_digits - 1, f"10^{num_digits - 1}"),
            "phase": "collect"
        },
        "message": "Radix Sort complete. Array is sorted.",
        "operation": "sorted",
        "codeLine": 5,
        "stats": {**stats}
    })

    return steps
