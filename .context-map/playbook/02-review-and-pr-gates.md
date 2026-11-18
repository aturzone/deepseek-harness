# Playbook 02: review flow, PR gates, and acceptance

## One-line purpose

A change in `deepseek-harness` becomes accepted only by accumulating **2 weighted approval points** on the exact PR head, while non-draft, free of write-capable change requests, and passing the required `Policy` + CI checks — then landing through GitHub's official stack object; everything short of `MERGED` (comments, labels, green CI, a fork branch) is metadata, not acceptance.

## 0. The external-contribution gate (read first)

- [`CONTRIBUTING.md`](../../CONTRIBUTING.md) states plainly: "We are sorry that we cannot accept external pull requests at the moment." External bug reports go to GitHub Discussions, and the sanctioned outside contributions are ecosystem work (a `dsh-plugin`-topic plugin, blog posts, answers) — not patches.
- A **fork branch is not acceptance**: a fork PR can be opened and can even run CI, but it cannot satisfy the policy stack below (same-repository Issue required, same-repository stack branches required, maintainer-only approval points), and the project does not merge it.
- Consequently every rule on this page describes how the maintainers' own PRs travel: same repository, same author chain, write-capable reviewers.

## 1. Policy workflows: what runs and what it means

| File | Trigger | Check / job names | Notes |
|---|---|---|---|
| [`.github/workflows/issue-policy.yml`](../../.github/workflows/issue-policy.yml) | `pull_request` opened/edited/synchronize/reopened/labeled/unlabeled/ready_for_review/review_requested; `pull_request_review` submitted | required job `Issue policy` | Checks out the trusted default branch and runs `.github/issue-management/policy.mjs pr` |
| [`.github/workflows/issue-lifecycle.yml`](../../.github/workflows/issue-lifecycle.yml) | Issue events; PR opened/edited/reopened/review_requested; review submitted | `Issue lifecycle` (not a merge gate) | Mutates Project status only |
| [`.github/workflows/weighted-approval.yml`](../../.github/workflows/weighted-approval.yml) | `pull_request_target` opened/synchronize/reopened/ready_for_review/converted_to_draft/edited; `issue_comment` created/edited/deleted; `workflow_run` | job `weighted approval publisher`; commit status **`weighted approval`**; check run **`weighted approval decision`** | Only the commit status may be a branch rule; the check run never gates |
| [`.github/workflows/pr-check-on-head-branch.yml`](../../.github/workflows/pr-check-on-head-branch.yml) | `pull_request_target` updates | `Policy / Master Change`, `Policy / Pre-Merge Check` | Pre-Merge merges the base commit and runs `scripts/pre-merge-check.ts` |
| [`.github/workflows/pr-check-after-approve.yml`](../../.github/workflows/pr-check-after-approve.yml) | `pull_request_target`; review submitted/dismissed | `Policy / Approve Check` + check run `Policy / Reviewer Check` | Reviewer Check is `success` only when every file needing review has one |
| [`.github/workflows/pr-check-on-base-branch.yml`](../../.github/workflows/pr-check-on-base-branch.yml) | push to `master` / `release/dsh-x.y.z` | `Policy / Recheck` | Re-runs head checks after base movement |
| [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) | `pull_request` only | verdict `all checks passed` (needs `node 24 / static`, `node 24 / coverage`, `node 24 / lint`, `node 24 / benchmarks`, `node 24 / snapshots and artifacts`, `node-compat`) | Linux lanes |
| [`.github/workflows/ci-windows.yml`](../../.github/workflows/ci-windows.yml) / [`ci-python.yml`](../../.github/workflows/ci-python.yml) | `pull_request` only | verdicts `windows checks passed`, `python checks passed` | Separate workflows so one lane can be re-run |

- `Policy` jobs run from `pull_request_target`, so their definitions come from the **base branch**; the review/approval checks treat the head only as a Git repository and execute no PR code, while `Policy / Pre-Merge Check` does install and compile the merged tree under `contents: read` with no secret. Keep job names and the `Policy` workflow name stable — branch rules require them (`.github/AGENTS.md`).
- The three `Policy` behaviors are repository variables `MERGE_POLICY_MASTER_DIFF`, `MERGE_POLICY_PRE_MERGE`, `MERGE_POLICY_HEAD_DIFF`, each `off` / `report` / `block`; a missing or unknown value counts as `report`. Values are repo settings, not PR-editable.
- Pre-Merge runs `scripts/pre-merge-check.ts`: version sync, `pnpm install --frozen-lockfile`, Host contracts, Client compile — on the tree merged with the reported base commit.

## 1b. End-to-end path of one in-repository PR

1. Open the PR non-draft with the four-section description and a same-repository Issue reference; apply exactly one `kind/*`, at least one `area/*`, at most one `p0`–`p3`.
2. Request a reviewer (`review_requested`) or receive a review — this is the moment `Issue policy` stops exempting the PR and full label/reference validation runs; the resolving Issue moves to `In review`.
3. Reviews land; each write-capable `APPROVED` adds its weight, each write-capable `CHANGES_REQUESTED` blocks the status with `pending`. The weighted publisher runs on every push, edit, draft/ready toggle, review event, and `/delegate` comment.
4. Required checks must be green on the exact head: `Issue policy`, the `Policy` jobs (`Master Change`, `Pre-Merge Check`, `Approve Check`), the `Policy / Reviewer Check` run, `all checks passed`, `windows checks passed`, `python checks passed`, plus the `weighted approval` commit status.
5. Land through GitHub's stack object (`gh stack merge`, or the single PR through it for a one-layer stack); confirm each selected PR reports `MERGED`.
6. The Issue reaches `Done` only when a closing keyword resolved it and the Issue is closed as completed.

## 2. Exact label and Issue-reference obligations

Enforced by `.github/issue-management/rules.mjs` + `pull-request.mjs` (`Issue policy` job). Applies to non-draft, human-authored PRs **that have a requested review or a submitted review**; drafts, Bot/App authors, and PRs with neither are exempt — exemption is not approval.

PR obligations:

- **At least one same-repository Issue reference** in the body. PR numbers do not count (stacked-dependency PRs included); cross-repository references do not count; references inside HTML comments, code fences, or inline code do not count. Use `Fixes #N` / `Closes #N` / `Resolves #N` for resolving, `Refs #N` for context.
- **Exactly one** canonical `kind/*` from the closed set: `kind/feature`, `kind/bug-fix`, `kind/doc`, `kind/testing`, `kind/cleanup`, `kind/dependency`. Unknown `kind/*` fails.
- **At least one** `area/*`. The area inventory is extensible; `area/*` names durable domains, not touched paths ([taxonomy](../../.agents/notes/implemented/process/2026-08-08-unified-github-label-taxonomy.md)).
- **At most one** priority label from `p0`–`p3`.
- **Forbidden on PRs:** every retired alias (`kind/bug`, `kind/documentation`, `feature`, `bug-fix`, `doc`, `cleanup`, `testing`, `dependencies`, `ci`, `cli`, `llm`, `web-search`) and any `source/*` (Issue-only).
- Resolving references add Priority matching: a PR Priority must equal the highest resolving-Issue Priority; if any resolving Issue has a Priority, every resolving Issue must have one; an informational-only PR may carry its own Priority.

Issue obligations (native metadata, not labels): one of the five Issue Types (`Idea`, `Feature`, `Bug`, `Research`, `Task`), a legal Project `Status`, Project Priority `P0`–`P3` (compared case-insensitively) or empty, no `kind/*`/legacy labels; `Done` requires closed+completed, `No action` requires closed+not-planned.

Lifecycle side effects: PR opened/reopened/body edit → resolving Issues `In progress`; review requested → `In review`; changes-requested → `In progress`; PR opening also initializes empty Project `Start Date`.

## 3. Approval-point math (`weighted approval`)

Policy (`.github/review-ownership/approval-policy.json`): `requiredPoints: 2`, `defaultPoints: 1`, two-point reviewers `07akioni`, `imccyu`, `tianyicui`, `tianyicui-bot`, `turtle1999`, `turtle2099`. `parseApprovalPolicy` rejects any other field.

- Only the reviewer's **current** `APPROVED` / `CHANGES_REQUESTED` counts; `DISMISSED` clears the standing decision, comment-only/pending do not replace it. The PR author's own review never counts.
- Reviewer permission must currently be `admin` or `write` (`WRITABLE_PERMISSIONS` in `check-approval.mjs`); other accounts become `ignoredReviewers`.
- Author credit (`author-weight.mjs`): `min(100, mergedPRs) × 11 / 1000` → 0 PRs = 0, 50 = 0.55, ≥100 = 1.1. Counted by immutable author account ID, merged PRs in this repository excluding the current PR, stopping at 100, rejecting incomplete history. **It can never reach 2 alone.**
- Blame boost, only for an approval holding the default 1 point, only while points are below threshold, no blocker exists, and the lookup runs: `min(2, 1 + 4 × ownedLines / totalLines)` → 0% = 1, 12.5% = 1.5, 25%+ = 2. Production lines are supported `src/` code under `packages/`, `apps/`, `python/`, `native/` plus Desktop renderer/Python runtime launchers; docs, tests, fixtures, snapshots, generated source, vendored code, declarations, comments and blanks are excluded (`blame-production.py`).
- Decision: draft → `pending` ("draft pull request"); any write-capable `CHANGES_REQUESTED` → `pending` regardless of score; else `success` iff `points + 1e-12 ≥ 2`. Displayed score rounds to 3 decimals, e.g. `1.55/2 approval points (author 0.55)`; evaluation failure publishes `error`.
- Delegation: the entire comment body `/delegate @username` transfers the sender's points to the recipient's effective approval; both need write/admin, neither may be the author; the command dismisses the sender's existing decision reviews and requests the recipient's review. Any later review by the sender reclaims the points; delegation cannot be forwarded; author credit cannot be delegated. A delegated approval that is later dismissed/replaced stops counting.
- Evaluation runs on open/synchronize/reopen/ready/draft/edit/`/delegate` comment; closed/merged PRs are skipped.

Worked scores (any blocker, or a draft, keeps the status `pending` regardless):

| Reviews on the head | Points | Status |
|---|---|---|
| one default reviewer approved, author has 0 merged PRs, no production-line ownership | 1 | pending |
| two default reviewers approved | 2 | success |
| one of the six two-point reviewers approved | 2 | success |
| one default approval + author credit 0.55, reviewer owns 25%+ of changed production lines (boost to 2) | 2.55 | success |
| one default approval (1) with no owned lines + author credit 0.55 | 1.55 | pending |
| author credit only (max 1.1) | 1.1 | pending |

- Approval-policy edits take effect only after they merge to the default branch.
- Local verification of the math: `pnpm run test:approval-policy`.

## 4. PR description contract (four sections + AI Usage v0.1.2)

Owned by [`.agents/skills/dsh-pr-description/SKILL.md`](../../.agents/skills/dsh-pr-description/SKILL.md); template [`.github/pull_request_template.md`](../../.github/pull_request_template.md); headings and labels stay English, prose follows the description's language (Chinese unless a human asked otherwise).

1. `## Motivation` — one sentence naming the problem; at least one same-repository Issue with `Fixes/Closes/Resolves #N` (resolving) or `Refs #N` (context).
2. `## Changes` — **Interface changes** (commands, flags, config keys, env vars, public exports, plugin registration values, protocols, persisted formats) and **Behavior changes** (user/model/developer/system-observable results, defaults, performance, timing, output; docs/AGENTS.md/skill edits count as behavior); write `None` when absent; state only what the diff guarantees and tests cover.
3. `## Testing` — **Test design** with the form matching the change type (behavior matrix: scenario × before × after × covering test; performance before/after with machine, run count, sampling; refactor: byte-for-byte/unchanged snapshots/old-vs-new; docs: link, pairing, example compilation), then **Test entries**, one per test method with the visible command or steps, the behavior covered, and whether evidence came from a local run or CI; put evidence in that entry's `<details><summary>Proof</summary>`.
4. `## AI Usage` — marker-guarded block:
   ```markdown
   <!-- ai-declaration:start -->
   [![AI-DECLARATION: <highest level>](<badge URL>)](https://ai-declaration.md)

   **AI declaration** ([v0.1.2](https://ai-declaration.md/en/0.1.2)): `<highest level>`
   <!-- ai-declaration:end -->
   ```
   followed by a 5-row table in fixed order — `breakdown`, `design`, `testing`, `implementation`, `review` — with `级别` from `hint`/`assist`/`pair`/`copilot`/`auto`/`n/a`, `AI 参与度` as a multiple of 5% inside the level's range (hint 0–10, assist 15–25, pair 30–50, copilot 55–85, auto 90–100), and a 1–2 sentence decision record (≤80 Chinese chars / 40 English words) that names who decided, without usernames, session ids, quotes, or check-running narration. The badge is the **highest** level among non-`n/a` rows; the `review` row is `n/a` until review comments have actually been handled; update affected rows (and the badge) after each review round and never append a change history.

Change-specific disclosures live inside the section they concern as bold English labels: changed behavior of an existing test (why it changed); a raised `scripts/doc-budgets.manifest.json` ceiling (old/new value + why); GUI behavior change (embedded GIF plus its required disclosures, or a statement that none is embedded and why); a translation term missing from the terminology list (source or proposed rendering).

Create/update with `gh pr create --body-file <gitignored file>` / `gh pr edit <n> --body-file`, preserving author content and the `ai-declaration` markers; the old `## Human and Agent Roles` heading is replaced, never duplicated.

## 5. Pre-push check selection (smallest sufficient evidence)

Hooks are deliberately narrow ([`lefthook.yml`](../../lefthook.yml)): `pre-commit` runs staged `.i18n.yaml` pairing, archived-note verification, staged Oxlint with `--fix`, `git diff --cached --check`, pi-ai provider metadata, and the vendor manifest guard; `pre-merge-commit` repeats pairing; `pre-push` runs only `pnpm run typecheck`. Install via `node scripts/install-lefthook.mjs`.

Selection ([`.agents/skills/dsh-pre-push-checks/SKILL.md`](../../.agents/skills/dsh-pre-push-checks/SKILL.md)):

1. Confirm checkout, verify the live base or stack parent, then `pnpm --silent run change-scope --base <verified-base-ref>` (never guesses or fetches a base; JSON spans committed + staged + unstaged + untracked).
2. Run only what the outgoing surface needs: owning Vitest file/name for package or script behavior; `pnpm run doc-sync` for docs, Agent Notes, catalogs, or doc-linked comments; the UI change workflow plus required inspection for GUI; a focused keyless snapshot or runnable example for model/CLI/terminal-visible output; `pnpm run build` + hygiene + owning built-artifact smoke for manifests, exports, build config, worker/bin entries; `pnpm run build:check` after `build:artifacts` before claiming TypeScript completion; `test:e2e` targets for real provider behavior.
3. Focus coverage by naming both the owning tests and the source scope: `pnpm exec vitest run <tests...> --coverage --coverage.include='packages/<group>/<package>/src/**/*.ts'`; never `--passWithNoTests`, never lower thresholds.
4. Full rehearsal only on explicit request, CI diagnosis, or an irreducibly repo-wide change; `pnpm run check:all` is opt-in and not an agent instruction.

History-rewriting pushes: use `--force-with-lease=<branch>:<observed-oid>` (or `gh stack push`/`gh stack sync` leases); raw `--force` is forbidden; after any rewrite re-fetch heads and re-audit threads, approvals, mergeability, checks. Verify `git rev-parse HEAD origin/<branch>`, then `gh pr checks`; report pending as pending. "No checks reported" with `total_count: 0` plus `CONFLICTING`/`DIRTY` means the PR conflicts — GitHub creates no `pull_request` runs; resolve the conflict, do not push empty commits.

## 6. Review checklist

Reviewer ([`.agents/skills/dsh-code-review/SKILL.md`](../../.agents/skills/dsh-code-review/SKILL.md)): verify the live base and exact head, rerun `change-scope` after retarget/rebase, read the owning requirements before judging (`AGENTS.md`, `packages/AGENTS.md`, the matching `docs/defensive-patterns/` page, `docs/AGENTS.md`, `docs/testing.md`) — then the diff. Blocking set: semantic review of new prose; docs and JSDoc updated with code; spine/seam type docs; Cordis ownership/cleanup (singleton state, unreversible effects, cleanup ordering, disposal tests); required evidence and CI coverage; locale-owned client UI copy. Manual set: interface contracts both sides, error handling, lifecycle/concurrency, scope and consumer fit, config precedence, model perspective, enforcement paths, borrowed vs owned state, bounds over the final value, real entry path, test strength/reliability, negative controls, implemented-note accuracy, transcript snapshots, bilingual meaning. Report defect, location, impact, evidence — inline on the tightest diff range; separate blockers from suggestions; fix or rebut on technical grounds.

Author before requesting review: labels + Issue reference + Priority, complete four-section description, GUI GIF where required ([`record-browser-gif`](../../.agents/skills/record-browser-gif/SKILL.md): recorded from the PR's real server/API, commit SHA and tree disclosed, `gh` ≥2.99.0, parts when >5 MiB), keyless snapshot updates for model/user-visible output, an upgrade guide for externally perceptible breaks, README/JSDoc in the same diff, Agent Note only for durable decision rationale.

## 7. Native stacked-PR mechanics

[`dsh-merging-stacked-prs`](../../.agents/skills/dsh-merging-stacked-prs/SKILL.md) + [native-stack note](../../.agents/notes/implemented/process/2026-08-02-native-github-stacks-and-optional-rebases.md):

- Every same-repository chain of two or more dependent PRs must use GitHub's official stack object before landing. `PullRequest.stack` and `stackEntry.position` (paginated) are the authority — not base-branch inference.
- `gh stack --version` first; hard-stop when the extension/server feature is missing or any head branch is in a fork. A same-author unstacked chain is linked automatically (`gh stack link --base <trunk> <bottom> … <top>`); mixed authors require the user's decision; never dissolve/reorder an existing stack automatically.
- Choose one refresh history: native cascading rebase (`gh stack sync`, then immediately validate every rewritten layer; `gh stack rebase` + `gh stack push` on conflict) or incremental merge-forward bottom-to-top. Merge-forward keeps checkpoints; rebase invalidates commit OIDs and inline anchors.
- Land only via `gh stack merge <stack-number> --yes --merge` (or an explicitly bounded boundary PR for a partial landing). Never `--delete-branch`, per-PR `gh pr merge`, or manual retargeting; a merge queue may land the range in separate groups, so **every selected PR must independently report `MERGED`**.
- Delete a branch only after its PR is `MERGED` and `gh pr list --state open --base <branch> --json number --jq length` returns `0`.
- Review fixes ([stack review guide](../../docs/cookbook/responding-to-pr-review-on-a-stack.md)): one worktree per PR branch; fix on the layer that introduced the defect and propagate upward in order; keep each reviewed fix as its own commit (never amend reviewed work out); reply in the review thread, not a top-level comment; treat delegated fixes as trust-but-verify with your own gates.

## 8. Acceptance taxonomy — acknowledged vs accepted

| Stage | What exists | What it proves | What it does not |
|---|---|---|---|
| **Acknowledged** | A comment or reply, labels, an Issue reference, a draft PR, green CI, a `/delegate` command, or one 1-point approval | Someone or something noticed the change | No gate is satisfied; a single 1-point approval leaves `weighted approval` `pending`; a fork branch/PR is **not** acceptance at all |
| **Peer-reviewed** | A recorded `APPROVED` review from a write/admin account, counted in the score (1 point, 2 for the six named reviewers, or a blame-boosted 1→2) | A peer examined the exact head | Below 2 points it is still `pending`; comment-only reviews never count; the author's own review never counts |
| **Maintainer-approved** | `weighted approval` commit status `success` (≥2 points including author credit, non-draft, no write-capable change request) **plus** `Policy` jobs and `all checks passed` / `windows checks passed` / `python checks passed` green, PR mergeable | Merge requirements are met on the current head | Not landed; any new push, exit from draft, or new blocking review re-evaluates |
| **Merged** | PR state `MERGED` for every selected stack layer (head branches may then be deleted, remaining upper layers retargeted); the Issue moves to `Done` only with a closing keyword and closed+completed | The change is in the default branch | Earlier acknowledgement or approval rounds are not retroactive evidence about it |

Current reality: external PRs are closed by policy, so no fork branch is accepted however green its CI; maintainer replies, issue labels, or a passing run on a fork prove interest, not acceptance. For in-repository PRs, only the `MERGED` line counts as delivery, and a ready top layer of a stack does not prove its dependencies landed.

## 9. Where to look first

1. [`.github/AGENTS.md`](../../.github/AGENTS.md) — what `Policy` publishes, modes, job-name stability.
2. [`.github/review-ownership/README.md`](../../.github/review-ownership/README.md) — approval scoring, delegation, security, verification.
3. [`.github/issue-management/README.md`](../../.github/issue-management/README.md) — Issue policy and lifecycle.
4. [`.agents/skills/dsh-pr-description/SKILL.md`](../../.agents/skills/dsh-pr-description/SKILL.md) — description + AI Usage.
5. [`.agents/skills/dsh-pre-push-checks/SKILL.md`](../../.agents/skills/dsh-pre-push-checks/SKILL.md) — evidence selection and push procedure.
6. [`.agents/skills/dsh-code-review/SKILL.md`](../../.agents/skills/dsh-code-review/SKILL.md) — review sources of truth and checklist.
7. [`.agents/skills/dsh-merging-stacked-prs/SKILL.md`](../../.agents/skills/dsh-merging-stacked-prs/SKILL.md) — stack landing.
8. [`CONTRIBUTING.md`](../../CONTRIBUTING.md) — the external-contribution gate.

## 10. Constraints & gotchas

- `Issue policy` exempts drafts, Bot/App authors, and PRs with no review request and no review — the exemption disappears the moment a review is requested or submitted, and validation re-reads live state.
- `kind/*` is a closed set; retired aliases are reserved forever; `area/*` is extensible but must name a durable domain, never a one-off project or person.
- The weighted status must be required as a **commit status with GitHub Actions as the expected source**; a same-named status from another integration can satisfy a context-only rule — never require the check run.
- Approval-policy changes only take effect after merging to the default branch; a PR cannot alter the policy that judges it.
- Green CI alone never merges: the `Policy / Pre-Merge Check` may be `report` mode (warns without failing), so absence of a red check is not proof the merged tree builds unless its mode is `block`.
- Reviewer weights are keyed to exact logins, including bot accounts; permission changes apply on the next subscribed event, not retroactively.
- Only merged-state counts: a queued stack merge, a `reviewDecision` of `APPROVED`, or a green reviewer check run is not a landed change.
- Under the self-hosted failover setting, fork PRs are excluded from the compatibility lane (`ci.yml` requires `head.repo.fork == false` there), and stacked chains hard-stop on cross-fork heads.
- Expected-output placement matters for evidence: session-round-trip expectations live under `snapshots/`, other expectations beside their owning test under `tests/expected/`.
- `doc-sync` includes generated catalogs/help/graphs; hand-editing `docs/cli-help.md`, `docs/config-catalog.md`, or `apps/cli/composition.md` fails freshness gates.
- `gh stack sync` publishes before local validation; never claim readiness because the command succeeded.
- Never print credentials; real-API evidence and GIF recording use the normal credential path, never a key echoed into logs.

## Open questions

1. What exactly counts as a "file that needs review" for `Policy / Reviewer Check`? The logic lives in the external `deepseek-harness/deepseek-harness-check` action, not in this repository.
2. Are `MERGE_POLICY_MASTER_DIFF`, `MERGE_POLICY_PRE_MERGE`, and `MERGE_POLICY_HEAD_DIFF` currently `block` on `master` and the release branches? The values are repository settings and unreadable from the checkout.
3. Is there a documented trigger or date for reopening external contributions, beyond "at the moment" in `CONTRIBUTING.md`?
4. Where is the live `area/*` inventory owned? The taxonomy grants agents the right to add labels, but the canonical list is GitHub state, not a repo file.
5. Does landing a stack require a merge queue on this repository? No repository-side merge-queue configuration exists here, so queue behavior is server-side.
