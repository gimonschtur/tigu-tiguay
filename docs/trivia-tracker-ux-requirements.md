# Trivia Score Tracker — UI/UX Requirements (MoSCoW)

**Status key:** ✅ Implemented &nbsp;·&nbsp; ⚠️ Partially implemented &nbsp;·&nbsp; ❌ Not implemented

## Must Have (M)

| ID | Requirement | Status |
|---|---|---|
| UX-M01 | The system shall allow the score tracker to start a session for a trivia night. | ✅ `SessionCreate.jsx` |
| UX-M02 | Upon starting a session, the system shall display a home screen showing the list of categories grouped by round, along with a button to access the leaderboard. | ✅ `Home.jsx` |
| UX-M03 | The system shall provide access to the home screen from every other screen. | ✅ Via `PersistentPane`/`TopBar` on all in-session screens |
| UX-M04 | Each screen shall include a navigation control that allows the score tracker to navigate directly to a specific round, category, or question. | ✅ `NavigateSheet.jsx`, opened from the persistent pane |
| UX-M05 | Each question shall have a dedicated scoring screen whose per-team scoring control is determined by the question's default point value: a discrete tap-target row (UX-M28) for a default of 5 or less, or Full marks plus a custom option (UX-M29) for a default greater than 5. The screen shall display the question's identifier (FR-M08) only, not the question's text content. When the question has already been scored, the screen shall mark it as "editing a scored question" (status-based, independent of UX-M16). | ✅ `LiveScoring.jsx` |
| UX-M06 | The system shall allow the score tracker to enter or view scores for all teams for a given question on a single screen. | ✅ `LiveScoring.jsx` lists all teams |
| UX-M07 | The system shall display a persistent pane on all screens containing: (a) access to the home screen, (b) access to each round, category, and question, (c) a summary of each team's running total score, (d) access to the score deduction screen (UX-M09), and (e) access to the audit trail screen (UX-M21). | ✅ On all in-session screens (Home, Live Scoring, Deduction, Leaderboard, Audit Trail). Intentionally absent on pre-session screens (Landing, Session Creation, Join) and terminal screens (End Session Confirm, Final Results, Past Sessions), where there's no live session state to summarize |
| UX-M08 | The system shall allow the score tracker to update the score of a previously answered question. | ✅ `LiveScoring.jsx`, reached via the navigate sheet |
| UX-M09 | The system shall provide a score deduction screen allowing the score tracker to deduct points from a team's score to account for rule violations or penalties. This screen shall be accessible from both the home screen and the persistent pane. | ✅ `Deduction.jsx` |
| UX-M10 | The system shall provide a control, accessible from the home screen, allowing the score tracker to end the active session. The system shall display a confirmation prompt before ending the session, since doing so locks further edits (FR-M14). | ✅ `EndSessionConfirm.jsx` |
| UX-M11 | The system shall provide a session-creation flow, completed before UX-M01 (starting the session), in which the game master configures rounds, the categories within each round, and the questions within each category, including a default point value for each question (FR-M15). | ✅ `SessionCreate.jsx` |
| UX-M12 | The session-creation flow shall allow the game master to specify the number of participating teams and enter each team's name (FR-M16). | ✅ `SessionCreate.jsx` |
| UX-M13 | The session-creation flow shall allow the game master to optionally add a tie-breaker round, including a defined number of tie-breaker questions (FR-M17). The tie-breaker round shall appear and score identically to any other round. | ✅ `SessionCreate.jsx` |
| UX-M14 | The leaderboard and the end-session flow shall handle questions that were never activated or answered without error, treating them as contributing zero points (FR-M18). | ✅ |
| UX-M15 | The system shall provide a "Save and next question" control that commits all staged scores for the current question (FR-M29) and advances the score tracker to the next question in sequence. This is the sole means of advancing past a question. | ✅ *(supersedes the original auto-advance wording)* |
| UX-M16 | The system shall display a single confirmation prompt before overwriting an already-scored question's recorded scores, triggered only when at least one team's staged value actually differs from its existing recorded value — not merely because the question's status is "scored." A team being scored for the first time within an already-touched question does not trigger it. This is one prompt for the question as a whole, not one per team. | ✅ Bottom sheet in `LiveScoring.jsx`, listing each changed team |
| UX-M17 | The system shall provide a screen where a view-only device can enter or scan the session identifier (FR-M19) to connect to the active session as a viewer. | ⚠️ `Join.jsx` — works only for the session on the same device until FR-M23 |
| UX-M18 | Upon opening the app with no active session in progress, the system shall display a landing screen with two options: "Start a session" (leading to the session-creation flow, UX-M11) and "Join a session" (leading to the session-join screen, UX-M17). | ✅ `Landing.jsx` |
| UX-M19 | If the device was already acting as the score tracker for an active session (FR-M25), the app shall skip the landing screen (UX-M18) on reopen and return directly to that session's home screen (UX-M02). | ✅ `Entry` component in `App.jsx` |
| UX-M20 | The home screen shall display the session identifier (join code or QR code, FR-M26) so the score tracker can share it with participants joining as view-only viewers. | ✅ `Home.jsx` |
| UX-M21 | The system shall provide an audit trail screen, accessible from the persistent pane, showing every point change (FR-M12) with its round, category, question, team, point value, and timestamp. The screen shall allow filtering by round, category, question, and team. | ✅ `AuditTrail.jsx` |
| UX-M22 | During session creation, each category shall provide a button to apply a common default point value to all of its questions at once, in addition to the ability to set each question's point value individually (FR-M27). | ✅ `SessionCreate.jsx` |
| UX-M23 | The session-creation flow shall pre-populate sensible defaults to speed up setup: three teams; three rounds — Round 1 (Current Events, Science, Geography), Round 2 (Pop Culture, Math, History), Round 3 (Famous Movie Lines, Name that Song); five questions per category; and a default point value of 1. All defaults shall remain fully editable — addable, removable, and renameable — before the session starts. | ✅ `SessionCreate.jsx` |
| UX-M24 | The system shall provide a "Manage teams" screen, accessible from the home screen via an edit control, allowing the score tracker to rename any team at any point during an active session (FR-M28). | ✅ `ManageTeams.jsx` |
| UX-M25 | Display mode (FR-M38) shall show team names and scores at a size legible from across a room, in a dark, high-contrast theme distinct from the rest of the app, with no touch targets or interactive controls of any kind, auto-refreshing as new scores are saved (FR-M11). It shall support three views matching the leaderboard's breakdown: whole game, per round, and per category (FR-M42). Within the per-round and per-category views, each group's top-ranked team shall use the same gold-highlight treatment as the overall leader (FR-M44), at a smaller size than the whole-game view since those views list more rows. | ✅ `DisplayMode.jsx` |
| UX-M26 | The join screen shall let the connecting device choose "Viewer" or "Display" after entering a session code, determining which layout it receives (FR-M39). | ✅ `Join.jsx` |
| UX-M27 | *(Revised)* Editor controls shall be meaningfully larger than the minimum accessible touch-target size. All teams shall remain visible together on the live scoring screen, rather than requiring per-team navigation — prioritized over strict thumb-zone placement per direct score-tracker feedback. | ✅ 48 px tap targets, all teams on one screen |
| UX-M28 | For a question whose default point value is 5 or less (FR-M40), the scoring screen shall present, per team, a single row of tap targets numbered 1 through the default value inclusive. Each target shall be a compact, evenly-sized control. The target matching the team's currently staged value shall render filled in the primary accent color with light text; every other target shall render outlined in that same accent color. Tapping the currently-staged target again reverts the staged value to zero (FR-M30); tapping any other target stages that value immediately. A team with no target selected shows a dash and scores zero. | ✅ `LiveScoring.jsx` |
| UX-M29 | For a question whose default point value is greater than 5 (FR-M41), the scoring screen shall present, per team: a "Full marks · N" control sized as the primary action, plus a smaller "Custom" control. Full marks follows the same accent color and toggle rule as UX-M28. Selecting Custom shall reveal a numeric input, pre-filled with the team's currently staged value, accepting any whole number from 1 up to the default value; this input shall use a secondary (gold) accent, signaling a distinct entry mode. Whichever control was used most recently determines the staged value (FR-M31). | ✅ `LiveScoring.jsx` |
| UX-M30 | Across all live-scoring controls (UX-M28, UX-M29, UX-M37), a filled control in the primary accent color shall always mean "this is staged / on," and an outlined control in that same color shall always mean "available but not staged." This visual language shall stay consistent regardless of which variant a given question uses. | ✅ |
| UX-M31 | The leaderboard screen shall include a control to open Display mode, which shall show the same view (game, round, or category) currently selected on the leaderboard — not default back to the whole-game view. | ✅ `Leaderboard.jsx` |
| UX-M32 | The live scoring screen shall show the category name, the current question's position within it ("Question X of Y"), and a segmented progress indicator across that category's questions — the current question marked distinctly from scored and unanswered ones. | ✅ `LiveScoring.jsx` |
| UX-M33 | Arriving at the first question of a new category — via the normal Save-and-next progression, or via the Back control (UX-M34) — shall display a distinct banner naming the new category, clearly different in treatment from the ordinary question-to-question transition within the same category. Manually jumping to a question via the navigation control shall not trigger this banner. | ✅ `LiveScoring.jsx` (plus a 60 ms vibration where supported) |
| UX-M34 | The live scoring screen shall display a Back control that navigates to the previous question without committing any values staged for the current question. On the first question of the session, this control shall be hidden or disabled, since there is no previous question. | ✅ `LiveScoring.jsx` |
| UX-M35 | Each point-value field in the session-creation flow shall present buttons for values 1 through 5, plus a custom input for values greater than 5 — matching the live scoring screen's own threshold and visual treatment (UX-M28) for consistency. | ✅ `SessionCreate.jsx` |
| UX-M36 | In the session-creation flow's point-value fields, the value button and the custom input shall be mutually exclusive: selecting a button clears and disables the input; selecting the already-active button again deselects it and re-enables the input; typing into the input (once enabled) stages that value directly. | ✅ `SessionCreate.jsx` |
| UX-M37 | The live scoring screen shall show the all-teams control (FR-M51) as a full-width button directly above the team list. Off: outlined in the primary accent, labeled "Give +N to all teams." On: filled in the primary accent, labeled "+N given to all teams · Tap to undo" (UX-M30). After it is turned off (FR-M52), a brief message shall state how many teams were reverted and which teams kept hand-entered values, with an Undo action that restores the bulk values. | ✅ `LiveScoring.jsx` |

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

## Implementation Review Notes

**Scoring-screen update (UX-M28/M29 reworded, UX-M37 added).** Built on the latest
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
