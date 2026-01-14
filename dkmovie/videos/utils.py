from os import cpu_count


def get_threads_count() -> int:
    return min(6, max(1, (cpu_count() or 1) - 2))
