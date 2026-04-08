## Problem

Multiple services use `.catch(() => {})` patterns that silently swallow errors, making production debugging nearly impossible.

## Where (sample)

- `backend/src/modules/browser/session-manager.service.ts`
- `backend/src/modules/apps/apps.service.ts`
- `backend/src/modules/app-creator/components/auth/auth.generator.ts`

To find all occurrences:

```bash
grep -rn "catch(() => {})" backend/src
```

## Acceptance criteria

- [ ] Replace all silent catches with `.catch((err) => this.logger.warn('What failed', err))`
- [ ] Add an ESLint rule (`@typescript-eslint/no-empty-function` plus `prefer-promise-reject-errors`) to prevent regressions
- [ ] Add a row to `CONTRIBUTING.md`: "always log caught errors"
