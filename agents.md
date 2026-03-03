# Project guidance for Codex

## Guardrails
- Do not re-scaffold the project. Modify existing structure.
- Keep changes small and reviewable.
- Prefer built-in browser APIs and existing dependencies.
- Avoid adding new libraries unless strictly necessary (and explain why if you do).

## Coding conventions
- TypeScript: use the project’s existing style (TS or JS). Do not convert the whole repo.
- Keep components accessible (labels, aria where needed).
- Use local time for date handling; avoid UTC date drift.

## Commands
- Use `npm install` only if you add a dependency.
- Validate with: `npm run build` (and `npm run lint` if present).

## Data persistence
- All app state is stored in localStorage under a single versioned key: "budgetApp:v1".
- Never overwrite existing user data on startup.