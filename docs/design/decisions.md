# Design decisions

The choices that shape the code. Each was decided by the product owner;
the requirement docs' review notes hold the full history.

| # | Decision | Why | Consequence in code |
|---|---|---|---|
| D1 | **Stage scores, commit on Save** (replaced commit-per-tap) | A half-entered question never reaches the leaderboard or audit trail | Staged values live in `LiveScoring` state; `saveQuestionScores` is the only score writer (FR-M29, FR-M33) |
| D2 | **Totals are derived, never stored** | Corrections must replace, not add; history must stay complete | `getTeamTotal` uses the latest entry per question plus deductions, floored at 0 |
| D3 | **localStorage now, cloud DB later behind one module** | Ship fast at zero cost; keep the backend swap small | All storage access in `repository.js` (NFR-M07, FR-M23 pending) |
| D4 | **Polling, not real-time sync** | Lowest implementation cost | Display mode polls every 2 s; the planned backend uses the same pattern |
| D5 | **Editor is mobile-only; big screens get Display mode** | Desktop scoring was slower than a spreadsheet at a real event | No desktop editor layout; `DisplayMode.jsx` is read-only and dark (NFR-M05, FR-M38) |
| D6 | **Input variant by point value, threshold 5** | Tapping is faster than typing for small values | `TAP_ROW_MAX = 5`; setup uses the same `POINT_BUTTON_MAX = 5` (FR-M40, FR-M48) |
| D7 | **No 0 button; blank means 0** | Fewer targets; clearing is a tap on the selected value | Tap row is 1..N; Full marks toggles off (FR-M30, FR-M40, FR-M41) |
| D8 | **All-teams toggle restores earlier values and keeps hand edits** | "Everyone got it" is common; undo must not wipe deliberate edits | `preBulk` snapshot and `stagedVia = 'bulk'` tracking (FR-M51, FR-M52) |
| D9 | **Zero is written only as a correction** | Lets a tracker fix a wrong score to 0 without polluting fresh questions | `saveQuestionScores` special case (FR-M50) |
| D10 | **Overwrite prompt only on real changes** | Score-tracker feedback: prompt only when a recorded value actually changes | `hasActualChanges()` compares staged vs recorded (UX-M16) |
| D11 | **Question IDs from category names** | The ID tells the tracker the category at a glance | `deriveCategoryPrefix` with collision rules (FR-M34–M37) |
| D12 | **Fixed team order in scoring rows** | Rows must not move under a finger as totals change | Scoring and the pane use `getTeamsInOrder`, never the sorted leaderboard |
| D13 | **Category banner only on sequential moves** | Flag "you moved on" without nagging during deliberate jumps | `fromCategoryId` in navigation state from Save and Back only (FR-M46) |
| D14 | **Docs and code change in one commit** | Requirements, design, and code never drift | Docs live in this repo and deploy with it |

## Declined ideas

- **Skip action for questions a tracker falls behind on.** Proposed with
  the category banner; declined. Saving with blanks still marks a question
  scored.
- **Leader "by round" box on the Leaderboard.** Removed as confusing; the
  Round and Category tabs cover it.
