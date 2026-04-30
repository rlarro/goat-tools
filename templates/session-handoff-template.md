# [Book Title] — Chapter [N] Session Prompt

**Date:** [Date]
**Status:** Ready for [planning / drafting] session

---

## Context

We are writing [book title and brief description]. We are about to work on Chapter [N]: "[Chapter Title]."

---

## Documents to read before doing anything else

[List every document Claude should read, in order, with a note about what's in each one and what to pay attention to.]

1. **[Style Guide filename]** — Voice rules, editorial principles, chapter map, process reference. [Note anything specific to look for, e.g., "The What's Next section has the scope notes for this chapter."]

2. **[Manuscript filename]** — Current manuscript through Chapter [N-1]. Read the last [2-3] chapters closely for voice calibration and continuity.

3. **[DraftGuide filename]** (if drafting session) — The architectural plan for this chapter. All decisions are locked. Draft from this.

4. **[Other relevant files]** — [Description of what's in them and why they matter for this session.]

---

## What's locked

[What is done and should not be revisited.]

- Chapter [N-1] ("[Title]") is locked. It ended on [closing line or moment].
- [Any other relevant locked decisions.]

---

## What this session needs to do

[Clear statement of the session's objective.]

- [If planning session: "Read everything, produce a three-part brief (what exists / what's thin / proposed approach), discuss, make decisions, output a DraftGuide."]
- [If drafting session: "Draft the chapter from the DraftGuide. Iterate. Run the Post-Draft Quality Pass before delivering."]

---

## Key material for this chapter

[Specific stories, details, callbacks, or source material that this session needs to find or incorporate.]

- [Item and where to find it]
- [Item and where to find it]

---

## Sensitive material notes (if applicable)

[Any content that needs careful handling: real people who should be anonymized, topics to avoid, legal considerations.]

---

*End of Session Prompt.*

---

## How to use this template

1. **Write this at the end of the previous session.** While you still have full context, produce the document that lets the next session start clean.

2. **Be specific about what to read.** Don't just list filenames. Say what's in them and what matters. The next Claude instance has no memory of the previous session.

3. **The "What's locked" section prevents re-litigation.** Without it, the new session may question decisions the previous session already resolved.

4. **Keep it lean.** This isn't a summary of the whole project. It's a briefing for one specific session. Include only what that session needs.

### Planning session vs. drafting session

Planning sessions are open-ended. The prompt should include source material and open questions. The deliverable is a DraftGuide.

Drafting sessions are focused. The prompt should include the DraftGuide, the style guide, and the last few locked chapters for voice calibration. The deliverable is a draft.

Don't combine them. By the time you've worked through planning, the context window is deep enough that drafting quality suffers. Start fresh.

---

## Real Example: Session Handoff from *Too Many Goats on the Mountain*

This is a condensed version of the actual session prompt written to start a new chapter. You can give this entire template, including this example, to Claude and say: "Here's what another project did. Help me build mine."

### As written (condensed)

**Chapter 12 Session Prompt: "Five Screens. How Hard Can It Be."**

We are writing a 30-year Silicon Valley startup memoir. We are about to work on Chapter 12, the first chapter at a new company.

**Documents to read before doing anything else:**

1. **StyleGuide_v8.md** — Voice rules, chapter map. The "What's Next" section has the scope notes for this chapter.
2. **BackgroundMaterials.md** — Session 6 handoff has the complete arc for this company.
3. **Manuscript_v13.md** — Current manuscript through Chapter 11 (LOCKED). Read Ch11 closely since Ch12 picks up directly from its ending.
4. **Ch11_DraftGuide.md** — Contains the "What Ch12 Inherits" section at the bottom.

**What's locked:** Ch11 ended on "Onward." The previous company arc is complete. The narrator told his CEO he'd do a three-month transition, picked an end date, and started looking.

**What this session needs to do:** Read everything, produce a three-part brief (what exists, what's thin, proposed approach), discuss, make decisions, output a DraftGuide. No prose drafting in this session.

**Key material:** The job search (a referral from a friend, one interesting detour that didn't work out, a competing offer with big equity that was turned down), the decision, and the first-week culture contrast with the previous company.

### What makes this example work

It tells the new Claude instance exactly what to read and in what order. It says what's locked so previously resolved decisions don't get re-opened. It names the session's deliverable explicitly (a DraftGuide, not a draft). And it gives enough context about the chapter's content that Claude can start working immediately rather than spending thirty minutes rediscovering the project.
