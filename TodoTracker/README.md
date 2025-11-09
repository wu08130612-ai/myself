# TodoTracker (P0: Textual TUI)

一个基于 Python + SQLite + Textual 的任务管理器，支持：

- 预置分类集并支持自由输入
- 创新 UI 效果：完成印章、连胜环、动机条、证据徽标（默认启用）
- 快捷完成（临时任务，`category=临时`，`priority=中`）
- 每日总结导出：纯文本和 CSV 到 `~/Documents/TodoTracker/summaries/`
- 默认数据库：`~/Documents/TodoTracker/data.db`

## 安装

```bash
pip install -r requirements.txt
```

## 运行

```bash
python main.py
```

## 快捷键

- `a` 添加任务
- `e` 编辑任务
- `d` 删除任务
- `c` 完成任务（可添加证据）
- `q` 快捷完成（创建临时任务并立即完成）
- `s` 搜索任务
- `x` 导出当日日报（文本 + CSV）
- `r` 刷新视图

## 数据结构

- tasks(id, title, description, category, priority, created_at, due_date, status, is_temp)
- completions(id, task_id, completed_at, evidence)

## 注意

- 首次运行会自动创建数据库文件与 summaries 目录。
- 连胜环为近 7 天的每日完成情况（任意任务），以分段圆点展示。