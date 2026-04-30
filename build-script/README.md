# Build Script: Markdown to Print-Ready .docx

Takes a markdown manuscript and produces a formatted 6x9 .docx suitable for Amazon KDP upload. Running headers, title page, copyright page, table of contents, scene breaks, chapter formatting, and proper margins. The same interior file works for paperback, hardcover, and case laminate editions.

---

## What it produces

A single .docx file formatted for a 6" x 9" trade paperback with:

- **Title page** with book title, subtitle, and author name
- **Copyright page** with standard copyright language
- **Table of contents** generated from chapter headings
- **Opening epigraph** (if present in the manuscript)
- **Chapter formatting** with chapter numbers and titles on new pages
- **Running headers** with book title on even pages and chapter title on odd pages
- **Scene breaks** rendered from `***` markers in the manuscript
- **Photo placeholders** preserved from the manuscript
- **Proper margins** with gutter for binding (0.75" inside, 0.625" outside)
- **Print-appropriate typography** (Georgia, 10.5pt, 1.5x line spacing, first-line paragraph indent)

---

## Prerequisites

- Node.js (v18+)
- npm

## Setup

From the `build-script/` directory:

```bash
npm install
```

This installs the `docx` library (the only dependency).

---

## Usage

1. Place your manuscript markdown file as `manuscript.md` in the same directory as the script (or update the path in the CONFIG section at the top of `build.js`).

2. Run:

```bash
npm run build
```

3. The output .docx will be created at the path specified in the script (default: `/mnt/user-data/outputs/`). Update this path for your environment.

---

## Customizing

All the key parameters are in the CONFIG block at the top of `build.js`:

```javascript
const BOOK_TITLE = "Your Book Title";
const SUBTITLE = "Your Subtitle";
const AUTHOR = "Your Name";
const FONT = "Georgia";          // Body font
const BODY_SIZE = 21;            // 10.5pt (in half-points)
const LINE_SPACING = 360;        // 1.5x line spacing
const PAGE_W = 8640;             // 6" in DXA (twentieths of a point)
const PAGE_H = 12960;            // 9" in DXA
const MARGIN_TOP = 1080;         // 0.75"
const MARGIN_BOT = 1080;         // 0.75"
const MARGIN_IN = 1080;          // 0.75" gutter (binding side)
const MARGIN_OUT = 900;          // 0.625" outside
```

### Page sizes

The default is 6x9, the most common trade paperback size for nonfiction. For other KDP-supported sizes:

| Size | PAGE_W (DXA) | PAGE_H (DXA) |
|---|---|---|
| 5" x 8" | 7200 | 11520 |
| 5.25" x 8" | 7560 | 11520 |
| 5.5" x 8.5" | 7920 | 12240 |
| 6" x 9" (default) | 8640 | 12960 |
| 6.14" x 9.21" | 8842 | 13262 |

### DXA units

The docx library uses DXA (twentieths of a point) for all measurements. To convert:
- Inches to DXA: multiply by 1440
- Points to half-points (font size): multiply by 2

---

## Manuscript format

The script expects a markdown file with this structure:

```markdown
# Book Title

## Subtitle

**Author Name**

*Draft note (optional)*

## Contents

- Prologue — *Title* ✓
- Chapter 1 — *Title* ✓
- Chapter 2 — *Title*

---

> "Epigraph text"
> — Attribution

---

# Prologue
## Title

Body text...

***

Scene break, then more text...

# Chapter 1
## Title

Body text...
```

Key formatting conventions:
- `# Chapter N` for chapter headings
- `## Title` for chapter titles (immediately after the chapter heading)
- `***` for scene breaks
- `> "text"` and `> — attribution` for epigraphs
- Standard markdown for italics and bold
- Photo placeholders in any format (preserved as-is)

---

## Known limitations

- Does not embed actual images. Photo placeholders are rendered as styled text blocks.
- Smart quote handling assumes the manuscript already has smart quotes. If your markdown uses straight quotes, add a conversion step.
- The TOC is generated from the manuscript's Contents section, not dynamically from headings. Keep them in sync.
- Running headers use the chapter title from the most recent `## Title` line. Multi-line titles may truncate.

---

## How this was built

This script was developed iteratively over 40+ manuscript versions during the writing of *Too Many Goats on the Mountain*. It started as a simple markdown-to-docx converter and grew to handle the full formatting requirements of a print-ready book. Claude wrote the script; Rene tested each version against KDP's requirements and reported what broke.

The script is not elegant. It does the job. If you're formatting your own book for KDP and don't want to spend days in Word, this will save you significant time.
