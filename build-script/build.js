const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Header, Footer,
  AlignmentType, PageBreak, PageNumber, SectionType,
  HeadingLevel, BorderStyle
} = require('docx');

// ── CONFIG (Rene's specs, unchanged from v2) ──
const BOOK_TITLE = "Too Many Goats on the Mountain";
const SUBTITLE = "Thirty Years Inside Silicon Valley Startups:\nFrom the Dot Com Bubble to the BioTech Winter";
const AUTHOR = "Rene Larro";
const FONT = "Georgia";
const BODY_SIZE = 21;       // 10.5pt in half-points
const LINE_SPACING = 360;   // 1.5x (240 * 1.5)
const BODY_COLOR = "1A1A1A";
const PAGE_W = 8640;        // 6" in DXA
const PAGE_H = 12960;       // 9" in DXA
const MARGIN_TOP = 1080;    // 0.75"
const MARGIN_BOT = 1080;
const MARGIN_IN = 1080;     // 0.75" gutter
const MARGIN_OUT = 900;     // 0.625"
const INDENT = 360;         // 0.25" first-line indent
const SCENE_BREAK_SPACE = 360; // ~18pt before/after scene breaks
const CH_NUM_BEFORE = 1080; // ~0.75" before chapter number
const CH_NUM_AFTER = 120;
const CH_TITLE_BEFORE = 120;
const CH_TITLE_AFTER = 840;

// ── Read and parse manuscript ──
const raw = fs.readFileSync('/home/claude/manuscript.md', 'utf8');

// Smart quotes helper
function smartQuotes(text) {
  // Already has smart quotes from manuscript, just ensure consistency
  return text;
}

// ── Parse manuscript into structured sections ──
function parseManuscript(text) {
  const lines = text.split('\n');
  const sections = [];
  let current = null;
  let i = 0;
  
  // Skip the header block (title, subtitle, author, draft note, contents, epigraph)
  // We'll build those manually. Find where "# Prologue" starts.
  let prologueStart = -1;
  
  // Also capture the epigraph
  let epigraphText = '';
  let epigraphAttr = '';
  
  // Find the TOC entries for reference
  const tocEntries = [];
  let inToc = false;
  
  for (let j = 0; j < lines.length; j++) {
    const line = lines[j];
    if (line.startsWith('## Contents') || line === 'Contents') { inToc = true; continue; }
    if (inToc && (line.startsWith('---') || line === '')) { 
      // In plain text format, blank lines are normal in TOC - only exit on '---' or epigraph
      if (line.startsWith('---')) { inToc = false; continue; }
      continue;
    }
    if (inToc && (line.startsWith('- ') || line.startsWith('·'))) {
      tocEntries.push(line.replace(/^- /, '').replace(/^·\s*/, '').replace(/ ✓$/, '').trim());
    }
    // Exit TOC when we hit the epigraph
    if (inToc && (line.startsWith('> "') || line.startsWith('> \u201C') || line.startsWith('"') || line.startsWith('\u201C'))) {
      inToc = false;
      // Fall through to epigraph capture below
    }
    if (line.startsWith('> "') || line.startsWith('> \u201C') || (!inToc && /^"Life should not/.test(line)) || (!inToc && /^\u201CLife should not/.test(line))) {
      // Handle both markdown (> "quote") and plain text ("quote" — attribution) formats
      let epLine = line.replace(/^> /, '');
      // Check if attribution is on the same line (plain text format): "quote" — Author
      const dashSplit = epLine.match(/^[""\u201C](.+?)[""\u201D]\s*[—\u2014]\s*(.+)$/);
      if (dashSplit) {
        epigraphText = dashSplit[1];
        epigraphAttr = '\u2014 ' + dashSplit[2];
      } else {
        epigraphText = epLine.replace(/^"/, '').replace(/"$/, '').replace(/^\u201C/, '').replace(/\u201D$/, '');
      }
    }
    if (line.startsWith('> \u2014') || line.startsWith('> —')) {
      epigraphAttr = line.replace(/^> /, '');
    }
    if (line === '# Prologue' || line === 'Prologue') {
      prologueStart = j;
      break;
    }
  }
  
  // Now parse from prologue onward into chapters
  // v3: Support both markdown (# Chapter N / ## Title) and plain-text (Chapter N / Title) formats
  const chapterPatternMd = /^#\s+(Prologue|Chapter \d+|Epilogue|Where Are They Now|How This Book Was Made)$/;
  const chapterPatternPlain = /^(Prologue|Chapter \d+|Epilogue|Where Are They Now|How This Book Was Made)$/;
  const titlePatternMd = /^## (.+)$/;
  // Skip inline part headers (e.g. "# PART FOUR — APTTUS" or "PART FOUR — APTTUS")
  const partHeaderPattern = /^#?\s*PART /;
  // Skip part epigraphs that appear as ## or plain text right after a part header
  let skipNextTitle = false;
  
  for (let j = prologueStart; j < lines.length; j++) {
    const line = lines[j];
    
    // Skip inline part headers in the manuscript body
    if (partHeaderPattern.test(line)) {
      skipNextTitle = true;
      continue;
    }
    
    // Skip the part epigraph line right after a part header
    if (skipNextTitle && line.trim() !== '' && line.trim() !== '---') {
      // Check if this is actually a chapter heading (don't skip it)
      if (chapterPatternMd.test(line) || chapterPatternPlain.test(line)) {
        skipNextTitle = false;
        // Fall through to chapter matching below
      } else {
        skipNextTitle = false;
        continue;
      }
    }
    // Skip blank lines and horizontal rules after part headers
    if (skipNextTitle && (line.trim() === '' || line.trim() === '---')) {
      continue;
    }
    
    // Match chapter headings (markdown or plain text)
    const mdMatch = line.match(chapterPatternMd);
    const plainMatch = line.match(chapterPatternPlain);
    const chMatch = mdMatch || plainMatch;
    
    if (chMatch) {
      if (current) sections.push(current);
      current = {
        type: 'chapter',
        number: chMatch[1],
        title: '',
        content: []
      };
      continue;
    }
    
    // Match title line (markdown ## or plain text on next non-blank line after chapter heading)
    if (current && !current.title) {
      const mdTitle = line.match(titlePatternMd);
      if (mdTitle) {
        current.title = mdTitle[1];
        continue;
      }
      // Plain text title: first non-blank line after chapter heading
      if (line.trim() !== '' && line.trim() !== '---') {
        current.title = line.trim();
        continue;
      }
      // Skip blank lines between heading and title
      if (line.trim() === '') continue;
    }
    
    if (current) {
      current.content.push(line);
    }
  }
  if (current) sections.push(current);
  
  return { sections, epigraphText, epigraphAttr, tocEntries };
}

// ── Build paragraphs from chapter content ──
function buildChapterParagraphs(contentLines) {
  const paragraphs = [];
  let isFirstParagraph = true;
  let currentPara = '';
  let inPhotoBlock = false;
  let photoLines = [];
  
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i];
    
    // Skip horizontal rules
    if (line === '---') continue;
    
    // Photo block detection - single line format (v35: entire block on one line)
    if ((line.includes('┌') && line.includes('┘')) || (line.includes('\u250C') && line.includes('\u2518'))) {
      // Flush current paragraph
      if (currentPara.trim()) {
        paragraphs.push(makeBodyParagraph(currentPara.trim(), isFirstParagraph));
        isFirstParagraph = false;
        currentPara = '';
      }
      // Extract photo info from single line
      const photoInfo = parsePhotoBlockSingleLine(line);
      if (photoInfo) {
        paragraphs.push(makePhotoPlaceholder(photoInfo));
        paragraphs.push(makePhotoCaption(photoInfo));
        isFirstParagraph = true;
      }
      continue;
    }
    
    // Photo block detection - multi-line format (v33 markdown)
    if (line.includes('┌─') || line.includes('\u250C')) {
      inPhotoBlock = true;
      photoLines = [];
      continue;
    }
    if (inPhotoBlock) {
      if (line.includes('┘') || line.includes('\u2518')) {
        inPhotoBlock = false;
        // Parse photo block
        const photoInfo = parsePhotoBlock(photoLines);
        if (photoInfo) {
          paragraphs.push(makePhotoPlaceholder(photoInfo));
          paragraphs.push(makePhotoCaption(photoInfo));
          isFirstParagraph = true; // Next paragraph after photo: no indent
        }
        continue;
      }
      photoLines.push(line);
      continue;
    }
    
    // Scene break (supports both "* * *" and "***")
    if (line.trim() === '* * *' || line.trim() === '***') {
      // Flush current paragraph
      if (currentPara.trim()) {
        paragraphs.push(makeBodyParagraph(currentPara.trim(), isFirstParagraph));
        isFirstParagraph = false;
        currentPara = '';
      }
      paragraphs.push(makeSceneBreak());
      isFirstParagraph = true;
      continue;
    }
    
    // Empty line = paragraph break
    if (line.trim() === '') {
      if (currentPara.trim()) {
        paragraphs.push(makeBodyParagraph(currentPara.trim(), isFirstParagraph));
        isFirstParagraph = false;
        currentPara = '';
      }
      continue;
    }
    
    // Accumulate paragraph text
    if (currentPara) {
      currentPara += ' ' + line;
    } else {
      currentPara = line;
    }
  }
  
  // Flush last paragraph
  if (currentPara.trim()) {
    paragraphs.push(makeBodyParagraph(currentPara.trim(), isFirstParagraph));
  }
  
  return paragraphs;
}

function parsePhotoBlock(lines) {
  let filename = '';
  let captionLines = [];
  
  for (const line of lines) {
    const trimmed = line.replace(/│/g, '').replace(/\u2502/g, '').trim();
    if (!trimmed) continue;
    
    const fileMatch = trimmed.match(/\{\{\s*(Photo|Image):\s*(.+?)\s*\}\}/);
    if (fileMatch) {
      filename = fileMatch[2];
    } else {
      captionLines.push(trimmed);
    }
  }
  
  return {
    filename: filename,
    caption: captionLines.join(' ').trim()
  };
}

function parsePhotoBlockSingleLine(line) {
  // Split on │ to get the content cells
  const parts = line.split(/│|\u2502/).map(s => s.replace(/[┌┐└┘─]/g, '').replace(/[\u250C\u2510\u2514\u2518\u2500]/g, '').trim()).filter(s => s);
  
  let filename = '';
  let captionParts = [];
  
  for (const part of parts) {
    const fileMatch = part.match(/\{\{\s*(Photo|Image):\s*(.+?)\s*\}\}/);
    if (fileMatch) {
      filename = fileMatch[2];
    } else if (part) {
      captionParts.push(part);
    }
  }
  
  return {
    filename: filename,
    caption: captionParts.join(' ').trim()
  };
}

function makePhotoPlaceholder(info) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 80 },
    children: [
      new TextRun({
        text: `[ PHOTO: ${info.filename} ]`,
        font: FONT,
        size: 18, // 9pt
        color: "999999",
        italics: true,
      }),
    ],
  });
}

function makePhotoCaption(info) {
  if (!info.caption) return new Paragraph({ children: [] });
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 240 },
    children: [
      new TextRun({
        text: info.caption,
        font: FONT,
        size: 17, // 8.5pt
        color: "4A4A4A",
        italics: true,
      }),
    ],
  });
}

function makeBodyParagraph(text, noIndent) {
  // Handle text that might have basic markdown italics/bold
  const runs = parseInlineFormatting(text);
  
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 120, line: LINE_SPACING },
    indent: noIndent ? {} : { firstLine: INDENT },
    children: runs,
  });
}

function parseInlineFormatting(text) {
  const runs = [];
  // Parse *italic* and **bold** markdown inline formatting
  // Split on italic/bold markers while preserving them
  const parts = text.split(/(\*{1,2}[^*]+?\*{1,2})/);
  
  for (const part of parts) {
    if (!part) continue;
    
    // Bold: **text**
    const boldMatch = part.match(/^\*\*(.+?)\*\*$/);
    if (boldMatch) {
      runs.push(new TextRun({
        text: boldMatch[1],
        font: FONT,
        size: BODY_SIZE,
        color: BODY_COLOR,
        bold: true,
      }));
      continue;
    }
    
    // Italic: *text*
    const italicMatch = part.match(/^\*(.+?)\*$/);
    if (italicMatch) {
      runs.push(new TextRun({
        text: italicMatch[1],
        font: FONT,
        size: BODY_SIZE,
        color: BODY_COLOR,
        italics: true,
      }));
      continue;
    }
    
    // Plain text
    runs.push(new TextRun({
      text: part,
      font: FONT,
      size: BODY_SIZE,
      color: BODY_COLOR,
    }));
  }
  
  if (runs.length === 0) {
    runs.push(new TextRun({
      text: text,
      font: FONT,
      size: BODY_SIZE,
      color: BODY_COLOR,
    }));
  }
  
  return runs;
}

function makeSceneBreak() {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: SCENE_BREAK_SPACE, after: SCENE_BREAK_SPACE, line: LINE_SPACING },
    children: [
      new TextRun({
        text: "***",
        font: FONT,
        size: BODY_SIZE,
        color: BODY_COLOR,
      }),
    ],
  });
}

// ── Build the document ──
const { sections, epigraphText, epigraphAttr, tocEntries } = parseManuscript(raw);

// ── v3: Updated part map for 34-chapter structure ──
// Part One: Prologue + Ch1-2 (Early Days)
// Part Two: Ch3-11 (Model N)
// Part Three: Ch12-17 (Castlight)
// Part Four: Ch18-21 (Apttus)
// Part Five: Ch22-29 (Benchling)
// Part Six: Ch30-34 (Seqera)
const partMap = {
  'Prologue': 'PART ONE \u2014 Early Days',
  'Chapter 1': 'PART ONE \u2014 Early Days',
  'Chapter 2': 'PART ONE \u2014 Early Days',
  'Chapter 3': 'PART TWO \u2014 Model N',
  'Chapter 4': 'PART TWO \u2014 Model N',
  'Chapter 5': 'PART TWO \u2014 Model N',
  'Chapter 6': 'PART TWO \u2014 Model N',
  'Chapter 7': 'PART TWO \u2014 Model N',
  'Chapter 8': 'PART TWO \u2014 Model N',
  'Chapter 9': 'PART TWO \u2014 Model N',
  'Chapter 10': 'PART TWO \u2014 Model N',
  'Chapter 11': 'PART TWO \u2014 Model N',
  'Chapter 12': 'PART THREE \u2014 Castlight',
  'Chapter 13': 'PART THREE \u2014 Castlight',
  'Chapter 14': 'PART THREE \u2014 Castlight',
  'Chapter 15': 'PART THREE \u2014 Castlight',
  'Chapter 16': 'PART THREE \u2014 Castlight',
  'Chapter 17': 'PART THREE \u2014 Castlight',
  'Chapter 18': 'PART FOUR \u2014 Apttus',
  'Chapter 19': 'PART FOUR \u2014 Apttus',
  'Chapter 20': 'PART FOUR \u2014 Apttus',
  'Chapter 21': 'PART FOUR \u2014 Apttus',
  'Chapter 22': 'PART FIVE \u2014 Benchling',
  'Chapter 23': 'PART FIVE \u2014 Benchling',
  'Chapter 24': 'PART FIVE \u2014 Benchling',
  'Chapter 25': 'PART FIVE \u2014 Benchling',
  'Chapter 26': 'PART FIVE \u2014 Benchling',
  'Chapter 27': 'PART FIVE \u2014 Benchling',
  'Chapter 28': 'PART FIVE \u2014 Benchling',
  'Chapter 29': 'PART FIVE \u2014 Benchling',
  'Chapter 30': 'PART SIX \u2014 Seqera',
  'Chapter 31': 'PART SIX \u2014 Seqera',
  'Chapter 32': 'PART SIX \u2014 Seqera',
  'Chapter 33': 'PART SIX \u2014 Seqera',
  'Chapter 34': 'PART SIX \u2014 Seqera',
};

// Track which parts we've already inserted
const insertedParts = new Set();

// Build all document sections
const docSections = [];

// ── SECTION 1: Title page ──
docSections.push({
  properties: {
    page: {
      size: { width: PAGE_W, height: PAGE_H },
      margin: { top: MARGIN_TOP, bottom: MARGIN_BOT, left: MARGIN_IN, right: MARGIN_OUT },
    },
    titlePage: true,
  },
  headers: { default: new Header({ children: [] }) },
  footers: { default: new Footer({ children: [] }), first: new Footer({ children: [] }) },
  children: [
    // Push title down
    new Paragraph({ spacing: { before: 1800 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: "Too Many Goats",
          font: FONT,
          size: 48, // 24pt
          bold: true,
          color: BODY_COLOR,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: "on the Mountain",
          font: FONT,
          size: 48,
          bold: true,
          color: BODY_COLOR,
        }),
      ],
    }),
    // Goat silhouette image placeholder
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 600 },
      children: [
        new TextRun({
          text: "[ IMAGE: goat_silhouette.png ]",
          font: FONT,
          size: 18,
          color: "999999",
          italics: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "Thirty Years Inside Silicon Valley Startups:",
          font: FONT,
          size: 28, // 14pt
          italics: true,
          color: "4A4A4A",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 720 },
      children: [
        new TextRun({
          text: "From the Dot Com Bubble to the BioTech Winter",
          font: FONT,
          size: 28,
          italics: true,
          color: "4A4A4A",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: AUTHOR,
          font: FONT,
          size: 32, // 16pt
          color: BODY_COLOR,
        }),
      ],
    }),
  ],
});

// ── SECTION 2: Table of Contents ──
const tocChildren = [
  new Paragraph({ spacing: { before: 960 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 480 },
    children: [
      new TextRun({
        text: "Contents",
        font: FONT,
        size: 36, // 18pt
        color: BODY_COLOR,
      }),
    ],
  }),
];

// ── v3: Updated TOC to match v33/v34 manuscript (34 chapters) ──
const tocParts = [
  { name: 'PART ONE \u2014 Early Days', chapters: [
    { num: 'Prologue', title: 'One in a Million' },
    { num: 'Chapter 1', title: 'I Should Have Been a Dentist' },
    { num: 'Chapter 2', title: 'Don\u2019t Call It SPAM' },
  ]},
  { name: 'PART TWO \u2014 Model N', chapters: [
    { num: 'Chapter 3', title: 'We Build Smarter Bricks' },
    { num: 'Chapter 4', title: 'Chargeback Betty' },
    { num: 'Chapter 5', title: 'Do You Want the Salad, or the Whole Enchilada?' },
    { num: 'Chapter 6', title: 'VEGAS BABY' },
    { num: 'Chapter 7', title: 'If You\u2019ve Seen One Rebate, You\u2019ve Seen One Rebate' },
    { num: 'Chapter 8', title: 'Mr. Larro, Welcome to Hyderabad' },
    { num: 'Chapter 9', title: 'You Mean You Expected It to Work?' },
    { num: 'Chapter 10', title: 'Ring That Bell' },
    { num: 'Chapter 11', title: 'Stick a Fork in Me Because I\u2019m Done' },
  ]},
  { name: 'PART THREE \u2014 Castlight', chapters: [
    { num: 'Chapter 12', title: 'Five Screens. How Hard Can It Be.' },
    { num: 'Chapter 13', title: 'The Sizzle and the Steak' },
    { num: 'Chapter 14', title: 'History May Not Repeat, but It Sure Does Rhyme' },
    { num: 'Chapter 15', title: 'Leadville and LeBron' },
    { num: 'Chapter 16', title: 'The Plumber' },
    { num: 'Chapter 17', title: 'JIFF. No, Not the Peanut Butter.' },
  ]},
  { name: 'PART FOUR \u2014 Apttus', chapters: [
    { num: 'Chapter 18', title: 'Rene, Rene, Rene' },
    { num: 'Chapter 19', title: 'What the F*** Have I Gotten Myself Into' },
    { num: 'Chapter 20', title: 'Dumpster Fire' },
    { num: 'Chapter 21', title: 'Lipstick on a Pig' },
  ]},
  { name: 'PART FIVE \u2014 Benchling', chapters: [
    { num: 'Chapter 22', title: 'Fujis Versus Honeycrisps' },
    { num: 'Chapter 23', title: 'What the Hell Is a Restriction Enzyme?' },
    { num: 'Chapter 24', title: 'Benchling for Dummies' },
    { num: 'Chapter 25', title: 'It Never Gets Easier, You Just Go Faster' },
    { num: 'Chapter 26', title: 'Aloha' },
    { num: 'Chapter 27', title: 'Gas on the Fire' },
    { num: 'Chapter 28', title: 'So Close' },
    { num: 'Chapter 29', title: 'Gut Punch' },
  ]},
  { name: 'PART SIX \u2014 Seqera', chapters: [
    { num: 'Chapter 30', title: 'D\u00E9j\u00E0 Vu' },
    { num: 'Chapter 31', title: 'Bienvenido a Seqera' },
    { num: 'Chapter 32', title: 'Wow, It\u2019s Early' },
    { num: 'Chapter 33', title: 'Free Is a Great Business Model Until It Isn\u2019t' },
    { num: 'Chapter 34', title: 'Biotech Winter' },
  ]},
  { name: 'Epilogue', chapters: [
    { num: 'Epilogue', title: 'It\u2019s a Small Valley. I\u2019m Sure Our Paths Will Cross Again.' },
  ]},
];

const TOC_SIZE = 19; // 9.5pt for TOC entries

for (const part of tocParts) {
  if (part.name === 'Epilogue') {
    tocChildren.push(new Paragraph({
      spacing: { before: 280, after: 80 },
      children: [
        new TextRun({
          text: 'Epilogue \u2014 ',
          font: FONT,
          size: TOC_SIZE,
          bold: true,
          color: BODY_COLOR,
        }),
        new TextRun({
          text: part.chapters[0].title,
          font: FONT,
          size: TOC_SIZE,
          italics: true,
          color: BODY_COLOR,
        }),
      ],
    }));
    continue;
  }
  tocChildren.push(new Paragraph({
    spacing: { before: 280, after: 80 },
    children: [
      new TextRun({
        text: part.name,
        font: FONT,
        size: TOC_SIZE,
        bold: true,
        color: BODY_COLOR,
      }),
    ],
  }));
  for (const ch of part.chapters) {
    const label = ch.num === 'Prologue' ? 'Prologue' : ch.num;
    tocChildren.push(new Paragraph({
      spacing: { after: 60 },
      indent: { left: 360 },
      children: [
        new TextRun({
          text: `${label} \u2014 `,
          font: FONT,
          size: TOC_SIZE,
          color: BODY_COLOR,
        }),
        new TextRun({
          text: ch.title,
          font: FONT,
          size: TOC_SIZE,
          italics: true,
          color: BODY_COLOR,
        }),
      ],
    }));
  }
}

docSections.push({
  properties: {
    type: SectionType.NEXT_PAGE,
    page: {
      size: { width: PAGE_W, height: PAGE_H },
      margin: { top: MARGIN_TOP, bottom: MARGIN_BOT, left: MARGIN_IN, right: MARGIN_OUT },
    },
    titlePage: true,
  },
  headers: { default: new Header({ children: [] }) },
  footers: { default: new Footer({ children: [] }), first: new Footer({ children: [] }) },
  children: tocChildren,
});

// ── SECTION 3: Epigraph page ──
docSections.push({
  properties: {
    type: SectionType.NEXT_PAGE,
    page: {
      size: { width: PAGE_W, height: PAGE_H },
      margin: { top: MARGIN_TOP, bottom: MARGIN_BOT, left: MARGIN_IN, right: MARGIN_OUT },
    },
    titlePage: true,
  },
  headers: { default: new Header({ children: [] }) },
  footers: {
    default: new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ font: FONT, size: 18, color: "666666", children: [PageNumber.CURRENT] })],
        }),
      ],
    }),
    first: new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ font: FONT, size: 18, color: "666666", children: [PageNumber.CURRENT] })],
        }),
      ],
    }),
  },
  children: [
    new Paragraph({ spacing: { before: 3600 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120, line: 300 },
      children: [
        new TextRun({
          text: `\u201C${epigraphText}\u201D`,
          font: FONT,
          size: 28, // 14pt
          italics: true,
          color: "4A4A4A",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: epigraphAttr,
          font: FONT,
          size: 24, // 12pt
          color: "666666",
        }),
      ],
    }),
  ],
});

// ── Build running header for chapter pages ──
function makeRunningHeader() {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: BOOK_TITLE,
            font: FONT,
            size: 16, // 8pt
            italics: true,
            color: "666666",
          }),
        ],
      }),
    ],
  });
}

function makePageFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            font: FONT,
            size: 18, // 9pt
            color: "666666",
            children: [PageNumber.CURRENT],
          }),
        ],
      }),
    ],
  });
}

// ── CHAPTER SECTIONS (including Epilogue and back matter) ──
for (const section of sections) {
  const children = [];
  
  // Check if we need a part header before this chapter
  const partName = partMap[section.number];
  if (partName && !insertedParts.has(partName)) {
    insertedParts.add(partName);
    // Insert part header as first element on this chapter's page
    children.push(
      new Paragraph({ spacing: { before: 2400 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 360 },
        children: [
          new TextRun({
            text: partName,
            font: FONT,
            size: 40, // 20pt
            bold: true,
            color: BODY_COLOR,
          }),
        ],
      }),
      // Page break after part header, then chapter starts on next page
      new Paragraph({ children: [new PageBreak()] }),
    );
  }
  
  // Chapter number / section heading
  let chNumText;
  if (section.number === 'Prologue') {
    chNumText = 'PROLOGUE';
  } else if (section.number === 'Epilogue') {
    chNumText = 'EPILOGUE';
  } else if (section.number === 'Where Are They Now' || section.number === 'How This Book Was Made') {
    // Back matter sections: use the section name as heading, no separate title
    chNumText = section.number.toUpperCase();
  } else {
    chNumText = section.number.toUpperCase();
  }
  
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: CH_NUM_BEFORE, after: CH_NUM_AFTER },
      children: [
        new TextRun({
          text: chNumText,
          font: FONT,
          size: 20, // 10pt
          bold: true,
          color: BODY_COLOR,
          characterSpacing: 120, // letterspacing
        }),
      ],
    })
  );
  
  // Chapter title (skip for back matter sections that use their name as the heading)
  if (section.title && section.number !== 'Where Are They Now' && section.number !== 'How This Book Was Made') {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: CH_TITLE_BEFORE, after: CH_TITLE_AFTER },
        children: [
          new TextRun({
            text: section.title,
            font: FONT,
            size: 36, // 18pt
            color: BODY_COLOR,
          }),
        ],
      })
    );
  }
  
  // Chapter content
  const bodyParas = buildChapterParagraphs(section.content);
  children.push(...bodyParas);
  
  docSections.push({
    properties: {
      type: SectionType.NEXT_PAGE,
      page: {
        size: { width: PAGE_W, height: PAGE_H },
        margin: { top: MARGIN_TOP, bottom: MARGIN_BOT, left: MARGIN_IN, right: MARGIN_OUT },
      },
      titlePage: true, // suppress header on first page of each chapter
    },
    headers: {
      default: makeRunningHeader(),
      first: new Header({ children: [] }), // suppress on chapter opener
    },
    footers: {
      default: makePageFooter(),
      first: makePageFooter(), // page numbers on all pages
    },
    children: children,
  });
}

// ── Generate ──
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: FONT,
          size: BODY_SIZE,
          color: BODY_COLOR,
        },
      },
    },
  },
  sections: docSections,
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/claude/TMG_Manuscript_Formatted.docx', buffer);
  console.log('Done. File size:', (buffer.length / 1024).toFixed(0), 'KB');
  console.log('Sections parsed:', sections.length);
  console.log('Sections:', sections.map(s => `${s.number}: "${s.title}"`).join('\n  '));
});
