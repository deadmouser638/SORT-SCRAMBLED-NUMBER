"""SortViz full test harness — tests all 6 algorithms against all 6 test cases."""
import json

from algorithms.bubble_sort import generate_steps as bubble_steps
from algorithms.selection_sort import generate_steps as selection_steps
from algorithms.insertion_sort import generate_steps as insertion_steps
from algorithms.merge_sort import generate_steps as merge_steps
from algorithms.quick_sort import generate_steps as quick_steps
from algorithms.radix_sort import generate_steps as radix_steps

ALGORITHMS = {
    "bubble": bubble_steps,
    "selection": selection_steps,
    "insertion": insertion_steps,
    "merge": merge_steps,
    "quick": quick_steps,
    "radix": radix_steps,
}

TEST_ARRAYS = {
    "random": [64, 11, 90, 25, 3, 47],
    "sorted": [1, 2, 3, 4, 5, 6],
    "reverse": [6, 5, 4, 3, 2, 1],
    "single": [42],
    "duplicates": [5, 3, 5, 1, 3, 5],
    "two_elements": [9, 1],
}

passed = 0
failed = 0

print("=" * 60)
print("  SortViz Algorithm Test Harness")
print("  6 algorithms x 6 test cases = 36 tests")
print("=" * 60)

for algo_name, algo_fn in ALGORITHMS.items():
    print(f"\n--- {algo_name.upper()} SORT ---")

    for case_name, arr in TEST_ARRAYS.items():
        original = arr.copy()
        expected = sorted(arr)

        try:
            steps = algo_fn(arr)
        except Exception as e:
            print(f"  FAIL  {algo_name} on {case_name}: ERROR - {e}")
            failed += 1
            continue

        # 1. Check input not mutated
        if arr != original:
            print(f"  FAIL  {algo_name} on {case_name}: INPUT MUTATED")
            failed += 1
            continue

        # 2. Check final array is sorted
        final = steps[-1]["arr"] if steps else arr
        if final != expected:
            print(f"  FAIL  {algo_name} on {case_name}: got {final} expected {expected}")
            failed += 1
            continue

        # 3. Check step count > 0 for non-trivial arrays
        if len(arr) > 1 and len(steps) == 0:
            print(f"  FAIL  {algo_name} on {case_name}: 0 steps for non-trivial input")
            failed += 1
            continue

        # 4. Check barStates keys are strings
        bad_keys = False
        for step in steps:
            for key in step["barStates"].keys():
                if not isinstance(key, str):
                    bad_keys = True
                    break
            if bad_keys:
                break
        if bad_keys:
            print(f"  FAIL  {algo_name} on {case_name}: barStates has non-string keys")
            failed += 1
            continue

        print(f"  PASS  {algo_name} on {case_name}: {len(steps)} steps")
        passed += 1

print("\n" + "=" * 60)
print(f"  Results: {passed} passed, {failed} failed out of {passed + failed}")
print("=" * 60)

# Print sample step (Bubble Sort, step 0)
print("\n--- Sample step (Bubble Sort on [64,11,90,25,3,47], step 0) ---")
sample_steps = bubble_steps([64, 11, 90, 25, 3, 47])
if sample_steps:
    print(json.dumps(sample_steps[0], indent=2))
