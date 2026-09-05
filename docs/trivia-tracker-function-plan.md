# Trivia Score Tracker — Function List (MoSCoW)

## Must Have (M)

| ID     | Requirement                                                                                                                                                                                                                                                                                                                                                                                              |
|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| FR-M01 | The system shall allow the user to enter a score for each question, per team.                                                                                                                                                                                                                                                                                                                            |
| FR-M02 | The system shall track each team's scores throughout the event.                                                                                                                                                                                                                                                                                                                                          |
| FR-M03 | The system shall calculate and display the cumulative total score for each team.                                                                                                                                                                                                                                                                                                                         |
| FR-M04 | *(Retired — superseded by FR-M15, which covers configuring the full question set during session creation.)*                                                                                                                                                                                                                                                                                              |
| FR-M05 | The system shall allow the user to enter a specific score value for a team's answer to a question, as an alternative to applying the default point value via a button (see UX-M05).                                                                                                                                                                                                                      |
| FR-M06 | The system shall allow the user to configure a default score value applied to each question.                                                                                                                                                                                                                                                                                                             |
| FR-M07 | The system shall allow questions to be grouped by category, with categories nested within rounds (round → category → question).                                                                                                                                                                                                                                                                          |
| FR-M08 | The system shall assign a unique identifier to each question to support tracking and reference.                                                                                                                                                                                                                                                                                                          |
| FR-M09 | The system shall persist the active trivia event's data such that no data is lost if the score tracker's device closes, refreshes, or restarts (including accidental closure). Upon reopening the app, the score tracker shall regain full access to the same active session with all data intact.                                                                                                       |
| FR-M10 | The system shall permit only one device to act as the active score tracker (editor) per session; all other connected devices shall have view-only access to scores and the leaderboard.                                                                                                                                                                                                                  |
| FR-M11 | The system shall update the leaderboard immediately upon any score change, including edits to past questions.                                                                                                                                                                                                                                                                                            |
| FR-M12 | The system shall maintain an audit trail recording every point added to or deducted from any team, including the round, category, question, team, point value, and timestamp of each change. The audit trail shall be filterable by round, category, question, and team.                                                                                                                                 |
| FR-M13 | The system shall allow the score tracker to deduct points from a team's score to account for rule violations or penalties.                                                                                                                                                                                                                                                                               |
| FR-M14 | The system shall allow the score tracker to end an active session, after which the system shall lock further edits to that session's scores. If past-session storage (FR-S02) is implemented, ended sessions shall be archived to it.                                                                                                                                                                    |
| FR-M15 | The system shall allow the game master to create a session by configuring its rounds, the categories within each round, the questions within each category, and the default point value per question (see FR-M06).                                                                                                                                                                                       |
| FR-M16 | The system shall allow the game master to configure the number of participating teams and assign a name to each team during session creation.                                                                                                                                                                                                                                                            |
| FR-M17 | The system shall allow the game master to optionally configure a special tie-breaker round during session creation, including a defined number of tie-breaker questions. The tie-breaker round shall be treated the same as any other round for scoring and leaderboard purposes (see UX-S01).                                                                                                           |
| FR-M18 | The system shall correctly compute the leaderboard and permit ending a session even if one or more configured questions were never activated or answered; unactivated questions shall contribute zero points and shall not cause an error.                                                                                                                                                               |
| FR-M19 | The system shall provide a session identifier (e.g., a join code or QR code) that a view-only device can use to connect to the correct active session.                                                                                                                                                                                                                                                   |
| FR-M20 | The system shall restrict any point value entered (default point values, specific score entries, and deduction amounts) to an integer between 1 and 100, inclusive, and shall reject entries outside this range or in a non-integer format.                                                                                                                                                              |
| FR-M21 | After a session has ended and further edits are locked (FR-M14), the system shall keep the leaderboard, the audit trail (FR-M12), and the score export (FR-C01, if implemented) accessible in view-only mode.                                                                                                                                                                                            |
| FR-M22 | The system shall not allow a team's cumulative total score to go below zero; any deduction that would reduce the total below zero shall cap the total at zero.                                                                                                                                                                                                                                           |
| FR-M23 | Given the multi-device requirement (NFR-M01), the session's authoritative data shall be stored in a free-tier cloud database accessible to all connected devices. Local device storage shall serve only as a temporary cache/buffer to preserve unsaved entries during connectivity loss, and shall sync to the cloud database once connectivity is restored — it shall not be the sole store of record. |
| FR-M24 | When no session is active on a device, the system shall present the user with a choice to either (a) create and start a new session, becoming the active score tracker, or (b) join an existing active session as a view-only viewer using a session identifier (FR-M19).                                                                                                                                |
| FR-M25 | If a device previously acted as the active score tracker for a session that is still active, reopening the app on that device shall bypass the choice in FR-M24 and return the user directly to that session as the score tracker (see FR-M09).                                                                                                                                                          |
| FR-M26 | The system shall display the session identifier (FR-M19) to the score tracker on the home screen so it can be shared with participants who wish to join as view-only viewers.                                                                                                                                                                                                                            |

## Should Have (S)

| ID     | Requirement                                                                                           |
|--------|-------------------------------------------------------------------------------------------------------|
| FR-S01 | The system shall display a leaderboard showing the running total score of all teams, ranked in order. |
| FR-S02 | The system shall allow the user to store and view the results of past trivia sessions.                |

## Could Have (C)

| ID     | Requirement                                                                                                                                                                         |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| FR-C01 | The system shall allow the user to export the score tally and summary to a Microsoft Excel (.xlsx) file.                                                                            |
| FR-C03 | The system shall display a running tally showing each team's score broken down question-by-question across the entire event, distinct from the ranked leaderboard summary (FR-S01). |

## Won't Have (W)

*(none listed yet)*

---

# Non-Functional Requirements

## Must Have (M)

| ID      | Requirement                                                                                                                                                                                                          |
|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| NFR-M01 | The system shall be accessible via both mobile and web platforms concurrently, with score updates entered on one device reflected in near real-time on any other device or platform accessing the same active event. |
| NFR-M02 | The system shall reflect score entries and leaderboard updates in near-real-time, with sub-second UI response.                                                                                                       |
| NFR-M03 | The system shall retain all event data without loss across app closure, page refresh, or device restart.                                                                                                             |
| NFR-M04 | The system shall prevent stored scores from being corrupted or silently overwritten by concurrent entries.                                                                                                           |
| NFR-M05 | The system shall adapt its layout to both small (mobile) and large (desktop) viewports without loss of function.                                                                                                     |
| NFR-M06 | The system shall be easy for the user to operate and manage without requiring specialized technical knowledge.                                                                                                       |
| NFR-M07 | The system shall be implementable and maintainable with low development effort and cost.                                                                                                                             |

## Should Have (S)

| ID      | Requirement                                                                                                        |
|---------|--------------------------------------------------------------------------------------------------------------------|
| NFR-S01 | The system shall provide a self-explanatory setup process that a user can complete without external documentation. |
| NFR-S02 | The system shall remain usable at venues with poor or intermittent connectivity by tolerating offline operation.   |
| NFR-S03 | The system's data model shall support querying and filtering by category or question ID.                           |

## Won't Have (W)

*(none listed yet)*

**Note:** Where Must Have requirements conflict, **NFR-M07** (low
implementation effort/cost) takes precedence over **NFR-M01** (real-time
synchronous multi-device output).
