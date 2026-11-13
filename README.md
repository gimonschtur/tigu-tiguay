# tigu-tiguay

Score tracker for Tigu-Tiguay, the trivia night at ThirdTry Coffee in
Borongan. A mobile-first React PWA hosted on Netlify.

| Folder | Contents |
|---|---|
| `trivia-tracker/` | The app source (Vite + React + Tailwind) |
| `docs/` | Requirements, glossary, UI design, and software design (Markdown + Mermaid) |
| `docs-site/` | MkDocs Material config that publishes `docs/` as a website |
| `dist/` | Last production build of the app |
| `mockups/` | Original screen mockups |

Start with [`docs/index.md`](docs/index.md), or the published docs site.

## Run locally

```bash
cd trivia-tracker && npm ci && npm run dev      # app at localhost:5173
cd docs-site && pip install -r requirements.txt && mkdocs serve   # docs at localhost:8000
```
