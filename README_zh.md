# Odysseus

```
█████████████████████████████████████████████████████████████
█   Odysseus  ——  自托管的 AI 工作空间                   █
█████████████████████████████████████████████████████████████
```

![Odysseus](docs/odysseus.jpg)

自托管的 AI 工作空间 —— 旨在成为 ChatGPT 和 Claude 的自托管版本。
运行在你自己的硬件上，使用你自己的数据 —— 本地优先、隐私优先。

## 功能特性

- **聊天** —— 与任何本地模型或 API 对话；添加它们非常简单。
- **智能体** —— 交给它工具，让它自己完成整个任务。
- **模型管家** —— 扫描硬件，推荐模型，点击下载并启动服务。
- **深度研究** —— 多步骤搜索、阅读、综合来源，生成可视化报告。
- **模型对比** —— 多模型并排盲测，无偏差对比。
- **文档编辑** —— 你写正文，AI 辅助编辑。
- **记忆与技能** —— 持久化记忆，智能体随时间进化。
- **邮件** —— IMAP/SMTP 收件箱，内置 AI 分拣。
- **笔记与任务** —— 快速笔记、待办清单、定时任务。
- **日历** —— 本地优先日历，支持 CalDAV 同步。
- **移动端支持** —— 响应式设计，支持 PWA 安装。
- **更多功能** —— 图片编辑、主题编辑、文件上传、网页搜索等。

## 快速开始

### Docker（推荐）
```bash
git clone https://github.com/skyconnfig/odysseus.git
cd odysseus
cp .env.example .env
docker compose up -d --build
```

打开 http://localhost:7000

### 原生 Windows
```powershell
git clone https://github.com/skyconnfig/odysseus.git
cd odysseus
powershell -ExecutionPolicy Bypass -File .\launch-windows.ps1
```

### 原生 Linux / macOS
```bash
git clone https://github.com/skyconnfig/odysseus.git
cd odysseus
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m uvicorn app:app --host 127.0.0.1 --port 7000
```

## 架构
```
app.py         FastAPI 入口
core/          认证、数据库、中间件
src/           LLM 核心、智能体、搜索
routes/        聊天、会话、文档端点
services/      文档、记忆、搜索服务
static/        前端模块（HTML + JS + CSS）
```

## 许可证
MIT