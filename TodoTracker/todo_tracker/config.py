from __future__ import annotations

from pathlib import Path
from typing import List


def db_path() -> Path:
    return Path.home() / "Documents" / "TodoTracker" / "data.db"


def summaries_dir() -> Path:
    return Path.home() / "Documents" / "TodoTracker" / "summaries"


def ensure_dirs() -> None:
    # Ensure parent directories exist
    dbp = db_path()
    dbp.parent.mkdir(parents=True, exist_ok=True)
    sdir = summaries_dir()
    sdir.mkdir(parents=True, exist_ok=True)


def category_presets() -> List[str]:
    return [
        "产品",
        "设计",
        "开发",
        "学习",
        "生活",
        "临时",
    ]


PRIORITY_SET = ("低", "中", "高")