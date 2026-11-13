# Software design

How the score tracker is put together, written for a developer who needs to
understand or change the source. Every diagram reflects the code in
`trivia-tracker/src` on the `develop` branch.

| Page | Covers |
|---|---|
| [Architecture](architecture.md) | System context, layers, deployment, and the planned cloud backend |
| [Tech stack](tech-stack.md) | Libraries and tools, versions, and what each one does |
| [Source code and components](source-code.md) | Folder layout, module dependencies, and every file's job |
| [Data model](data-model.md) | Session structure, audit entries, totals, and question IDs |
| [Screens and navigation](screens-and-navigation.md) | Routes and how screens connect |
| [Key flows](key-flows.md) | Sequence diagrams for setup, scoring, deduction, ending, and display |
| [Live scoring in depth](live-scoring.md) | Staged values, the all-teams toggle, and save rules |
| [Build, test, and deploy](build-test-deploy.md) | Local commands, tests, Netlify, and PWA updates |
| [Design decisions](decisions.md) | The choices that shape the code, and why |

!!! tip "Reading diagrams on a phone"
    Wide diagrams scroll sideways. Turn the phone to landscape for the
    larger ones.
