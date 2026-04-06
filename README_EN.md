# talk-mbti

[中文](./README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MBTI](https://img.shields.io/badge/MBTI-16%20Types-blue)](https://en.wikipedia.org/wiki/Myers%E2%80%93Briggs_Type_Indicator)
[![Platform](https://img.shields.io/badge/Platform-Claude%20Code%20%7C%20Codex-purple)](https://github.com)
[![Language](https://img.shields.io/badge/Language-Chinese-red)](https://github.com)
[![AI Powered](https://img.shields.io/badge/AI-Gemini%20%7C%20Claude%20%7C%20GPT-green)](https://github.com)

**MBTI personality analysis through natural conversation, not questionnaires.**

Almost every MBTI test on the market makes you answer dozens of multiple-choice questions. The experience is tedious, and the results are questionable — because how people react in real conversation is fundamentally different from how they pick between "A or B" on a form.

talk-mbti takes a different approach: **it chats with you, and infers your personality type from the way you talk, the logic behind your choices, and your gut reactions to everyday scenarios.** After 8-12 turns of natural conversation, it generates a personalized analysis report that quotes your own words.

## Product Phases

| Phase | Format | Status |
|-------|--------|--------|
| Phase 1 | Claude Code / Codex Skill (terminal chat) | ✅ Available |
| Phase 2 | Web App (Next.js + FastAPI + Gemini) | 🔜 Planned |
| Phase 3 | Mobile APP (React Native) | 📋 Roadmap |

## Quick Start

### Phase 1: Skill Version

**Install to Claude Code:**

```bash
cp -r skill/ ~/.claude/skills/mbti-analysis/
```

**Install to Codex:**

```bash
ln -s ~/.claude/skills/mbti-analysis ~/.codex/skills/mbti-analysis
```

**Usage:**

Type `/mbti-analysis` in Claude Code or Codex to start chatting.

## Core Design

### Three-Phase Conversation Flow

1. **Icebreaker** (Turns 1-4): Casual life scenarios, broad scan across all 4 dimensions
2. **Deep Dive** (Turns 5-9): Targeted probing on low-confidence dimensions
3. **Calibration** (Turns 10-12): Cross-validation, resolve contradictory signals

### Scoring Mechanism

- Extract 0-3 behavioral signals per turn, weighted by strength (strong=3, moderate=2, weak=1)
- Dynamically adjust next question to target the lowest-confidence dimension
- Borderline dimensions (<60%) are honestly flagged in the report

### Report Contents

- Four-dimension percentages with visual progress bars
- Personalized analysis quoting user's own words for each dimension
- Cognitive function stack (Dominant / Auxiliary / Tertiary / Inferior)
- Personalized strengths & growth suggestions
- Honest disclosure of borderline dimensions

## Tech Stack (Phase 2)

```
Frontend (Next.js + TailwindCSS + Framer Motion)
    ↕ WebSocket / SSE
Backend (FastAPI)
    ├── Conversation Engine
    ├── Scoring Engine
    └── Report Generator
    ↕
Gemini API (gemini-2.5-flash)
    ↕
SQLite → PostgreSQL
```

## Project Structure

```
talk-mbti/
├── skill/                  # Phase 1: Claude Code / Codex Skill
│   └── SKILL.md           # Conversation orchestration prompt
├── 方案.md                 # Full product spec (Chinese)
├── README.md              # Chinese README
├── README_EN.md           # English README
└── LICENSE
```

## License

[MIT License](./LICENSE)
