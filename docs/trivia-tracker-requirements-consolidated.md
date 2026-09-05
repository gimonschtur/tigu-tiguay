# Trivia Score Tracker — Consolidated Requirements (Grouped by Function)

All functional (FR), non-functional (NFR), and UI/UX (UX) requirements,
reorganized by functional area instead of by document. MoSCoW priority is
retained on every item. Original IDs are preserved for traceability back
to `trivia-tracker-function-plan.md` and `trivia-tracker-ux-requirements.md`.

---

## 1. Session Setup & Configuration

| ID | Priority | Requirement |
|---|---|---|
| FR-M15 | Must | The system shall allow the game master to create a session by configuring its rounds, the categories within each round, the questions within each category, and the default point value per question (see FR-M06). |
| FR-M16 | Must | The system shall allow the game master to configure the number of participating teams and assign a name to each team during session creation. |
| FR-M17 | Must | The system shall allow the game master to optionally configure a special tie-breaker round during session creation, including a defined number of tie-breaker questions. The tie-breaker round shall be treated the same as any other round for scoring and leaderboard purposes (see UX-S01). |
| FR-M06 | Must | The system shall allow the user to configure a default score value applied to each question. |
| FR-M07 | Must | The system shall allow questions to be grouped by category, with categories nested within rounds (round → category → question). |
| FR-M08 | Must | The system shall assign a unique identifier to each question to support tracking and reference. |
| UX-M11 | Must | The system shall provide a session-creation flow, completed before UX-M01 (starting the session), in which the game master configures rounds, the categories within each round, the questions within each category, and the default point value per question (FR-M15). |
| UX-M12 | Must | The session-creation flow shall allow the game master to specify the number of participating teams and enter each team's name (FR-M16). |
| UX-M13 | Must | The session-creation flow shall allow the game master to optionally add a tie-breaker round, including a defined number of tie-breaker questions (FR-M17). The tie-breaker round shall appear and score identically to any other round. |
| NFR-S01 | Should | The system shall provide a self-explanatory setup process that a user can complete without external documentation. |
| FR-M04 | *Retired* | *(Superseded by FR-M15, which covers configuring the full question set during session creation.)* |

---

## 2. Session Lifecycle (Start / End)

| ID | Priority | Requirement |
|---|---|---|
| FR-M24 | Must | When no session is active on a device, the system shall present the user with a choice to either (a) create and start a new session, becoming the active score tracker, or (b) join an existing active session as a view-only viewer using a session identifier (FR-M19). |
| UX-M18 | Must | Upon opening the app with no active session in progress, the system shall display a landing screen with two options: "Start a session" (leading to the session-creation flow, UX-M11) and "Join a session" (leading to the session-join screen, UX-M17). |
| FR-M25 | Must | If a device previously acted as the active score tracker for a session that is still active, reopening the app on that device shall bypass the choice in FR-M24 and return the user directly to that session as the score tracker (see FR-M09). |
| UX-M19 | Must | If the device was already acting as the score tracker for an active session (FR-M25), the app shall skip the landing screen (UX-M18) on reopen and return directly to that session's home screen (UX-M02). |
| UX-M01 | Must | The system shall allow the score tracker to start a session for a trivia night. |
| FR-M14 | Must | The system shall allow the score tracker to end an active session, after which the system shall lock further edits to that session's scores. If past-session storage (FR-S02) is implemented, ended sessions shall be archived to it. |
| UX-M10 | Must | The system shall provide a control, accessible from the home screen, allowing the score tracker to end the active session. The system shall display a confirmation prompt before ending the session, since doing so locks further edits (FR-M14). |
| FR-M21 | Must | After a session has ended and further edits are locked (FR-M14), the system shall keep the leaderboard, the audit trail (FR-M12), and the score export (FR-C01, if implemented) accessible in view-only mode. |
| FR-M18 | Must | The system shall correctly compute the leaderboard and permit ending a session even if one or more configured questions were never activated or answered; unactivated questions shall contribute zero points and shall not cause an error. |
| UX-M14 | Must | The leaderboard and the end-session flow shall handle questions that were never activated or answered without error, treating them as contributing zero points (FR-M18). |

---

## 3. Navigation & Home Screen

| ID | Priority | Requirement |
|---|---|---|
| UX-M02 | Must | Upon starting a session, the system shall display a home screen showing the list of categories grouped by round, along with a button to access the leaderboard. |
| UX-M03 | Must | The system shall provide access to the home screen from every other screen. |
| UX-M04 | Must | Each screen shall include a navigation control that allows the score tracker to navigate directly to a specific round, category, or question. |
| UX-M07 | Must | The system shall display a persistent pane on all screens containing: (a) access to the home screen, (b) access to each round, category, and question, (c) a summary of each team's running total score, (d) access to the score deduction screen (UX-M09), and (e) access to the audit trail screen (UX-M21). |
| UX-C01 | Could | The system shall visually indicate which questions have already been scored versus which remain unanswered, from the navigation control. |

---

## 4. Live Scoring

| ID | Priority | Requirement |
|---|---|---|
| FR-M01 | Must | The system shall allow the user to enter a score for each question, per team. |
| FR-M05 | Must | The system shall allow the user to enter a specific score value for a team's answer to a question, as an alternative to applying the default point value via a button (see UX-M05). |
| FR-M02 | Must | The system shall track each team's scores throughout the event. |
| FR-M03 | Must | The system shall calculate and display the cumulative total score for each team. |
| FR-M20 | Must | The system shall restrict any point value entered (default point values, specific score entries, and deduction amounts) to an integer between 1 and 100, inclusive, and shall reject entries outside this range or in a non-integer format. |
| UX-M05 | Must | Each question shall have a dedicated scoring screen that provides two methods of awarding points to a team: (a) a button that applies a predefined point value on click, and (b) an input field for entering a specific point value. Both methods shall be available on the same screen. The screen shall display the question's identifier (FR-M08) only, not the question's text content. |
| UX-M06 | Must | The system shall allow the score tracker to enter or view scores for all teams for a given question on a single screen. |
| UX-M15 | Must | Upon completing the score entry for a question (UX-M05/UX-M06), the system shall automatically advance the score tracker to the next question in sequence. |

---

## 5. Score Correction & Deduction

| ID | Priority | Requirement |
|---|---|---|
| FR-M13 | Must | The system shall allow the score tracker to deduct points from a team's score to account for rule violations or penalties. |
| FR-M22 | Must | The system shall not allow a team's cumulative total score to go below zero; any deduction that would reduce the total below zero shall cap the total at zero. |
| UX-M09 | Must | The system shall provide a score deduction screen allowing the score tracker to deduct points from a team's score to account for rule violations or penalties. This screen shall be accessible from both the home screen and the persistent pane. |
| UX-M08 | Must | The system shall allow the score tracker to update the score of a previously answered question. |
| UX-M16 | Must | The system shall display a confirmation prompt before overwriting an existing score when editing a past question, to prevent accidental data loss. |
| FR-M11 | Must | The system shall update the leaderboard immediately upon any score change, including edits to past questions. |

---

## 6. Multi-Device Access & Sync

| ID | Priority | Requirement |
|---|---|---|
| FR-M10 | Must | The system shall permit only one device to act as the active score tracker (editor) per session; all other connected devices shall have view-only access to scores and the leaderboard. |
| FR-M19 | Must | The system shall provide a session identifier (e.g., a join code or QR code) that a view-only device can use to connect to the correct active session. |
| FR-M26 | Must | The system shall display the session identifier (FR-M19) to the score tracker on the home screen so it can be shared with participants who wish to join as view-only viewers. |
| UX-M20 | Must | The home screen shall display the session identifier (join code or QR code, FR-M26) so the score tracker can share it with participants joining as view-only viewers. |
| UX-M17 | Must | The system shall provide a screen where a view-only device can enter or scan the session identifier (FR-M19) to connect to the active session. |
| FR-M23 | Must | Given the multi-device requirement (NFR-M01), the session's authoritative data shall be stored in a free-tier cloud database accessible to all connected devices. Local device storage shall serve only as a temporary cache/buffer to preserve unsaved entries during connectivity loss, and shall sync to the cloud database once connectivity is restored — it shall not be the sole store of record. |
| NFR-M01 | Must | The system shall be accessible via both mobile and web platforms concurrently, with score updates entered on one device reflected in near real-time on any other device or platform accessing the same active event. |
| NFR-M02 | Must | The system shall reflect score entries and leaderboard updates in near-real-time, with sub-second UI response. |
| NFR-M04 | Must | The system shall prevent stored scores from being corrupted or silently overwritten by concurrent entries. |
| NFR-S02 | Should | The system shall remain usable at venues with poor or intermittent connectivity by tolerating offline operation. |

---

## 7. Data Persistence & Integrity

| ID | Priority | Requirement |
|---|---|---|
| FR-M09 | Must | The system shall persist the active trivia event's data such that no data is lost if the score tracker's device closes, refreshes, or restarts (including accidental closure). Upon reopening the app, the score tracker shall regain full access to the same active session with all data intact. |
| FR-M12 | Must | The system shall maintain an audit trail recording every point added to or deducted from any team, including the round, category, question, team, point value, and timestamp of each change. The audit trail shall be filterable by round, category, question, and team. |
| UX-M21 | Must | The system shall provide an audit trail screen, accessible from the persistent pane, showing every point change (FR-M12) with its round, category, question, team, point value, and timestamp. The screen shall allow filtering by round, category, question, and team. |
| NFR-M03 | Must | The system shall retain all event data without loss across app closure, page refresh, or device restart. |
| NFR-S03 | Should | The system's data model shall support querying and filtering by category or question ID. |

---

## 8. Leaderboard & Reporting

| ID | Priority | Requirement |
|---|---|---|
| FR-S01 | Should | The system shall display a leaderboard showing the running total score of all teams, ranked in order. |
| UX-S01 | Should | The leaderboard shall display each team's score broken down by: total for the entire game, total per category, and total per round. |
| FR-S02 | Should | The system shall allow the user to store and view the results of past trivia sessions. |
| FR-C03 | Could | The system shall display a running tally showing each team's score broken down question-by-question across the entire event, distinct from the ranked leaderboard summary (FR-S01). |
| FR-C01 | Could | The system shall allow the user to export the score tally and summary to a Microsoft Excel (.xlsx) file. |

---

## 9. Platform & Usability

| ID | Priority | Requirement |
|---|---|---|
| NFR-M05 | Must | The system shall adapt its layout to both small (mobile) and large (desktop) viewports without loss of function. |
| NFR-M06 | Must | The system shall be easy for the user to operate and manage without requiring specialized technical knowledge. |
| NFR-M07 | Must | The system shall be implementable and maintainable with low development effort and cost. |

---

**Priority conflict note (unchanged from source):** Where Must Have
requirements conflict, **NFR-M07** (low implementation effort/cost) takes
precedence over **NFR-M01** (near real-time multi-device output).
