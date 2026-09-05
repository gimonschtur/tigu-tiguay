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
| FR-M08 | The system shall assign a unique identifier to each question, formatted as two uppercase letters followed by two digits (e.g., "AB12"), to support tracking and reference. | ✅ `makeQuestionId()` |
| FR-M09 | The system shall persist the active trivia event's data such that no data is lost if the score tracker's device closes, refreshes, or restarts (including accidental closure). Upon reopening the app, the score tracker shall regain full access to the same active session with all data intact. | ✅ `localStorage`-backed, single device |
| FR-M10 | The system shall permit only one device to act as the active score tracker (editor) per session; all other connected devices shall have view-only access to scores and the leaderboard. | ⚠️ Editor-role tracking exists (`editorDeviceToken`), but there is no real second device — the Join screen is a UI stub with no backend to connect to |
| FR-M11 | The system shall update the leaderboard immediately upon any score change, including edits to past questions. | ✅ Fixed during this review — see note below |
| FR-M12 | The system shall maintain an audit trail recording every point added to or deducted from any team, including the round, category, question, team, point value, and timestamp of each change. The audit trail shall be filterable by round, category, question, and team. | ✅ `getAuditEntries()`, `AuditTrail.jsx` |
| FR-M13 | The system shall allow the score tracker to deduct points from a team's score to account for rule violations or penalties. | ✅ `Deduction.jsx` |
| FR-M14 | The system shall allow the score tracker to end an active session, after which the system shall lock further edits to that session's scores. If past-session storage (FR-S02) is implemented, ended sessions shall be archived to it. | ✅ `endSession()` locks writes, archives |
| FR-M15 | The system shall allow the game master to create a session by configuring its rounds, the categories within each round, and the questions within each category, including a default point value for each question (see FR-M06 and FR-M27). | ✅ `SessionCreate.jsx` |
| FR-M16 | The system shall allow the game master to configure the number of participating teams and assign a name to each team during session creation. | ✅ `SessionCreate.jsx` |
| FR-M17 | The system shall allow the game master to optionally configure a special tie-breaker round during session creation, including a defined number of tie-breaker questions. The tie-breaker round shall be treated the same as any other round for scoring and leaderboard purposes (see UX-S01). | ✅ Treated identically in leaderboard/totals |
| FR-M18 | The system shall correctly compute the leaderboard and permit ending a session even if one or more configured questions were never activated or answered; unactivated questions shall contribute zero points and shall not cause an error. | ✅ Derived totals naturally zero out unscored questions |
| FR-M19 | The system shall provide a session identifier (e.g., a join code or QR code) that a view-only device can use to connect to the correct active session. | ⚠️ Code is generated and displayed; the actual connect action is a stub (needs FR-M23) |
| FR-M20 | The system shall restrict any point value entered (default point values, specific score entries, and deduction amounts) to an integer between 1 and 100, inclusive, and shall reject entries outside this range or in a non-integer format. | ✅ Validated in `LiveScoring.jsx`, `Deduction.jsx`, and (added in this review) `SessionCreate.jsx` |
| FR-M21 | After a session has ended and further edits are locked (FR-M14), the system shall keep the leaderboard, the audit trail (FR-M12), and the score export (FR-C01, if implemented) accessible in view-only mode. | ✅ `FinalResults.jsx`; export clause is moot since FR-C01 isn't built |
| FR-M22 | The system shall not allow a team's cumulative total score to go below zero; any deduction that would reduce the total below zero shall cap the total at zero. | ✅ `getTeamTotal()` floors at zero |
| FR-M23 | Given the multi-device requirement (NFR-M01), the session's authoritative data shall be stored in a free-tier cloud database accessible to all connected devices. Local device storage shall serve only as a temporary cache/buffer to preserve unsaved entries during connectivity loss, and shall sync to the cloud database once connectivity is restored — it shall not be the sole store of record. | ❌ Not implemented — `localStorage` is currently the sole store (Option A), by explicit prior agreement pending backend setup |
| FR-M24 | When no session is active on a device, the system shall present the user with a choice to either (a) create and start a new session, becoming the active score tracker, or (b) join an existing active session as a view-only viewer using a session identifier (FR-M19). | ✅ `Landing.jsx` |
| FR-M25 | If a device previously acted as the active score tracker for a session that is still active, reopening the app on that device shall bypass the choice in FR-M24 and return the user directly to that session as the score tracker (see FR-M09). | ✅ `isReturningEditor()` + `Entry` route |
| FR-M26 | The system shall display the session identifier (FR-M19) to the score tracker on the home screen so it can be shared with participants who wish to join as view-only viewers. | ✅ `Home.jsx` |
| FR-M27 | The system shall allow the user to apply a common default point value to all questions within a category in a single action, as a faster alternative to configuring each question's point value individually (FR-M06). | ✅ `SessionCreate.jsx` "Apply to all questions" button |

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
| NFR-M05 | The system shall adapt its layout to both small (mobile) and large (desktop) viewports without loss of function. | ❌ Not implemented — current build is mobile-width only; no desktop layout was built |
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

## Implementation Review Notes (this pass)

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
