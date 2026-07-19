"""Quick Sort step generator for SortViz."""


def generate_steps(arr):
    """Generates step-by-step state snapshots for algorithm visualization.

    Args:
        arr (list[int]): The input array of integers to sort.

    Returns:
        list[dict]: A list of dictionary objects representing the state at each step.
    """
    """Generates step-by-step states for Quick Sort."""
    a = arr.copy()
    n = len(a)
    steps = []
    stats = {"comparisons": 0, "swaps": 0}
    call_stack = []
    sorted_indices = set()

    if n <= 1:
        bar_states = {str(i): "sorted" for i in range(n)}
        steps.append({
            "arr": a[:],
            "barStates": bar_states,
            "dsType": "stack",
            "dsData": {
                "frames": [],
                "currentFrame": -1
            },
            "message": "Array is already sorted." if n > 0 else "Empty array.",
            "operation": "sorted",
            "stats": {**stats}
        })
        return steps

    def get_bar_states(partition_low=None, partition_high=None):
        """Build barStates with sorted indices and optional partition range."""
        bs = {str(k): "default" for k in range(n)}
        for s in sorted_indices:
            bs[str(s)] = "sorted"
        # Show current partition range with "selected" state
        if partition_low is not None and partition_high is not None:
            for k in range(partition_low, partition_high + 1):
                if bs[str(k)] == "default":
                    bs[str(k)] = "selected"  # in current partition range
        return bs

    def get_ds_data():
        """Build dsData snapshot of current call stack."""
        return {
            "frames": [{"low": f["low"], "high": f["high"]} for f in call_stack],
            "currentFrame": len(call_stack) - 1
        }

    def partition(low, high):
        """Lomuto partition with pivot = arr[high]."""
        pivot = a[high]

        # Show pivot selection — highlight entire partition range
        bs = get_bar_states(low, high)
        bs[str(high)] = "pivot"
        steps.append({
            "arr": a[:],
            "barStates": bs,
            "dsType": "stack",
            "dsData": get_ds_data(),
            "message": f"Pivot selected: arr[{high}]={pivot} — partitioning [{low}..{high}]",
            "operation": "pivot",
            "codeLine": 2,
            "stats": {**stats}
        })

        i = low - 1

        for j in range(low, high):
            stats["comparisons"] += 1

            # Compare step — show partition range, pivot, and comparing element
            bs_cmp = get_bar_states(low, high)
            bs_cmp[str(high)] = "pivot"
            bs_cmp[str(j)] = "comparing"
            # Show the i boundary
            if i >= low:
                bs_cmp[str(i)] = "selected"

            steps.append({
                "arr": a[:],
                "barStates": bs_cmp,
                "dsType": "stack",
                "dsData": get_ds_data(),
                "message": f"Comparing arr[{j}]={a[j]} with pivot={pivot}",
                "operation": "compare",
                "codeLine": 5,
                "stats": {**stats}
            })

            if a[j] <= pivot:
                i += 1
                if i != j:
                    a[i], a[j] = a[j], a[i]
                    stats["swaps"] += 1

                    bs_swap = get_bar_states(low, high)
                    bs_swap[str(high)] = "pivot"
                    bs_swap[str(i)] = "swapping"
                    bs_swap[str(j)] = "swapping"

                    steps.append({
                        "arr": a[:],
                        "barStates": bs_swap,
                        "dsType": "stack",
                        "dsData": get_ds_data(),
                        "message": f"Swapped arr[{i}]={a[i]} and arr[{j}]={a[j]}",
                        "operation": "swap",
                        "codeLine": 6,
                        "stats": {**stats}
                    })

        # Place pivot in final position
        a[i + 1], a[high] = a[high], a[i + 1]
        stats["swaps"] += 1

        pivot_pos = i + 1
        sorted_indices.add(pivot_pos)

        bs_placed = get_bar_states(low, high)
        bs_placed[str(pivot_pos)] = "sorted"

        steps.append({
            "arr": a[:],
            "barStates": bs_placed,
            "dsType": "stack",
            "dsData": get_ds_data(),
            "message": f"Pivot {a[pivot_pos]} placed at final position {pivot_pos} — left [{low}..{pivot_pos - 1}], right [{pivot_pos + 1}..{high}]",
            "operation": "sorted",
            "codeLine": 7,
            "stats": {**stats}
        })

        return pivot_pos

    def quick_sort(low, high):
        """Recursively sort subarray a[low..high]."""
        call_stack.append({"low": low, "high": high})

        if low < high:
            pi = partition(low, high)
            quick_sort(low, pi - 1)
            quick_sort(pi + 1, high)
        else:
            if low == high:
                sorted_indices.add(low)

                # Show single element as sorted
                bs = get_bar_states()
                steps.append({
                    "arr": a[:],
                    "barStates": bs,
                    "dsType": "stack",
                    "dsData": get_ds_data(),
                    "message": f"Single element arr[{low}]={a[low]} is already in place",
                    "operation": "sorted",
                    "stats": {**stats}
                })

        call_stack.pop()

    quick_sort(0, n - 1)

    # Final step: all sorted
    bar_states_final = {str(k): "sorted" for k in range(n)}
    steps.append({
        "arr": a[:],
        "barStates": bar_states_final,
        "dsType": "stack",
        "dsData": {
            "frames": [],
            "currentFrame": -1
        },
        "message": "Quick Sort complete. Array is sorted.",
        "operation": "sorted",
        "codeLine": 11,
        "stats": {**stats}
    })

    return steps
