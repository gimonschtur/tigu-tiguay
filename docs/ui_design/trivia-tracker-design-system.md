# Trivia Score Tracker — Visual Design System: Barako Coastal

Reference document for the app's visual identity, grounded in the actual
venue (ThirdTry Coffee, Borongan, Eastern Samar). Use this to keep future
mockups and UI decisions consistent.

---

## Color Palette

| Swatch | Hex       | Name           | Role                                                                             |
|--------|-----------|----------------|----------------------------------------------------------------------------------|
| 🟫     | `#3B2417` | Espresso brown | Structural chrome — top bar, persistent pane, primary text on light backgrounds  |
| ⬜      | `#F1E4D0` | Warm cream     | Primary background                                                               |
| 🟩     | `#1F7A72` | Coastal teal   | Primary action — "add point" button, positive scoring actions                    |
| 🟨     | `#C98A2B` | Marigold gold  | Highlight/emphasis — leaderboard #1 spot, top-team badges, key callouts          |
| 🟧     | `#D9714E` | Soft coral     | Deduction/alert actions — point deduction button, warnings, confirmation prompts |

**Supporting neutral:** `#FBF6EC` (card background, one shade lighter than the
primary cream) — use for individual team rows/cards sitting on the main
cream background, so cards read as distinct surfaces.

**Muted text:** `#8A6A4A` (a desaturated brown) — use for secondary text
like question counters, timestamps, or helper labels.

### Semantic usage rules
- **Teal** = adding points / primary confirming actions. Never use for deduction.
- **Coral** = deducting points / destructive or warning actions. Never use for adding points.
- **Gold** = status/rank highlight only (leaderboard leader, badges). Not a button color.
- **Espresso brown** = structural surfaces (bars, panes), not buttons.
- Avoid using more than one accent (teal/gold/coral) in the same interactive control — each color should map to one meaning throughout the app.

---

## Typography

| Role                 | Typeface | Notes                                                                            |
|----------------------|----------|----------------------------------------------------------------------------------|
| Display / headers    | Fraunces | Warm serif with personality — round titles, category names, leaderboard headings |
| Body / UI / numerals | Manrope  | Clean geometric sans — team names, labels, buttons, and all score numbers        |

**Numerals rule:** All score values must use tabular figures (fixed-width
digits) so numbers don't visually shift as they update live — this matters
for legibility during fast-paced scoring.

---

## Layout Principles

- Warm cream base, with espresso brown reserved for chrome (top bar, bottom persistent pane) — not full-screen backgrounds.
- Cards (team rows, question cards) sit on the cream background using the lighter `#FBF6EC` surface, with soft rounded corners (~12px).
- One accent color per interactive element — no gradients, no mixed accent buttons.
- Icons: simple outline style, no filled/decorative icon sets, to match the flat/clean aesthetic.

---

## How to keep this available in future conversations

This file is currently saved as a project output, not part of the
Project's permanent file set. To make sure future chats in this Project
can reference it automatically:

1. Download this file from the conversation.
2. Open your Claude Project settings and upload it into the Project's
   knowledge/files section.

Once it's part of the Project files (alongside your requirements docs),
any future conversation in this Project will have it available the same
way the requirements documents are available now.
