# Plan: IELTS Listening Inline Table-Completion

## Goal
Create a dedicated **table-completion renderer** that displays a two-column table with dark headers and inline input boxes, matching the classic IELTS format. Also enhance the generic inline input styling.

---

## Current State

The system already has an inline answer box mechanism via `InlinePassage` in `IeltsListeningFormat.jsx`:
- Admin puts `___21___`, `___22___` etc. placeholders in the passage HTML
- `InlinePassage` replaces these with `<input>` elements inline
- Questions without placeholders render as standalone cards below

**Problem:** The current visual style is just plain `<input>` boxes — it doesn't match the IELTS table format with dark headers, red question numbers, and dotted underlines.

---

## Target Visual (from IELTS reference image)

```
┌──────────────────────────┬────────────────────────┐
│  GROUP TOUR (dark bg)    │  DETAILS (dark bg)     │
│  (white text, bold)      │  (white text, bold)    │
├──────────────────────────┼────────────────────────┤
│ Beachcombers and         │ exploring rock pools   │
│ Rock - (12) [________]   │ away from the          │
│                          │ (13) [________]        │
│ Guided Forest walk       │ to catch lunch         │
│ Beach Expedition         │ departs at             │
│                          │ (14) [________]        │
│ Moonlight Forest Walk    │ departs at sundown     │
│ the (15) [________]      │                        │
└──────────────────────────┴────────────────────────┘
```

Key visual elements:
- Dark header row (`bg-slate-900 text-white`)
- Clean cell borders
- Inline inputs with dotted underline inside cells
- Red question numbers `(12)` in red font
- Alternating row subtle background
- Input expands to fit content

---

## Changes

### Change 1: Restyle Inline Inputs in `InlinePassage`

**File:** `IeltsListeningFormat.jsx` lines 152-191

**Current:** Plain `<input>` with border styling
```html
<input class="inline-block px-3 py-1 text-sm font-bold bg-white border-2 rounded-lg ..." />
```

**New:** IELTS-style dotted underline input
- Input shows as `________` with a dotted bottom border instead of a box
- Question number `(12)` displayed before the input in bold red
- On focus: subtle primary background highlight
- On submit: green/red background tint with badge

The HTML template in the `replace()` callback (line 177) will be updated.

---

### Change 2: New `TableCompletionRenderer` Component

**File:** `IeltsListeningFormat.jsx` — add new component (~120 lines)

This component detects when the passage contains a markdown table with `___id___` placeholders and renders it as a proper IELTS-style table.

**Architecture:**
1. Parse the markdown table rows from the passage HTML (already parsed by `convertMarkdownTablesToHtml`)
2. Identify cells containing `___id___` placeholders
3. Render as a `<table>` with React (not `dangerouslySetInnerHTML`)
4. Replace placeholder cells with inline `<input>` components
5. Connect to the same `answers` / `onAnswerChange` system

**Props:** Same as `InlinePassage` — `passage`, `questions`, `answers`, `onAnswerChange`, `submitted`, `result`, `offset`

**Styling:**
- Header row: `bg-slate-900 text-white font-black text-xs uppercase tracking-widest`
- Data rows: alternating `bg-white` / `bg-slate-50/30`
- Cells: `border border-slate-200 p-4 text-sm text-slate-700`
- Inline inputs: dotted bottom border, red question number prefix
- Submitted state: green/red tint with checkmark/cross badge

---

### Change 3: Auto-Detection in `IeltsListeningFormat`

**File:** `IeltsListeningFormat.jsx` lines 568-579

Add logic to detect if the passage is primarily a table with inline gaps:

```js
const hasTableCompletion = /___([\w-]+)___/.test(activeSet.passage)
    && /^\|.+\|$/m.test(activeSet.passage);
```

**Rendering logic:**
```
if (hasTableCompletion) {
    → Render <TableCompletionRenderer />
} else if (hasInlinePlaceholders) {
    → Render <InlinePassage /> (existing, with restyled inputs)
} else {
    → Render raw passage + standalone questions
}
```

---

### Change 4: Update `ListeningInlineGuide.jsx`

**File:** `ListeningInlineGuide.jsx`

Currently only shows for Parts 3 & 4. Update to:
- Show for **all parts** (Part 1 form completion also uses tables)
- Add a dedicated **table template** matching the IELTS format
- Include copy-paste ready example with two-column table

---

## Files to Modify

| # | File | Change | Lines Affected |
|---|------|--------|----------------|
| 1 | `IeltsListeningFormat.jsx` | Restyle `InlinePassage` inputs | ~152-191 |
| 2 | `IeltsListeningFormat.jsx` | Add `TableCompletionRenderer` component | New ~120 lines |
| 3 | `IeltsListeningFormat.jsx` | Auto-detect table passages | ~568-579 |
| 4 | `ListeningInlineGuide.jsx` | Show for all parts + table template | Full file |

**No backend changes needed** — the data model already supports this via the `passage` field with `___id___` placeholders.

---

## Admin Workflow (No Changes Needed)

Admins already create tables like this in the passage field:

```
| GROUP TOUR | DETAILS |
|---|---|
| Beachcombers and Rock - (12) ___l12___ | away from the (13) ___l13___ |
| Guided Forest walk | to catch lunch |
| Beach Expedition | departs at (14) ___l14___ |
| Moonlight Forest Walk | departs at sundown |
| the (15) ___l15___ | |
```

The new renderer will automatically detect this format and display it in IELTS style.

---

## Implementation Order

1. Restyle `InlinePassage` inputs (smallest change, immediate visual improvement)
2. Add `TableCompletionRenderer` component
3. Add auto-detection logic in `IeltsListeningFormat`
4. Update `ListeningInlineGuide.jsx`

---

## Dependencies

- `convertMarkdownTablesToHtml` — already parses markdown tables into HTML
- `collapseListeningExampleBlocks` — already strips example blocks
- `useAnswers` hook — flat `{ [qId]: value }` dictionary (no changes needed)
- `useEvaluate` hook — case-insensitive trimmed string comparison (no changes needed)
