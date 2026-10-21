# Open Scrutiny — Vote Counting App

Standalone Angular app for simple vote counting and live bar-chart results. Configuration and counts persist in the browser (`localStorage`).

## Features

### Configuration (`/config`)

- Election title and description
- Optional logo (stored as a data URL in `localStorage`)
- Multiple voting items (questions), each with customizable options (defaults: SI, NO, N/C)
- Saved under the key `vote_app_data`

### Execution (`/execution`)

- Header with title, description, and logo
- Bar charts per question (NGX-Charts), Y-axis integer ticks
- Per question: option buttons to **select** one choice per item, then **Contabilizar Voto** adds **one vote** to each selected option
- **Manual totals**: numeric fields per option; **Aplicar totales manuales** sets absolute counts (overwrites counts for that item’s options)
- Vote totals stored under `vote_app_counts` and merged with config on load
- If stored data is corrupt, an error is shown with a path back to configuration

## Data and limits

| Key | Contents |
|-----|----------|
| `vote_app_data` | Election definition (counts in this blob are stored as zero; live counts live in `vote_app_counts`) |
| `vote_app_counts` | Map of item id → option id → count |

Data is **per browser / per device**. Clearing site data removes the election. Large logos increase `localStorage` usage.

## Tech stack

- Angular 21 (standalone components)
- Angular Material
- NGX-Charts
- TypeScript
- Vitest (via `ng test`)

## Development

```bash
npm ci
npm start
```

Open `http://localhost:4200/` (default Angular dev server port unless configured otherwise).

## Build and CI

```bash
npm run build   # output in dist/
npm test
```

See [docs/BUILD.md](docs/BUILD.md) for bundle budgets and dependency policy.

## Agent / project docs

Engineering skills read [AGENTS.md](AGENTS.md) and `docs/agents/`.
