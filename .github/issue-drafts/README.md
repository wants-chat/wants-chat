# OSS Issue Backlog — WantsChat

Master index of 30 issues to file on GitHub for the OSS release. Each issue has its own body file in this directory (e.g., `01-silent-catches.md`) which you can copy to your clipboard with:

```bash
cat .github/issue-drafts/<filename>.md | pbcopy
```

Then paste into the GitHub "New issue" body field.

---

## 🔒 Security (7)

| # | Title | Labels | Priority | Body file |
|---|---|---|---|---|
| 1 | [security] Open redirect in OAuth callback URLs | `security` `bug` | 🔴 critical | `02-oauth-open-redirect.md` |
| 2 | [security] CORS allows any origin together with credentials | `security` `bug` | 🔴 critical | `03-cors-credentials.md` |
| 3 | [security] No rate limiting on auth endpoints | `security` `enhancement` | 🟠 high | `04-auth-rate-limit.md` |
| 4 | [security] dangerouslySetInnerHTML used 41 times without sanitization | `security` `bug` | 🟠 high | `05-xss-sanitize.md` |
| 5 | [security] WebSocket gateways have hardcoded localhost CORS | `security` `bug` | 🟠 high | `06-websocket-cors.md` |
| 6 | [security] Add helmet for default security headers | `security` `enhancement` `good first issue` | 🟡 medium | `02-helmet-security-headers.md` |
| 7 | [security] Database SSL is hardcoded to false | `security` `bug` `good first issue` | 🟡 medium | `08-db-ssl-config.md` |

## 🐛 Bugs (5)

| # | Title | Labels | Priority | Body file |
|---|---|---|---|---|
| 8 | [bug] Silent .catch(() => {}) hiding real errors | `bug` `error-handling` | 🟠 high | `01-silent-catches.md` ✅ |
| 9 | [bug] Pagination missing on list endpoints | `bug` `performance` | 🟠 high | `09-pagination-list-endpoints.md` |
| 10 | [bug] bcrypt and bcryptjs both installed; only one is used | `bug` `dependencies` `good first issue` | 🟡 low | `10-bcrypt-duplicate.md` |
| 11 | [bug] Leftover meditation/language frontend files reference dead backend | `bug` `cleanup` | 🟡 medium | `11-meditation-leftover.md` |
| 12 | [tech-debt] app-creator module excluded from compilation; decide its fate | `tech-debt` `discussion` | 🟡 medium | `12-app-creator-fate.md` |

## 🧪 Testing (3)

| # | Title | Labels | Priority | Body file |
|---|---|---|---|---|
| 13 | [testing] Project has zero automated tests | `testing` `help wanted` | 🟠 high | `13-zero-tests.md` |
| 14 | [testing] CI workflow runs typecheck only, no smoke test | `testing` `ci` | 🟡 medium | `14-ci-smoke-test.md` |
| 15 | [testing] Add gitleaks to CI to prevent future credential leaks | `testing` `security` `good first issue` | 🟡 medium | `15-gitleaks-ci.md` |

## ♿ Accessibility (2)

| # | Title | Labels | Priority | Body file |
|---|---|---|---|---|
| 16 | [a11y] Many tool components use div onClick instead of button | `accessibility` `good first issue` `help wanted` | 🟡 medium | `16-div-onclick.md` ✅ |
| 17 | [a11y] No keyboard navigation testing or accessibility audit | `accessibility` `enhancement` | 🟡 medium | `17-a11y-audit.md` |

## ⚡ Performance (2)

| # | Title | Labels | Priority | Body file |
|---|---|---|---|---|
| 18 | [perf] 2072 console.log calls in production source | `performance` `code-quality` | 🟡 medium | `18-console-logs.md` |
| 19 | [perf] Audit and shrink frontend bundle (lodash, framer-motion, etc.) | `performance` `enhancement` `good first issue` | 🟡 medium | `19-bundle-audit.md` |

## 📚 Documentation (4)

| # | Title | Labels | Priority | Body file |
|---|---|---|---|---|
| 20 | [docs] How to contribute a new tool — full walkthrough | `documentation` `enhancement` | 🟡 medium | `20-add-new-tool-guide.md` |
| 21 | [docs] Architecture overview is sparse, needs diagrams | `documentation` `enhancement` | 🟡 medium | `21-architecture-diagrams.md` |
| 22 | [docs] Database initialization is undocumented | `documentation` `bug` | 🟡 medium | `22-db-init-docs.md` |
| 23 | [docs] CLAUDE.md describes Hono but backend is NestJS | `documentation` `bug` `good first issue` | 🟡 low | `23-claude-md-fix.md` ⚠️ may already be done |

## 🛠️ Developer Experience (4)

| # | Title | Labels | Priority | Body file |
|---|---|---|---|---|
| 24 | [ci] deploy.yml is hardcoded to private production server | `ci` `enhancement` `documentation` | 🟡 medium | `24-deploy-yml-private.md` |
| 25 | [deps] Add Dependabot configuration for auto dependency PRs | `dependencies` `ci` `good first issue` | 🟡 medium | `25-dependabot-config.md` |
| 26 | [bug] Backend Dockerfile healthcheck pings wrong path | `bug` `docker` `good first issue` | 🟡 low | `26-backend-healthcheck.md` |
| 27 | [bug] Frontend Dockerfile healthcheck pings wrong port | `bug` `docker` `good first issue` | 🟡 low | `27-frontend-healthcheck.md` |

## 🌍 Internationalization (1)

| # | Title | Labels | Priority | Body file |
|---|---|---|---|---|
| 28 | [i18n] No missing-key validation for translations | `internationalization` `quality` `enhancement` | 🟡 medium | `28-i18n-missing-keys.md` |

## 🥚 Tech debt / cleanup (2)

| # | Title | Labels | Priority | Body file |
|---|---|---|---|---|
| 29 | [tech-debt] 200+ usages of `any` in source | `tech-debt` `code-quality` `help wanted` | 🟢 low | `29-any-types.md` |
| 30 | [tech-debt] 288 unresolved TODO/FIXME comments | `tech-debt` `discussion` | 🟢 low | `30-todos-triage.md` |

---

## How to file them efficiently

### One at a time (current workflow)

```bash
# 1. Get the body of the next issue
cat .github/issue-drafts/<filename>.md | pbcopy

# 2. On GitHub: New issue → blank issue → paste title + body
# 3. Add labels
# 4. Click Create
```

### In bulk (after `gh` is set up)

Once you've installed and authenticated `gh`, you can file them all at once:

```bash
gh issue create \
  --title "[security] Add helmet for default security headers" \
  --label "security,enhancement,good first issue" \
  --body-file .github/issue-drafts/02-helmet-security-headers.md
```

Or run the bulk-create script (if generated): `bash .github/issue-drafts/create-all.sh`

---

## Status legend

- ✅ Body file written, ready to file
- ⚠️ Body file written but issue may already be addressed
- (no mark) Body file not yet written; ask Claude to generate it

## Recommended filing order

1. **Good first issues first** (#6, 7, 10, 15, 16, 19, 23, 25, 26, 27) — bait for contributors
2. **Critical security as private advisories** (#1, 2) — file via Security tab → Advisories
3. **High-priority bugs** (#3, 4, 5, 8, 9) — public issues
4. **Testing gaps** (#13, 14, 15) — public issues
5. **Documentation** (#20, 21, 22, 23) — public issues
6. **Performance/cleanup** (#18, 19, 29, 30) — public issues, mark as `help wanted`
