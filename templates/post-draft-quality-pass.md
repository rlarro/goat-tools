# Post-Draft Quality Pass

**Purpose:** Run these five passes on every first draft before delivering it. Copy-paste this prompt after generating a draft. The goal is to catch the most common AI writing problems systematically.

This quality pass was developed over the course of writing a 34-chapter, 80,000-word memoir. Every pass exists because it caught a specific problem the previous passes missed. The order matters.

---

## Prompt

You just generated a first draft. Before delivering it, run the following five passes in order. Make all fixes directly to the file. Do not deliver until all five passes are complete.

### Pass 1: Style Violations (automated)

Run grep checks for hard rule violations defined in your style guide. Fix every hit.

```bash
# Em dashes (adjust based on your style guide rules)
grep -n '—' [FILE]

# Semicolons in narrative prose
grep -n ';' [FILE] | grep -v '^\s*#'

# Colons as literary devices (colons before lists are usually OK)
grep -n ':' [FILE] | grep -v '^\s*#\|^\s*│\|Photo:\|caption'

# Banned phrases (customize this list from your style guide)
grep -ni "and that's when I\|looking back\|journey\|learnings\|buckle up\|I realized that" [FILE]
```

Customize the banned phrases list to match your style guide's banned constructions.

### Pass 2: Repetition Scan (automated + manual)

Run a word/phrase frequency check. Any word or phrase appearing 3+ times is a flag. 2x is a flag if they're within a page of each other.

```bash
# Common AI-ism adjectives and descriptors
for word in "amazing" "brilliant" "extraordinary" "incredible" "impressive" "spectacular" "remarkable" "stunning" "massive" "enormous" "staggering" "genuine" "real" "clear" "great" "simple" "complex" "deep" "beautiful" "talented" "capable"; do
  count=$(grep -oi "\b$word\b" [FILE] | wc -l)
  if [ "$count" -gt 1 ]; then echo "$word: $count"; fi
done

# Filler words and common crutches
for phrase in "realization" "realize" "became clear" "becoming clear" "starting to" "started to" "I knew" "I'd never" "exactly" "literally" "essentially" "basically" "honestly" "genuinely" "straightforward" "just a" "just another" "the exact same" "unlike anything" "for the first time"; do
  count=$(grep -oi "$phrase" [FILE] | wc -l)
  if [ "$count" -gt 1 ]; then echo "\"$phrase\": $count"; fi
done
```

For every flag, `grep -n` to see exact locations. Fix by varying the word, cutting one instance, or leaving it only if the repetition is intentional and earned (a callback, a deliberate echo).

### Pass 3: Compression ("six sentences when three will do")

Read the draft looking for passages where multiple consecutive sentences make the same point. Common patterns:

- Three sentences that all establish the same credential or competence
- Scene descriptions that narrate the same action from multiple angles
- Transitional passages that over-explain what the reader is about to see
- Paragraphs that tell the reader what to feel about what just happened

For each instance: can you cut sentences without losing substance? If the paragraph still works with a sentence removed, the sentence was dead weight.

Also check for run-on paragraphs (8+ sentences) that should be broken into two.

### Pass 4: Project-Specific Checks

This is the pass you customize for your book. Every project has failure modes that the universal passes above won't catch. You discover them by finding problems in drafts and adding a check that prevents them from recurring.

Start with one or two checks. Add more as you go. Here are examples from real projects to show the range:

**Example: "Me-me-me" check (first-person memoir).** The narrator was the sole agent of every action. Every scene read as "I figured this out, I saved this, I built this." The check: are other characters driving scenes they should be driving? Does the narrator frame other people's qualities as their own discovery rather than the other person's accomplishment? Fix by giving other characters agency and verbs.

**Example: "Trust the reader" check (any narrative nonfiction).** Chapters kept explaining their own points after making them. A paragraph would tell a story, then the next paragraph would explain what the story meant. The check: does any paragraph start explaining what the previous paragraph already showed? If the reader would get it without the explanation, cut the explanation.

**Example: "No villains" check (memoir with real people).** First drafts of chapters about difficult situations read as dysfunction portraits. The check: is this chapter fair to the people in it? If it was all bad, why did smart people stay? What was genuinely good? Add the honest counterweight.

**Example: "Anachronism" check (historical narrative).** Claude would use modern phrasing in scenes set decades earlier. The check: does the language feel right for the period? Would this character have said it this way?

Your project will develop its own. When you fix something that the first three passes missed, write the check that would have caught it, and add it here.

### Pass 5: Editor's Read (fresh eyes)

Read the entire chapter top to bottom as if you've never seen it. You are an external editor who was just handed this manuscript. Check:

**Flow and transitions:**
- Does each section break land cleanly?
- Are there abrupt topic jumps that need a bridge sentence?
- Does the opening pull you in?
- Does the closing earn its landing?

**Clarity:**
- Any sentences where the meaning is ambiguous?
- Any phrases that assume context the reader doesn't have?
- Any pronouns with unclear antecedents?

**Pacing:**
- Any sections that drag? Where you'd start skimming?
- Any sections that feel rushed?
- Does the chapter earn its length?

**Voice:**
- Does it sound like the target voice from the style guide, or like a writer constructing a scene?
- Any sentences that feel "composed at a desk"?
- Any passages that sound like a different genre than intended?

After all five passes, report what you found and fixed, then deliver the file.

---

## How to use this

1. **Run it on every first draft.** No exceptions. The passes catch things you won't see on a casual read.

2. **Customize Pass 1 and Pass 2.** The grep patterns should match your style guide's specific rules and banned phrases. Add your own AI tells as you discover them.

3. **The order matters.** Style violations first (mechanical, fast). Repetition second (semi-automated). Compression third (requires judgment). Project-specific checks fourth (requires deep knowledge of your book's particular failure modes). Editor's read last (requires the freshest possible eyes, after everything else is cleaned up).

4. **Pass 4 is where your project lives.** The first three passes and Pass 5 are universal. Pass 4 is yours. It starts empty and grows as you discover what your book specifically gets wrong. By the end of a 30-chapter project, you might have five or six checks in there. Every one traces back to a specific draft that went sideways.

---

## Real Example: How This Looked in Practice on *Too Many Goats on the Mountain*

By the end of 34 chapters, the TMG quality pass had accumulated these project-specific checks in Pass 4:

1. **Me-me-me check.** First-person memoir where the narrator kept being the hero of every scene. Fix: give other characters agency and verbs.
2. **Trust the reader.** Chapters kept explaining their own points after making them. Fix: if a paragraph explains what the previous paragraph showed, cut it.
3. **No villains check.** First drafts of difficult chapters read as dysfunction portraits. Fix: add the honest counterweight. Why did smart people stay?
4. **Credentialing check.** Claude would insert resume-style framing ("Having spent twenty years building..."). Fix: let the story show competence, never announce it.
5. **Superlative audit.** "The hardest decision of my career" appeared in Chapter 16, but harder decisions came later. Fix: save the big words for where they actually earn their place, relative to the whole book.

None of these existed at the start. Each one was added after catching a specific problem in a specific draft. By the end of the project, running the full five-pass quality check on a chapter took about fifteen minutes and caught problems that would have taken much longer to find during editing.
