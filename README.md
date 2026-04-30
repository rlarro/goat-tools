# Goat Tools

**A toolkit for writing books with AI.**

These tools were developed over 100+ sessions writing *Too Many Goats on the Mountain*, an 300-page book, in collaboration with Claude. Every tool here exists because something went wrong without it. None of them were planned. All of them held once they were established.

The companion white paper, *"How I Used AI to Help Write a 300-Page Book in a Month"*, describes the experience and findings in detail. https://rlarro.substack.com/publish/post/196038383

Goat Pad, a purpose-built markdown editor for AI-assisted writing, is a separate project: https://github.com/rlarro/goatpad

---

## What's in the box

### Templates

Reusable workflow documents. Each one includes the template itself, instructions for how to use it, and a real filled-in example embedded inline.

| Template | What it does |
|---|---|
| [Style Guide](templates/style-guide-template.md) | The governing document for your project. Voice rules, editorial principles, chapter map, character names, process reference. Load this at the start of every session. |
| [DraftGuide](templates/draft-guide-template.md) | The architectural plan for a single chapter. Beats, source material, locked decisions, voice register. Output of your planning session, input to your drafting session. |
| [Arc Spine](templates/arc-spine-template.md) | Multi-chapter structural blueprint for when three or more chapters need to be planned as a unit. Theme, structural forces, per-chapter scope, thread tracking. |
| [Session Handoff](templates/session-handoff-template.md) | The document that lets the next Claude session pick up clean. What to read, what's locked, what's next, what decisions are outstanding. |
| [Post-Draft Quality Pass](templates/post-draft-quality-pass.md) | Five automated and manual passes to run on every first draft before you read it. Style violations, repetition, compression, me-me-me check, editor's read. |
| [Raw Material & Notes](templates/raw-material-template.md) | The parking lot. Character details, story fragments, structural ideas, epilogue material. Everything that doesn't have a home yet. Updated every session; spent material archived. |
| [End-of-Session Checklist](templates/end-of-session-checklist.md) | The housekeeping steps that keep your project files in sync. Run this after every chapter lock. |

### Build Script

A Node.js script that takes a markdown manuscript and produces a print-ready 6x9 .docx formatted for Amazon KDP. Works for paperback, hardcover, and case laminate. Running headers, title page, copyright page, table of contents, proper margins, scene breaks, photo placeholders.

See [build-script/README.md](build-script/README.md) for setup and usage.

### Examples

Every template includes a "Real Example" section at the bottom showing how that template was actually used on *Too Many Goats on the Mountain*. The examples are part of the prompt. When you hand a template to Claude, the example shows it what a filled-in version looks like, which dramatically improves what you get back. Don't strip the examples when you copy a template into your own project. Keep them as reference, then add your own work above.

---

## The workflow in brief

This is the process that emerged over 34 chapters. It's described in detail in the white paper.

**1. Set up your project.** Create a Claude Project. Add your Style Guide. Add any source material (outlines, notes, research, photos). Set up your preferences so Claude knows your voice.

**2. Capture raw material.** Talk into a voice dictation tool (we used Wispr Flow). Stream of consciousness. Don't structure it. For first-person work, the raw dictation IS the voice. Claude can't find your voice from a synthesized outline. It needs to hear how you actually tell stories. Even for third-person or historical work, raw dictation captures detail and energy that structured notes don't.

**Important:** Save your dictation transcripts as files (Word docs, text files, markdown) organized by chapter or topic. Do not rely on chat history as your archive. Chats get long, context windows fill up, and details get lost. Your raw material files are the durable record. Upload them to Claude when you need them, but keep the originals outside of Claude where you control them.

**3. Plan before you draft.** For each chapter: read the source material, diagnose what the chapter needs to do, discuss structure and beats, lock decisions, output a DraftGuide. Do this in its own chat session. Don't draft in the planning session.

**4. Draft in a fresh session.** Start a new chat. Load the DraftGuide plus the Style Guide plus the last few locked chapters for voice calibration. Draft the chapter. Iterate. When it's close, run the Post-Draft Quality Pass.

**5. Edit offline.** Download the draft and edit in GoatPad. It was built specifically for this workflow - clean markdown in, clean markdown out, no encoding damage. If you prefer Word, it works, but be warned that round-tripping markdown through Word can introduce smart quote encoding issues, disappearing paragraphs, and formatting damage that takes real time to untangle. Track changes in Word are useful, but the format conversion tax is real. Goat Pad avoids it entirely.

**6. Housekeeping.** Run the End-of-Session Checklist. Update the manuscript, style guide, and any other project files. Write the session handoff for the next chapter.

**7. Repeat.** For multi-chapter arcs, add a spine step before the individual DraftGuides.

---

## Getting started

If you're starting a book project with Claude:

1. Copy the [Style Guide template](templates/style-guide-template.md) into your Claude Project files. Fill in the sections. Don't worry about getting it perfect. It evolves.

2. Do a few raw dictation sessions to capture material and establish your voice.

3. When you're ready to draft your first chapter, use the [DraftGuide template](templates/draft-guide-template.md) to plan it, then draft in a fresh session.

4. After your first chapter is locked, start using the [End-of-Session Checklist](templates/end-of-session-checklist.md) and [Session Handoffs](templates/session-handoff-template.md) to keep things organized.

5. When you have enough chapters to see the shape, set up the [build script](build-script/README.md) to start producing formatted output.

You don't need all of these on day one. Start with the Style Guide and the DraftGuide. Add the others as your project gets complex enough to need them.

---

## License

MIT. Use these however you want.

---

## About

Built by Rene Larro while writing *Too Many Goats on the Mountain: Thirty Years Inside Silicon Valley Startups*. The book, the white paper, and these tools are all products of the same experience.
