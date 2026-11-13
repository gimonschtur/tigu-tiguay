# Key flows

Sequence diagrams for the paths that matter most. `repo` is
`lib/repository.js`; `LS` is the browser's `localStorage`.

## Opening the app

```mermaid
sequenceDiagram
    participant U as User
    participant A as App (Entry)
    participant R as repo
    participant LS as localStorage
    U->>A: open /
    A->>R: isReturningEditor()
    R->>LS: read active session + editor token
    alt session active and tokens match
        A-->>U: redirect to /home (FR-M25)
    else
        A-->>U: Landing: Start / Join / Past sessions (FR-M24)
    end
```

## Creating a session

```mermaid
sequenceDiagram
    participant U as Game master
    participant S as SessionCreate
    participant I as id.js
    participant R as repo
    participant LS as localStorage
    S->>I: deriveCategoryPrefix for each default category
    Note over S: Step 1 Basics → Step 2 Rounds → Step 3 Teams<br/>all held in component state
    U->>S: rename a category
    S->>I: deriveCategoryPrefix(new name, other prefixes)
    S->>S: regenerate that category's question IDs from 01
    U->>S: Start session
    S->>S: validate every point value is 1–100 (FR-M20)
    opt tie-breaker on
        S->>I: deriveCategoryPrefix("Tie-breaker", …)
    end
    S->>R: createSession({ rounds, teams })
    R->>LS: save session + editor token
    S-->>U: navigate to /home
```

## Scoring a question

The core loop. Nothing is written until **Save and next question**
(FR-M29). Details of the on-screen states are in
[Live scoring in depth](live-scoring.md).

```mermaid
sequenceDiagram
    participant U as Score tracker
    participant L as LiveScoring
    participant R as repo
    participant LS as localStorage
    L->>R: getActiveSession(), getLatestQuestionEntry per team
    Note over L: staged = recorded values, or 0
    U->>L: tap values / Full marks / Custom / all-teams
    L->>L: update staged state only
    U->>L: Save and next question
    L->>L: validate staged values (0 or 1..default)
    alt question already scored AND a recorded value changes
        L-->>U: Overwrite scores? (UX-M16)
        U->>L: Overwrite
    end
    L->>R: saveQuestionScores(qId, roundId, catId, staged)
    loop each team
        R->>R: 0 and no record → skip (FR-M32)
        R->>R: same as record → skip
        R->>R: else push score or correction (0 allowed only as correction, FR-M50)
    end
    R->>R: question.status = scored (FR-M33)
    R->>LS: save session
    L-->>U: navigate to next question with fromCategoryId
```

## Going back

```mermaid
sequenceDiagram
    participant U as Score tracker
    participant L as LiveScoring
    U->>L: Back (hidden on the first question)
    L->>L: discard staged values
    L-->>U: navigate to previous question with fromCategoryId
    Note over U,L: Banner shows if the previous question is in another category
```

## Deducting points

```mermaid
sequenceDiagram
    participant U as Score tracker
    participant D as Deduction
    participant R as repo
    participant LS as localStorage
    U->>D: pick team, amount (default 1), optional reason
    D->>D: validate 1–100
    D->>R: appendAuditEntry({ type: deduction, pointValue: -n })
    R->>LS: save session
    D-->>U: back to /home
    Note over R: Totals floor at 0 (FR-M22)
```

## Ending a session

```mermaid
sequenceDiagram
    participant U as Score tracker
    participant H as Home
    participant R as repo
    participant LS as localStorage
    participant F as FinalResults
    U->>H: End session
    H-->>U: confirm: questions scored, unscored = 0, leader
    U->>H: End session
    H->>R: endSession()
    R->>LS: status = ended, add to past sessions, remove editor token
    H-->>F: /leaderboard-final
    U->>F: Done
    F->>R: clearActiveSession()
```

## Display mode

```mermaid
sequenceDiagram
    participant LB as Leaderboard (tab: game/round/category)
    participant DM as DisplayMode
    participant R as repo
    participant LS as localStorage
    LB->>DM: /display?view=<selected tab> (FR-M43)
    loop every 2 seconds
        DM->>R: getActiveSession()
        R->>LS: read
        DM->>DM: re-render ranked teams per view
    end
```

A display in a second tab on the scoring device sees each save within
2 seconds. A display on another device needs the cloud database.

## Joining

```mermaid
sequenceDiagram
    participant U as Viewer / display device
    participant J as Join
    participant R as repo
    U->>J: code + Viewer or Display
    J->>R: getActiveSession()
    alt code matches this device's session
        J-->>U: /leaderboard or /display
    else
        J-->>U: alert: cross-device join needs the cloud backend
    end
```
