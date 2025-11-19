from __future__ import annotations

import csv
import datetime as dt
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Tuple

from .config import PRIORITY_SET, summaries_dir
from .db import connect, init_db


@dataclass
class Task:
    id: int
    title: str
    description: str
    category: str
    priority: str
    created_at: str
    due_date: Optional[str]
    status: str
    is_temp: int


@dataclass
class Completion:
    id: int
    task_id: int
    completed_at: str
    evidence: Optional[str]


def _row_to_task(row) -> Task:
    return Task(
        id=row["id"],
        title=row["title"],
        description=row["description"] or "",
        category=row["category"] or "",
        priority=row["priority"] or "中",
        created_at=row["created_at"],
        due_date=row["due_date"],
        status=row["status"],
        is_temp=row["is_temp"],
    )


def list_tasks(search: Optional[str] = None, category: Optional[str] = None) -> List[Task]:
    conn = connect()
    init_db(conn)
    q = "SELECT * FROM tasks"
    params: List[str] = []
    conds: List[str] = []
    if search:
        conds.append("(title LIKE ? OR description LIKE ?)")
        like = f"%{search}%"
        params.extend([like, like])
    if category:
        conds.append("category = ?")
        params.append(category)
    if conds:
        q += " WHERE " + " AND ".join(conds)
    q += (
        " ORDER BY "
        "status='未完成' DESC, "
        "CASE priority WHEN '高' THEN 3 WHEN '中' THEN 2 WHEN '低' THEN 1 ELSE 0 END DESC, "
        "CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, "
        "due_date ASC, "
        "created_at DESC"
    )
    rows = conn.execute(q, params).fetchall()
    conn.close()
    return [_row_to_task(r) for r in rows]


def add_task(title: str, description: str = "", category: str = "", priority: str = "中", due_date: Optional[str] = None, is_temp: int = 0) -> int:
    assert priority in PRIORITY_SET
    now = dt.datetime.now().isoformat(timespec="seconds")
    conn = connect()
    init_db(conn)
    cur = conn.execute(
        "INSERT INTO tasks(title, description, category, priority, created_at, due_date, status, is_temp) VALUES(?,?,?,?,?,?, '未完成', ?)",
        (title, description, category, priority, now, due_date, is_temp),
    )
    conn.commit()
    task_id = cur.lastrowid
    conn.close()
    return int(task_id)


def update_task(task_id: int, *, title: Optional[str] = None, description: Optional[str] = None, category: Optional[str] = None, priority: Optional[str] = None, due_date: Optional[str] = None) -> None:
    conn = connect()
    init_db(conn)
    fields: List[str] = []
    values: List[Optional[str]] = []
    if title is not None:
        fields.append("title = ?")
        values.append(title)
    if description is not None:
        fields.append("description = ?")
        values.append(description)
    if category is not None:
        fields.append("category = ?")
        values.append(category)
    if priority is not None:
        assert priority in PRIORITY_SET
        fields.append("priority = ?")
        values.append(priority)
    if due_date is not None:
        fields.append("due_date = ?")
        values.append(due_date)
    if not fields:
        conn.close()
        return
    values.append(task_id)
    conn.execute(f"UPDATE tasks SET {', '.join(fields)} WHERE id = ?", values)
    conn.commit()
    conn.close()


def delete_task(task_id: int) -> None:
    conn = connect()
    init_db(conn)
    conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()


def record_completion(task_id: int, evidence: Optional[str] = None) -> int:
    now = dt.datetime.now().isoformat(timespec="seconds")
    conn = connect()
    init_db(conn)
    cur = conn.execute(
        "INSERT INTO completions(task_id, completed_at, evidence) VALUES(?,?,?)",
        (task_id, now, evidence),
    )
    conn.execute("UPDATE tasks SET status='已完成' WHERE id=?", (task_id,))
    conn.commit()
    cid = cur.lastrowid
    conn.close()
    return int(cid)


def quick_complete(title: str, evidence: Optional[str] = None) -> Tuple[int, int]:
    task_id = add_task(title=title, description="", category="临时", priority="中", due_date=None, is_temp=1)
    cid = record_completion(task_id, evidence=evidence)
    return task_id, cid


def undo_last_completion(task_id: int) -> Optional[int]:
    """撤销最近一次完成记录，并将任务状态改回未完成。

    返回被删除的完成记录 ID（若无记录则返回 None）。
    """
    conn = connect()
    init_db(conn)
    row = conn.execute(
        "SELECT id FROM completions WHERE task_id = ? ORDER BY completed_at DESC LIMIT 1",
        (task_id,),
    ).fetchone()
    deleted_id: Optional[int] = None
    if row is not None:
        deleted_id = int(row["id"])  # row is Row, index or key both work
        conn.execute("DELETE FROM completions WHERE id = ?", (deleted_id,))
    # 无论是否存在完成记录，都把任务状态改回未完成
    conn.execute("UPDATE tasks SET status='未完成' WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return deleted_id


def last_7_day_streak() -> List[bool]:
    # True/False by day for the last 7 days (today inclusive)
    conn = connect()
    init_db(conn)
    today = dt.date.today()
    results: List[bool] = []
    for i in range(7):
        day = today - dt.timedelta(days=i)
        start = dt.datetime.combine(day, dt.time.min).isoformat(timespec="seconds")
        end = dt.datetime.combine(day, dt.time.max).isoformat(timespec="seconds")
        row = conn.execute(
            "SELECT COUNT(*) AS cnt FROM completions WHERE completed_at BETWEEN ? AND ?",
            (start, end),
        ).fetchone()
        results.append(bool(row["cnt"]))
    conn.close()
    return list(reversed(results))  # from oldest -> newest


def export_daily_summary() -> Tuple[Path, Path]:
    # Export today's summary to text and CSV
    sdir = summaries_dir()
    today = dt.date.today().isoformat()
    txt_path = sdir / f"summary_{today}.txt"
    csv_path = sdir / f"summary_{today}.csv"

    conn = connect()
    init_db(conn)
    start = dt.datetime.combine(dt.date.today(), dt.time.min).isoformat(timespec="seconds")
    end = dt.datetime.combine(dt.date.today(), dt.time.max).isoformat(timespec="seconds")
    tasks_rows = conn.execute("SELECT * FROM tasks").fetchall()
    comp_rows = conn.execute(
        "SELECT * FROM completions WHERE completed_at BETWEEN ? AND ? ORDER BY completed_at DESC",
        (start, end),
    ).fetchall()
    conn.close()

    # Text summary
    with txt_path.open("w", encoding="utf-8") as f:
        f.write(f"当日总结 ({today})\n")
        f.write("完成的任务:\n")
        for r in comp_rows:
            f.write(f"- #{r['task_id']} 完成于 {r['completed_at']}\n")
            if r["evidence"]:
                f.write(f"  证据: {r['evidence']}\n")
        f.write("\n全部任务状态:\n")
        for t in tasks_rows:
            f.write(f"- #{t['id']} [{t['status']}] {t['title']} | {t['category']} | {t['priority']}\n")

    # CSV summary
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["task_id", "status", "title", "category", "priority", "created_at", "due_date", "latest_evidence"])
        # Get latest evidence per task for today (simple pass)
        latest_evidence = {r["task_id"]: r["evidence"] for r in comp_rows if r["evidence"]}
        for t in tasks_rows:
            writer.writerow([
                t["id"], t["status"], t["title"], t["category"], t["priority"], t["created_at"], t["due_date"], latest_evidence.get(t["id"], "")
            ])

    return txt_path, csv_path