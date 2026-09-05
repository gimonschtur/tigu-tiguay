# Trivia Score Tracker — Claude Design Brief

Use this as the starting prompt/brief when prototyping in Claude Design.
Upload alongside `trivia-tracker-design-system.md` (Barako Coastal palette
and typography) so the tool applies consistent styling from the first
screen.

---

## Project context

A live score-tracking app for **Tigu-Tiguay: Borongan Trivia Night**, a
team-based pub-quiz event at ThirdTry Coffee (Borongan, Eastern Samar).
One "score tracker" (game master) runs the live event from an editor
device; other devices (players, staff, projector) view scores read-only.
Sessions run ~2 hours with 3–6 teams competing across multiple rounds and
categories.

**Visual identity:** Barako Coastal — see `trivia-tracker-design-system.md`
for the full palette, typography, and semantic color rules (teal = add
points, coral = deduct points, gold = leaderboard highlight, espresso
brown = structural chrome).

**Platform:** The app must work on both mobile and desktop/web viewports
without loss of function. Prototype the live scoring and leaderboard
screens in both a mobile layout and a wider desktop/web layout so the
responsive behavior is considered from the start, not added later.

---

## Screens to prototype

### 1. Landing screen (no active session)
Shown when the app opens with no session active on the device.
- Two options: "Start a session" and "Join a session"
- If this device was already the score tracker for a session still in
  progress, skip this screen entirely and go straight to the home screen

### 2. Session creation flow
Game master configures the event before it starts.
- Add rounds, categories within rounds, questions within categories
- Set a default point value per question (per-question override optional)
- Add teams and name each one
- Optional: add a tie-breaker round with a set number of questions

### 3. Home screen
Landing screen once a session starts.
- List of categories grouped by round
- Button to open the leaderboard
- Entry point to the session-end control
- Displays the session's join code (or QR code) so the score tracker can
  share it with anyone wanting to join as a view-only viewer

### 4. Live scoring screen
The core, most-used screen during the event.
- Shows the **question ID only** — no question text or answer content
  displayed here
- All teams listed on one screen, each with:
  - A button that applies the default point value in one tap
  - An input field to enter a specific point value instead
- Point values (button default and manual entry) are restricted to whole
  numbers from 1 to 100 — show an inline error state for out-of-range or
  non-numeric input
- Auto-advances to the next question once a question's scoring is complete
- Reused for editing a past question's score: navigating back to an
  already-scored question opens this same screen pre-filled with the
  existing score, and shows a confirmation prompt before the new value
  overwrites it
- Persistent pane (see below) visible throughout

### 5. Score deduction screen
Reachable from the home screen and from the persistent pane.
- Select a team, enter a point amount to deduct
- Deduction amount is restricted to a whole number from 1 to 100
- Confirmation before applying

### 6. Leaderboard screen
- Ranked list of teams by total score
- Breakdown views: total for the game, total per round, total per category
- Gold highlight treatment for the #1 team

### 7. Session join screen (view-only devices)
- Enter or scan a session code to connect as a read-only viewer

### 8. End session confirmation
- Triggered from the home screen
- Confirms before locking further edits
- After ending, leaderboard and audit trail remain viewable (view-only)

### 9. Past-session history (Should Have)
- A list of previously ended sessions, each opening into its final
  leaderboard (view-only)
- Reachable from the landing screen (screen 1) — a light-touch entry
  point is enough, doesn't need to be prominent

### 10. Audit trail
Reachable from the persistent pane on any screen.
- A chronological list of every point change: round, category, question,
  team, point value, and timestamp
- Filterable by round, category, question, and team
- Remains viewable after a session ends (view-only, alongside the
  leaderboard)

---

## Persistent pane (appears on every screen)

- Access to the home screen
- Navigation to any round, category, or question — indicate which
  questions are already scored versus still unanswered (a subtle marker
  is enough; this is a nice-to-have, not a core requirement)
- Running total score summary per team
- Shortcut to the score deduction screen
- Shortcut to the audit trail (see screen 10 below)

---

## Content notes

- Team and category names: sentence case, no ALL CAPS
- Score numerals: tabular figures so digits don't shift as they update
- Confirmation prompts before any destructive action (overwriting a past
  score, ending a session)
- No filler copy — labels should be short and literal (e.g. "End session",
  not "Are you sure you want to finish up?")

---

## Out of scope for this prototype pass

- Actual question/answer content (not part of the UI — see live scoring
  screen note above)
- xlsx export UI (Could Have, lower priority)
