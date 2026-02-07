# AI Research Team - Quick Reference

*Competitive analysis automation for DMF E-learning platform*

---

## 🚀 Quick Start

### From Claude Code Terminal:

```bash
# Research any module before development
/research vocabulary
/research reading
/research listening
/research speaking
/research writing
```

### From Telegram (to Fuchs):

```
"Em research vocabulary module cho DMF nhé"
```

---

## 📊 What You Get (~30-40 min)

**Output:** `.research/RESEARCH_REPORT_[module].md`

**Contains:**
- ✅ Top 10 competitors analysis (URLs, features, pricing)
- ✅ UX patterns with screenshots (swipe, animations, gamification)
- ✅ Tech stack reverse-engineering (React, APIs, performance)
- ✅ **Implementation roadmap** (week-by-week, P0/P1/P2 features)
- ✅ **Effort estimates** (days + model selection: Sonnet vs Opus)
- ✅ **What to avoid** (anti-patterns from competitors)

**Cost:** ~$12-19 per module

---

## 🎯 Team Structure

```
Research Lead (Opus 4.5 - 10 min)
    │
    ├─── Market Scout (Sonnet - 15 min) → Top 10 competitors
    ├─── UX Analyst (Sonnet - 15 min) → UI/UX patterns + screenshots
    └─── Tech Detective (Sonnet - 15 min) → Tech stack analysis
    
Strategy Synthesizer (Opus 4.5 - 10 min) → Roadmap + priorities

Final Report (3-5 min) → Comprehensive markdown
```

---

## 📁 File Structure

```
dmf-elearning-platform/
├── .research/
│   ├── RESEARCH_REPORT_vocabulary.md ← Final report
│   ├── vocabulary/
│   │   ├── screenshots/
│   │   │   ├── duolingo-flashcard.png
│   │   │   ├── babbel-onboarding.png
│   │   │   └── ...
│   │   └── data/
│   │       ├── market-findings.md
│   │       ├── ux-patterns.md
│   │       ├── tech-analysis.md
│   │       └── strategy-synthesis.md
│   └── reading/ (next module)
│       └── ...
└── .claude/
    └── agents/
        ├── research-lead.md
        ├── market-scout.md
        ├── ux-analyst.md
        ├── tech-detective.md
        └── strategy-synthesizer.md
```

---

## 💡 When to Use

**BEFORE developing a new module:**
- ✅ Starting Vocabulary module → `/research vocabulary`
- ✅ Planning Reading feature → `/research reading`
- ✅ Adding Speaking practice → `/research speaking`

**Why it's valuable:**
- 🎯 Learn from market leaders (Duolingo, Babbel, etc.)
- 🚀 Faster development (best practices from day 1)
- 💰 Cost savings (avoid reinventing the wheel)
- 🏆 Competitive advantage (know what works)

---

## 🔧 Technical Details

### Agent Permissions:
- **Research Lead:** Can spawn workers, read/write reports
- **Market Scout:** Can search web (MCP DuckDuckGo), fetch pages
- **UX Analyst:** Can control browser, take screenshots
- **Tech Detective:** Can inspect DevTools, network calls
- **Strategy Synthesizer:** Read-only, synthesis + roadmap

### Tools Used:
- **MCP:** web-search-duckduckgo (market research)
- **Browser:** OpenClaw browser tool (screenshots, inspection)
- **Sessions:** sessions_spawn, sessions_send (coordination)

---

## 📋 Example Output

### Executive Summary (from real research):

```markdown
## Executive Summary

**Module:** Vocabulary Learning

**Top Competitors:** Duolingo, Babbel, Memrise, Quizlet, Anki

**Key Insight:** All leaders use:
1. Flashcard-based interface (100%)
2. Spaced Repetition System (90%)
3. Gamification (80% - streaks, XP, leaderboards)
4. Audio pronunciation (80%)

**Recommendation for DMF:**
- **P0 (Must-Have):** Flashcards + SRS + Audio → 5 days, Sonnet 4
- **P1 (Should-Have):** Streaks + XP → 2 days, Sonnet 4
- **P2 (Nice-to-Have):** Community features → defer to post-MVP

**Estimated effort:** 7 days total
**Estimated cost:** $40-60 (AI) + $100-200 (audio generation)
```

---

## 🎯 Success Metrics

After research complete:
- ✅ ≥5 competitors analyzed
- ✅ ≥10 screenshots collected
- ✅ ≥3 UX patterns documented
- ✅ Tech stack fully analyzed
- ✅ Implementation roadmap created
- ✅ Report delivered <40 minutes

---

## 🔥 Pro Tips

1. **Run research FIRST** - Before writing any code
2. **Read the full report** - Don't skip Strategy Synthesis section
3. **Follow P0 priorities** - Focus on must-haves, defer nice-to-haves
4. **Use screenshots** - Visual reference for UI development
5. **Validate tech choices** - Compare with what leaders use

---

## 🆘 Troubleshooting

**Issue:** Research taking too long (>60 min)
- **Cause:** Worker agents stuck or failed
- **Solution:** Check `sessions_list`, restart if needed

**Issue:** No competitors found
- **Cause:** Module too niche or search terms unclear
- **Solution:** Manual Google search, use similar module as reference

**Issue:** Screenshots not saving
- **Cause:** Browser tool permission issue
- **Solution:** Check `.claude/settings.json` allows browser tool

---

## 📞 Support

**Created by:** Fuchs 🦊 (OpenClaw AI Assistant)  
**Date:** 2026-02-06  
**Location:** `.claude/agents/research-*.md` (5 agent files)  
**Documentation:** `AI_RESEARCH_TEAM.md` (full design doc)

---

**Ready to research? Run:** `/research vocabulary` 🚀
