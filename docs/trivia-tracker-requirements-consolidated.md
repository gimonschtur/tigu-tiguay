# Trivia Score Tracker — Consolidated Requirements (Grouped by Function)

All functional (FR), non-functional (NFR), and UI/UX (UX) requirements,
reorganized by functional area instead of by document. MoSCoW priority is
retained on every item. Original IDs are preserved for traceability back
to `trivia-tracker-function-plan.md` and `trivia-tracker-ux-requirements.md`.

**Status key:** ✅ Implemented &nbsp;·&nbsp; ⚠️ Partially implemented &nbsp;·&nbsp; ❌ Not implemented

---

## 1. Session Setup & Configuration

| ID | Priority | Requirement | Status |
|---|---|---|---|
| FR-M15 | Must | The system shall allow the game master to create a session by configuring its rounds, the categories within each round, and the questions within each category, including a default point value for each question (see FR-M06 and FR-M27). | ✅ |
| FR-M16 | Must | The system shall allow the game master to configure the number of participating teams and assign a name to each team during session creation. | ✅ |
| FR-M17 | Must | The system shall allow the game master to optionally configure a special tie-breaker round during session creation, including a defined number of tie-breaker questions. The tie-breaker round shall be treated the same as any other round for scoring and leaderboard purposes (see UX-S01). | ✅ |
| FR-M06 | Must | The system shall allow the user to configure a specific default point value for each individual question. | ✅ |
| FR-M27 | Must | The system shall allow the user to apply a common default point value to all questions within a category in a single action, as a faster alternative to configuring each question's point value individually (FR-M06). | ✅ |
| FR-M07 | Must | The system shall allow questions to be grouped by category, with categories nested within rounds (round → category → question). | ✅ |
| FR-M08 | Must | The system shall assign a unique identifier to each question, formatted as two uppercase letters followed by two digits (e.g., "MO01"). The letters are derived from the question's category name (FR-M34–M37); the digits number questions within that category, starting at 01. | ✅ |
| FR-M34 | Must | The two-letter prefix of a question's identifier (FR-M08) shall be derived from its category's name as follows: for a one-word name, the first two characters of that word; for a two-word name, the first letter of each word; for a name of three or more words, the first letter of each of the first two words only. Hyphens shall be treated as word breaks. The result shall always be uppercase. | ✅ |
| FR-M35 | Must | A category with no name entered shall use the placeholder prefix "XX" for its questions' identifiers until a name is entered, at which point the prefix shall be recalculated per FR-M34. | ✅ |
| FR-M36 | Must | Renaming a category shall regenerate the identifiers of all of its questions to match the new name's derived prefix (FR-M34), renumbered sequentially from 01. | ✅ |
| FR-M37 | Must | If a category's derived prefix (FR-M34) is already in use by another category within the same session, the system shall attempt alternative two-letter prefixes drawn from the category's own name, in the following order, before falling back to an arbitrary unused prefix: (a) for a one-word name, other two-letter combinations of the first letter paired with each subsequent letter, in reading order; (b) for a multi-word name, initials of other word pairs, in reading order; (c) if no name-derived alternative is available, the first unused prefix in alphabetical order from AA through ZZ. | ✅ |
| FR-M48 | Must | The session-creation flow's point-value fields (the default point value, each category's common default, and each individual question's point value) shall present buttons for values 1 through 5, matching the live scoring screen's threshold (FR-M40); values greater than 5 shall be set via a custom numeric input. | ✅ |
| FR-M49 | Must | In the session-creation flow's point-value fields, selecting a value button shall clear and disable the custom input; selecting the same button again shall deselect it and re-enable the input. The button and the input shall never both be active at once. | ✅ |
| UX-M23 | Must | The session-creation flow shall pre-populate sensible defaults to speed up setup: three teams; three rounds — Round 1 (Current Events, Science, Geography), Round 2 (Pop Culture, Math, History), Round 3 (Famous Movie Lines, Name that Song); five questions per category; and a default point value of 1. All defaults shall remain fully editable — addable, removable, and renameable — before the session starts. | ✅ |
| UX-M35 | Must | Each point-value field in the session-creation flow shall present buttons for values 1 through 5, plus a custom input for values greater than 5 — matching the live scoring screen's own threshold and visual treatment (UX-M28) for consistency. | ✅ |
| UX-M36 | Must | In the session-creation flow's point-value fields, the value button and the custom input shall be mutually exclusive: selecting a button clears and disables the input; selecting the already-active button again deselects it and re-enables the input; typing into the input (once enabled) stages that value directly. | ✅ |
| UX-M11 | Must | The system shall provide a session-creation flow, completed before UX-M01 (starting the session), in which the game master configures rounds, the categories within each round, and the questions within each category, including a default point value for each question (FR-M15). | ✅ |
| UX-M22 | Must | During session creation, each category shall provide a button to apply a common default point value to all of its questions at once, in addition to the ability to set each question's point value individually (FR-M27). | ✅ |
| UX-M12 | Must | The session-creation flow shall allow the game master to specify the number of participating teams and enter each team's name (FR-M16). | ✅ |
| UX-M13 | Must | The session-creation flow shall allow the game master to optionally add a tie-breaker round, including a defined number of tie-breaker questions (FR-M17). The tie-breaker round shall appear and score identically to any other round. | ✅ |
| NFR-S01 | Should | The system shall provide a self-explanatory setup process that a user can complete without external documentation. | ✅ |
| FR-M04 | *Retired* | *(Superseded by FR-M15, which covers configuring the full question set during session creation.)* | — |

---

## 2. Session Lifecycle (Start / End)

| ID | Priority | Requirement | Status |
|---|---|---|---|
| FR-M24 | Must | When no session is active on a device, the system shall present the user with a choice to either (a) create and start a new session, becoming the active score tracker, or (b) join an existing active session as a view-only viewer using a session identifier (FR-M19). | ✅ |
| UX-M18 | Must | Upon opening the app with no active session in progress, the system shall display a landing screen with two options: "Start a session" (leading to the session-creation flow, UX-M11) and "Join a session" (leading to the session-join screen, UX-M17). | ✅ |
| FR-M25 | Must | If a device previously acted as the active score tracker for a session that is still active, reopening the app on that device shall bypass the choice in FR-M24 and return the user directly to that session as the score tracker (see FR-M09). | ✅ |
| UX-M19 | Must | If the device was already acting as the score tracker for an active session (FR-M25), the app shall skip the landing screen (UX-M18) on reopen and return directly to that session's home screen (UX-M02). | ✅ |
| UX-M01 | Must | The system shall allow the score tracker to start a session for a trivia night. | ✅ |
| FR-M14 | Must | The system shall allow the score tracker to end an active session, after which the system shall lock further edits to that session's scores. If past-session storage (FR-S02) is implemented, ended sessions shall be archived to it. | ✅ |
| UX-M10 | Must | The system shall provide a control, accessible from the home screen, allowing the score tracker to end the active session. The system shall display a confirmation prompt before ending the session, since doing so locks further edits (FR-M14). | ✅ |
| FR-M21 | Must | After a session has ended and further edits are locked (FR-M14), the system shall keep the leaderboard, the audit trail (FR-M12), and the score export (FR-C01, if implemented) accessible in view-only mode. | ✅ (export clause moot — FR-C01 not built) |
| FR-M18 | Must | The system shall correctly compute the leaderboard and permit ending a session even if one or more configured questions were never activated or answered; unactivated questions shall contribute zero points and shall not cause an error. | ✅ |
| UX-M14 | Must | The leaderboard and the end-session flow shall handle questions that were never activated or answered without error, treating them as contributing zero points (FR-M18). | ✅ |

---

## 3. Navigation & Home Screen

| ID | Priority | Requirement | Status |
|---|---|---|---|
| UX-M02 | Must | Upon starting a session, the system shall display a home screen showing the list of categories grouped by round, along with a button to access the leaderboard. | ✅ |
| UX-M03 | Must | The system shall provide access to the home screen from every other screen. | ✅ (in-session screens; not applicable to pre/post-session screens) |
| UX-M04 | Must | Each screen shall include a navigation control that allows the score tracker to navigate directly to a specific round, category, or question. | ✅ |
| FR-M28 | Must | The system shall allow the score tracker to rename any team at any point during an active session, not only during session creation. | ✅ |
| UX-M24 | Must | The system shall provide a "Manage teams" screen, accessible from the home screen via an edit control, allowing the score tracker to rename any team at any point during an active session (FR-M28). | ✅ |
| UX-M07 | Must | The system shall display a persistent pane on all screens containing: (a) access to the home screen, (b) access to each round, category, and question, (c) a summary of each team's running total score, (d) access to the score deduction screen (UX-M09), and (e) access to the audit trail screen (UX-M21). | ✅ |
| UX-C01 | Could | The system shall visually indicate which questions have already been scored versus which remain unanswered, from the navigation control. | ✅ |

---

## 4. Live Scoring

| ID | Priority | Requirement | Status |
|---|---|---|---|
| FR-M01 | Must | The system shall allow the user to enter a score for each question, per team. | ✅ |
| FR-M05 | Must | The system shall allow the user to enter a specific score value for a team's answer to a question, as an alternative to applying the default point value via a button (see UX-M05). | ✅ |
| FR-M02 | Must | The system shall track each team's scores throughout the event. | ✅ |
| FR-M03 | Must | The system shall calculate and display the cumulative total score for each team. | ✅ |
| FR-M20 | Must | The system shall restrict any point value entered (default point values, specific score entries, and deduction amounts) to zero or an integer between 1 and 100, inclusive, and shall reject entries outside this range or in a non-integer format. A staged value of zero on the live scoring screen (FR-M29) indicates nothing to save for that team; zero is never itself written as a recorded score, **except** as a deliberate correction to a team that already has a recorded score for that question (see FR-M50). | ✅ |
| UX-M05 | Must | Each question shall have a dedicated scoring screen whose per-team scoring control is determined by the question's default point value: a discrete tap-target row (UX-M28) for a default of 5 or less, or Full marks plus a custom option (UX-M29) for a default greater than 5. The screen shall display the question's identifier (FR-M08) only, not the question's text content. When the question has already been scored, the screen shall mark it as "editing a scored question" (status-based, independent of UX-M16). | ✅ |
| UX-M06 | Must | The system shall allow the score tracker to enter or view scores for all teams for a given question on a single screen. | ✅ |
| UX-M15 | Must | The system shall provide a "Save and next question" control that commits all staged scores for the current question (FR-M29) and advances the score tracker to the next question in sequence. This is the sole means of advancing past a question. | ✅ |
| FR-M29 | Must | Score entries made with any scoring control on the live scoring screen shall be staged locally and shall not be committed to the audit trail, the team's cumulative total, or the question's scored status until the score tracker explicitly saves the question. | ✅ |
| FR-M30 | Must | Each single-value scoring control (a tap target or Full marks) shall be togglable: selecting the control that holds the team's currently staged value shall revert that team's staged value to zero rather than applying a deduction. | ✅ |
| FR-M31 | Must | If more than one scoring control is used for the same team on the same question, the staged value shall be determined by whichever control was used most recently, with no restriction on switching between them. | ✅ |
| FR-M32 | Must | A team with a staged value of zero and no previously recorded score for that question shall not generate an audit entry when the question is saved; this is equivalent to the question remaining unanswered for that team (see FR-M18). | ✅ |
| FR-M33 | Must | A question's scored status shall change only when the score tracker saves the question (FR-M29); it shall not change as a result of staging a value alone. | ✅ |
| FR-M40 | Must | For a question whose default point value is 5 or less, the scoring screen shall present, per team, a row of discrete tap targets numbered 1 through the default value (inclusive), allowing the score tracker to stage any value in that range in a single tap without typing. There shall be no separate zero target; a team with nothing selected scores zero (FR-M32), and selecting the staged target again clears it (FR-M30). | ✅ |
| FR-M41 | Must | For a question whose default point value is greater than 5, the scoring screen shall present, per team, a Full marks control staging the full default value, plus a custom-entry control for staging any other whole number from 1 up to the default value. There shall be no separate zero control; a team with nothing staged scores zero (FR-M32), and selecting Full marks again clears it (FR-M30). | ✅ |
| FR-M45 | Must | The live scoring screen shall display the current question's position within its category (e.g., "Question 3 of 5") and a visual progress indicator across that category's questions, so the score tracker can always tell how far through the category they are without opening the navigation control. | ✅ |
| FR-M46 | Must | When the score tracker moves into a question belonging to a different category than the current one — via the normal Save-and-next progression or the Back control (FR-M47), not manual navigation — the system shall display a distinct, clearly visible indication that a new category has begun. | ✅ |
| FR-M47 | Must | The live scoring screen shall provide a Back control that navigates to the previous question in sequence without committing any values staged for the current question. On the first question of the session, the Back control shall be hidden or disabled. | ✅ |
| FR-M50 | Must | If a team already has a recorded score for a question, staging a value of zero for that team and saving the question shall write a correction entry with a point value of zero, reducing that team's recorded score for the question to zero. This is the sole exception to FR-M20's rule that zero is never written as a recorded score — it does not apply to a team with no existing recorded score for the question (see FR-M32, which continues to govern that case). | ✅ |
| FR-M51 | Must | The live scoring screen shall provide a single all-teams control that, in one action, stages the question's default point value for every team. | ✅ |
| FR-M52 | Must | Activating the all-teams control again (FR-M51) shall remove the points it added: every team still holding the value staged by that control shall revert to the value it held before the control was activated (zero on a fresh question). A team whose value was changed by hand after the control was activated shall keep that value. Like every other scoring control, this shall stage values only (FR-M29). | ✅ |
| UX-M27 | Must | *(Revised)* Editor controls shall be meaningfully larger than the minimum accessible touch-target size. All teams shall remain visible together on the live scoring screen, rather than requiring per-team navigation — prioritized over strict thumb-zone placement per direct score-tracker feedback. | ✅ |
| UX-M28 | Must | For a question whose default point value is 5 or less (FR-M40), the scoring screen shall present, per team, a single row of tap targets numbered 1 through the default value inclusive. Each target shall be a compact, evenly-sized control. The target matching the team's currently staged value shall render filled in the primary accent color with light text; every other target shall render outlined in that same accent color. Tapping the currently-staged target again reverts the staged value to zero (FR-M30); tapping any other target stages that value immediately. A team with no target selected shows a dash and scores zero. | ✅ |
| UX-M29 | Must | For a question whose default point value is greater than 5 (FR-M41), the scoring screen shall present, per team: a "Full marks · N" control sized as the primary action, plus a smaller "Custom" control. Full marks follows the same accent color and toggle rule as UX-M28. Selecting Custom shall reveal a numeric input, pre-filled with the team's currently staged value, accepting any whole number from 1 up to the default value; this input shall use a secondary (espresso) outline, signaling a distinct entry mode. Whichever control was used most recently determines the staged value (FR-M31). | ✅ |
| UX-M30 | Must | Across all live-scoring controls (UX-M28, UX-M29, UX-M37), a filled control in the primary accent color shall always mean "this is staged / on," and an outlined control in that same color shall always mean "available but not staged." This visual language shall stay consistent regardless of which variant a given question uses. | ✅ |
| UX-M32 | Must | The live scoring screen shall show the category name, the current question's position within it ("Question X of Y"), and a segmented progress indicator across that category's questions — the current question marked distinctly from scored and unanswered ones. | ✅ |
| UX-M33 | Must | Arriving at the first question of a new category — via the normal Save-and-next progression, or via the Back control (UX-M34) — shall display a distinct banner naming the new category, clearly different in treatment from the ordinary question-to-question transition within the same category. Manually jumping to a question via the navigation control shall not trigger this banner. | ✅ |
| UX-M34 | Must | The live scoring screen shall display a Back control that navigates to the previous question without committing any values staged for the current question. On the first question of the session, this control shall be hidden or disabled, since there is no previous question. | ✅ |
| UX-M37 | Must | The live scoring screen shall show the all-teams control (FR-M51) as a full-width button directly above the team list. Off: outlined in the primary accent, labeled "Give +N to all teams." On: filled in the primary accent, labeled "+N given to all teams · Tap to undo" (UX-M30). After it is turned off (FR-M52), a brief message shall state how many teams were reverted and which teams kept hand-entered values, with an Undo action that restores the bulk values. | ✅ |

---

## 5. Score Correction & Deduction

| ID | Priority | Requirement | Status |
|---|---|---|---|
| FR-M13 | Must | The system shall allow the score tracker to deduct points from a team's score to account for rule violations or penalties. | ✅ |
| FR-M22 | Must | The system shall not allow a team's cumulative total score to go below zero; any deduction that would reduce the total below zero shall cap the total at zero. | ✅ |
| UX-M09 | Must | The system shall provide a score deduction screen allowing the score tracker to deduct points from a team's score to account for rule violations or penalties. This screen shall be accessible from both the home screen and the persistent pane. | ✅ |
| UX-M08 | Must | The system shall allow the score tracker to update the score of a previously answered question. | ✅ |
| UX-M16 | Must | The system shall display a single confirmation prompt before overwriting an already-scored question's recorded scores, triggered only when at least one team's staged value actually differs from its existing recorded value — not merely because the question's status is "scored." A team being scored for the first time within an already-touched question does not trigger it. This is one prompt for the question as a whole, not one per team. | ✅ |
| FR-M11 | Must | The system shall update the leaderboard immediately upon **save** of a question's scores (FR-M29), including saves that edit past questions. Values staged but not yet saved shall not affect the leaderboard. | ✅ |

---

## 6. Multi-Device Access & Sync

| ID | Priority | Requirement | Status |
|---|---|---|---|
| FR-M10 | Must | The system shall permit only one device to act as the active score tracker (editor) per session; all other connected devices shall have view-only access to scores and the leaderboard. | ⚠️ Editor role tracked, but no real second device exists to test against |
| FR-M19 | Must | The system shall provide a session identifier (e.g., a join code or QR code) that a view-only device can use to connect to the correct active session. | ⚠️ Identifier generated/displayed; connection not functional |
| FR-M26 | Must | The system shall display the session identifier (FR-M19) to the score tracker on the home screen so it can be shared with participants who wish to join as view-only viewers. | ✅ |
| UX-M20 | Must | The home screen shall display the session identifier (join code or QR code, FR-M26) so the score tracker can share it with participants joining as view-only viewers. | ✅ |
| UX-M17 | Must | The system shall provide a screen where a view-only device can enter or scan the session identifier (FR-M19) to connect to the active session as a viewer. | ⚠️ `Join.jsx` — works only for the session on the same device until FR-M23 |
| FR-M38 | Must | The system shall provide a Display mode, distinct from the editor role and from standard view-only joining, optimized for large screens (projector or desktop) and passive group viewing: no interactive scoring controls, large legible type, and automatic updates as scores are committed (see FR-M11). | ✅ |
| FR-M39 | Must | Display mode shall be accessible via the same session identifier used for view-only joining (FR-M19), selected as a mode at join time rather than requiring a separate identifier. | ⚠️ Mode selector built in `Join.jsx`; inherits FR-M19's same-device-only limitation |
| FR-M42 | Must | Display mode shall support three views matching the leaderboard's own breakdown: the entire game, per-round totals, and per-category totals. | ✅ |
| UX-M25 | Must | Display mode (FR-M38) shall show team names and scores at a size legible from across a room, in a dark, high-contrast theme distinct from the rest of the app, with no touch targets or interactive controls of any kind, auto-refreshing as new scores are saved (FR-M11). It shall support three views matching the leaderboard's breakdown: whole game, per round, and per category (FR-M42). Within the per-round and per-category views, each group's top-ranked team shall use the same gold-highlight treatment as the overall leader (FR-M44), at a smaller size than the whole-game view since those views list more rows. | ✅ |
| UX-M26 | Must | The join screen shall let the connecting device choose "Viewer" or "Display" after entering a session code, determining which layout it receives (FR-M39). | ✅ |
| FR-M23 | Must | Given the multi-device requirement (NFR-M01), the session's authoritative data shall be stored in a free-tier cloud database accessible to all connected devices. Local device storage shall serve only as a temporary cache/buffer to preserve unsaved entries during connectivity loss, and shall sync to the cloud database once connectivity is restored — it shall not be the sole store of record. | ❌ Not implemented |
| NFR-M01 | Must | The system shall be accessible via both mobile and web platforms concurrently, with score updates entered on one device reflected in near real-time on any other device or platform accessing the same active event. | ❌ Not implemented |
| NFR-M02 | Must | The system shall reflect score entries and leaderboard updates in near-real-time, with sub-second UI response. | ✅ (within the single device) |
| NFR-M04 | Must | The system shall prevent stored scores from being corrupted or silently overwritten by concurrent entries. | ⚠️ Moot rather than engineered — no concurrent writers exist yet |
| NFR-S02 | Should | The system shall remain usable at venues with poor or intermittent connectivity by tolerating offline operation. | ✅ (trivially — no network calls exist yet) |

---

## 7. Data Persistence & Integrity

| ID | Priority | Requirement | Status |
|---|---|---|---|
| FR-M09 | Must | The system shall persist the active trivia event's data such that no data is lost if the score tracker's device closes, refreshes, or restarts (including accidental closure). Upon reopening the app, the score tracker shall regain full access to the same active session with all data intact. | ✅ |
| FR-M12 | Must | The system shall maintain an audit trail recording every point added to or deducted from any team, including the round, category, question, team, point value, and timestamp of each change. The audit trail shall be filterable by round, category, question, and team. | ✅ |
| UX-M21 | Must | The system shall provide an audit trail screen, accessible from the persistent pane, showing every point change (FR-M12) with its round, category, question, team, point value, and timestamp. The screen shall allow filtering by round, category, question, and team. | ✅ |
| NFR-M03 | Must | The system shall retain all event data without loss across app closure, page refresh, or device restart. | ✅ |
| NFR-S03 | Should | The system's data model shall support querying and filtering by category or question ID. | ✅ |

---

## 8. Leaderboard & Reporting

| ID | Priority | Requirement | Status |
|---|---|---|---|
| FR-S01 | Should | The system shall display a leaderboard showing the running total score of all teams, ranked in order. | ✅ |
| FR-M43 | Must | The leaderboard screen shall provide a control to enter Display mode, opening it directly to whichever view (game, round, or category) was currently selected on the leaderboard screen at the time. | ✅ |
| FR-M44 | Must | Within Display mode's per-round and per-category views, the top-ranked team within each group shall receive the same gold-highlight visual treatment used for the overall leader in the whole-game view, applied per group rather than reserved for a single overall leader. | ✅ |
| UX-M31 | Must | The leaderboard screen shall include a control to open Display mode, which shall show the same view (game, round, or category) currently selected on the leaderboard — not default back to the whole-game view. | ✅ |
| UX-S01 | Should | The leaderboard shall display each team's score broken down by: total for the entire game, total per category, and total per round. | ✅ |
| FR-S02 | Should | The system shall allow the user to store and view the results of past trivia sessions. | ✅ |
| FR-C03 | Could | The system shall display a running tally showing each team's score broken down question-by-question across the entire event, distinct from the ranked leaderboard summary (FR-S01). | ❌ Not implemented |
| FR-C01 | Could | The system shall allow the user to export the score tally and summary to a Microsoft Excel (.xlsx) file. | ❌ Not implemented |

---

## 9. Platform & Usability

| ID | Priority | Requirement | Status |
|---|---|---|---|
| NFR-M05 | Must | *(Revised)* The system shall optimize the editor (score tracker) interface for mobile touch input as its primary and only supported input surface. Large-screen support is provided through the separate, non-interactive Display mode (FR-M38) — not by adapting the editor UI to larger viewports. | ✅ |
| NFR-M06 | Must | The system shall be easy for the user to operate and manage without requiring specialized technical knowledge. | ✅ Qualitative |
| NFR-M07 | Must | The system shall be implementable and maintainable with low development effort and cost. | ✅ |

---

**Priority conflict note (unchanged from source):** Where Must Have
requirements conflict, **NFR-M07** (low implementation effort/cost) takes
precedence over **NFR-M01** (near real-time multi-device output).

---

## Summary

| Status | Count |
|---|---|
| ✅ Implemented | 95 |
| ⚠️ Partially implemented | 5 |
| ❌ Not implemented | 4 |

**Everything not fully implemented traces back to one of two causes:** no
real cloud backend yet (FR-M23 — accounts for FR-M10, FR-M19, UX-M17,
FR-M39, NFR-M01, and NFR-M04 being partial or blocked, since each needs a
real second device), or not built yet by scope choice (FR-C01 export,
FR-C03 question-by-question tally).

**Most recent pass: scoring-screen update.** The 0 button is gone from
both scoring variants (FR-M40/M41, UX-M28/M29 reworded), and a new
all-teams toggle stages the default for every team and undoes cleanly,
keeping hand edits (FR-M51, FR-M52, UX-M37). The same pass rebuilt the
staged-scoring, Display mode, Manage teams, derived-ID, Back, and
setup-button work (FR-M28–M50, UX-M23–M36) into the repository, which
previously held only the 5 September build.
