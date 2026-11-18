# Reviewer-path plan (evidence-first, PR channel closed)

Upstream closes external PRs and has not replied to 15 public threads. Reviewer trust therefore has to be built by
demonstrating reviewer-grade work in public, not by asking for a role.

## What "reviewer-grade" means in this repo

Read `dsh-code-review`, `AGENTS.md`, `docs/defensive-patterns/*`, and the owning READMEs before judging a diff. Report:
defect, location, impact, evidence; separate blockers from suggestions; omit what a green gate already enforces.

## Concrete programme

1. **Gap synthesis** — publish source-linked lists of systemic weaknesses, not wishlists. Done: Ideas #12346 (durable
   text invariant, session diagnostics, profile recovery UX, upgrade diagnostics, stable addressing).
2. **Subsystem reviews** — review actual upstream areas in the review format, grounded in code and tests:
   session durability/reader compatibility, PTC turn scope, HMR transaction state, profile boot/recovery, hosted UI
   identity. Each review publishes findings + severity + minimal fixes where mechanical.
3. **Patch follow-through** — every accepted-in-principle complaint gets a branch, a regression that fails before the
   fix, per-file 100% coverage, full lint/duplication/typecheck/build, and honest status.
4. **Community service** — answer Q&A with verified source references (e.g. #12296), reproduce reported bugs, and never
   claim acceptance without a merge.

## Near-term queue

- npm publish of `dsh-session-doctor` once `npm login` lands, then registry install rehearsal + plugin announcement.
- First subsystem review: session reader/writer compatibility (we already know the reader rules and turn-scope guard).
- Second review: profile boot/recovery path (guard + backup/restore shape).
