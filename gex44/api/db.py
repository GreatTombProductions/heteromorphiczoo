# FILE_TRAJECTORY: load-bearing
# TRAJECTORY_NOTE: SQLite connection management for the GEX44 API.
# Thread-safe connection pool via contextvars. WAL mode for concurrent reads.
"""
db.py — SQLite connection helpers for the HZ API.

Provides a context-managed connection with WAL mode and foreign keys enabled.
FastAPI endpoints use get_db() as a dependency.
"""

import sqlite3
from contextlib import contextmanager
from pathlib import Path

from .config import DB_PATH


def _connect(db_path: Path | None = None) -> sqlite3.Connection:
    """Create a new SQLite connection with correct pragmas."""
    path = db_path or DB_PATH
    conn = sqlite3.connect(str(path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


@contextmanager
def get_connection(db_path: Path | None = None):
    """Context manager yielding a SQLite connection. Commits on success, rolls back on error."""
    conn = _connect(db_path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# Singleton connection for the FastAPI app lifecycle.
# FastAPI is single-process; SQLite WAL handles concurrent reads.
_app_conn: sqlite3.Connection | None = None


def get_app_db() -> sqlite3.Connection:
    """Get or create the singleton app connection."""
    global _app_conn
    if _app_conn is None:
        _app_conn = _connect()
    return _app_conn


def close_app_db():
    """Close the singleton connection (called on app shutdown)."""
    global _app_conn
    if _app_conn is not None:
        _app_conn.close()
        _app_conn = None
