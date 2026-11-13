# Architecture

The score tracker is a static single-page app. Netlify serves the built
files; everything else, including all data, runs and lives in the browser of
the device that uses it.

## System context

```mermaid
flowchart TB
    tracker["Score tracker<br/>(game master's phone)"]
    viewer["Viewer<br/>(phone, view-only)"]
    display["Display<br/>(projector / TV tab)"]

    subgraph device["Scoring device browser"]
        app["Tigu-Tiguay PWA<br/>React app"]
        ls[("localStorage<br/>session + history")]
        sw["Service worker<br/>offline cache"]
    end

    netlify["Netlify CDN<br/>static files"]
    cloud[("Free-tier cloud DB<br/>FR-M23 — not built")]

    tracker -->|"enters scores"| app
    app <-->|"read / write JSON"| ls
    sw -.->|"serves cached files offline"| app
    netlify -->|"HTML, JS, CSS, icons"| app
    display -->|"same device, second tab"| app
    viewer -.->|"needs cloud DB"| cloud
    app -.->|"planned sync"| cloud
```

Solid lines work today. Dashed lines need the cloud database (FR-M23):
until then, a viewer or display only works when it runs on **the same
device** as the score tracker, for example a second browser tab on a laptop
connected to a projector.

## Layers

The code has three layers. Pages never touch `localStorage` directly; they
go through the repository module, which is the single place that reads and
writes data.

```mermaid
flowchart TB
    subgraph ui["UI layer — src/pages, src/components"]
        pages["Pages (one per route)<br/>Home, LiveScoring, Leaderboard, …"]
        shared["Shared components<br/>TopBar, PersistentPane, NavigateSheet"]
    end
    subgraph domain["Data layer — src/lib"]
        repo["repository.js<br/>sessions, scores, totals, audit"]
        ids["id.js<br/>IDs, join codes, question prefixes"]
    end
    subgraph storage["Storage — browser"]
        ls[("localStorage<br/>3 keys")]
    end

    pages --> shared
    pages --> repo
    pages -->|"SessionCreate only"| ids
    repo --> ids
    repo --> ls
```

| Layer | Responsibility | Rules |
|---|---|---|
| UI | Render screens, hold **staged** (unsaved) input in component state, navigate | No direct storage access; derive totals through the repository |
| Data | Create and end sessions, commit scores, compute totals, filter the audit trail | Pure functions over a session object, plus `load`/`save` helpers |
| Storage | Persist JSON | Three keys; see [Data model](data-model.md#storage-keys) |

The repository's function signatures are the seam for the planned backend:
swapping its internals for a cloud database leaves the UI unchanged.

## Runtime view

```mermaid
flowchart TB
    open(["Open app"]) --> entry{"Returning editor<br/>with active session?"}
    entry -->|yes| home["Home"]
    entry -->|no| landing["Landing"]
    landing -->|"Start a session"| create["Session creation"] --> home
    landing -->|"Join a session"| join["Join"] --> board["Leaderboard or Display"]
    home --> score["Live scoring"] -->|"Save and next"| score
    home --> other["Leaderboard · Deduct · Audit ·<br/>Manage teams · Display"]
    home -->|"End session"| final["Final results"] --> landing
```

Every in-session screen re-reads the session from `localStorage` when it
mounts, so screens never hold stale shared state. Display mode also polls
every 2 seconds.

## Deployment

```mermaid
flowchart LR
    dev["Developer"] -->|"git push"| gh["GitHub<br/>gimonschtur/tigu-tiguay"]
    gh -->|"webhook"| nb1["Netlify build: app<br/>base trivia-tracker/<br/>npm run build"]
    gh -->|"webhook"| nb2["Netlify build: docs<br/>base docs-site/<br/>mkdocs build"]
    nb1 --> cdn1["App site<br/>dist/"]
    nb2 --> cdn2["Docs site<br/>site/"]
    cdn1 --> phone["Phone: install PWA<br/>(Add to Home Screen)"]
```

Both sites build from the same repository with separate base directories,
so code and docs ship from one commit. See
[Build, test, and deploy](build-test-deploy.md).

## Planned backend (FR-M23)

The chosen sync approach is lightweight polling against a free-tier cloud
database (design option C). Only the repository internals change.

```mermaid
sequenceDiagram
    participant E as Editor device
    participant C as Cloud DB
    participant V as Viewer / Display
    E->>E: Stage scores locally
    E->>C: saveQuestionScores (one batch on Save)
    Note over E: Local cache first, outbox drains on reconnect
    loop every few seconds
        V->>C: getSession(joinCode)
        C-->>V: session snapshot
    end
```

Requirements still blocked on this work: FR-M10, FR-M19, FR-M23, FR-M39,
UX-M17, NFR-M01, and NFR-M04.

## Quality attributes

| Need | How the design meets it |
|---|---|
| No data loss on refresh or restart (NFR-M03) | Every commit writes the whole session to `localStorage` immediately |
| Fast entry under time pressure (UX-M27) | Large tap targets, one screen per question, all-teams button |
| Works with poor venue Wi-Fi (NFR-S02) | Service worker caches the app; no network calls at runtime |
| Correct totals after edits (FR-M11) | Totals derive from the audit trail; the latest entry per question wins |
| Low cost and effort (NFR-M07) | Static hosting, no server, free tiers only |
