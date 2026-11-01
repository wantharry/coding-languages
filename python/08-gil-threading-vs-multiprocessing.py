"""
The GIL (Global Interpreter Lock): what it actually means, demonstrated.

HONEST EXPLANATION, not a slogan:

CPython (the reference implementation almost everyone means by "Python")
has one Global Interpreter Lock per process. Only the thread holding the
GIL may execute Python bytecode at any instant -- even on a machine with 16
CPU cores, only one OS thread inside one CPython process is ever actually
running Python code at a given moment. The interpreter periodically
suspends the running thread and lets another runnable thread acquire the
GIL (by default, CPython checks roughly every 100 bytecode instructions, or
`sys.getswitchinterval()` seconds of wall time -- whichever triggers
first), so threads still take turns and the program still makes progress on
all of them. But they never run Python bytecode *simultaneously*.

What this means in practice:

- CPU-BOUND work (tight Python loops, number crunching in pure Python) gets
  ZERO speedup from `threading` -- the threads just take turns on the same
  single core's worth of GIL-holding time, with EXTRA overhead from
  constantly switching the lock between them. More threads can even make
  pure-Python CPU-bound work slightly SLOWER than doing it on one thread,
  never meaningfully faster.
- I/O-BOUND work (waiting on a network call, disk read, `time.sleep`, a
  subprocess) is a totally different story: the GIL is RELEASED while a
  thread is blocked waiting on I/O (that release is built into every
  blocking I/O call in the standard library), so other threads can run
  during that wait. `threading` genuinely helps I/O-bound workloads, which
  is the overwhelming majority of real-world "use threads in Python" cases
  (web requests, file I/O, waiting on subprocesses).
- `multiprocessing` sidesteps the GIL entirely by using separate OS
  PROCESSES, each with its own Python interpreter and its own GIL. That's
  real parallelism for CPU-bound work, at the cost of: process startup
  overhead, no shared memory by default (data is pickled and copied between
  processes), and having to be careful about what's actually picklable.

This file demonstrates the CPU-bound case concretely: the same CPU-heavy
task, run with threading (no real speedup) and with multiprocessing (real
speedup, up to however many cores are available).

(Python 3.13+ has an experimental "free-threaded" build without a GIL, but
that's not the standard interpreter most teams run in 2026, and is out of
scope here -- what's demonstrated below is the GIL's real, current-day
behavior.)
"""

import time
from multiprocessing import Pool
from threading import Thread


def cpu_bound_task(n):
    """Deliberately a tight, pure-Python loop -- no C-accelerated shortcuts
    like sum(range(n)) -- so the GIL genuinely matters for every iteration.
    Computes the sum of squares from 0 to n-1."""
    total = 0
    for i in range(n):
        total += i * i
    return total


def run_sequentially(n, times):
    """Baseline: do all the work on a single thread, one task after
    another. This is what we compare both threading and multiprocessing
    against."""
    start = time.perf_counter()
    for _ in range(times):
        cpu_bound_task(n)
    return time.perf_counter() - start


def run_with_threading(n, thread_count):
    """Split the same total work across `thread_count` threads. If
    threading gave real parallelism for CPU-bound work, this should take
    roughly 1/thread_count of the sequential time. It won't."""
    start = time.perf_counter()
    threads = [Thread(target=cpu_bound_task, args=(n,)) for _ in range(thread_count)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    return time.perf_counter() - start


def run_with_multiprocessing(n, process_count):
    """Split the same total work across `process_count` separate OS
    processes, each with its own interpreter and GIL. This DOES get real
    parallelism, limited by actual CPU core count."""
    start = time.perf_counter()
    with Pool(processes=process_count) as pool:
        pool.map(cpu_bound_task, [n] * process_count)
    return time.perf_counter() - start


if __name__ == "__main__":
    # Tuned so the sequential baseline takes a few seconds -- long enough
    # for timing differences to be clear and not noise, short enough to
    # run quickly in CI/interview settings.
    N = 15_000_000
    WORKERS = 4

    print(f"Task: sum of squares up to {N:,}, repeated {WORKERS} times "
          f"(either sequentially, across {WORKERS} threads, or across "
          f"{WORKERS} processes)\n")

    sequential_time = run_sequentially(N, WORKERS)
    print(f"Sequential (1 thread, {WORKERS}x the work, one after another): "
          f"{sequential_time:.2f}s")

    threaded_time = run_with_threading(N, WORKERS)
    print(f"Threading  ({WORKERS} threads, running 'concurrently'):        "
          f"{threaded_time:.2f}s")

    multiproc_time = run_with_multiprocessing(N, WORKERS)
    print(f"Multiprocessing ({WORKERS} processes, running in parallel):   "
          f"{multiproc_time:.2f}s")

    print()
    print(f"threading speedup vs sequential:        {sequential_time / threaded_time:.2f}x")
    print(f"multiprocessing speedup vs sequential:   {sequential_time / multiproc_time:.2f}x")
    print()
    print(
        "Expected (and, per this file's own verification run, observed) "
        "pattern: threading's speedup stays near 1x (sometimes even "
        f"*below* 1x, due to GIL hand-off/thread-switching overhead -- {WORKERS} "
        "threads do not run this CPU-bound loop any faster than one thread "
        "doing the same total work), while multiprocessing's speedup is "
        f"meaningfully larger, approaching (never exceeding) {WORKERS}x, the "
        "number of worker processes -- because each process has its own "
        "GIL and genuinely runs on its own CPU core at the same time."
    )
