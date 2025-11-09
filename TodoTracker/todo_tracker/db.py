from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Iterable, Optional

from .config import db_path, ensure_dirs


SCHEMA_TASKS = """
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT CHECK(priority IN ('低','中','高')) DEFAULT '中',
    created_at TEXT NOT NULL,
    due_date TEXT,
    status TEXT CHECK(status IN ('未完成','已完成')) DEFAULT '未完成',
    is_temp INTEGER DEFAULT 0
);
"""

SCHEMA_COMPLETIONS = """
CREATE TABLE IF NOT EXISTS completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    completed_at TEXT NOT NULL,
    evidence TEXT,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
"""


def connect() -> sqlite3.Connection:
    ensure_dirs()
    path: Path = db_path()
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(conn: Optional[sqlite3.Connection] = None) -> None:
    owns = False
    if conn is None:
        conn = connect()
        owns = True
    try:
        conn.executescript(SCHEMA_TASKS)
        conn.executescript(SCHEMA_COMPLETIONS)
        conn.commit()
    finally:
        if owns:
            conn.close()