# Trivia Score Tracker — Glossary, Thresholds & Default Values

Reference for every app-specific term, numeric threshold, and default in
Tigu-Tiguay. Requirement IDs point to `trivia-tracker-function-plan.md`
(FR/NFR) and `trivia-tracker-ux-requirements.md` (UX).

---

## Part 1 — Glossary

### Roles and modes

| Term | Definition |
|---|---|
| **Score tracker (editor)** | The one device that creates the session and enters scores (FR-M10). |
| **Viewer** | A device that joins with the session code and sees scores view-only (FR-M19, UX-M17). |
| **Display mode** | A dark, non-interactive, large-screen leaderboard for a projector or TV, in whole-game, per-round, or per-category view (FR-M38, FR-M42, UX-M25). |
| **Session** | One trivia night: its rounds, categories, questions, teams, and audit trail. |
| **Join code** | The 6-character code shown on Home that viewers and displays enter (FR-M19, FR-M26). |

### Scoring

| Term | Definition |
|---|---|
| **Staged value** | A team's value for the current question held on screen only, not yet saved (FR-M29). |
| **Save (commit)** | "Save and next question" — writes staged values to the audit trail and marks the question scored (FR-M33, UX-M15). |
| **Tap row** | Per-team buttons numbered 1 to the question's default, for questions worth 5 or less (FR-M40, UX-M28). |
| **Full marks** | Per-team control staging the full default value, for questions worth more than 5 (FR-M41, UX-M29). |
| **Custom** | Per-team numeric input for any value from 1 to the default, for questions worth more than 5 (UX-M29). |
| **Toggle-to-clear** | Selecting the control that holds a team's staged value clears it back to 0 (FR-M30). |
| **All-teams button** | One button that stages the default for every team; tapping it again removes those bulk points and keeps hand edits (FR-M51, FR-M52, UX-M37). |
| **Hand edit** | Any change to a team's value made with that team's own controls, as opposed to the all-teams button. |
| **Last action wins** | When several controls touch one team, the most recent one sets the staged value (FR-M31). |
| **Scored question** | A question saved at least once; reopening it shows "Editing scored question" (UX-M05). |
| **Overwrite prompt** | The single confirmation shown when a save would change an existing recorded value (UX-M16). |
| **Category banner** | "Now in: [category]" shown when Save-and-next or Back crosses into a new category (FR-M46, UX-M33). |

### Audit trail

| Term | Definition |
|---|---|
| **Score entry** | Type `score` — a team's first recorded value for a question. |
| **Correction** | Type `correction` — a value that supersedes an earlier one for the same team and question. Only the latest counts toward totals; the history stays. |
| **Zero correction** | A correction with value 0, written only when a team that already has a score is reset to 0 (FR-M50). |
| **Deduction** | Type `deduction` — a penalty outside any question. Commits immediately, no staging (FR-M13). |
| **Audit trail** | The full log of scores, corrections, and deductions, filterable by round, category, question, and team (FR-M12). |

### Question IDs

| Term | Definition |
|---|---|
| **Category-derived prefix** | A question ID's two letters, computed from its category's name (FR-M34). |
| **Placeholder prefix** | `XX` — used by an unnamed category until it gets a name (FR-M35). |
| **Prefix collision resolution** | The fallback order when two categories would derive the same prefix: other letter pairs from the name, then the first free pair from AA to ZZ (FR-M37). |

---

## Part 2 — Thresholds & Numeric Constants

| Constant | Value | Where it applies | Source |
|---|---|---|---|
| **Point value range** | 1–100 (whole numbers) | Recorded scores, default point values, deduction amounts. 0 is valid as a staged "nothing to save" value, and is written only as a zero correction. | FR-M20, FR-M50 |
| **Tap-row / Full-marks threshold** | **5** | A question worth 5 or less gets the 1–N tap row; worth more than 5 gets Full marks + Custom. | FR-M40, FR-M41 · `TAP_ROW_MAX` in `LiveScoring.jsx` |
| **Custom input range** | 1 to the question's default | Live scoring Custom input. | UX-M29 |
| **Session-creation point buttons** | **1–5** | Default point value, category common default, and each question's value. Custom input above 5. | FR-M48 · `POINT_BUTTON_MAX` in `SessionCreate.jsx` |
| **Question ID format** | 2 letters + 2 digits | e.g. `MO01`; digits restart at 01 in each category. | FR-M08 |
| **Join code length** | 6 characters | Letters and digits, excluding look-alikes (I, O, 0, 1). | `makeJoinCode()` in `id.js` |
| **Display mode refresh interval** | 2 seconds | How often Display mode re-reads saved scores. | `DISPLAY_REFRESH_MS` in `DisplayMode.jsx` |
| **Category-transition vibration** | 60 ms | Haptic buzz when a new category begins, where the device supports it. | `LiveScoring.jsx` |
| **Undo message duration** | 4.5 seconds | How long the all-teams undo message stays on screen. | `LiveScoring.jsx` |
| **Score floor** | 0 | A team's total never drops below zero. | FR-M22 |
| **Prefix collision fallback** | AA → ZZ | Alphabetical scan, used only when a name yields no free alternative. | FR-M37 |

---

## Part 3 — Default Values

Starting values pre-filled for convenience. Each can be changed before it
takes effect.

### Session creation

| Field | Default | Source |
|---|---|---|
| Number of teams | 3, named "Team 1", "Team 2", "Team 3" | UX-M23 |
| Rounds and categories | Round 1: Current Events (CE), Science (SC), Geography (GE) · Round 2: Pop Culture (PC), Math (MA), History (HI) · Round 3: Famous Movie Lines (FM), Name that Song (NT) | UX-M23 |
| Questions per category | 5 | UX-M23 |
| Default point value per question | **1** | UX-M23 |
| Tie-breaker round | Off | `SessionCreate.jsx` |
| Tie-breaker question count (once on) | 3 | `SessionCreate.jsx` |

### Live scoring & deduction

| Field | Default | Source |
|---|---|---|
| Staged value on a never-scored question | 0 for every team | FR-M29, FR-M32 |
| Staged value on a scored question | Each team's latest recorded value | UX-M08 |
| All-teams button | Off on every question | FR-M51 |
| Deduction amount | **1** | `Deduction.jsx` |

---

## Part 4 — Maintaining this document

Update this file in the same pass as the requirement docs and code
whenever a term, threshold, or default changes.
