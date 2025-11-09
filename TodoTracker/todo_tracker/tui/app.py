from __future__ import annotations

import datetime as dt
from typing import Optional

from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal
from textual.screen import ModalScreen
from textual.widgets import Button, Footer, Input, Label, ListItem, ListView, Static
from textual.reactive import reactive
from textual import events

from ..config import category_presets, PRIORITY_SET
from ..storage import (
    add_task,
    delete_task,
    export_daily_summary,
    last_7_day_streak,
    list_tasks,
    quick_complete,
    record_completion,
    update_task,
)


def _streak_ring() -> str:
    days = last_7_day_streak()
    # Use 7-segment ring with unicode dots; filled=●, empty=○
    segs = ["●" if d else "○" for d in days]
    return "".join(segs)


def _stamp_for_status(status: str) -> str:
    return "✅ 已完成" if status == "已完成" else "⌛ 未完成"


def _momentum_bar(created_at: str, due_date: Optional[str]) -> str:
    # 10-block bar showing time till due; if no due, show age-based fade
    total_blocks = 10
    if due_date:
        try:
            due = dt.datetime.fromisoformat(due_date)
            created = dt.datetime.fromisoformat(created_at)
            total = max((due - created).total_seconds(), 0.1)
            elapsed = max((dt.datetime.now() - created).total_seconds(), 0)
            pct = min(elapsed / total, 1.0)
        except Exception:
            pct = 0.0
    else:
        try:
            created = dt.datetime.fromisoformat(created_at)
            days = max((dt.datetime.now() - created).days, 0)
            pct = min(days / 14, 1.0)  # age effect (2-week scale)
        except Exception:
            pct = 0.0
    filled = int(pct * total_blocks)
    empty = total_blocks - filled
    return "█" * filled + "░" * empty


class TaskItem(ListItem):
    def __init__(self, task):
        super().__init__()
        self.task = task

    def compose(self) -> ComposeResult:
        meta = f"#{self.task.id} [{self.task.category or '-'} | {self.task.priority}]"
        stamp = _stamp_for_status(self.task.status)
        momentum = _momentum_bar(self.task.created_at, self.task.due_date)
        evidence_badge = ""  # filled when showing completion evidence on export
        if self.task.status == "已完成":
            evidence_badge = "[证据]"
        title_line = f"{stamp} {self.task.title} {evidence_badge}"

        yield Horizontal(
            Label(title_line),
            Static(momentum, classes="bar"),
        )
        yield Label(meta, classes="meta")


class TaskForm(ModalScreen[dict]):
    def __init__(self, *, initial: Optional[dict] = None):
        super().__init__()
        self.initial = initial or {}

    def compose(self) -> ComposeResult:
        yield Static("任务表单", classes="title")
        self.input_title = Input(value=self.initial.get("title", ""), placeholder="标题")
        self.input_desc = Input(value=self.initial.get("description", ""), placeholder="描述(可选)")
        self.input_category = Input(value=self.initial.get("category", ""), placeholder=f"分类(预置: {', '.join(category_presets())})")
        self.input_priority = Input(value=self.initial.get("priority", "中"), placeholder=f"优先级({', '.join(PRIORITY_SET)})")
        self.input_due = Input(value=self.initial.get("due_date", ""), placeholder="截止时间 ISO(YYYY-MM-DD HH:MM:SS) 可选")
        yield self.input_title
        yield self.input_desc
        yield self.input_category
        yield self.input_priority
        yield self.input_due
        yield Horizontal(Button("确认", id="ok"), Button("取消", id="cancel"))

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "ok":
            self.dismiss(
                {
                    "title": self.input_title.value.strip(),
                    "description": self.input_desc.value.strip(),
                    "category": self.input_category.value.strip(),
                    "priority": (self.input_priority.value.strip() or "中"),
                    "due_date": (self.input_due.value.strip() or None),
                }
            )
        else:
            self.dismiss({})


class EvidenceForm(ModalScreen[str]):
    def compose(self) -> ComposeResult:
        yield Static("完成证据(可选)", classes="title")
        self.input_ev = Input(placeholder="例如链接/备注")
        yield self.input_ev
        yield Horizontal(Button("确认", id="ok"), Button("跳过", id="skip"))

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "ok":
            self.dismiss(self.input_ev.value.strip())
        else:
            self.dismiss("")


class SearchForm(ModalScreen[str]):
    def compose(self) -> ComposeResult:
        yield Static("搜索关键词", classes="title")
        self.input_kw = Input(placeholder="标题/描述关键词")
        yield self.input_kw
        yield Horizontal(Button("确认", id="ok"), Button("取消", id="cancel"))

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "ok":
            self.dismiss(self.input_kw.value.strip())
        else:
            self.dismiss("")


class TodoApp(App):
    CSS = """
    Screen { layout: vertical; }
    .hdr { background: $surface; color: $text; padding: 1; }
    .bar { width: 16; content-align: right middle; }
    .meta { color: $text-muted; }
    Footer { dock: bottom; }
    """

    BINDINGS = [
        ("a", "add", "添加"),
        ("e", "edit", "编辑"),
        ("d", "delete", "删除"),
        ("c", "complete", "完成"),
        ("q", "quick", "快捷完成"),
        ("s", "search", "搜索"),
        ("x", "export", "导出日报"),
        ("r", "refresh", "刷新"),
    ]

    search_kw: reactive[Optional[str]] = reactive(None)

    def compose(self) -> ComposeResult:
        header = Horizontal(Label("TodoTracker"), Static(_streak_ring(), classes="hdr"))
        yield header
        self.list_view = ListView()
        yield self.list_view
        yield Footer()

    def on_mount(self) -> None:
        self.refresh_list()

    def refresh_list(self) -> None:
        self.list_view.clear()
        for task in list_tasks(search=self.search_kw):
            self.list_view.append(TaskItem(task))

    def action_refresh(self) -> None:
        self.refresh_list()

    def action_add(self) -> None:
        self.push_screen(TaskForm(), self._add_cb)

    def _add_cb(self, data: dict) -> None:
        if not data or not data.get("title"):
            return
        add_task(
            title=data["title"],
            description=data.get("description", ""),
            category=data.get("category", ""),
            priority=data.get("priority", "中"),
            due_date=data.get("due_date"),
        )
        self.refresh_list()

    def _selected_task_id(self) -> Optional[int]:
        if not self.list_view or not self.list_view.index is not None:
            return None
        item = self.list_view.get_child_at_index(self.list_view.index)
        if isinstance(item, TaskItem):
            return int(item.task.id)
        return None

    def action_edit(self) -> None:
        tid = self._selected_task_id()
        if tid is None:
            return
        # Read-original minimal: re-fetch to populate initial
        tasks = list_tasks()
        t = next((x for x in tasks if x.id == tid), None)
        if not t:
            return
        init = {
            "title": t.title,
            "description": t.description,
            "category": t.category,
            "priority": t.priority,
            "due_date": t.due_date or "",
        }
        self.push_screen(TaskForm(initial=init), lambda d: self._edit_cb(tid, d))

    def _edit_cb(self, task_id: int, data: dict) -> None:
        if not data:
            return
        update_task(
            task_id,
            title=data.get("title"),
            description=data.get("description"),
            category=data.get("category"),
            priority=data.get("priority"),
            due_date=data.get("due_date"),
        )
        self.refresh_list()

    def action_delete(self) -> None:
        tid = self._selected_task_id()
        if tid is None:
            return
        delete_task(tid)
        self.refresh_list()

    def action_complete(self) -> None:
        tid = self._selected_task_id()
        if tid is None:
            return
        self.push_screen(EvidenceForm(), lambda ev: self._complete_cb(tid, ev))

    def _complete_cb(self, task_id: int, evidence: str) -> None:
        record_completion(task_id, evidence=evidence or None)
        self.refresh_list()

    def action_quick(self) -> None:
        # Quick completion creates a temp task and completes it
        self.push_screen(SearchForm(), self._quick_cb)

    def _quick_cb(self, title: str) -> None:
        if not title:
            return
        quick_complete(title, evidence=None)
        self.refresh_list()

    def action_search(self) -> None:
        self.push_screen(SearchForm(), self._search_cb)

    def _search_cb(self, kw: str) -> None:
        self.search_kw = kw or None
        self.refresh_list()

    def action_export(self) -> None:
        export_daily_summary()
        # simple toast
        self.bell()