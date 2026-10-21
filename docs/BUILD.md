# Build and bundle policy

## Reproducible install

```bash
npm ci
npm run build
npm test
```

CI runs the same commands on every push/PR to `main` (see `.github/workflows/ci.yml`).

## Production bundle size

The app ships Angular, Angular Material, and NGX-Charts. A typical production build is on the order of **~800 kB** initial JavaScript (before gzip), which is expected for this stack.

`angular.json` production budgets are set to:

- **Warning** at 850 kB initial
- **Error** at 1.2 MB initial

Further size reduction (lazy routes, chart alternatives) is **P2** debt unless load time becomes a problem in the field.

## Angular versions

All `@angular/*` packages should stay on the **same major** (currently 21) so `npm ci` resolves without peer conflicts.
