# talk-mbti

[English](./README_EN.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MBTI](https://img.shields.io/badge/MBTI-16%20Types-blue)](https://en.wikipedia.org/wiki/Myers%E2%80%93Briggs_Type_Indicator)
[![Platform](https://img.shields.io/badge/Platform-Claude%20Code%20%7C%20Codex-purple)](https://github.com)
[![Language](https://img.shields.io/badge/Language-Chinese-red)](https://github.com)
[![AI Powered](https://img.shields.io/badge/AI-Gemini%20%7C%20Claude%20%7C%20GPT-green)](https://github.com)

**用聊天代替问卷的 MBTI 人格分析工具。**

市面上几乎所有 MBTI 测试都在让你做选择题。几十道问题答下来，体验枯燥，结果还不一定准——因为人在「选 A 还是选 B」的时候和在真实对话中的反应完全是两码事。

talk-mbti 换了一个思路：**跟你聊天，从你说话的方式、做选择的逻辑、面对场景的第一反应中，推断你的人格类型。** 8-12 轮自然对话后，生成一份引用你原话的个性化分析报告。

## 产品形态

| 阶段 | 形态 | 状态 |
|------|------|------|
| Phase 1 | Claude Code / Codex Skill（终端对话） | ✅ 可用 |
| Phase 2 | Web 应用（Next.js + FastAPI + Gemini） | 🔜 规划中 |
| Phase 3 | 移动端 APP（React Native） | 📋 路线图 |

## 快速开始

### Phase 1：Skill 体验版

**安装到 Claude Code：**

```bash
# 复制 skill 到 Claude Code skills 目录
cp -r skill/ ~/.claude/skills/mbti-analysis/
```

**安装到 Codex：**

```bash
# 创建符号链接
ln -s ~/.claude/skills/mbti-analysis ~/.codex/skills/mbti-analysis
```

**使用：**

在 Claude Code 或 Codex 中输入 `/mbti-analysis`，开始聊天。

### 对话示例

```
🤖: 嘿！来跟我随便聊聊吧。先来个轻松的——想象一下，你刚熬完一个大项目，
    终于放假了，第一反应你会想做什么？

👤: 终于可以一个人在家躺着了，什么人都不想见

🤖: 哈哈完全理解，忙完之后就想把整个世界关在门外对吧。
    那你躺着的时候一般会干什么？刷手机、看书、还是脑子放空？

👤: 看书或者打游戏，偶尔刷刷技术博客

🤖: 技术博客都是休息时间的菜单了，看来是真的喜欢。
    对了突然想到，你平时学新技术的时候一般怎么入门的？
    是先找个教程跟着做，还是先把整体架构搞清楚？

...（8-12 轮后）

🤖: 跟你聊天真的挺有意思的！我觉得我对你有了一个蛮清晰的感觉了。
    要不我跟你说说我的观察？

🧠 你的 MBTI 类型：INTJ — 在键盘前构建系统之前，先在脑中跑完了三遍架构
━━━━━━━━━━━━━━━━━━━━━━━━
📊 四维度解析
I ■■■■■■■■□□ 82% ←→ E 18%
...
```

## 核心设计

### 对话三阶段

1. **破冰暖场**（第 1-4 轮）：轻松生活场景，广泛扫描四个维度
2. **深度追问**（第 5-9 轮）：针对置信度低的维度定向深入
3. **校准收尾**（第 10-12 轮）：交叉验证，解决矛盾信号

### 评分机制

- 每轮对话提取 0-3 个行为信号，按强(3)/中(2)/弱(1) 加权
- 动态调整下一个问题方向，优先探测置信度最低的维度
- 边界维度（<60%）在报告中诚实标注

### 报告内容

- 四维度百分比 + 进度条可视化
- 每个维度引用用户原话做个性化分析
- 认知功能栈（主导/辅助/第三/劣势）
- 个性化超能力 & 成长建议
- 边界维度诚实说明

## 技术架构（Phase 2）

```
前端 (Next.js + TailwindCSS + Framer Motion)
    ↕ WebSocket / SSE
后端 (FastAPI)
    ├── 对话引擎
    ├── 评分引擎
    └── 报告生成
    ↕
Gemini API (gemini-2.5-flash)
    ↕
SQLite → PostgreSQL
```

## 项目结构

```
talk-mbti/
├── skill/                  # Phase 1: Claude Code / Codex Skill
│   └── SKILL.md           # 对话编排 prompt
├── 方案.md                 # 完整产品方案
├── README.md              # 中文 README
├── README_EN.md           # English README
└── LICENSE
```

## 许可证

[MIT License](./LICENSE)
