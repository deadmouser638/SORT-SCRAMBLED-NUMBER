"""SortViz algorithm package — contains all sorting step generators."""

ALGO_INFO = {
    "bubble": {
        "name": "Bubble Sort",
        "best": "O(n)", "average": "O(n²)", "worst": "O(n²)",
        "space": "O(1)", "stable": True,
        "ds": "Array",
        "description": "Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order."
    },
    "selection": {
        "name": "Selection Sort",
        "best": "O(n²)", "average": "O(n²)", "worst": "O(n²)",
        "space": "O(1)", "stable": False,
        "ds": "Array + Min Pointer",
        "description": "Finds the minimum element from the unsorted region and places it at the beginning."
    },
    "insertion": {
        "name": "Insertion Sort",
        "best": "O(n)", "average": "O(n²)", "worst": "O(n²)",
        "space": "O(1)", "stable": True,
        "ds": "Array (Sorted + Unsorted)",
        "description": "Builds the sorted array one element at a time by inserting each into its correct position."
    },
    "merge": {
        "name": "Merge Sort",
        "best": "O(n log n)", "average": "O(n log n)",
        "worst": "O(n log n)", "space": "O(n)", "stable": True,
        "ds": "Auxiliary Arrays (L + R)",
        "description": "Divides array in half, recursively sorts each half, then merges using auxiliary arrays."
    },
    "quick": {
        "name": "Quick Sort",
        "best": "O(n log n)", "average": "O(n log n)",
        "worst": "O(n²)", "space": "O(log n)", "stable": False,
        "ds": "Recursion Call Stack",
        "description": "Selects a pivot, partitions elements around it, and recursively sorts the partitions."
    },
    "radix": {
        "name": "Radix Sort",
        "best": "O(nk)", "average": "O(nk)", "worst": "O(nk)",
        "space": "O(n + k)", "stable": True,
        "ds": "10 Digit Buckets (0-9)",
        "description": "Sorts numbers digit by digit using 10 buckets, from least significant to most significant."
    }
}
