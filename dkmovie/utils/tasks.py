from typing import Any


def default_task_params(name: str, **kwargs) -> dict[str, Any]:
    """
    Get common Celery task parameters for tasks.

    Args:
        name: Name of the task.
        **kwargs: Additional task parameters to override defaults.

    Returns:
        Dict of common task parameters with standard retry settings.
    """
    base_params = {
        "bind": True,
        "name": name,
        "max_retries": 5,
        "default_retry_delay": 60,
        "autoretry_for": (Exception,),
        "retry_backoff": True,
        "retry_backoff_max": 900,
        "retry_jitter": True,
    }
    return base_params | kwargs
