# Trivia Score Tracker — UI/UX Requirements (MoSCoW)

**Status key:** ✅ Implemented &nbsp;·&nbsp; ⚠️ Partially implemented &nbsp;·&nbsp; ❌ Not implemented

## Must Have (M)

| ID | Requirement | Status |
|---|---|---|
| UX-M01 | The system shall allow the score tracker to start a session for a trivia night. | ✅ `SessionCreate.jsx` |
| UX-M02 | Upon starting a session, the system shall display a home screen showing the list of categories grouped by round, along with a button to access the leaderboard. | ✅ `Home.jsx` |
| UX-M03 | The system shall provide access to the home screen from every other screen. | ✅ Via `PersistentPane`/`TopBar` on all in-session screens |
| UX-M04 | Each screen shall include a navigation control that allows the score tracker to navigate directly to a specific round, category, or question. | ✅ `NavigateSheet.jsx`, opened from the persistent pane |
| UX-M05 | Each question shall have a dedicated scoring screen that provides two methods of awarding points to a team: (a) a button that applies a predefined point value on click, and (b) an input field for entering a specific point value. Both methods shall be available on the same screen. The screen shall display the question's identifier (FR-M08) only, not the question's text content. | ✅ `LiveScoring.jsx` — the data model has no question-text field at all, so this can't be violated |
| UX-M06 | The system shall allow the score tracker to enter or view scores for all teams for a given question on a single screen. | ✅ `LiveScoring.jsx` lists all teams |
| UX-M07 | The system shall display a persistent pane on all screens containing: (a) access to the home screen, (b) access to each round, category, and question, (c) a summary of each team's running total score, (d) access to the score deduction screen (UX-M09), and (e) access to the audit trail screen (UX-M21). | ✅ On all in-session screens (Home, Live Scoring, Deduction, Leaderboard, Audit Trail). Intentionally absent on pre-session screens (Landing, Session Creation, Join) and terminal screens (End Session Confirm, Final Results, Past Sessions), where there's no live session state to summarize |
| UX-M08 | The system shall allow the score tracker to update the score of a previously answered question. | ✅ `LiveScoring.jsx`, reached via the navigate sheet |
| UX-M09 | The system shall provide a score deduction screen allowing the score tracker to deduct points from a team's score to account for rule violations or penalties. This screen shall be accessible from both the home screen and the persistent pane. | ✅ `Deduction.jsx` |
| UX-M10 | The system shall provide a control, accessible from the home screen, allowing the score tracker to end the active session. The system shall display a confirmation prompt before ending the session, since doing so locks further edits (FR-M14). | ✅ `EndSessionConfirm.jsx` |
| UX-M11 | The system shall provide a session-creation flow, completed before UX-M01 (starting the session), in which the game master configures rounds, the categories within each round, and the questions within each category, including a default point value for each question (FR-M15). | ✅ `SessionCreate.jsx` |
| UX-M12 | The session-creation flow shall allow the game master to specify the number of participating teams and enter each team's name (FR-M16). | ✅ `SessionCreate.jsx` |
| UX-M13 | The session-creation flow shall allow the game master to optionally add a tie-breaker round, including a defined number of tie-breaker questions (FR-M17). The tie-breaker round shall appear and score identically to any other round. | ✅ `SessionCreate.jsx` |
| UX-M14 | The leaderboard and the end-session flow shall handle questions that were never activated or answered without error, treating them as contributing zero points (FR-M18). | ✅ |
| UX-M15 | Upon completing the score entry for a question (UX-M05/UX-M06), the system shall automatically advance the score tracker to the next question in sequence. | ✅ Fixed during this review — see notes at the bottom |
| UX-M16 | The system shall display a confirmation prompt before overwriting an existing score when editing a past question, to prevent accidental data loss. | ✅ Bottom-sheet confirmation in `LiveScoring.jsx` |
| UX-M17 | The system shall provide a screen where a view-only device can enter or scan the session identifier (FR-M19) to connect to the active session. | ⚠️ `Join.jsx` exists with the code entry and QR placeholder UI, but the "Join" action is a stub — it doesn't actually connect to a live session (needs FR-M23) |
| UX-M18 | Upon opening the app with no active session in progress, the system shall display a landing screen with two options: "Start a session" (leading to the session-creation flow, UX-M11) and "Join a session" (leading to the session-join screen, UX-M17). | ✅ `Landing.jsx` |
| UX-M19 | If the device was already acting as the score tracker for an active session (FR-M25), the app shall skip the landing screen (UX-M18) on reopen and return directly to that session's home screen (UX-M02). | ✅ `Entry` component in `App.jsx` |
| UX-M20 | The home screen shall display the session identifier (join code or QR code, FR-M26) so the score tracker can share it with participants joining as view-only viewers. | ✅ `Home.jsx` |
| UX-M21 | The system shall provide an audit trail screen, accessible from the persistent pane, showing every point change (FR-M12) with its round, category, question, team, point value, and timestamp. The screen shall allow filtering by round, category, question, and team. | ✅ `AuditTrail.jsx` |
| UX-M22 | During session creation, each category shall provide a button to apply a common default point value to all of its questions at once, in addition to the ability to set each question's point value individually (FR-M27). | ✅ `SessionCreate.jsx` |

## Should Have (S)

| ID | Requirement | Status |
|---|---|---|
| UX-S01 | The leaderboard shall display each team's score broken down by: total for the entire game, total per category, and total per round. | ✅ `Leaderboard.jsx` tabs |

## Could Have (C)

| ID | Requirement | Status |
|---|---|---|
| UX-C01 | The system shall visually indicate which questions have already been scored versus which remain unanswered, from the navigation control. | ✅ `NavigateSheet.jsx` dot indicators and chip states |

## Won't Have (W)

*(none listed yet)*

---

## Review Notes — Items Worth Clarifying or Flagging

1. **Round/category hierarchy — confirmed.** Categories are nested within
   rounds (round → category → question), matching UX-M02. FR-M07 has been
   updated to state this explicitly.

2. **Concurrent-edit conflict — resolved by FR-M10.** Only one device may
   act as the active score tracker (editor) per session; all other
   devices are view-only. This removes the double-count risk on UX-M05's
   "+point" button, since scoring input can only originate from a single
   source at a time. *(Note: this is currently true only because there's
   no second device at all yet — see FR-M10's implementation status.)*

3. **UX-M08 (edit past score) — resolved by FR-M11 and FR-M12.** The
   leaderboard now updates immediately on any score change (FR-M11), and
   every point change (add or deduct) is recorded in an audit trail with
   round, category, question, team, and timestamp, filterable by round,
   category, question, and team (FR-M12).

4. **No requirement for ending/closing a session — resolved by FR-M14
   and UX-M10.** The score tracker can end an active session from the
   home screen, with a confirmation prompt before edits are locked. If
   past-session storage (FR-S02) is implemented, ended sessions are
   archived to it.

5. **Default point value source — resolved by UX-M11/FR-M15.** Default
   point values are configured during session creation (before UX-M01),
   explicitly linked to FR-M06. Session creation also now covers team
   setup (FR-M16/UX-M12) and an optional tie-breaker round
   (FR-M17/UX-M13) — both previously unaddressed gaps.

6. **Navigation-after-tally behavior — resolved by UX-M15.** After
   scoring a question on UX-M05/M06's screen, the system automatically
   advances the score tracker to the next question in sequence.

7. **UX-S02 (confirmation before overwrite) — elevated to Must Have as
   UX-M16.** Given it directly protects against the data integrity risk
   described in point 3, this is now required rather than optional.

8. **Unanswered/unactivated questions at session end — addressed by
   FR-M18/UX-M14.** Since FR-M15 now allows configuring a full question
   set upfront, it's expected that not every configured question will
   necessarily be activated during a live event (e.g., time runs out).
   Ending a session or computing the leaderboard no longer errors on
   this case — unactivated questions simply contribute zero points.

9. **No entry point defined for a fresh app open — resolved by
   FR-M24/UX-M18 and FR-M25/UX-M19.** Previously, session creation
   (UX-M11) and session join (UX-M17) existed as disconnected flows with
   no screen routing a new user to either one. A landing screen now
   presents the choice explicitly ("Start a session" vs. "Join a
   session"). A returning score tracker whose session is still active
   skips this choice entirely and drops straight back into their session
   as editor, avoiding the risk of a host accidentally landing on the
   join screen for their own event.

10. **Session code had no display point for the score tracker —
    resolved by FR-M26/UX-M20.** FR-M19/UX-M17 defined how a view-only
    device *enters* a session code, but nothing said where the score
    tracker *sees* that code to share it in the first place. The home
    screen now displays it directly.

11. **Audit trail had no screen or access point — resolved by UX-M21.**
    FR-M12 (the audit trail's data) and FR-M21 (its post-session
    visibility) were both defined, but nothing specified where or how
    the score tracker actually views it. UX-M21 adds a dedicated screen,
    reachable from the persistent pane (UX-M07 updated accordingly), with
    the same filtering (round, category, question, team) as the
    underlying data.

---

## Implementation Review Notes (this pass)

**UX-M15 regression, found and fixed.** The rewrite that matched the
visual mockup replaced the original auto-advance behavior with a manual
"Save and next question" button only — the app no longer advanced
automatically once every team was scored, contradicting the requirement
as written. Fixed in `LiveScoring.jsx`: the screen now auto-advances the
first time every team gets a score for a question, while the manual
button remains as a way to move on early. Editing an already-scored
question (reached via the navigate sheet) does **not** trigger
auto-advance, since jumping forward again after a deliberate correction
would be surprising.

**Two requirements are genuinely blocked on FR-M23** (the free-tier
cloud database) rather than anything UI-related: UX-M17 (join screen)
and the practical meaning of UX-M03/UX-M07 across multiple *actual*
devices. The screens and UI states are built; the network layer behind
them isn't yet.
