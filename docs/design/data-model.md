# Data model

A whole trivia night is one JSON **session** object. Scores are never
stored as totals: every change is an **audit entry**, and totals are worked
out from those entries whenever a screen needs them.

## Entities

```mermaid
erDiagram
    SESSION ||--|{ ROUND : has
    ROUND ||--|{ CATEGORY : has
    CATEGORY ||--|{ QUESTION : has
    SESSION ||--|{ TEAM : has
    SESSION ||--o{ AUDIT_ENTRY : records
    TEAM ||--o{ AUDIT_ENTRY : "scored in"
    QUESTION |o--o{ AUDIT_ENTRY : "score / correction"

    SESSION {
        string id "session_…"
        string joinCode "6 chars"
        string status "active | ended"
        number createdAt
        number endedAt "null while active"
        string editorDeviceToken
    }
    ROUND {
        string id
        string name
        boolean isTieBreaker
    }
    CATEGORY {
        string id
        string name
    }
    QUESTION {
        string id "e.g. CE01"
        number order
        number defaultPointValue "1-100"
        string pointMode "button | input"
        string status "unanswered | scored"
    }
    TEAM {
        string id
        string name
    }
    AUDIT_ENTRY {
        string id
        number timestamp
        string teamId
        string questionId "null for deductions"
        string roundId
        string categoryId
        number pointValue "negative for deductions"
        string type "score | correction | deduction"
        string reason "deductions only"
    }
```

Rounds, categories, questions, and teams are nested arrays inside the
session. Audit entries are a flat array (`session.auditEntries`) that
points back to them by ID.

## Storage keys

| Key | Value | Written by |
|---|---|---|
| `trivia_active_session` | The active (or just-ended) session | Every write function |
| `trivia_past_sessions` | Array of ended sessions, newest first | `endSession()` |
| `trivia_editor_token` | The token of the session this device created | `createSession()`; removed by `endSession()` |

Every write loads the session, changes it, and saves the **whole** object
back. There are no partial writes, so a closed tab can never leave a
half-saved question.

## Audit entry types

| Type | When | `questionId` | `pointValue` |
|---|---|---|---|
| `score` | A team's first saved value for a question | set | 1–100 |
| `correction` | A saved value replaces an earlier one | set | 0–100 (0 only per FR-M50) |
| `deduction` | A penalty from the Deduct screen | `null` | −1 to −100 |

Entries are never edited or deleted, so the audit trail is the full history
(FR-M12).

## How totals are computed

`getTeamTotal(session, teamId, { roundId?, categoryId? })`:

```mermaid
flowchart TB
    start(["Team's audit entries<br/>filtered by round / category if given"]) --> split{"Has questionId?"}
    split -->|yes| latest["Keep only the latest entry<br/>per question (timestamp, ties → later)"]
    split -->|"no (deduction)"| ded["Add to deduction sum"]
    latest --> sum["Sum the kept entries"]
    sum --> total["score sum + deduction sum"]
    ded --> total
    total --> floor["max(0, total)<br/>FR-M22"]
```

A correction therefore **replaces** the earlier score rather than adding to
it, and deductions stack.

## Question lifecycle

```mermaid
stateDiagram-v2
    [*] --> unanswered: created in setup
    unanswered --> unanswered: values staged on screen (nothing written)
    unanswered --> scored: Save and next question
    scored --> scored: saved again (corrections written if values changed)
```

Only `saveQuestionScores` changes `status` (FR-M33). Saving a question with
nothing staged still marks it scored.

## Session lifecycle

```mermaid
stateDiagram-v2
    [*] --> active: createSession
    active --> active: scores, deductions, renames
    active --> ended: endSession (archived to past sessions)
    ended --> [*]: clearActiveSession (after final results)
```

Writes check `status === 'active'` and do nothing on an ended session
(FR-M14).

## Question IDs

Format: two letters from the category name plus a two-digit number within
the category, for example `CE01` for the first Current Events question
(FR-M08). `deriveCategoryPrefix(name, otherPrefixes)` picks the letters:

```mermaid
flowchart TB
    name(["Category name"]) --> words["Split on spaces and hyphens"]
    words --> n{"How many words?"}
    n -->|0| xx["XX placeholder (FR-M35)"]
    n -->|1| two["First two letters<br/>Science → SC"]
    n -->|"2+"| ini["Initials of first two words<br/>Famous Movie Lines → FM"]
    xx & two & ini --> free{"Already used by<br/>another category?"}
    free -->|no| done(["Use it"])
    free -->|yes| alt["Try alternatives from the name (FR-M37)<br/>1 word: first letter + each later letter<br/>2+ words: other word-pair initials"]
    alt --> free2{"Any unused?"}
    free2 -->|yes| done
    free2 -->|no| scan["First unused pair, AA → ZZ"] --> done
```

Renaming a category during setup re-derives its prefix and renumbers its
questions from 01 (FR-M36). Default rounds produce CE, SC, GE, PC, MA, HI,
FM, and NT with no collisions.
