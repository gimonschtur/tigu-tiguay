# Tigu-Tiguay Score Tracker

Documentation for the score tracker used at Tigu-Tiguay, the trivia night
at ThirdTry Coffee in Borongan, Eastern Samar. The app is a mobile-first
Progressive Web App (PWA): one phone runs the scoring, and a projector or
second tab can show a live leaderboard.

## Start here

| If you want to… | Read |
|---|---|
| Understand how the app is built | [Software design](design/index.md) |
| See what the app must do, with status | [Consolidated requirements](trivia-tracker-requirements-consolidated.md) |
| Look up a term, threshold, or default | [Glossary](trivia-tracker-glossary.md) |
| Match the look and feel | [Design system](ui_design/trivia-tracker-design-system.md) |

## Quick facts

- **Type:** React single-page app, installable as a PWA, hosted on Netlify.
- **Storage:** the browser's local storage on the scoring device. There is no
  server yet; multi-device sync waits on a free-tier cloud database (FR-M23).
- **Source:** [`trivia-tracker/`](https://github.com/gimonschtur/tigu-tiguay/tree/develop/trivia-tracker)
  in this repository. These docs live in [`docs/`](https://github.com/gimonschtur/tigu-tiguay/tree/develop/docs)
  and build with MkDocs from [`docs-site/`](https://github.com/gimonschtur/tigu-tiguay/tree/develop/docs-site).
- **Requirement IDs:** `FR-` functional, `NFR-` non-functional, `UX-` UI/UX;
  the letter after the dash is the MoSCoW priority (M, S, C).

## Keeping docs in sync

Requirements, design docs, and source code change together in one commit.
When a behavior changes, update the requirement row, the matching design
page, and the code in the same pass.
