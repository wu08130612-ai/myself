from __future__ import annotations

from typing import List, Optional
from dataclasses import asdict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from TodoTracker.todo_tracker.storage import (
    Task,
    add_task,
    delete_task,
    export_daily_summary,
    last_7_day_streak,
    list_tasks,
    quick_complete,
    record_completion,
    undo_last_completion,
    update_task,
)
from TodoTracker.todo_tracker.config import category_presets


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = ""
    priority: Optional[str] = "中"
    due_date: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None


class Evidence(BaseModel):
    evidence: Optional[str] = None


app = FastAPI(title="TodoTracker API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/presets/categories")
def categories() -> list[str]:
    return category_presets()


@app.get("/tasks")
def get_tasks(search: Optional[str] = None, category: Optional[str] = None) -> List[dict]:
    # Convert dataclass Task -> dict to avoid Pydantic schema issues
    return [asdict(t) for t in list_tasks(search=search, category=category)]


@app.post("/tasks")
def create_task(data: TaskCreate) -> dict:
    tid = add_task(
        title=data.title,
        description=data.description or "",
        category=data.category or "",
        priority=data.priority or "中",
        due_date=data.due_date,
    )
    return {"id": tid}


@app.patch("/tasks/{task_id}")
def patch_task(task_id: int, data: TaskUpdate) -> dict:
    update_task(
        task_id,
        title=data.title,
        description=data.description,
        category=data.category,
        priority=data.priority,
        due_date=data.due_date,
    )
    return {"ok": True}


@app.delete("/tasks/{task_id}")
def remove_task(task_id: int) -> dict:
    delete_task(task_id)
    return {"ok": True}


@app.post("/tasks/{task_id}/complete")
def complete_task(task_id: int, body: Evidence) -> dict:
    cid = record_completion(task_id, evidence=body.evidence)
    return {"completion_id": cid}


@app.post("/tasks/{task_id}/uncomplete")
def uncomplete_task(task_id: int) -> dict:
    deleted_id = undo_last_completion(task_id)
    return {"removed_completion_id": deleted_id}


@app.post("/quick-complete")
def quick(data: TaskCreate) -> dict:
    tid, cid = quick_complete(data.title, evidence=None)
    return {"id": tid, "completion_id": cid}


@app.get("/streak")
def streak() -> List[bool]:
    return last_7_day_streak()


@app.get("/summary/today")
def summary_today() -> dict:
    txt, csv = export_daily_summary()
    return {"txt": str(txt), "csv": str(csv)}