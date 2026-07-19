"""Merge Sort step generator for SortViz."""


def generate_steps(arr):
    """Generates step-by-step state snapshots for algorithm visualization.

    Args:
        arr (list[int]): The input array of integers to sort.

    Returns:
        list[dict]: A list of dictionary objects representing the state at each step.
    """
    """Generates step-by-step states for Merge Sort."""
    a = arr.copy()
    n = len(a)
    steps = []
    stats = {"comparisons": 0, "swaps": 0}
    sorted_ranges = []  # track ranges that have been fully merged

    if n <= 1:
        bar_states = {str(i): "sorted" for i in range(n)}
        steps.append({
            "arr": a[:],
            "barStates": bar_states,
            "dsType": "merge",
            "dsData": {
                "left": [],
                "right": [],
                "leftIndex": 0,
                "rightIndex": 0,
                "mergeRange": [0, n - 1] if n > 0 else []
            },
            "message": "Array is already sorted." if n > 0 else "Empty array.",
            "operation": "sorted",
            "stats": {**stats}
        })
        return steps

    def get_bar_states_for_range(lo, hi, highlight_indices=None, highlight_type="comparing"):
        """Build bar states showing merge range and specific highlights."""
        bs = {str(k): "default" for k in range(n)}
        # Show already completed ranges as sorted
        for (rlo, rhi) in sorted_ranges:
            for k in range(rlo, rhi + 1):
                bs[str(k)] = "sorted"
        # Dim the merge range to show it's being worked on
        for k in range(lo, hi + 1):
            if bs[str(k)] != "sorted":
                bs[str(k)] = "selected"  # "selected" = in current merge range
        # Apply specific highlights
        if highlight_indices:
            for idx, state in highlight_indices.items():
                bs[str(idx)] = state
        return bs

    def merge_sort(lo, hi):
        """Recursively divide and merge subarrays."""
        if lo >= hi:
            return

        mid = (lo + hi) // 2

        # Show the divide step
        bs_divide = {str(k): "default" for k in range(n)}
        for (rlo, rhi) in sorted_ranges:
            for k in range(rlo, rhi + 1):
                bs_divide[str(k)] = "sorted"
        for k in range(lo, mid + 1):
            bs_divide[str(k)] = "comparing"
        for k in range(mid + 1, hi + 1):
            bs_divide[str(k)] = "pivot"  # different color for right half

        steps.append({
            "arr": a[:],
            "barStates": bs_divide,
            "dsType": "merge",
            "dsData": {
                "left": a[lo:mid + 1],
                "right": a[mid + 1:hi + 1],
                "leftIndex": 0,
                "rightIndex": 0,
                "mergeRange": [lo, hi]
            },
            "message": f"Dividing arr[{lo}..{hi}] → left[{lo}..{mid}] and right[{mid + 1}..{hi}]",
            "operation": "divide",
            "codeLine": 2,
            "stats": {**stats}
        })

        merge_sort(lo, mid)
        merge_sort(mid + 1, hi)
        merge(lo, mid, hi)

    def merge(lo, mid, hi):
        """Merge two sorted subarrays a[lo..mid] and a[mid+1..hi]."""
        left = a[lo:mid + 1]
        right = a[mid + 1:hi + 1]

        # Show merge start
        bs = get_bar_states_for_range(lo, hi)
        steps.append({
            "arr": a[:],
            "barStates": bs,
            "dsType": "merge",
            "dsData": {
                "left": left[:],
                "right": right[:],
                "leftIndex": 0,
                "rightIndex": 0,
                "mergeRange": [lo, hi]
            },
            "message": f"Merging [{lo}..{mid}] and [{mid + 1}..{hi}]",
            "operation": "merge",
            "codeLine": 5,
            "stats": {**stats}
        })

        li = 0
        ri = 0
        k = lo
        placed = []  # track which positions have been placed

        while li < len(left) and ri < len(right):
            stats["comparisons"] += 1

            # Compare step: show which elements are being compared
            bs_cmp = get_bar_states_for_range(lo, hi, {
                k: "comparing"  # where the next element will be placed
            })

            steps.append({
                "arr": a[:],
                "barStates": bs_cmp,
                "dsType": "merge",
                "dsData": {
                    "left": left[:],
                    "right": right[:],
                    "leftIndex": li,
                    "rightIndex": ri,
                    "mergeRange": [lo, hi]
                },
                "message": f"Comparing left[{li}]={left[li]} with right[{ri}]={right[ri]}",
                "operation": "compare",
                "codeLine": 8,
                "stats": {**stats}
            })

            if left[li] <= right[ri]:
                a[k] = left[li]
                stats["swaps"] += 1
                li += 1
            else:
                a[k] = right[ri]
                stats["swaps"] += 1
                ri += 1

            placed.append(k)

            # Show placement
            bs_place = get_bar_states_for_range(lo, hi)
            # Mark placed positions as swapping (just placed)
            bs_place[str(k)] = "swapping"

            steps.append({
                "arr": a[:],
                "barStates": bs_place,
                "dsType": "merge",
                "dsData": {
                    "left": left[:],
                    "right": right[:],
                    "leftIndex": li,
                    "rightIndex": ri,
                    "mergeRange": [lo, hi]
                },
                "message": f"Placed {a[k]} at position {k}",
                "operation": "merge",
                "codeLine": 9,
                "stats": {**stats}
            })

            k += 1

        # Copy remaining left elements
        while li < len(left):
            a[k] = left[li]
            stats["swaps"] += 1

            bs_rem = get_bar_states_for_range(lo, hi)
            bs_rem[str(k)] = "swapping"

            steps.append({
                "arr": a[:],
                "barStates": bs_rem,
                "dsType": "merge",
                "dsData": {
                    "left": left[:],
                    "right": right[:],
                    "leftIndex": li + 1,
                    "rightIndex": ri,
                    "mergeRange": [lo, hi]
                },
                "message": f"Placed remaining left[{li}]={left[li]} at position {k}",
                "operation": "merge",
                "codeLine": 10,
                "stats": {**stats}
            })

            li += 1
            k += 1

        # Copy remaining right elements
        while ri < len(right):
            a[k] = right[ri]
            stats["swaps"] += 1

            bs_rem = get_bar_states_for_range(lo, hi)
            bs_rem[str(k)] = "swapping"

            steps.append({
                "arr": a[:],
                "barStates": bs_rem,
                "dsType": "merge",
                "dsData": {
                    "left": left[:],
                    "right": right[:],
                    "leftIndex": li,
                    "rightIndex": ri + 1,
                    "mergeRange": [lo, hi]
                },
                "message": f"Placed remaining right[{ri}]={right[ri]} at position {k}",
                "operation": "merge",
                "codeLine": 10,
                "stats": {**stats}
            })

            ri += 1
            k += 1

        # Mark this range as sorted
        sorted_ranges.append((lo, hi))

    merge_sort(0, n - 1)

    # Final step: all sorted
    bar_states_final = {str(k): "sorted" for k in range(n)}
    steps.append({
        "arr": a[:],
        "barStates": bar_states_final,
        "dsType": "merge",
        "dsData": {
            "left": [],
            "right": [],
            "leftIndex": 0,
            "rightIndex": 0,
            "mergeRange": [0, n - 1]
        },
        "message": "Merge Sort complete. Array is sorted.",
        "operation": "sorted",
        "codeLine": 11,
        "stats": {**stats}
    })

    return steps
