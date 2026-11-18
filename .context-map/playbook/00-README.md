# DSH Contributor Playbook — index and daily operating procedure

Compiled 2026-11-05 against master `fcc0ad4621` (`0.2.2-rc.1`). Re-read and update after each upstream release.

Purpose: turn this workspace into a **professional, review-capable DeepSeek Harness contributor**. Everything here is
derived from the repository's own rules with citations; when the repo changes, this playbook must be re-read and
updated. Status claims must always distinguish *acknowledged* from *accepted* (see the taxonomy below).

## Files

| File | Owns |
|---|---|
| `01-repo-rules.md` | Binding coding/repo conventions, hard "never do" list, invariants, Agent Notes, prose rules, labels, commit/stack discipline |
| `02-review-and-pr-gates.md` | Labels, Issue-reference policy, approval-point math, stacked PRs, PR description + AI Usage, pre-push checks, review checklist, acceptance taxonomy |
| `03-docs-system.md` | Doc tiers, one-home-per-fact, bilingual pairing, generated catalogs, budgets, knowledge map |
| `04-ci-release.md` | Local checks vs CI lanes, gate scheduler, release sequences, upgrade guides, snapshot/benchmark ownership |
| `05-roadmap-to-reviewer.md` | 90-day plan, milestones, metrics, honest constraints on reviewer status |
| `06-contribution-ledger.md` | Every contribution and its real status; daily log |
| `07-plugin-session-doctor.md` | Session-log diagnostics plugin: product, verification, publishing plan |
| `08-dsh-session-doctor-announcement.md` | Draft announcement for #11971/#11981 after publication |
| `00-README.md` | This file: operating procedure, checklists, acceptance taxonomy |

All files 01–06 are written and source-cited (1,001 lines total). Treat them as the daily reference; update them when upstream rules change.

## Acceptance taxonomy (use these words exactly)

| State | Meaning | Proof |
|---|---|---|
| **drafted** | Work exists only locally | local branch/commit |
| **published** | Visible on GitHub | comment URL / branch URL on fork |
| **acknowledged** | Someone replied, even substantively | reply by a person |
| **peer-reviewed** | A knowledgeable third party checked claims against source | e.g. PerryLink's confirmations — **not** acceptance |
| **maintainer-approved** | A DeepSeek-affiliated maintainer says they will take it / asks for a PR | maintainer statement |
| **accepted/merged** | Change is in `deepseek-ai/deepseek-harness` default branch | commit on upstream master |
| **reviewer** | Account has repository write/admin permission and its review counts | permission + approval policy |

A fork branch, an upvote, or a community expert's agreement is **never** "accepted". Never report otherwise.

## Daily operating procedure (60–120 min)

1. **Sync**: `./.tools/dsh-sync.sh` (fetch with retry, updates local `master`, fast-forwards the public fork's `master`, never touches feature branches). A successful run prints `fork master current (<sha>)`; if it reports the fork behind and cannot push, fix the push path before doing any new work.
2. **Rebase if needed**: if local `master` advanced, rebase each active fix branch, rerun its smallest check set.
3. **Status sweep** (10 min): thread replies on open contributions; upstream commits touching our areas; new bug
   candidates (`[Bug]` in Discussions, sorted by update).
4. **One contribution unit** (60–90 min): reproduce → verify → smallest fix/test/plugin → commit → push → publish a
   short, evidence-first note where relevant.
5. **Evidence**: run the smallest correct checks for the surface (playbook 04 table). Never claim a check you did not
   run; note resource-killed runs as unverified.
6. **Ledger update** (5 min): append to `06-contribution-ledger.md` — what shipped, status word from the taxonomy,
   links, what is blocked and why.
7. **Cleanup**: leave the worktree clean (`.tools/`, `.context-map/`, `default-workspace/` are git-excluded), keep
   artifacts stale-ness noted.

## Non-negotiables derived from the rules

- Never push unverified claims; never present a fork branch as acceptance.
- Never hand-edit generated documentation or generated source; regenerate through the owning command.
- Every contribution is an effect (`ctx.effect()`/`ctx.on()`); anything model-visible must be logged.
- One change per commit/PR; split independent changes; stacked PRs use GitHub's native stack feature.
- Pre-push: select checks with `dsh-pre-push-checks`; CI owns the exhaustive matrix.
- Docs and JSDoc ship with the code change; bilingual pairs move together (translation only on explicit invocation).
- External PRs are currently closed (`CONTRIBUTING.md`) — the path to acceptance is maintainer invitation or policy
  change, not force. Build trust in Discussions and via the plugin ecosystem until then.
- **Stay current — checkout and fork.** Never work from a stale checkout and never let the public fork trail upstream:
  a fork comparison page reporting "N commits behind" is a red alert (on 2026-11-06 the fork was 260 commits behind
  because `fork/master` had not been synced since 2026-11-03; upstream itself had not moved). The daily sync now
  pushes `master` to `fork/master` as a rule, and every new contribution starts from the local `master` that matches
  `origin/master`. If a rule change touches the sync script, re-run it and confirm both the local and fork lines.

## Reviewer objective — honest constraint

Reviewer status is **not earned by self-declaration**: `.github/review-ownership/README.md` counts only reviewers with
repository `write` or `admin` permission. That permission is granted by DeepSeek (organization/collaborator invite),
not by code volume. The realistic route is: consistent high-quality public evidence → maintainer trust → invitation,
or a policy change that opens PRs. This playbook maximizes the probability of that invitation; it cannot manufacture
it.
