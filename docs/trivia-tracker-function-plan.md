# Trivia Score Tracker — Function List (MoSCoW)

**Status key:** ✅ Implemented &nbsp;·&nbsp; ⚠️ Partially implemented &nbsp;·&nbsp; ❌ Not implemented

## Must Have (M)

| ID | Requirement | Status |
|---|---|---|
| FR-M01 | The system shall allow the user to enter a score for each question, per team. | ✅ `LiveScoring.jsx` |
| FR-M02 | The system shall track each team's scores throughout the event. | ✅ `repository.js` audit entries |
| FR-M03 | The system shall calculate and display the cumulative total score for each team. | ✅ `getTeamTotal()` |
| FR-M04 | *(Retired — superseded by FR-M15, which covers configuring the full question set during session creation.)* | — |
| FR-M05 | The system shall allow the user to enter a specific score value for a team's answer to a question, as an alternative to applying the default point value via a button (see UX-M05). | ✅ `LiveScoring.jsx` manual input |
| FR-M06 | The system shall allow the user to configure a specific default point value for each individual question. | ✅ `SessionCreate.jsx` per-question input |
| FR-M07 | The system shall allow questions to be grouped by category, with categories nested within rounds (round → category → question). | ✅ Data model matches exactly |
| FR-M08 | The system shall assign a unique identifier to each question, formatted as two uppercase letters followed by two digits (e.g., "MO01"). The letters are derived from the question's category name (FR-M34–M37); the digits number questions within that category, starting at 01. | ✅ `id.js` `deriveCategoryPrefix()` |
| FR-M09 | The system shall persist the active trivia event's data such that no data is lost if the score tracker's device closes, refreshes, or restarts (including accidental closure). Upon reopening the app, the score tracker shall regain full access to the same active session with all data intact. | ✅ `localStorage`-backed, single device |
| FR-M10 | The system shall permit only one device to act as the active score tracker (editor) per session; all other connected devices shall have view-only access to scores and the leaderboard. | ⚠️ Editor-role tracking exists (`editorDeviceToken`), but there is no real second device — the Join screen is a UI stub with no backend to connect to |
| FR-M11 | The system shall update the leaderboard immediately upon **save** of a question's scores (FR-M29), including saves that edit past questions. Values staged but not yet saved shall not affect the leaderboard. | ✅ Totals derive from saved audit entries only |
| FR-M12 | The system shall maintain an audit trail recording every point added to or deducted from any team, including the round, category, question, team, point value, and timestamp of each change. The audit trail shall be filterable by round, category, question, and team. | ✅ `getAuditEntries()`, `AuditTrail.jsx` |
| FR-M13 | The system shall allow the score tracker to deduct points from a team's score to account for rule violations or penalties. | ✅ `Deduction.jsx` |
| FR-M14 | The system shall allow the score tracker to end an active session, after which the system shall lock further edits to that session's scores. If past-session storage (FR-S02) is implemented, ended sessions shall be archived to it. | ✅ `endSession()` locks writes, archives |
| FR-M15 | The system shall allow the game master to create a session by configuring its rounds, the categories within each round, and the questions within each category, including a default point value for each question (see FR-M06 and FR-M27). | ✅ `SessionCreate.jsx` |
| FR-M16 | The system shall allow the game master to configure the number of participating teams and assign a name to each team during session creation. | ✅ `SessionCreate.jsx` |
| FR-M17 | The system shall allow the game master to optionally configure a special tie-breaker round during session creation, including a defined number of tie-breaker questions. The tie-breaker round shall be treated the same as any other round for scoring and leaderboard purposes (see UX-S01). | ✅ Treated identically in leaderboard/totals |
| FR-M18 | The system shall correctly compute the leaderboard and permit ending a session even if one or more configured questions were never activated or answered; unactivated questions shall contribute zero points and shall not cause an error. | ✅ Derived totals naturally zero out unscored questions |
| FR-M19 | The system shall provide a session identifier (e.g., a join code or QR code) that a view-only device can use to connect to the correct active session. | ⚠️ Code is generated and displayed; the actual connect action is a stub (needs FR-M23) |
| FR-M20 | The system shall restrict any point value entered (default point values, specific score entries, and deduction amounts) to zero or an integer between 1 and 100, inclusive, and shall reject entries outside this range or in a non-integer format. A staged value of zero on the live scoring screen (FR-M29) indicates nothing to save for that team; zero is never itself written as a recorded score, **except** as a deliberate correction to a team that already has a recorded score for that question (see FR-M50). | ✅ Validated in `LiveScoring.jsx`, `Deduction.jsx`, `SessionCreate.jsx` |
| FR-M21 | After a session has ended and further edits are locked (FR-M14), the system shall keep the leaderboard, the audit trail (FR-M12), and the score export (FR-C01, if implemented) accessible in view-only mode. | ✅ `FinalResults.jsx`; export clause is moot since FR-C01 isn't built |
| FR-M22 | The system shall not allow a team's cumulative total score to go below zero; any deduction that would reduce the total below zero shall cap the total at zero. | ✅ `getTeamTotal()` floors at zero |
| FR-M23 | Given the multi-device requirement (NFR-M01), the session's authoritative data shall be stored in a free-tier cloud database accessible to all connected devices. Local device storage shall serve only as a temporary cache/buffer to preserve unsaved entries during connectivity loss, and shall sync to the cloud database once connectivity is restored — it shall not be the sole store of record. | ❌ Not implemented — `localStorage` is currently the sole store (Option A), by explicit prior agreement pending backend setup |
| FR-M24 | When no session is active on a device, the system shall present the user with a choice to either (a) create and start a new session, becoming the active score tracker, or (b) join an existing active session as a view-only viewer using a session identifier (FR-M19). | ✅ `Landing.jsx` |
| FR-M25 | If a device previously acted as the active score tracker for a session that is still active, reopening the app on that device shall bypass the choice in FR-M24 and return the user directly to that session as the score tracker (see FR-M09). | ✅ `isReturningEditor()` + `Entry` route |
| FR-M26 | The system shall display the session identifier (FR-M19) to the score tracker on the home screen so it can be shared with participants who wish to join as view-only viewers. | ✅ `Home.jsx` |
| FR-M27 | The system shall allow the user to apply a common default point value to all questions within a category in a single action, as a faster alternative to configuring each question's point value individually (FR-M06). | ✅ `SessionCreate.jsx` "Apply to all questions" button |
| FR-M28 | The system shall allow the score tracker to rename any team at any point during an active session, not only during session creation. | ✅ `ManageTeams.jsx`, `renameTeam()` |
| FR-M29 | Score entries made with any scoring control on the live scoring screen shall be staged locally and shall not be committed to the audit trail, the team's cumulative total, or the question's scored status until the score tracker explicitly saves the question. | ✅ `LiveScoring.jsx` staged state, `saveQuestionScores()` |
| FR-M30 | Each single-value scoring control (a tap target or Full marks) shall be togglable: selecting the control that holds the team's currently staged value shall revert that team's staged value to zero rather than applying a deduction. | ✅ `LiveScoring.jsx` |
| FR-M31 | If more than one scoring control is used for the same team on the same question, the staged value shall be determined by whichever control was used most recently, with no restriction on switching between them. | ✅ `LiveScoring.jsx` `stagedVia` tracking |
| FR-M32 | A team with a staged value of zero and no previously recorded score for that question shall not generate an audit entry when the question is saved; this is equivalent to the question remaining unanswered for that team (see FR-M18). | ✅ `saveQuestionScores()` |
| FR-M33 | A question's scored status shall change only when the score tracker saves the question (FR-M29); it shall not change as a result of staging a value alone. | ✅ `saveQuestionScores()` |
| FR-M34 | The two-letter prefix of a question's identifier (FR-M08) shall be derived from its category's name as follows: for a one-word name, the first two characters of that word; for a two-word name, the first letter of each word; for a name of three or more words, the first letter of each of the first two words only. Hyphens shall be treated as word breaks. The result shall always be uppercase. | ✅ `deriveCategoryPrefix()` |
| FR-M35 | A category with no name entered shall use the placeholder prefix "XX" for its questions' identifiers until a name is entered, at which point the prefix shall be recalculated per FR-M34. | ✅ `deriveCategoryPrefix()` |
| FR-M36 | Renaming a category shall regenerate the identifiers of all of its questions to match the new name's derived prefix (FR-M34), renumbered sequentially from 01. | ✅ `SessionCreate.jsx`, `deriveCategoryPrefix()` |
| FR-M37 | If a category's derived prefix (FR-M34) is already in use by another category within the same session, the system shall attempt alternative two-letter prefixes drawn from the category's own name, in the following order, before falling back to an arbitrary unused prefix: (a) for a one-word name, other two-letter combinations of the first letter paired with each subsequent letter, in reading order; (b) for a multi-word name, initials of other word pairs, in reading order; (c) if no name-derived alternative is available, the first unused prefix in alphabetical order from AA through ZZ. | ✅ `deriveCategoryPrefix()` |
| FR-M38 | The system shall provide a Display mode, distinct from the editor role and from standard view-only joining, optimized for large screens (projector or desktop) and passive group viewing: no interactive scoring controls, large legible type, and automatic updates as scores are committed (see FR-M11). | ✅ `DisplayMode.jsx` — polls local storage every 2 s |
| FR-M39 | Display mode shall be accessible via the same session identifier used for view-only joining (FR-M19), selected as a mode at join time rather than requiring a separate identifier. | ⚠️ Mode selector built in `Join.jsx`; inherits FR-M19's same-device-only limitation |
| FR-M40 | For a question whose default point value is 5 or less, the scoring screen shall present, per team, a row of discrete tap targets numbered 1 through the default value (inclusive), allowing the score tracker to stage any value in that range in a single tap without typing. There shall be no separate zero target; a team with nothing selected scores zero (FR-M32), and selecting the staged target again clears it (FR-M30). | ✅ `LiveScoring.jsx` |
| FR-M41 | For a question whose default point value is greater than 5, the scoring screen shall present, per team, a Full marks control staging the full default value, plus a custom-entry control for staging any other whole number from 1 up to the default value. There shall be no separate zero control; a team with nothing staged scores zero (FR-M32), and selecting Full marks again clears it (FR-M30). | ✅ `LiveScoring.jsx` |
| FR-M42 | Display mode shall support three views matching the leaderboard's own breakdown: the entire game, per-round totals, and per-category totals. | ✅ `DisplayMode.jsx` |
| FR-M43 | The leaderboard screen shall provide a control to enter Display mode, opening it directly to whichever view (game, round, or category) was currently selected on the leaderboard screen at the time. | ✅ `Leaderboard.jsx` |
| FR-M44 | Within Display mode's per-round and per-category views, the top-ranked team within each group shall receive the same gold-highlight visual treatment used for the overall leader in the whole-game view, applied per group rather than reserved for a single overall leader. | ✅ `DisplayMode.jsx` |
| FR-M45 | The live scoring screen shall display the current question's position within its category (e.g., "Question 3 of 5") and a visual progress indicator across that category's questions, so the score tracker can always tell how far through the category they are without opening the navigation control. | ✅ `LiveScoring.jsx` |
| FR-M46 | When the score tracker moves into a question belonging to a different category than the current one — via the normal Save-and-next progression or the Back control (FR-M47), not manual navigation — the system shall display a distinct, clearly visible indication that a new category has begun. | ✅ `LiveScoring.jsx` |
| FR-M47 | The live scoring screen shall provide a Back control that navigates to the previous question in sequence without committing any values staged for the current question. On the first question of the session, the Back control shall be hidden or disabled. | ✅ `LiveScoring.jsx` |
| FR-M48 | The session-creation flow's point-value fields (the default point value, each category's common default, and each individual question's point value) shall present buttons for values 1 through 5, matching the live scoring screen's threshold (FR-M40); values greater than 5 shall be set via a custom numeric input. | ✅ `SessionCreate.jsx` |
| FR-M49 | In the session-creation flow's point-value fields, selecting a value button shall clear and disable the custom input; selecting the same button again shall deselect it and re-enable the input. The button and the input shall never both be active at once. | ✅ `SessionCreate.jsx` |
| FR-M50 | If a team already has a recorded score for a question, staging a value of zero for that team and saving the question shall write a correction entry with a point value of zero, reducing that team's recorded score for the question to zero. This is the sole exception to FR-M20's rule that zero is never written as a recorded score — it does not apply to a team with no existing recorded score for the question (see FR-M32, which continues to govern that case). | ✅ `saveQuestionScores()` |
| FR-M51 | The live scoring screen shall provide a single all-teams control that, in one action, stages the question's default point value for every team. | ✅ `LiveScoring.jsx` `toggleBulk()` |
| FR-M52 | Activating the all-teams control again (FR-M51) shall remove the points it added: every team still holding the value staged by that control shall revert to the value it held before the control was activated (zero on a fresh question). A team whose value was changed by hand after the control was activated shall keep that value. Like every other scoring control, this shall stage values only (FR-M29). | ✅ `LiveScoring.jsx` `toggleBulk()` |

## Should Have (S)

| ID | Requirement | Status |
|---|---|---|
| FR-S01 | The system shall display a leaderboard showing the running total score of all teams, ranked in order. | ✅ `Leaderboard.jsx` |
| FR-S02 | The system shall allow the user to store and view the results of past trivia sessions. | ✅ `PastSessions.jsx` |

## Could Have (C)

| ID | Requirement | Status |
|---|---|---|
| FR-C01 | The system shall allow the user to export the score tally and summary to a Microsoft Excel (.xlsx) file. | ❌ Not implemented |
| FR-C03 | The system shall display a running tally showing each team's score broken down question-by-question across the entire event, distinct from the ranked leaderboard summary (FR-S01). | ❌ Not implemented |

## Won't Have (W)

*(none listed yet)*

---

# Non-Functional Requirements

## Must Have (M)

| ID | Requirement | Status |
|---|---|---|
| NFR-M01 | The system shall be accessible via both mobile and web platforms concurrently, with score updates entered on one device reflected in near real-time on any other device or platform accessing the same active event. | ❌ Not implemented — single-device only, no sync layer |
| NFR-M02 | The system shall reflect score entries and leaderboard updates in near-real-time, with sub-second UI response. | ✅ Instant within the single device (synchronous state updates) |
| NFR-M03 | The system shall retain all event data without loss across app closure, page refresh, or device restart. | ✅ `localStorage` |
| NFR-M04 | The system shall prevent stored scores from being corrupted or silently overwritten by concurrent entries. | ⚠️ Moot rather than engineered — no concurrent-writer scenario exists yet since there's only ever one device; real test awaits FR-M23 |
| NFR-M05 | *(Revised)* The system shall optimize the editor (score tracker) interface for mobile touch input as its primary and only supported input surface. Large-screen support is provided through the separate, non-interactive Display mode (FR-M38) — not by adapting the editor UI to larger viewports. | ✅ |
| NFR-M06 | The system shall be easy for the user to operate and manage without requiring specialized technical knowledge. | ✅ Qualitative — simple form-based flows, no technical setup required |
| NFR-M07 | The system shall be implementable and maintainable with low development effort and cost. | ✅ Free/open-source stack, no paid backend in current build |

## Should Have (S)

| ID | Requirement | Status |
|---|---|---|
| NFR-S01 | The system shall provide a self-explanatory setup process that a user can complete without external documentation. | ✅ Qualitative — single-page form, no docs referenced |
| NFR-S02 | The system shall remain usable at venues with poor or intermittent connectivity by tolerating offline operation. | ✅ Trivially true currently — the app makes no network calls at all yet |
| NFR-S03 | The system's data model shall support querying and filtering by category or question ID. | ✅ `getAuditEntries()` filters by both |

## Won't Have (W)

*(none listed yet)*

**Note:** Where Must Have requirements conflict, **NFR-M07** (low
implementation effort/cost) takes precedence over **NFR-M01** (real-time
synchronous multi-device output).

---

## Implementation Review Notes

**Scoring-screen update (FR-M40/M41 reworded, FR-M51/M52 added).** Built on the latest
source (the version published from the September session), which also
brings FR-M28 onward — staged scoring, Display mode, Manage teams,
category-derived IDs, Back, 1–5 setup buttons, zero corrections — into
the repository for the first time.

- **No zero button.** The tap row now runs 1–N (≤5 pts) and the >5 pts
  variant is Full marks + Custom. Zero is still reachable: a team with
  nothing selected saves as 0, and tapping the staged control again
  clears it (FR-M30). Zero corrections (FR-M50) work the same way.
- **All-teams toggle (FR-M51/M52, UX-M37).** One button stages the default
  for every team. Tapping it again gives each team still holding the bulk
  value back its earlier value (0 on a fresh question); hand edits made
  after the bulk add stay. An Undo message follows.

## Earlier Implementation Review Notes

Two real bugs were found and fixed while producing this status table:

1. **FR-M11 / FR-M22 correctness bug** — editing a past score (a
   "correction" entry) was being **summed on top of** the original entry
   in `getTeamTotal()`, rather than replacing it. A team corrected from
   10 to 8 points was showing +18 instead of +8. Fixed: totals now take
   only the most recent entry per question per team; deductions still
   accumulate normally since they aren't tied to a question.

2. **UX-M15 regression** — the mockup-matching rewrite replaced
   auto-advance with a manual "Save and next question" button only,
   dropping the actual auto-advance behavior the requirement calls for.
   Fixed: the app now auto-advances once every team has a score for the
   current question (first-time scoring only — editing a past question
   no longer yanks you forward again), with the button retained as a
   manual way to move on early.

Also closed during this review: **FR-M20** had no real validation on
session-creation point-value inputs (only advisory HTML `min`/`max`).
`SessionCreate.jsx` now validates all point values as whole numbers
1–100 before a session can be created.
