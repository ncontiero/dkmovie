from django.conf import settings
from django.core.cache import cache

# Time in seconds a stream session remains valid without heartbeat
STREAM_TTL = settings.STREAM_TTL
# Maximum concurrent streams per user
MAX_STREAMS = settings.MAX_CONCURRENT_STREAMS


def _get_user_stream_key(user_id):
    return f"user_streams:{user_id}"


def _get_heartbeat_key(user_id, session_id):
    return f"stream_hb:{user_id}:{session_id}"


def clean_stale_sessions(user_id):
    """
    Removes expired sessions from the user's active set.
    """
    key = _get_user_stream_key(user_id)
    active_sessions = cache.get(key, set())
    valid_sessions = set()

    for session_id in active_sessions:
        if cache.get(_get_heartbeat_key(user_id, session_id)):
            valid_sessions.add(session_id)

    # Update cache if changed
    if len(valid_sessions) != len(active_sessions):
        cache.set(key, valid_sessions, timeout=None)

    return valid_sessions


def register_heartbeat(user_id, session_id):
    """
    Registers or renews a stream session.
    Returns True if allowed, False if limit reached.
    """
    valid_sessions = clean_stale_sessions(user_id)

    if session_id in valid_sessions:
        # Already active, renew TTL
        cache.set(_get_heartbeat_key(user_id, session_id), "1", timeout=STREAM_TTL)
        return True

    if len(valid_sessions) >= MAX_STREAMS:
        return False

    # Add new session
    valid_sessions.add(session_id)
    cache.set(_get_user_stream_key(user_id), valid_sessions, timeout=None)
    cache.set(_get_heartbeat_key(user_id, session_id), "1", timeout=STREAM_TTL)
    return True


def release_session(user_id, session_id):
    """Explicitly ends a session."""
    cache.delete(_get_heartbeat_key(user_id, session_id))

    key = _get_user_stream_key(user_id)
    active_sessions = cache.get(key, set())

    if session_id in active_sessions:
        active_sessions.remove(session_id)
        cache.set(key, active_sessions, timeout=None)


def is_session_valid(user_id, session_id):
    """
    Checks if a session ID is active and belongs to the user.
    Does NOT renew TTL (heartbeat does that).
    """
    return bool(cache.get(_get_heartbeat_key(user_id, session_id)))
