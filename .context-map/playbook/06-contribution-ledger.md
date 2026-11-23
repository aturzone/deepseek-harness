# Contribution ledger

Status vocabulary and proof requirements: see `00-README.md#acceptance-taxonomy`. Never upgrade a status without the
proof. Rows 1–23 and the 2026-11-05/06 notes were verified 2026-11-05/06; rows 24–28, the 2026-11-11 audit, and the
2026-11-11 release-day log were verified 2026-11-11. The 2026-11-23 post-migration wave re-verified every active
branch against `origin/master` = `dsh-v0.2.3-alpha.2`.

## MIGRATION HANDOFF (2026-11-18)

Host `sword` is being wiped for Debian 13 this afternoon. Durable copy of this ledger and the whole `.context-map`
tree is force-added to the fork branch **`meta/context-map`** (recover with
`git clone --branch meta/context-map https://github.com/aturzone/deepseek-harness.git`). The full post-migration
runbook, branch table, bootstrap order and pitfalls: `.context-map/migration/MIGRATION-HANDOFF-2026-11-18.md`.
Freeze state: runtime rc.3 under Node 24; upstream rc.4 (`ca33fd6843`, +807 commits); 19 patch branches still
rc.3-based and pending rebase; newest shipped fix `fix/hmr-module-graph-child-filename` @ `7e4bf5601d` (rc.4-based).

**Post-migration status (2026-11-23):** the migration executed; the workspace is live on Debian 13 at
`/home/atur/Workspace/deepseek-harness` (see `migration/DEBIAN-WORKSPACE-2026-11-23.md`). All 19 branches were
rebased onto `origin/master` = `dsh-v0.2.3-alpha.2` (`4b399c39a6`); tips are in the 2026-11-23 entry below.

## Active contributions

| # | Item | Type | Status | Proof / link | Next action |
|---|---|---|---|---|---|
| 1 | Settings `describe` crash on non-Schemastery Config (Discussion #11763) | report + patch | **peer-reviewed** | report: https://github.com/deepseek-ai/deepseek-harness/discussions/11763#discussioncomment-19370719 · peer review + refinement by PerryLink: `#discussioncomment-19399657` · our refinement reply: `#discussioncomment-19412339` · patch `fix/dsh-bug-triage` @ `38618c55cf` (settings `8579a7f370`) | Ask whether the team wants the patch relayed internally; keep green |
| 2 | Session log corruption from PTC records outside an open turn (Discussions #11971, #11981) | report + patch | **published**, no reply | #11971: `#discussioncomment-19370740` · #11981 cross-link: `#discussioncomment-19389727` · analysis: `#discussioncomment-19389782` · fix commit `38618c55cf` on `fix/dsh-bug-triage` | Wait for maintainer reply or reporter artifact; keep rebased |
| 3 | HMR transaction context leak (Discussion #11121) | report + patch | **published**, no reply | implementation report: `#discussioncomment-19390018` · patch `fix/hmr-transaction-context` @ `7d062c88dc` | Keep rebased; offer as branch |
| 4 | B-class step renumbering analysis (#11981) | analysis | **published**, awaiting artifact | `#discussioncomment-19389782` | Need producing version + one session log from reporter |
| 6 | Served index lacks cache headers → stale boot document (Discussion #6374) | report + patch | **published**, awaiting reply | comment: `#discussioncomment-19416230` · branch `fix/static-index-no-store` @ `49ea86b3da` | Keep rebased; answer maintainer preference if they want `no-cache` instead of `no-store` |
| 7 | `file-reference-local` installs prompts into a teardown agent scope (Discussion #12286) | report + patch | **published**, awaiting reply | comment: `#discussioncomment-19416325` · branch `fix/file-reference-scope-guard` @ `d84588d5f7` | Keep rebased; the report's candidate condition is now a real patch |
| 8 | Nested app-boot judges plugins against its own version, not the launcher (Discussion #10458) | report + patch | **published**, awaiting reply | comments: `#discussioncomment-19416449`, extension `#discussioncomment-19417014` · branch `fix/boot-launcher-runtime-version` @ `6887f331bb` (2 commits) | Fact now covers preflight, bundle-layer loading, and plugin-manager; wait for review direction |
| 9 | Missing profile manifest silently reset to the default template (Discussions #9940/#12290, #9753 family) | report + patch | **published**, awaiting reply | comment: `#discussioncomment-19416584` · branch `fix/profile-silent-reset-guard` @ `8e14c8dfb0` | Await fail-loud vs backup-then-reset preference; home-integrity diagnostic is a follow-up |
| 10 | Windows App Execution Alias rejected by executable resolution (Discussion #12275) | report + patch | **published**, awaiting reply | comments: `#discussioncomment-19416771`, test-isolation note `#discussioncomment-19417090` · branch `fix/windows-alias-executable` @ `8fc89ac081` (2 commits) | Offer shared util predicate if maintainers prefer one helper |
| 11 | Electron node-mode env leaks into "Open in app" launches (Discussions #9599/#12287) | report + patch | **published**, awaiting reply | comment: `#discussioncomment-19417159` · branch `fix/open-in-app-electron-env` @ `58a9fb538d` | Same fix should also satisfy the older #9599 thread |
| 12 | Surrogate-pair-splitting truncation poisons sessions (Discussions #11476/#11831) | report + patch | **published**, awaiting reply | comments: `#discussioncomment-19417303`, audit addendum `#discussioncomment-19418036` · branch `fix/truncation-surrogate-pairs` @ `7d21dde5b6` (2 commits) | `run_code` printed output and PTC cancellation carriers remain unverified |
| 23 | Managed-launch runner seams are silently ignored on production spawn paths (Discussions #12532/#11893) | report + patch | **published**, awaiting reply | comment: `#discussioncomment-19457844` · branch `fix/subprocess-managed-internals` @ `ab42e3b983` | Carries runnerInvocation/resolve/available into Windows-Job and Linux-scope launches |
| 22 | Accumulated `dsh-auth-*` cookies can race the desktop boot cleanup (Discussion #12360) | report + patch | **published**, awaiting reply | comment: `#discussioncomment-19438771` · branch `fix/desktop-cookie-cleanup-order` @ `495f17a0e4` | Hardens ordering; which Electron session holds the cookies needs the reporter's store |
| 21 | Sidebar shows the finished dot (and hides the clock) while a scheduled task still targets the Session (Discussion #12271) | report + patch | **published**, awaiting reply | comment: `#discussioncomment-19437819` · branch `fix/schedule-completion-gate` @ `a394b726db` | Adds a dynamic `CompletionGate` seam on ui-session; ui-schedule withholds the reminder while an active task targets the Session |
| 20 | RTL has no core direction declaration (feature request #10144; ecosystem packs #11672/#7404/#8935) | feature | **published**, awaiting reply | comment: `#discussioncomment-19437192` · branch `feat/locale-writing-direction` @ `eaf80faca4` | Delivers `<html dir>` from language packs; per-component logical-CSS conversion remains |
| 19 | Chat tail keeps reserved completion room forever after a Turn ends (Discussion #12295) | report + patch | **published**, awaiting reply | comment: `#discussioncomment-19430304` · branch `fix/chat-tail-space-reclaim` @ `aaa95e5b45` | Viewport tracks turn-running; settled room released at a tail alignment; live folds unchanged |
| 17 | Recovery silently moves hand-written profile-patch rows (MCP servers) to a backup (Discussion #12191) | analysis + docs fix | **published**, awaiting reply | comment: `#discussioncomment-19426981` · branch `docs/recovery-handwritten-rows` @ `065f580075` | Behavior is by design; gap is no post-restart in-app surface — offered marker+notice patch if maintainers want |
| 16 | Lone surrogates from tool output poison the session; one durable choke point (Discussions #11476/#11831) | report + patch | **published**, community-validated | comments: `#discussioncomment-19418978`, confirmation `#discussioncomment-19419116` · branch `fix/tool-result-well-formed` @ `67ddef289a` | Community forensics confirmed only `tool/result` reaches model context and the cancellation path uses it, so the choke covers it without new event types |
| 15 | Stale default preset blocks new sessions with an unactionable not-found toast (Discussion #12296) | answer + patch | **published**, awaiting reply | comments: `#discussioncomment-19417949`, patch `#discussioncomment-19417973` · branch `fix/agent-preset-unknown-message` @ `490c780120` | Message now lists available presets; the setting itself is user-side |
| 14 | Bundled cordis skill claims installed-package replacement always needs restart (Discussion #12301) | docs fix | **published**, awaiting reply | comment: `#discussioncomment-19417912` · branch `docs/cordis-skill-replacement-restart` @ `0bc94bb307` | Doc-only; wording now defers to the reported `application`/`restartReason` |
| 13 | Plugin manager offers a downgrade as an update after a renumbered line (Discussion #12209) | report + patch | **published**, awaiting reply | comments: `#discussioncomment-19417429`, coverage follow-up `#discussioncomment-19417527` · branch `fix/plugin-manager-update-line` @ `0c43a2b89e` (2 commits) | Offer the stricter latest-only shape if maintainers prefer it |
| 24 | Un-awaited async `ctx.effect()` rejection is silently dropped (Discussion #12609) | report + patch | **published**, awaiting reply | comment: `#discussioncomment-19535604` · branch `fix/effect-async-rejection` @ `1cc966733a` (vendor V28) | Vendored Cordis logs the dropped reason before disposal; regression fails pre-fix; upstream Cordis proposal recorded in V28 |
| 25 | `wsl.exe` argument re-interpretation in a data-loss incident (Discussion #12846) | independent triage | **published**, awaiting reply | comment: `#discussioncomment-19535605` | Confirmed dsh-ops 0.3.0 argv path and DSH guard seams; corrected the WSL mechanism (`--` is not an argv boundary; `-e/--exec` or in-WSL script), gave a zero-side-effect A/B test, safe form, guard-to-seam table, recovery checklist |
| 26 | Desktop auth-cookie 431 recurrence: upstream fix exists but is outside the released shell (Discussion #12911) | analysis | **published**, awaiting reply | comment: `#discussioncomment-19535418` · `5868dbc357`/`93bef27ec7` are on master `fcc0ad4621` but not in `dsh-v0.2.2-rc.1` (`66491b05e3`); our `fix/desktop-cookie-cleanup-order` @ `495f17a0e4` hardens ordering | Next desktop build should carry the fix; re-measure `Network/Cookies` and 431 afterwards |
| 27 | Idle `dsh web` SIGSEGV cores sit in V8 scavenger (Discussion #12596) | analysis | **published**, awaiting reply | comment: `#discussioncomment-19535617` | Verified flag matrix on Node 24.22.2 (no concurrent-scavenger flag; `--no-parallel-scavenge`, `--single-threaded-gc`, NODE_OPTIONS limits, semi-space direction), A/B matrix, nodejs/node checklist, `si_code=-6` provenance question |
| 28 | `dsh-session-doctor` released via Git and announced (Discussions #12927, #11971, #11981) | plugin release | **released** (GitHub), npm pending | repo https://github.com/aturzone/dsh-session-doctor @ `332d983` (bundle row now uses the scoped name — the first release tree did not mount) · announcement `#12927` · links: #11971 `#discussioncomment-19535608`, #11981 `#discussioncomment-19535609` · pinned GitHub install + boot HTTP 200 verified on dsh 0.2.2-rc.1 | npm publish blocked on account 2FA; watch install feedback and keep the reader-rule table in sync |

## Baseline facts

- Upstream accepted/merged: **0** (re-verified 2026-11-23; no merged PR has ever existed).
- Upstream business: external PRs closed (`CONTRIBUTING.md:9`); Issues disabled; Discussions only.
- Community expert engagement: PerryLink (not DeepSeek-affiliated) confirmed the settings bug on `fcc0ad46` and proposed a refinement we implemented.
- Patches are on the fork `aturzone/deepseek-harness`; upstream `origin` remains canonical.
- Installed runtime on the Debian host: `0.2.2-rc.1`; npm `next`/`latest` = `0.2.2-rc.5`, `alpha` = `0.2.3-alpha.2`.

### 2026-11-05 (late 28) — Phase 1 unit 29
- New report #12191 (desktop rc.5, profile patch "data loss"): verified against source and design note that recovery intentionally renames the whole patch and creates an empty one; hand-written MCP `insert` rows move to the backup, so tools disappear with no error.
- Published an analysis + immediate restore procedure on #12191, and a docs branch (`065f580075`) making the diagnostic reference state that hand-written rows are inactive until restored and that no in-app surface repeats the backup path after restart.
- Identified the real product gap (no post-recovery in-app notice) and offered a marker+notice patch if maintainers want the direction; this is a design decision, not a silent unilateral change.
- Docs gates: pairing record updated; only the unrelated local `animation/` scratch directory keeps `test:docs` at 20/21.
- npm publish still pending owner login (`npm whoami` still unauthenticated).

### 2026-11-05 (late 29) — Phase 1 unit 30
- Decoded the screenshot on #12293 (and answered the duplicate #12292): "sessions unusable after upgrade" is a saved custom Agent preset whose row names `@deepseek-ai/dsh-tool-subagent-control/list-agents` — a source subpath, not a package export (package exports only `.`, `./src/*`, `package.json`, `locale/*.json`), and absent from shipped presets. Loader cannot start the row, the preset is `agent-preset/invalid`, and every new Session fails.
- Provided: immediate switch-to-Standard procedure, `grep`/edit steps to remove the bad preset row, and the note that the updater sha512/rollback package lines are unrelated.
- Identified two product gaps and offered a patch draft: preset editor should validate resolvable plugin names on save; the failure should name the preset id and offer switching to a valid preset.
- npm publish still blocked on owner login.

### 2026-11-05 (late 30) — Phase 1 unit 31 (and infrastructure notes)
- npm publish: owner logged in, but publish returns **403** requiring 2FA/bypass token; the CLI here never reaches
  an OTP prompt. Owner chose **defer npm**. GitHub repo remains live; package `bin` normalized (`2a4421f`).
- Git transport: SSH to github.com:22 is now intercepted by the sandbox ("Connection closed by 198.18.0.68"), while
  HTTPS works. Changed the fork's push URL to HTTPS and added a repo-local credential helper that reads
  `gh auth token`; pushes then succeed (with occasional HTTP/1.1 retry).
- Shipped a follow-up to the preset-error UX: `agent-preset/invalid` now names the preset id in its message
  (`fda008fc5a`, registry tests 50/50, index.ts 100% coverage, typecheck 5/5), published as an addendum on #12293.
- Identified preset-save validation as an editor product decision left to maintainers.

### 2026-11-06 — Phase 1 unit 32 (core client fix after owner direction)
- Owner redirected to core contribution work; picked the open desktop bug #12295 (tail whitespace after Turn completion).
- Root-caused in `use-chat-viewport.ts`: completion collapse reserves room to keep the reader's row still, but a
  following reader then sits at the physical floor including that room, and `scrollToBottom` aligned to that floor,
  so the blank persisted until later growth.
- Fix `aaa95e5b45`: viewport tracks whether the active Turn can still grow (`setTurnRunning`, wired from the
  `running` input); once it cannot and no fold batch runs, a tail alignment releases the settled room and lands on
  the real content end. Live folds during a running Turn keep the reserved room.
- Evidence: viewport regression fails without the fix; hook-level finished-Turn case added; two live-fold
  expectations now declare `running: true`; `packages/client/ui-chat/tests` 982 passed; `ui-chat/src` 100%
  coverage; typecheck 5/5; full lint 0 errors. Published on #12295.
- npm publish remains deferred per owner (GitHub plugin repo live).

## Maintainer-responsiveness research (2026-11-06)

- **Discussions are not a maintainer channel in practice.** Of 100 most recently updated threads (all updated within
  6.5 hours on 2026-11-06), **zero** comments come from any of the six 2-point reviewer logins. Of the 100 oldest-updated
  threads (Aug 13 – Oct 16: 26 with comments), also **zero** reviewer replies. Top commenters are community accounts
  (PerryLink, XuZhangxing/Big-Dao/OrderG-X, jilian-dsh, argszero, …); none is DeepSeek-affiliated.
- **Release cadence is fast, review is internal.** npm shows 6 releases in 12 days (Oct 23 – Nov 4, roughly every
  1–4 days) while the public repository has had no commits since 2026-11-04. The release pipeline is not the
  contribution pipeline.
- **No public contribution channel has an SLA.** Issues and PRs are disabled; Discussions receive community answers only.
  Therefore "how long an MR takes to be reviewed" has no observable answer for external contributors: it is currently
  not possible to submit one.
- Public attention exists (Hacker News: developer preview 2026-08-13, 747 points; Desktop 2026-10-02, 417 points), but no
  public thread discusses contributing or review wait times. Reddit's JSON endpoint is blocked from this host.
- Consequence for strategy: acceptance cannot be optimized by waiting or pinging; keep shipping evidence-backed fixes,
  serve users directly, and treat the ecosystem (plugins, language packs, guard tools) as the parallel channel. The two
  realistic escalation options left are a single consolidated status note (noise risk) or an explicit owner-approved
  outreach message; neither is warranted unprompted.

### 2026-11-07 — Phase 1 unit 36 (daily sync + subprocess internals fix)
- Daily sync: upstream still `fcc0ad4621` (frozen since 2026-11-04, now ~3 days); npm latest/next stay 0.2.2-rc.1; fork master
  reported current by the new rule. No new upstream commits, breaking changes, or upgrade guides; artifacts still stale
  (rebuild with `pnpm run build` when needed). One new community reply on #12360 asks for a configurable port range and
  shorter cookie lifetime — a product decision, not a code defect we can unilaterally take.
- New reports triaged: #12532/#11893 (subprocess seam unreachable — fixed), #12502 (desktop auth crash loop; community
  forensics confirm the #12360 cookie chain and note 0.2.2-rc.1 desktop bundles pre-`5868dbc35`/`93bef27ec` code),
  #12553 (Windows PATH/whoami), #12552 (cold-resumed delivery), #12544/#1337 (duplicate dsh-tools copies from plugins),
  #12547 (terminal PS0 echo), #12546 (old UUID sessions), #10889 (bad turn-less session reuse).
- Shipped `ab42e3b983`: `LocalSubprocessInternals` carries the three runner seams and `spawn()` forwards them to both
  managed launches (previously only the fallback path got internals). Evidence: isolated-runtime test asserts the
  selected launch receives all seams and fails without the change; 341 subprocess tests pass apart from two known
  host-environment failures also failing on master; typecheck 5/5; lint 0. Published on #12532 and cross-referenced
  from #11893.

### 2026-11-08 — Phase 1 unit 37 (daily sync; auth-loop closure; volatile guidance)
- Daily sync: upstream still `fcc0ad4621` (frozen since 2026-11-04, now 4 days); npm latest/next remain `0.2.2-rc.1`;
  fork master reported current by the currency rule; **0 new upstream commits / breaking changes / upgrade guides**;
  artifacts still stale (`pnpm run build` when needed, not run per owner instruction).
- Closed the desktop auth-loop question on #12502 and duplicate #12606 with source evidence: fix commits `5868dbc35`
  and `93bef27ec` (2026-10-31) are in master but predate the notarized 0.2.2-rc.1 desktop bundle; our
  `fix/desktop-cookie-cleanup-order` @ `495f17a0e4` closes the remaining await-ordering gap; recovery steps for the
  accumulated Cookie DB included. Published `#discussioncomment-19468804` / `#discussioncomment-19468806`.
- Answered #12589 (`.volatile()` → `{}`): designed live-reference shape (`createVolatile` frozen `get()` object); gave the
  four consumption patterns (volatile+`get()`, non-volatile plain value, credentials records, snapshot comparison).
  Published `#discussioncomment-19468810`.
- Triaged remaining new reports (not yet worked): #12581 subprocess-spawn memory pressure, #12596 idle SIGSEGV,
  #12609 un-awaited async `ctx.effect` rejection, #12611 MCP stdio pool, #12597/#12230 upgrade bug clusters.

### 2026-11-08 (late) — plugin identity fixed; tomorrow queue
- Discovered the npm name `dsh-session-doctor` is taken (imtokenxinluo, 2026-09, v0.2.3), so the plugin now publishes
  scoped: **`@aturzone/dsh-session-doctor`** (`publishConfig.access = public`), install docs and runbook updated;
  tests 10/10, build OK; GitHub repo pushed (`125f6fb`). npm publish remains owner-deferred (needs 2FA-bypass token).
- Tomorrow queue (priority): (1) #12609 un-awaited async `ctx.effect` rejection is silently dropped — reproduce in
  cordis/vendor + minimal fix; (2) #12596 idle `dsh web` SIGSEGV — needs crash/log triage; (3) RTL logical-CSS
  conversion slice after direction foundation; (4) #12289 header slot-ownership proposal for maintainers; (5) daily
  sync + fork currency (script handles) and reply sweep.

### 2026-11-08 (late 2) — npm publish blockers diagnosed
- Owner supplied a granular token; `npm whoami` shows the npm account is **`aturdana`**, not `aturzone`, and the token is
  `bypass_2fa: false` (permissions package:write only) -> publish still 403 ("2FA or bypass-2fa token required").
- Because a user scope equals the npm username, the package moved to **`@aturdana/dsh-session-doctor`** (docs updated,
  GitHub push `3da6efc`). `<html dir>` RTL work unrelated.
- Added `.github/workflows/publish.yml` (workflow_dispatch, OIDC `id-token: write`, `npm publish --provenance
  --access public`) so a **trusted publisher** can release without tokens once configured on npmjs.com.
- Owner next step (choose one): (a) create a token with bypass-2FA enabled and send it; (b) run
  `npm publish --tag next --otp=<code>` themselves; then (c) configure Trusted Publisher on the package page
  (GitHub user `aturzone`, repo `dsh-session-doctor`, workflow `publish.yml`) for tokenless future releases.
- Second token still had `bypass_2fa: false`; npm now rejects direct publish without 2FA, and the CLI here receives a
  plain 403 (no OTP challenge), so interactive publish asks for nothing. Owner reports the OTP email never arrives.
- Blocked state: npm publish needs either (a) authenticator-app 2FA configured on npmjs.com so a 6-digit code can be
  supplied to `npm publish --otp=…`, (b) a bypass-2FA token if npm still exposes it, or (c) trusted publishing after a
  first publish. Package name is ready at `@aturdana/dsh-session-doctor@0.1.0`; workflow `publish.yml` is committed.
- Security: both pasted tokens were used only inline (temp npmrc) and never persisted; revoke/rotate them.

## Contributor-status audit (2026-11-11, freeze day 7)

- Upstream: `origin/master` = `fcc0ad4621`, no commits since 2026-11-04T13:06Z; the repository now has a single branch
  (`master`) and 39 tags; latest release `dsh-v0.2.2-rc.1` (2026-11-04); npm latest/next `0.2.2-rc.1` (dist-tags last
  touched 2026-11-05). This is the longest release gap in the Oct 9 – Nov 11 window (previous gaps were 1–6 days).
  `has_pull_requests` and `has_issues` remain `false`; `open_issues_count` 0; no PR/issue API exists to submit to.
- Discussion volume: 12,697 threads total; the 100 newest were created over 21.5 hours (~112/day, versus ~100/day on
  2026-11-06); 83/100 have zero comments; mix General 60 / Ideas 25 / Show Your Plugins 10 / Q&A 5. Fresh reports repeat
  known failure classes: #12911 (2026-11-11) is the same `dsh-auth-*` cookie startup crash as #12360/#12502/#12606, and
  #12846 reports a data-loss incident (wsl.exe argument re-expansion; untriaged).
- Maintainer comments in Discussions, exact counts via `commenter:` search: `tianyicui` 18 threads (last actual comment
  2026-09-05 on #5495), `LegGasai` 1 (#6912, 2026-09-19), `Chinesezjc` 5 (Aug–Sep); every other top-50 contributor 0
  (`imccyu`, `turtle1999`, `07akioni`, `winewill`, `mektpoy`, `turtle2099`, …). **Zero maintainer comments since
  2026-10-07**, and zero on any thread we touched.
- Where team attention is visible: tianyicui's public stars in the last week are community ecosystem repos —
  `hikariming/dsh-ee` (Nov 11), `ccch1mneyyy/dsh-Go` (Nov 11), `T-Auto/dsh-ops` (Nov 11), `Fei2411/DS-Bot` (Nov 11),
  `c1overzz/dsh-bili-scroll` (Nov 8), `tencent-connect/dsh-qqbot` (Nov 8), `Tyan66666/billion-context-dsh` (Nov 10),
  `Ephemeral-AI-Lab/layerfs` (Nov 10); 07akioni starred `XieZongChen/dsh-md-notes`; turtle1999 starred
  `c4i890/dsh-wetflow`, `std-microblock/dsh-plugin-environments`, `snnh/dsh-llm-service-lite`. No maintainer reaction was
  observed on any bug discussion.
- Ecosystem scale (GitHub search 2026-11-11): topic `deepseek-harness` 24,397 repos, topic `dsh-plugin` 29,621. Leaders:
  `farion1231/cc-switch` 153k, `nexu-io/open-design` 107k, `Ebony-Vinyl/dsh-our-free-model` 69k,
  `anywhere-labs/dsh-desktop` 35.7k, `awesome-dsh-plugin/awesome-dsh-plugin` 24.2k, `ccch1mneyyy/dsh-Go` 18.9k,
  `dataelement/dsh-desktop` 18k, `Fei2411/DS-Bot` 6.9k, `T-Auto/dsh-ops` 5.7k.
  `deepseek-ai/dsh-superagent-prototype` (2026-10-31, one commit, 22.3k stars, 2.7k forks, pushed 2026-11-03) has no
  issues, no discussions, and no follow-up — a research drop, not a contribution surface.
- Community keeps confirming our analyses with no maintainer in the loop: `haoenz` on #11981 (2026-11-11),
  `boyingliu01` on #11893 (2026-11-10: master still unfixed, "no issue/PR channel to advance"), `bwcx-jzy` +
  `PerryLink` core/Node A/B follow-ups on #12596 (2026-11-10), `l246804` large-corpus datapoint on #9695 (2026-11-08).
- Own position: 20 fork branches / 32 commits, every tip equal to its `fork/*` ref, worktree clean, master = fork/master
  = `fcc0ad4621` (**0 behind**). Participation: 31 threads (3 authored), ~47 comments by us, community replies across
  the active threads, **0 maintainer replies, 0 merged changes** (scoreboard stays 0). `dsh-session-doctor` is released
  via Git (#12927); npm is still blocked on account 2FA.
- Reading: the bottleneck is structural attention (the team is in release/ecosystem mode, not discussion triage), not
  report quality or visibility. Useful moves that do not need maintainer action: ship the session-doctor plugin,
  produce reproducible triage on new high-severity reports (#12846, #12911), and keep the patch set rebased. A
  consolidated status note still needs an explicit owner decision.

### 2026-11-11 — release day: effect-rejection fix, WSL data-loss triage, session-doctor announced

- Daily sync: upstream still `fcc0ad4621` (frozen since 2026-11-04, now 7 days = longest release gap in the Oct 9 – Nov
  11 window); repo has a single branch, 39 tags; npm `latest`/`next` remain `0.2.2-rc.1`; fork master reported current;
  worktree clean, 0 behind. Contributor-status audit recorded above (maintainer comments: none since 2026-10-07).
- Shipped `fix/effect-async-rejection` @ `1cc966733a` (fork + GitHub branch): the vendored Cordis `Fiber.effect`
  anti-unhandled-rejection catch discarded `reason`; the fix reports it through `ctx.logger.error(reason)` before
  disposal while the effect is still live, logged as vendor modification **V28**. Evidence: new regression in
  `packages/extensions/tool-cordis/tests/cordis-lifecycle.spec.ts` fails pre-fix (`[]` vs error) and passes after;
  `cordis-lifecycle.spec.ts` + `scripts/cordis-core-lifecycle.spec.ts` 24/24; `pnpm run typecheck` 5/5; oxlint on the
  spec 0 errors. Published on #12609 as `#discussioncomment-19535604`.
- Triage: #12846 (wsl.exe data loss). Independently reproduced the two-layer expansion, verified `dsh-ops` 0.3.0's
  unchanged argv path (`lib/shells.js:1070`, `lib/session-shells.js:42-54`) and DSH's missing gate/seams
  (`tool-bash` delegates to `tools/pre-execute`; `never` hard-rejects; no `/mnt/<drive>` policy). Corrected the WSL
  mechanism from `WslClient.cpp`: `--` only stops option parsing and runs `$SHELL -c`; `-e/--exec` is what preserves
  argv. Published as `#discussioncomment-19535605` with a zero-side-effect A/B test, safe `-e` + `${d:?}` form, guard
  mapping, and recovery checklist.
- Analysis: #12911 (cookie 431 recurrence) — ancestry proof that the fix commits `5868dbc357` / `93bef27ec7` are on
  master but not in release commit `dsh-v0.2.2-rc.1` (`66491b05e3`), so released desktop shells still carry the old
  jar behavior; our branch hardens prune ordering. Published `#discussioncomment-19535418`.
- Analysis: #12596 (idle SIGSEGV) — verified on Node 24.22.2 that `--no-concurrent-scavenge` does not exist, the real
  knobs are `--no-parallel-scavenge` / `--single-threaded-gc`, most V8 flags are rejected by `NODE_OPTIONS`, and
  `--max-semi-space-size=8/16/32` shrinks new space (default capacity 64 MB because pointer compression is off), so
  the direction is `--min-semi-space-size=32 --max-semi-space-size=64`; plus a nodejs/node issue checklist and the
  `si_code=-6` provenance question. Published `#discussioncomment-19535617`.
- Plugin release: found and fixed a release-blocking defect before announcing — `cordis.patch.yml` still inserted the
  unscoped `dsh-session-doctor` row after the package moved to `@aturdana`, so the installed profile printed
  `1 entry did not activate` and never mounted the tool. `332d983` fixes the row, corrects the README (npm pending,
  verified Git path, commit pin, pnpm `allowBuilds` gate) and PUBLISHING. Pushed to `origin/main`; Lead re-verified the
  exact pinned GitHub install in a fresh scratch profile: `allowBuilds` added, pnpm prepare/prepack builds `dist/`,
  profile lists the bundle, `--dump-config` shows the scoped row, `dsh web` entry 303 → page 200 (40,590 bytes) with
  zero activation/startup diagnostics; CLI fixture report and exit codes 0/1/2 recorded.
- Announced the plugin as Discussion **#12927** (`Show Your Plugins!`) and linked it on #11971 / #11981
  (`#discussioncomment-19535608`, `#discussioncomment-19535609`).
- Public side effects today: 6 comments + 1 new discussion (all analysis/artifacts, no maintainer ping). Scoreboard
  remains **0 merged**; nothing here is acceptance.

### 2026-11-11 (night) — upstream unfroze: 923 commits, 0.2.2-rc.2 shipped; rebase queue opened

- During the afternoon upstream resumed: `origin/master` moved `fcc0ad4621` → **`e8f7b93a34`** (+923 commits; areas:
  experimental 351, client 189, core 88, boot 22), and `dsh-v0.2.2-rc.2` was published 2026-11-11T11:33Z (tag commit
  `ddac96760b`). The repo still exposes one branch, Issues and PRs stay disabled, and there are still **no maintainer
  comments in Discussions since 2026-09-19** (verified: tianyicui's last comment is 2026-08-18 on #2717; today's thread
  updates there are community comments; LegGasai's last was 2026-09-19; imccyu/turtle1999/turtle2099/07akioni: none).
- Sync state: local `master` advanced to `e8f7b93a34`; `fork/master` = `origin/master` = `e8f7b93a34` (0 behind). All 20
  patch branches remain based on `fcc0ad4621` and are now 923 behind. Rebase estimate by upstream commits touching each
  branch's files (unmerged commits): **easy** — `docs/*` (1), `feat/locale-writing-direction` (0),
  `fix/hmr-transaction-context` (0), `fix/open-in-app-electron-env` (0), `fix/plugin-manager-update-line` (0),
  `fix/schedule-completion-gate` (0), `fix/static-index-no-store` (0), `fix/effect-async-rejection` (1; `fiber.ts` is
  byte-identical, vendor Cordis stays 4.1.0), `fix/file-reference-scope-guard` (2),
  `fix/subprocess-managed-internals` (2), `fix/agent-preset-unknown-message` (3), `fix/windows-alias-executable` (3);
  **medium** — `fix/chat-tail-space-reclaim` (6), `fix/profile-silent-reset-guard` (16),
  `fix/desktop-cookie-cleanup-order` (23), `fix/boot-launcher-runtime-version` (24), `fix/tool-result-well-formed` (25);
  **heavy** — `fix/dsh-bug-triage` (114), `fix/truncation-surrogate-pairs` (82). `git cherry` confirms none of these
  commits are upstream yet; markers for our guards (`SessionTurnScopeError`, `wellFormedToolResult`, `CompletionGate`,
  `turnRunning`) are absent on the new master.
- Impact match without attribution: rc.2 fixes two classes we analyzed — accumulated authentication data blocking
  Desktop startup (@turtle2099; our #12360/#12502/#12911 source analysis) and optional-plugin failures preventing Web
  startup (@imccyu; the #12192 class). The desktop code still calls `void removeLegacyHostCookies(...)` on master, so our
  ordering hardening remains applicable. No discussion number or our handle appears in the rc.2 notes/commits.
- RTL: `feat/locale-writing-direction` @ `eaf80faca4` is intact on the fork (5 files, +77/−19: language packs declare
  writing direction; `<html dir>` applied; test + README). Upstream drift in `packages/client/locale` is only release
  version lines in `src/locales/*.ts` + `package.json` (9 files), so the rebase is clean; the new master still states the
  registry "does not add … bidirectional layout" (`packages/client/locale/README.md:140`) and rc.2 contains no RTL work.
  Remaining scope is unchanged: per-component logical-CSS conversion plus direction values in the actual Persian/Arabic
  language packs (community: #7404/#11672/#8935).
- Recognition snapshot (honest): 0 maintainer replies across all our threads; announcement #12927 after ~18h has
  **0 comments / 1 upvote**; `aturzone/dsh-session-doctor` has **0 stars / 0 forks**; the fork has 0 stars; the plugin is
  not listed in `awesome-dsh-plugin`, where a similarly named third-party tool (`mayf3/dsh-session-doctor`, unscoped
  name) is listed — discovery/name-confusion risk, ours stays scoped as `@aturdana/...`. rc.2 shipping two of our
  documented bug classes is impact without attribution, not acceptance.
- Next: rebase in three waves (easy → verify with targeted tests; medium after reviewing upstream file refactors;
  heavy with refactor-aware adaptation), re-anchor published commit links only after a rebased branch is tested (no
  force-push of unverified histories), then re-audit which reports rc.2 already fixed so the ledger does not claim open
  bugs that are closed. Release notes saved at `.tools/tmp/rc2-notes.md`.

### 2026-11-12 (morning) — rebase wave 1 + partial wave 2 onto 0.2.2-rc.2; runtime upgrade audit

- Daily sync: upstream unchanged at **`e8f7b93a34`** (0.2.2-rc.2, released 2026-11-11T11:33Z); `fork/master` current;
  `pnpm-lock.yaml`/`pnpm-workspace.yaml` drifted (+821/−383), so `pnpm install --frozen-lockfile` was required before
  any verification. `pnpm run typecheck` 5/5 on the new base.
- **Wave 1 (13 branches) rebased and pushed** onto `origin/master`: docs/cordis-skill-replacement-restart,
  docs/recovery-handwritten-rows, feat/locale-writing-direction, fix/hmr-transaction-context,
  fix/open-in-app-electron-env, fix/plugin-manager-update-line, fix/schedule-completion-gate,
  fix/static-index-no-store, fix/effect-async-rejection, fix/file-reference-scope-guard,
  fix/subprocess-managed-internals, fix/agent-preset-unknown-message, fix/windows-alias-executable.
  Per-branch changed-test matrix: **212 tests passed** across 11 branches (2 docs-only), e.g. locale 9, hmr 18,
  open-in-app 4, plugin-manager 8, schedule 36, static-index 3, effect 12, file-reference 8, subprocess 32,
  agent-preset 39, windows-alias 43. Lint 0 on changed files; pushes used `--force-with-lease` and the pre-push
  typecheck hook.
- One real conflict in wave 1: `fix/subprocess-managed-internals` against the upstream `SubprocessError`/`loadNodePty`
  refactor. Resolved by keeping upstream's new import/function and lifting the runner seams into `spawn()` unchanged;
  verified that upstream rc.2 **still** calls `launchWindowsJob(spec, env)` / `launchLinuxScope(spec, env, argv)` without
  seams, so the fix remains needed. Post-rebase: local.spec 32/32, lint 0, typecheck 5/5.
- **Wave 2 (partial)**: `fix/desktop-cookie-cleanup-order` rebased clean (main-startup 186/186) and
  `fix/tool-result-well-formed` rebased after resolving an import conflict (upstream removed `joinContextSections`;
  kept `wellFormedToolResult`) — session + agent-loop contract tests 124/124, lint 0, typecheck 5/5. Both pushed.
- Deferred with reasons: `fix/chat-tail-space-reclaim` (conflict in `use-chat-scroll.ts` after upstream chat-scroll
  work), `fix/boot-launcher-runtime-version` and `fix/profile-silent-reset-guard` (translation-pairing hash conflicts;
  `scripts/verify-translation-pairing.ts --write <pair>` can regenerate, but the per-commit rebase needs care),
  `fix/dsh-bug-triage` (114 upstream touches) and `fix/truncation-surrogate-pairs` (82) — refactor-aware adaptation.
- Current tips (post-rebase, all authored `Atur Dana <aturzone@gmail.com>`): effect `268ed533b9`,
  tool-result `0130e42368`, subprocess `04742f8ef8`, cookie `dbcbd6708d`, locale `c2e33b610a`,
  static-index `177ff2b879`, hmr `09b6d142c5`, schedule `13211d6ca9`, file-reference `e1c2dfb4ba`,
  open-in-app `e330bc6609`, plugin-manager `2b2623b917`, agent-preset `149ab80554`, windows-alias `f202171bb2`,
  docs/* `7a80add9a8`/`45bd6c38be`; deferred branches keep the pre-rebase tips.
- Public reference re-anchored: the #12609 comment's patch link now points at `268ed533b9`.
- **Runtime audit:** the owner restarted `dsh web` at 08:22 local; it runs **0.2.2-rc.1** (global install on disk),
  chat healthy. npm now has **`next` = 0.2.2-rc.2** (published 2026-11-12T02:16Z) while `latest` is still rc.1.
  Profile `web` pins `@deepseek-ai/dsh-subagent-claude-code@0.2.1-rc.5`, so two subagent rows are disabled as
  incompatible with rc.1. Planned single coordinated upgrade (dsh rc.2 + profile plugin rc.2, `--allow-scripts` for
  node-pty/koffi/dsh-subprocess-local/... , then a controlled tmux restart) so server and served assets never
  cross versions again. `~/.local/bin/dsh-update` (with `--check`) exists for this; do not run it under a live server
  without restarting afterwards.

### 2026-11-13 (night) — all 20 patch branches rebased onto rc.2 and pushed

- Remaining wave-2 and heavy branches rebased onto `e8f7b93a34` and pushed: `fix/chat-tail-space-reclaim`
  (f33c981beb; full ui-chat 61 files / 1020 tests), `fix/desktop-cookie-cleanup-order` (dbcbd6708d; main-startup
  186/186), `fix/tool-result-well-formed` (0130e42368; session + agent-loop contracts 124/124; upstream removed
  `joinContextSections`, kept `wellFormedToolResult`), `fix/boot-launcher-runtime-version` (0935114bf1; adapted to the
  new update planner and `listedByDefault` diagnostic; compatibility-preflight + manager 199/202 with the 3 known real-Git
  network failures), `fix/profile-silent-reset-guard` (367c773da3; profile 40/40), `fix/truncation-surrogate-pairs`
  (50d8c8d60a; read-render + tool-web + market 148/148; upstream still uses `substring`, so the fix stands), and
  `fix/dsh-bug-triage` (35b5255eaf; 435 tests across session/PTC/auto-review/tool-fs/preset/settings/spill).
- Heavy-port notes: the triage branch was adapted to the new **batched append API** — the turn cursor is planned across
  all batch members before publishing and committed with the events; PTC catches follow upstream's
  `(result, imageRemoved)` settle signature and still drop log-only records on any append failure; settings keeps the
  schema guard as the single entry point (strict `meta` access); PTC tests use the current `PtcRunResult` shape.
- Pairings regenerated for `app-boot`, `tool-executor-ptc`, and `session` READMEs; `pnpm run test:docs` is 20/21 with
  only the known local `animation/` scratch-directory failure. `pnpm run typecheck` 5/5 and lint 0 on every branch.
- Current tips (all authored Atur Dana, all containing `e8f7b93a34`, all equal to their `fork/*` refs):
  docs 7a80add9a8/45bd6c38be, locale c2e33b610a, agent-preset 149ab80554, boot-launcher 0935114bf1,
  chat-tail f33c981beb, cookie dbcbd6708d, triage 35b5255eaf, effect 268ed533b9, file-reference e1c2dfb4ba,
  hmr 09b6d142c5, open-in-app e330bc6609, plugin-manager 2b2623b917, profile-reset 367c773da3,
  schedule 13211d6ca9, static-index 177ff2b879, subprocess 04742f8ef8, tool-result 0130e42368,
  truncation 50d8c8d60a, windows-alias f202171bb2.
- Environment note: concurrent typecheck gates can hit the 2 GB tsc heap in this session (cgroup pressure); use
  `NODE_OPTIONS=--max-old-space-size=8192 DSH_GATE_CONCURRENCY=1` for pre-push/typecheck when memory is tight.

- Triage published on #13139 (macOS `~/.zshrc` + `~/.vim/` data loss): audited 0.2.2-rc.2 and found no harness
  routine that deletes these paths — the only shell-config interactions are the read-only desktop login-shell probe
  (`apps/desktop/src/login-shell-environment.ts:105-179`), the temporary `mkdtemp` rc used by shell-activity
  (`packages/subprocess/subprocess-local/src/shell-activity.ts:45,66,128`), and profile-staging removals under
  `$DSH_HOME/profiles` (`apps/cli/src/profile-boot.ts:151-172`); `.vim` appears in no code path at all. Published the
  class analysis: likely a destructive tool command with `danger-full-access` + `never`, evidence list for the
  reporter (zsh history, Desktop host logs, APFS snapshots, mtimes), the guard seam (`tools/pre-execute` /
  `ctx.tools.guard`, `PreToolDecision`), the limits of the community PowerShell guard (#9173), and an offer to build
  and test an installable protected-dotfile guard: https://github.com/deepseek-ai/deepseek-harness/discussions/13139#discussioncomment-19578821

### 2026-11-13 — 0.2.2-rc.3 released; all remaining branches rebased (one retired as upstream-fixed)

- Upstream moved again: `origin/master` = **`39163dd30f`** (+448 commits) and `dsh-v0.2.2-rc.3` was published
  2026-11-13T07:56Z; npm `next` = rc.3 (`latest` still rc.1). Local `master` advanced and `fork/master` synced.
- Rebase: 19 patch branches onto rc.3 (17 clean; 3 required porting), all pushed as `Atur Dana`:
  `fix/dsh-bug-triage` (`8ecd9269fd`; rc.3 made `SessionId`/`ToolCallId` brand values type-only in tests — fixtures
  switched to `brandString<T>()`, PTC spill fixtures re-opened their turns), `fix/schedule-completion-gate`
  (`59f53412de`; rc.3 moved Session status into `dsh-client-ui-session-status` — the `CompletionGate` seam was
  re-implemented on `UiSessionStatus` and ui-schedule registers its catalog gate there, with the new package dependency,
  tsconfig reference and lockfile entry), and `fix/static-index-no-store` (`c0592b8d4f`; adapted to the new
  `renderIndex`/authorize refactor and kept `cache-control: no-store` on the rendered index).
- **Retired as fixed upstream:** `fix/open-in-app-electron-env` — upstream landed the same `ELECTRON_RUN_AS_NODE`
  removal in `a8ea5fcf81` plus the case-insensitive regression `374ab6172a`; branch deleted locally and on the fork.
- Evidence: changed-test matrix on rc.3 — locale 9, agent-preset 39, chat-tail 16, file-reference 8, hmr 18,
  plugin-manager 8, profile-reset 40, static-index 8, subprocess 32, truncation 154, windows-alias 43,
  effect 12, cookie 186, tool-result 124, boot-launcher 203/206 (3 known real-Git network failures), triage 338,
  schedule port 776+72; `pnpm run typecheck` 5/5 and lint 0 on every branch (used
  `NODE_OPTIONS=--max-old-space-size=8192 DSH_GATE_CONCURRENCY=1` under cgroup memory pressure).
- Current tips (all contain rc.3, match `fork/*`): docs `c116153892`/`616bbf5c3b`, locale `33623108f3`,
  agent-preset `6871f1c092`, boot-launcher `1265c9be13`, chat-tail `7f79aa4da2`,
  triage `8ecd9269fd`, effect `20e54b7762`, file-reference `f7a4c3adad`, hmr `6e45d490f0`,
  open-in-app **retired**, plugin-manager `160fee127e`, profile-reset `9cbe9deaf3`, schedule `59f53412de`,
  static-index `c0592b8d4f`, subprocess `0af1b8dee6`, tool-result `b724c5d461`, truncation `9dcd0d16dd`,
  windows-alias `0fa5b1c989`.
- Public replies: #13187 (new cookie-overflow report) — ancestry proof that `5868dbc357`/`93bef27ec7` are in rc.2/rc.3
  while the reporter measured rc.1, the janitor plugin's remaining role, and our ordering branch:
  https://github.com/deepseek-ai/deepseek-harness/discussions/13187#discussioncomment-19586605 · #13139 triage posted
  earlier (night section) · #12609 comment SHA re-anchored to `20e54b7762`.
- Still unmerged upstream (markers absent on rc.3): `SessionTurnScopeError`, `wellFormedToolResult`, `CompletionGate`,
  `turnRunning` — so the patch set remains live. Next re-audit: which other branches are now upstream-fixed
  (open-in-app was the first), plus the RTL logical-CSS slice.

- RTL slice: `feat/locale-writing-direction` (`919abb1f1a`, pushed) now converts every direction-dependent declaration in
  `ui-chat` to logical properties and adds a node-environment regression that scans the chat style sheets for
  physical sides (the statistics dialog stays physical: CSS anchor positioning exposes only `anchor(left)`). ui-chat
  1028/1028, typecheck 5/5, lint 0; posted under #10144 (`#discussioncomment-19590581`) with the remaining scope
  (other client packages + actual `direction: 'rtl'` values in Persian/Arabic packs).
- Runtime upgrade prepared: the host's only `node` is `/usr/bin/node` **v22.22.1** while DSH rc.3 declares
  `engines.node >=24.9.0`. The workspace-local Node 24.22.2 is therefore staged as `~/.local/node24` (copy), and a
  one-shot script (`~/.local/bin/dsh-upgrade-rc3.sh`) stops the tmux `dsh web`, installs
  `@deepseek-ai/dsh@0.2.2-rc.3` with Node 24's npm, updates the web profile's
  `@deepseek-ai/dsh-subagent-claude-code` to rc.3, rewrites `~/.local/bin/dsh` as a wrapper that always execs Node 24,
  and restarts the tmux host (with an rc.1 rollback path). Pre-validated in a temp prefix + temp `DSH_HOME`:
  rc.3 boots under Node 24 and serves entry 303 / page 200. The upgrade is scheduled from a separate tmux window after
  the session's final message so the active chat can persist while the server restarts.

### 2026-11-13 (evening) — mention triage (#9924): rc.1 scan confirmed, packaged Windows build is rc.3, ordering branch retired

- **Mention found and answered:** GitHub notification `mention` on #9924 (WEZHCE, 2026-11-13T13:09Z) references our
  rc.2/rc.3 ancestry analysis from #13187. Replied after tag-level verification:
  https://github.com/deepseek-ai/deepseek-harness/discussions/9924#discussioncomment-19597073
- Confirmed from `dsh-v0.2.2-rc.1`: none of `removeLegacyHostCookies` / `local-auth-cleanup` /
  `oldCookieHeaderBytes` / `deletedLocalAuthCookies` / `recovery-backups` exist there; `5868dbc357` and
  `93bef27ec7` (2026-10-31) are ancestors of rc.2/rc.3 only; rc.1's welcome client joins the whole cookie jar at
  `apps/desktop/src/main.ts:536`. The reporter's asar scan is correct, and the `oldCookieHeaderBytes` field came
  from their external repair tool, not the shipped build.
- The rc.2/rc.3 fix is not the prune: the auth path stopped reading the jar (rc.3 `main.ts:549-555`,
  `welcome-backend.ts:46-48`, `account-backend.ts:103`); `void removeLegacyHostCookies` is cleanup only.
  Master went further on 2026-11-12 (`71753fdf91`, post-rc.3): `parent-authentication.ts:34` +
  `host-process.ts:272` mint `dsh-desktop-session` over IPC, so there is no HTTP handshake and no `dsh-auth-*` use.
  Consequence: `fix/desktop-cookie-cleanup-order` had no defect behind it — **retired** (local + fork deleted);
  the ordering claim in #13187 is corrected in the #9924 reply.
- **Packaged Windows build is rc.3 as of today:** `HEAD https://download.deepseek.com/desktop/dsh-latest-windows-x64.exe`
  → `Content-Disposition: attachment; filename="deepseek-harness-0.2.2-rc.3-win-x64.exe"`,
  `Last-Modified: 2026-11-13T15:55:17Z`, 299,595,752 B. The electron-updater feed path the reporter probed
  (`/dsh-desk/feeds/win-x64/latest.yml`) 404s from here too and the GitHub release has no assets — auto-update lag
  explains their rc.1 cache, not missing source.
- Independently A/B'd `cookieMaxAgeDays` on a fixed-port temp web profile: default `Max-Age=2592000`, patched
  entry `Max-Age=604800`, same port-bound cookie name, `trustedHosts` preserved (a patch entry replaces the row
  config wholesale; bundle row `packages/bundle/web-app/cordis.patch.yml:237-244`). Caveats published: it bounds
  new cookies only, and lowering the value invalidates already-issued cookies whose signed lifetime exceeds it
  (`browser-auth.ts:381`).
- **Runtime upgrade attempt 1 (17:06) rolled back on a false negative:** the liveness check used
  `pgrep -f 'dsh web'`, but the wrapper runs `node .../lib/bin.js web`, so the script rolled back while rc.3 was
  fine. Re-validated rc.3 against a copy of the real profile under Node 24: boots, token URL 303, page 401.
  Attempt 2 scheduled with the process check fixed (`lib/bin.js web`), `~/.local/bin` in PATH, marker-based pane
  check and the same rollback path. Script `~/.local/bin/dsh-upgrade-rc3b.sh`; log
  `~/.local/state/dsh-upgrade.log`.

### 2026-11-15 — daily status: runtime upgraded, upstream quiet, plugins repaired, daily check scheduled

- **Runtime is now 0.2.2-rc.3 under Node 24.** `dsh --version` = `0.2.2-rc.3`; host pid runs
  `/home/atur/.local/node24/bin/node .../@deepseek-ai/dsh/lib/bin.js web` (current pid 1038272, started
  2026-11-14 14:49). The Nov-13 attempt-2 log confirms the successful swap (`wrapper version: 0.2.2-rc.3`,
  `host up=yes`, `exe=node24`) at 2026-11-13T22:24; the rc.1 rollback path was not needed.
- **Upstream has not moved since 2026-11-13.** `origin/master` is still `39163dd30f` (0 commits behind local
  master; fork/master identical), no rc.4 tag; npm dist-tags `next=0.2.2-rc.3`, `latest=0.2.2-rc.1`. Our guard
  markers remain absent from `origin/master` (`SessionTurnScopeError`, `wellFormedToolResult`, `CompletionGate`,
  `turnRunning`, `managedRunnerSeams`), so the 18 patch branches are still live; fork holds all 19 branches
  (18 + master).
- **Notifications:** no maintainer replies. New community comment on #13139 (argszero, 2026-11-14T02:13Z) announces
  an adjacent recursive-delete guard plugin and explicitly says it does not cover the reported selective deletion —
  informational, no action needed. The aot-runner mention turned out to be their own plugin-listing PR (#13369)
  moving to MERGED in `awesome-dsh-plugin`, unrelated to DSH upstream.
- **Profile repaired:** `@deepseek-ai/dsh-subagent-claude-code` and `@deepseek-ai/dsh-tool-subagent` were still
  `0.2.1-rc.5` (incompatible with rc.3, rows disabled). Updated to `0.2.2-rc.3` with
  `dsh plugin --profile web add` (workspace pnpm 11.28.5 under Node 24; the global pnpm shim hangs under Node 22);
  `dsh --profile web --dump-config` now emits no incompatibility warnings. A delayed tmux restart
  (`~/.local/bin/dsh-restart.sh`) activates the rows.
- **Daily check scheduled:** `schedule-374eea1b-4932-4a18-82cf-b9d590b1e69d` — "DSH project daily status check",
  `DTSTART;TZID=Asia/Tehran:20261116T093000`, `FREQ=DAILY`, target `new_once` (one dedicated session), first run
  2026-11-16 09:30 Tehran. The prompt covers runtime/upgrade, upstream sync, notifications/mentions, branch
  currency + upstream-fixed retirement, profile compatibility, ledger record and a Persian report.

### 2026-11-16 — daily status: runtime and upstream unchanged, no new replies, all branches current

- **Runtime:** `dsh --version` = `0.2.2-rc.3`; host pid 111396 runs
  `/home/atur/.local/node24/bin/node /home/atur/.local/lib/node_modules/@deepseek-ai/dsh/lib/bin.js web`
  (started 2026-11-16 08:43), listening `127.0.0.1:3080` (root answers 401 without a token) plus inspector
  `:9230`. tmux `dsh:0` still prints the `dsh web:` URL. npm dist-tags through the proxy:
  `next=0.2.2-rc.3`, `latest=0.2.2-rc.1`; running equals `next`, so no upgrade was staged. The pane shows one
  `[deepseek-account] ... status 403` line; model listing succeeds (2 rows) and no plugin disable messages.
- **Upstream:** `origin/master` = `39163dd30f` (2026-11-13, rc.3 merge), unchanged since the last check; local
  `master` and `fork/master` are that same commit (0 behind / 0 ahead), and no `dsh-v*` tag newer than
  `dsh-v0.2.2-rc.3` exists. Fetch used `http.version=HTTP/1.1`; no GnuTLS retry was needed.
- **Notifications:** `all=true&since=2026-11-15T00:00Z` returns 0 items and unread is 0. The most recent comment
  (argszero, #13139, 2026-11-14T02:13Z) was already triaged on 2026-11-15 as informational — it states itself that
  the guard does not cover the reported selective deletion — so no reply was posted.
- **Branches:** 19 local branches (18 patch + `master`); all 18 patch tips are identical to
  `aturzone/deepseek-harness`, each based exactly on `origin/master` and 1–4 commits ahead. `git grep` on
  `origin/master` for `SessionTurnScopeError`, `wellFormedToolResult`, `CompletionGate`, `turnRunning`,
  `managedRunnerSeams` returns 0 hits each, so no branch is upstream-fixed and none was retired.
- **Profile:** `~/.dsh/profiles/web` pins `@deepseek-ai/dsh-subagent-claude-code` `0.2.2-rc.3`; installed
  `@deepseek-ai/dsh-tool-subagent` is also `0.2.2-rc.3`, matching the host. `dsh --profile web --dump-config`
  exits 0 with no incompatibility/disabled warning on stderr.
- **Worktree:** moved the untracked 498 MB `.tmp-ofm/` rehearsal tree (fake DSH home, repacked plugin, logs) to
  `~/.local/state/dsh-scratch/tmp-ofm-2026-11-15`; no process had it open. `git status` is clean.
- **Next action:** watch for an rc.4 tag or any `origin/master` movement, then rebase and push the 18 branches;
  no public reply is pending.

### 2026-11-18 (night) — caught up after 4 silent days: rc.4 wave synced, HMR cache-child fix shipped

- **Honest gap:** no public contribution 2026-11-14…17. The daily-check schedule
  (`schedule-374eea1b-…`) was deleted externally before its first delivery (2026-11-16 09:30), so the rc.4 wave was
  missed; upstream shipped `dsh-v0.2.2-rc.4` on 2026-11-17T17:53Z and `master` advanced 807 commits
  (`39163dd30f` → **`ca33fd6843`**, 2026-11-17T22:17+0800). npm: `next=0.2.2-rc.4`, `latest=0.2.2-rc.1`.
- **Sync:** local `master` fast-forwarded to `ca33fd6843`; `fork/master` fast-forwarded to the same commit with a
  GitHub API `PATCH /git/refs/heads/master` (`force:false`, HTTP 200) because the git pre-push hook runs the full
  `pnpm run typecheck` under `/usr/bin/node` v22 and dies on TypeScript type stripping before pushing.
- **Contribution shipped:** `fix/hmr-module-graph-child-filename` @ `7e4bf5601d` (based on `ca33fd6843`), pushed to
  fork. `moduleGraph()` skips `require.cache` children whose `filename` is not a string; one such child previously
  made `pathToFileURL(undefined)` throw, which `contained()` turns into a whole-batch pending plan ("restart
  required"). Regression plants `require.cache[planted] = { exports: {}, children: [{ id: … }] }` beside a changed
  plugin: pre-fix `pending: [{ url: …/planted.cjs, reason: 'module-comparison' }]`, post-fix
  `{ warnings: [], pending: [] }` and the plugin is replaced. Evidence comments:
  #13623 https://github.com/deepseek-ai/deepseek-harness/discussions/13623#discussioncomment-19691730 and the
  canonical duplicate #10897 https://github.com/deepseek-ai/deepseek-harness/discussions/10897#discussioncomment-19691731
- **Checks:** `packages/boot/hmr/tests` 241/241; Oxlint 0 errors on both changed files; `tsc -b packages/boot/hmr`
  exit 0. Repo-wide `pnpm run typecheck` was stopped at 25 min (host + client compilers had passed; aggregate checks
  still running), so that gate is left to CI — stated as such in the public comment.
- **Branch queue after rc.4:** the 18 existing patch branches are still rc.3-based and now 807 commits behind. The
  guard markers remain absent from `origin/master` (`SessionTurnScopeError`, `wellFormedToolResult`, `CompletionGate`,
  `turnRunning`, `managedRunnerSeams`), so none of those fixes landed. Spot audit on rc.4: file-reference scope
  guard, profile-reset guard and the HMR transaction-context shape (`AsyncLocalStorage<boolean>`) are still needed;
  agent-preset and static-index branches still apply but need a post-rebase re-check; upstream now carries a
  structured `agent-preset/not-found` error with `available` in details (message text still lacks the list, so the
  toast fix remains relevant).
- **Migration freeze (2026-11-17 alert):** no rebase wave, no runtime upgrade to rc.4 and no new servers/background
  jobs on this host; host stays on rc.3. Handoff recorded in brain (`journal`, `memory`); daily check is not
  recreated until the migration is done. Post-migration order: re-clone/restore checkout → rebase the 18 branches
  onto rc.4 → upgrade runtime + profile plugins to rc.4 → recreate the daily check.

### 2026-11-23 — Debian workspace bootstrap + full rebase wave onto 0.2.3-alpha.2

**Post-migration workspace is live.** The `sword` → Debian 13 migration completed; the contribution workspace is
now `/home/atur/Workspace/deepseek-harness` (clone of the fork, main clone on `master` @ `4b399c39a6`). Bootstrap
facts and the sandbox/toolchain workarounds are in `migration/DEBIAN-WORKSPACE-2026-11-23.md`; `.tools/env.sh`
(recorded as `migration/env.sh`) is the entry point for every command. Fork `master` is current at `4b399c39a6`;
`upstream` is configured read-only for drift checks. Gates verified on the new host:
`CI=true pnpm install --frozen-lockfile` 3m07s; repo-wide `pnpm run typecheck` 5/5 gates in 157 s; HMR suite 240
pass. Git hooks are installed, so every branch push ran the real pre-push typecheck (30–175 s each) instead of
bypassing it.

**Full rebase wave.** All 19 prepared branches were checked against `origin/master` (= `dsh-v0.2.3-alpha.2`, released
2026-11-22), rebased, re-verified with focused owning tests + focused `tsc -b` + oxlint, and published to the fork
with `--force-with-lease` (observed old OID recorded per branch). `git merge-tree` had predicted 9 textual conflicts;
each conflict was re-applied on the current code, and upstream refactors required semantic adaptation in 9 branches.
Result: **18 current branches, 1 retire-candidate, 0 merged upstream.**

| branch | new tip | status | adaptation note |
|---|---|---|---|
| fix/hmr-module-graph-child-filename | 28ee62b21d | clean | — |
| fix/tool-result-well-formed | cb1a270940 | adapted | choke points re-applied after master moved seed validation into `checkSessionLog`/`validation.ts`; the `renderPrompt` removal is absorbed |
| fix/dsh-bug-triage | ebe670f393 (7 commits) | adapted | turn-scope guard validates batch surface metadata before rejecting; upstream `programValue`/`startLogged` PTC shape kept; five upstream-added direct-PTC fixtures now open a turn; bilingual pairing re-recorded; the settings `describe` fix survives |
| fix/hmr-transaction-context | c5d2da45da | adapted | settle-context README sentence merged onto the `--patch` overlay wording |
| fix/file-reference-scope-guard | 71c4783eed | clean | negative control still fails with `INACTIVE_EFFECT` on master |
| fix/effect-async-rejection | bf45cd0bab | adapted | vendor log entry renumbered to **V31** (`next V32`); upstream Cordis is still rc.12 and still discards async-effect rejections |
| fix/boot-launcher-runtime-version | 7131ded977 | adapted | `profileContext.runtimeVersion` re-applied on the renamed `overlayPaths` field; EN/ZH README and pairing re-recorded |
| fix/profile-silent-reset-guard | 0dcf43686b | adapted | initializer-owned set keeps `lock` (legacy Desktop artifact, no current writer); lint bracing |
| fix/agent-preset-unknown-message | ae5e67638b | clean | — |
| fix/static-index-no-store | 6ebd5f4dd7 | clean | — |
| fix/plugin-manager-update-line | 769d65d5ee | clean | — |
| fix/schedule-completion-gate | 17101ee2ae | clean | adds `@deepseek-ai/dsh-client-ui-session-status` workspace dep + client tsconfig reference + lockfile; frozen install verified |
| fix/chat-tail-space-reclaim | d51b8851c6 | clean | — |
| fix/truncation-surrogate-pairs | ae88e64bce | adapted | uses `truncateWithoutSplittingSurrogatePair`; **changes the upstream characterization test from PR #8643** that pinned the lone surrogate, and the commit says why |
| fix/windows-alias-executable | 38f60c700e | adapted | alias acceptance moved inside upstream `isExecutableFile()` catch |
| fix/subprocess-managed-internals | d631ef321f | clean | — |
| feat/locale-writing-direction | b2d6d0c133 | adapted | logical CSS; rail/preview follow upstream's move to inline-start; new logical-CSS scanner + `document-language` specs; aside-style expectation updated |
| docs/recovery-handwritten-rows | 1c9940f5e0 | clean | `test:docs` 21/21 |
| docs/cordis-skill-replacement-restart | c116153892 (unchanged) | **RETIRE-CANDIDATE** | upstream `fe6229109f` + `9b431e701e` now state the recomposition-reload rule and name `restartReason`; stronger than our edit. Fork branch retained, nothing deleted |

**Fix-still-needed re-confirmed on master** (greps): no `SessionTurnScopeError` / `wellFormedToolResult` /
`CompletionGate` / `turnRunning` / `managedRunnerSeams`; no `profileContext.runtimeVersion`; no
`isWindowsAppExecutionAlias`; no logical inline/block CSS in the chat surface; no index `no-store`; no registry
`latest` update line; profile reset still silent; the recovery README still omits hand-written rows. One open
decision: keep or later delete the retired `docs/cordis-skill-replacement-restart` fork branch.

**Public activity since the freeze (only one new item, a mention):**
- #9924 mention (Minervaowl7, 2026-11-19 05:09Z): Windows x64 packaged **0.2.2-rc.5**, two clean starts,
  `dsh-auth-*` `0 → 0 → 0`. Replied with tag-level evidence: rc.5 carries `removeLegacyHostCookies`
  (`apps/desktop/src/main.ts:551`, `web-document.ts:65-69`) and no longer stores a jar cookie
  (`main.ts:547-555`), while `dsh-v0.2.2-rc.1` has neither; included a deliberate legacy-row seeding procedure to
  exercise the cleanup half → `#discussioncomment-19834172`.
- #12911: closed our own loop with the rc.5 fact and the community datapoint →
  `#discussioncomment-19834326`.
- Sweep of all 30 tracked discussions: **zero other comments since 2026-11-18**; still zero maintainer replies.

**Durable state:** meta branch rebased onto current master and refreshed with this ledger + the bootstrap doc →
`meta/context-map` @ `c1513e70b3` (bootstrap commit) + this entry. Worktrees kept under `.worktrees/{wA,wB,wC}` for
the next wave; the main clone stays clean on `master`.

**Open:** runtime upgrade `0.2.2-rc.1` → `0.2.2-rc.5` (or the alpha line) needs a supervised restart and changes the
GUI URL; `dsh-session-doctor` npm publish is still blocked on account 2FA; the daily 09:00 Asia/Tehran status check
was not recreated.

## Currency rule (2026-11-06)

- Owner flagged the fork as "260 commits behind". Diagnosis: **upstream had not moved** (`origin/master` and the live
  GitHub head are both `fcc0ad4621`, 2026-11-04); the gap was the **fork's default branch** stuck at `8bd073392e`
  (2026-11-03). Fixed by fast-forwarding `fork/master` to `fcc0ad4621`; the fork comparison now shows 0 behind.
- Rule encoded: `.tools/dsh-sync.sh` now fetches `fork` and fast-forwards `fork/master` to `origin/master` on every run,
  printing `fork master current (<sha>)`; failures warn without failing the upstream sync. `00-README.md` daily step 1
  and the non-negotiables now require both lines. (Caught a bash pitfall while wiring it: `sync_fork_default()` invokes
  a definition header and swallows the following block — the call must be `sync_fork_default`.)
- Re-verified after the fix: `./.tools/dsh-sync.sh` ends with `fork master current (fcc0ad4621)` and exits 0.

## Scheduled check-in (2026-11-06 08:32 local)

- **Replies/feedback**: #11763 (4 comments) last is ours; #11971 (2) last ours; #11981 (3) last ours since
  2026-11-04 04:43 (≈2.5 days, no maintainer); #11121 (5 now) last is **community peer validation** from
  lingluochengni918: ported our `{ active }` HMR fix into a real 0.2.1-rc.2 install, A/B tested (5/5 nested
  failures unfixed vs 7 cases × 5 rounds green fixed), no production regression, plus the plugin-compatibility
  caveat (old truthiness checks degrade). Replied acknowledging the boundaries.
- **Upstream**: still `fcc0ad4621` (2026-11-04T08:40Z; `pushed_at` 2026-11-04T13:06Z). Nothing moved; none of the
  reported bugs fixed. Reminder's `8bd073392e` is our fork base from an earlier comment, not current upstream.
- **Branches**: `fix/dsh-bug-triage` @ `3683b3d4c7`, `fix/hmr-transaction-context` @ `05f68b5db9`; both pushed,
  based on `fcc0ad4621`, worktree clean, and covered by the previously audited gates.
- **Alternatives assessed after the no-response window**: Issues are disabled and PRs are disabled, so there is no
  escalation channel beyond Discussions; another bump would be noise. The viable alternative is a userland
  mitigation plugin for the unfixed corruption class (sanitize tool results in `tools/post-execute`) plus continuing
  core patches. Decision: keep shipping core fixes (#12271/#12289 next) and prepare the userland fallback only if the
  owner wants it; do not ping maintainers again unprompted.

### 2026-11-06 (later) — Phase 1 unit 33 (RTL direction foundation)
- Owner asked for RTL support as a core contribution. Surveyed: no direction support exists anywhere; locale README documents the
  gap ("does not add … bidirectional layout"); GUI has 652 physical CSS declarations across 141 files, so a full RTL rollout is a
  multi-package epic.
- Delivered the missing enabler: `LanguageRegistration`/`LocaleDefinition.direction` ("ltr" | "rtl", omitted = ltr), `<html dir>`
  applied and reasserted on language-pack load/unload/switch, validation at the JS pack boundary with a narrow justified lint
  exception. Direction stays on definitions so snapshot consumers are unchanged.
- Evidence: locale tests 72/72 (LTR, RTL both ways, unload fallback, invalid direction), `client/locale/src` 100% coverage,
  typecheck 5/5, full lint 0 errors, README EN/ZH paired. Published on #10144 with the explicit boundary that per-component
  logical-CSS conversion remains.
- Also surveyed RTL tracker context: #10144 umbrella, #11672/#7404/#8935 ecosystem packs, #11248 mixed-bidi text separate;
  #11688 is misfiled against chat.deepseek.com, not DSH.

### 2026-11-06 (later 3) — Phase 1 unit 35 (cookie cleanup ordering + responsiveness research)
- Owner asked for remaining work plus research on how long upstream needs to answer. Research recorded above; the
  concrete finding is that Discussions have received no reviewer comments in either sampled window.
- Shipped a hardening patch for #12360: the desktop already prunes legacy `dsh-auth-*` cookies for the default session,
  but did so fire-and-forget, so the welcome connection/page could still race the prune. The boot now awaits the prune
  (failures stay non-blocking) with an ordering regression that fails on the former code. `495f17a0e4`;
  desktop main-startup + web-document tests 175 passed, typecheck 5/5, lint 0.
- Also triaged the day's new reports: #12436 is the #12290 data-loss family, #12433 needs desktop lifecycle work,
  #12435 is Windows-sandbox-only, #12434 is the Windows updater, #12437 is a Kiwi-browser rendering case.

### 2026-11-06 (later 2) — Phase 1 unit 34 (scheduled-task completion dot)
- Implemented #12271 as a seam instead of a cross-package query: `ui-session` gains `registerCompletionGate(gate)`; the status
  snapshot applies every gate, so the finished reminder is withheld dynamically and returns when the withholding ends.
- `ui-schedule` registers one gate over its existing shared catalog (settled+ready, active records whose target Session matches;
  `new` targets are skipped). Before the first settled read nothing is withheld.
- Evidence: 800 client tests (ui-session + ui-schedule) passed; changed ranges 100% covered (verified from v8 JSON); typecheck 5/5;
  full lint 0 errors. Published on #12271 with the design trade-off explained.
- Note: one `unbound-method` lint finding was fixed by keeping a closure wrapper and covering it from the test instead of suppressing.

## Reviewer path (2026-11-06)
- Published Ideas discussion **#12346**: "five ways Session data is still the fragile part of DSH" — durable text
  invariants, session diagnostics, profile/data recovery UX, upgrade compatibility diagnostics, stable hosted-UI
  identity, each with report evidence and a minimal shape. No merge ask; offer to review or implement.
- Added `.context-map/playbook/09-reviewer-path.md`: reviewer-standard definition, programme (gap synthesis,
  subsystem reviews, patch follow-through, community service), near-term queue.
- npm publish of `dsh-session-doctor` still pending owner `npm login` (`npm whoami` ENEEDAUTH as of round start).

## Plugin publication (2026-11-06)
- Owner approved publication. GitHub repo created and pushed: https://github.com/aturzone/dsh-session-doctor
  (topics: `dsh-plugin`, `deepseek-harness`, `session-diagnostics`; metadata repository/homepage/bugs set;
  PUBLISHING.md updated with executed status).
- npm: owner completed `npm login` (account `aturzone`). `npm publish --tag next` then returned **403** — the
  registry requires 2FA or a granular token with bypass-2fa; the CLI here does not offer an OTP prompt.
  Owner chose **defer npm** (GitHub repo remains live and git-installable). Also normalized the package `bin`
  path for a clean tarball (`2a4421f`). Do not retry npm without an explicit owner request/token.
- Repo commits: `8ce9b96` (plugin import), `fb75cc1` (metadata + status).

## Consolidated index (2026-11-05)

- Published Discussion **#12299** as a single factual index of the eleven verified reproductions and their fix branches:
  https://github.com/deepseek-ai/deepseek-harness/discussions/12299
- It states plainly that nothing is merged/accepted, carries the honest boundaries (silent-reset scope, unverified
  surrogate carriers, version-list shape), and offers to reshape/split/rebase for any maintainer request.
- Status: **published**, not acknowledged; it is the channel maintainers said they monitor.

## Strategic note (2026-11-05)

- None of the six 2-point reviewer accounts has commented in recent dsh Discussions; their public activity is on
  `deepseek-ai/dsh-superagent-prototype` (maintainer pushes/watches). That repo is public/MIT but also has issues,
  discussions, and pull-requests surfaces closed/empty — no open external contribution channel there either.
- The dsh GitHub Pull Requests API returns 404: PRs are disabled, not just discouraged. Acceptance therefore depends on
  the team acting internally or an explicit invitation; our job is to keep evidence impeccable and visible.

## Daily log

Append one block per working day. Keep it terse and factual.

```
### YYYY-MM-DD
- Upstream: <sha> (+N commits); rebased branches: <list>
- Shipped: <commit/comment/report + link>
- Status changes: <item>: <old> -> <new> (proof: <link>)
- Checks run: <exact commands + result>
- Blocked by: <maintainer attention / policy / missing artifact / none>
- Next: <one concrete unit>
```

### 2026-11-05
- Upstream: `fcc0ad4621` (`0.2.2-rc.1`, +260 commits); both branches rebased, typecheck 5/5, session+PTC+settings 883/883, HMR 242/242.
- Shipped: settings refinement reply `#discussioncomment-19412339`; playbook system started (00–06).
- Status changes: item 1 published → peer-reviewed (PerryLink confirmation + refinement, `#discussioncomment-19399657`).
- Blocked by: PR policy (external PRs closed); maintainer attention.
- Next: start Phase 1 unit 1 (plugin scoping: session-log validator/quarantine from #11971/#11981 findings), keep the three patches rebased, run the daily routine.

### 2026-11-05 (cont.)
- Shipped: complete contributor playbook 00–06 (1,001 source-cited lines) — repo rules, review/approval gates, docs system, CI/release, roadmap, ledger.
- Checks run: none needed (documentation artifacts under .context-map/, git-excluded); tree clean.
- Blocked by: PR policy for acceptance; maintainer attention for item 2/3.
- Next: publish `dsh-session-doctor` (needs owner approval for a public repo), then install rehearsal.

### 2026-11-05 (late 27) — Phase 1 unit 28 (test:expected classified; gate matrix fully exercised)
- Ran `pnpm run test:expected` on the current branch: **141 passed / 3 failed**.
- All three failures are the headless stream-json "CLI tool round trip" scenario: the expected tool result is replaced by `sandbox mode "workspace-write" is requested but no sandbox backend is usable on this host` — this host lacks bubblewrap/Landlock, so the shell tool refuses to run. Environment limitation, not a code regression; the same scenario cannot pass without a sandbox backend.
- With that, every scripted CI tier has now been exercised locally at least once: test, test:coverage (partial — reported as unverified when killed), test:expected, test:snapshot (changed surface passes; SDK baseline mismatch reproduced on master), typecheck, lint, duplication, build, hygiene.
- Remaining reds are all classified as baseline/environment with master reproductions or explicit cause (sandbox backend, host temp paths, tracked-file residue).
- Next: only external decisions remain (plugin publication approval; maintainer channel).

### 2026-11-05 (late 26) — Phase 1 unit 27 (hygiene gate classified; stale residue cleaned)
- Ran `pnpm run hygiene` on the dependency-adding branch after a build: **21 passed / 2 failed**.
- Both failures reproduce identically on unmodified `master`: `vendor rescope` (tracked-file residue in the shipped snapshot of docs/tool-catalog + vendor/README postcondition) and `verify-optional-dependency-imports` (node exit 134, environment crash). Neither touches files changed by our branches.
- Removed 395 stale untracked build paths from older checkouts with the repository's own `pnpm run clean`; that fixed the `constraints` gate (which had been failing on local residue) without any source change.
- Hygiene results that matter for our diffs pass: package dependencies (new `output-retention` workspace deps), workspace constraints, publint, NodeNext consumer types, unknown casts, plugin record callers.
- Gate matrix now notes two repository-baseline gate failures that are environment/master-state, not branch regressions.

### 2026-11-05 (late 25) — Phase 1 unit 26 (snapshot lane classified with host escalation)
- Retried the keyless snapshot lane with the narrowest host escalation (danger-full-access) after documenting the sandbox denials.
- Result: **0 EROFS**; 217 passed / 38 failed, and every failure is in `snapshots/sdk/sdk.snapshot.ts` with the same `session header` config mismatch.
- Proof of non-attribution: the identical 38 failures reproduce on unmodified `master` (same command, same host), so they are environment/baseline drift, not caused by our patches. All session/headless/Acp scenario files pass, which covers the recorded-transcript surface our session and agent-loop changes touch.
- Honest status: the snapshot tier passes for the changed surface locally; the SDK header mismatches remain **unverified locally** (baseline-wide, environment-dependent), and CI owns the authoritative run.
- This completes the local gate matrix as far as the sandbox permits.

### 2026-11-05 (late 24) — Phase 1 unit 25 (snapshot lane: attempted, blocked by sandbox)
- Ran the keyless recorded-session lane (`pnpm run test:snapshot`, source mode, no build needed).
- First run: 204 passed / 51 failed, every sampled failure `EROFS: read-only file system, mkdtemp '/home/atur/dsh-log-snap-*'` — scenarios that intentionally create `outside-temp` workspaces under `$HOME`, which the workspace-write sandbox forbids.
- Retried with `HOME`/`TMPDIR` redirected inside the workspace: failures changed shape (expected/actual transcript diffs involving home-derived paths), not to a clean pass. The lane is path-sensitive by design and CI owns it on writable macOS/Linux runners.
- Conclusion recorded honestly: **snapshot tier was not yet verified**; no code-attributable snapshot regression was observed, but that was not evidence of a pass. (Superseded by the escalated run above.)
- Cleaned up the multi-MB run log; working tree clean.

### 2026-11-05 (late 23) — Phase 1 unit 24 (community forensics closes the carrier question)
- yingcai233333 scanned 110 local session logs frame-by-frame and reported: of 100 `cancellation-requested` records across 8 event types, only `tool/result` reaches model context; the three cancellation records and the run_code print carrier all live in `data.message.content[].text` — exactly the field `wellFormedToolResult()` covers. No new event type is needed.
- Also confirmed our `error.reason` handling: the declared payload is `{ name, code, reason? }`, reason is the only free text; `meta` never enters model context.
- Replied with the confirmation and the branch's artifact/coverage evidence; this is community peer validation, **not** maintainer acceptance.
- Next: watch for maintainer response; keep branches green.

### 2026-11-05 (late 22) — Phase 1 unit 23 (artifact plane)
- Ran `pnpm run build` (build:artifacts + build:check, 10 gates) on the four branches whose diffs add or change cross-package exports/APIs:
  - `fix/tool-result-well-formed` (`wellFormedToolResult` consumed by tools/agent-loop/pruner): 10/10;
  - `fix/dsh-bug-triage` (`SessionTurnScopeError` consumed by tool-executor-ptc): 10/10;
  - `fix/boot-launcher-runtime-version` (ProfileContext field + loading options): 10/10;
  - `fix/truncation-surrogate-pairs` (new workspace dependency exports): 10/10.
- Working tree stayed clean after every build (artifacts are ignored), so source-plane and artifact-plane evidence do not contaminate each other.
- Remaining branches change single-package internals only; they have package suites, full lint, duplication, and typecheck, so the extra build pass adds no signal there.
- Gate matrix now: focused behavior pre/post, per-file 100% coverage on changed gate files, full lint 0, duplication 0, typecheck 5/5, artifact build 10/10 where cross-package.

### 2026-11-05 (late 21) — Phase 1 unit 22 (gate matrix complete)
- Ran `pnpm run duplication` on all thirteen branches: **0 clones** on every branch (master baseline is also 0).
- Gate matrix is now complete per branch: full lint 0 errors, duplication 0 clones, `typecheck` 5/5, per-file 100% coverage on every changed gate file, and focused behavior tests with pre/post evidence.
- Updated the public index #12299 with the three newest items and the gate status, keeping the honest note that zero merges and zero maintainer replies exist.
- Community exchange on #11476 produced the durable choke-point design; no maintainer has replied yet.
- Next: keep watching; next new confirmed report gets the same treatment.

### 2026-11-05 (late 20) — Phase 1 unit 21
- Community engagement paid off: yingcai233333 supplied the missing `run_code` print reproduction (`console.log("A" + String.fromCharCode(0xd800) + "B")`) and proposed one durable choke point (`toWellFormed` before writing `tool/result`).
- Implemented exactly that: `wellFormedToolResult()` in `@deepseek-ai/dsh-session` sanitizes model-visible message text and the recorded failure reason; wired at all three `tool/result` writers (tool batch, agent-loop recovery, compaction pruner).
- Evidence: session helper at 100% S/B/F/L (branches for text/reasoning, no-reason, clean reason, passthrough block, both comparisons); agent-loop end-to-end test with a tool returning `A\uD800B` fails without the batch wrapper and stores `A\uFFFD B` with it; batch.ts/agent.ts 100%; typecheck 5/5; full lint clean.
- Published `67ddef289a` and replied with the evidence; also corrected a placeholder commit hash I had typed in that comment before the verification step (updated in place, verified).
- Lesson: never type hashes or ids into public prose before reading them from git.

### 2026-11-05 (late 19) — Phase 1 unit 20 (full-lint audit across every branch)
- Ran the repo's full lint (`pnpm run lint`, 6,814 files, 90 rules) on `master` (clean) and across all twelve patch branches.
- Four branches carried real errors that the staged-file pre-commit config did not catch; each found, fixed, retested, and pushed:
  - triage `3683b3d4c7`: reverted two `meta?.` chains that the schema guard had made redundant (no-unnecessary-condition);
  - hmr `05f68b5db9`: typed the promise rejection callback `(error: unknown)` and narrowed in the body;
  - profile-guard `54caa2ac95`: braced four throwing arrows in the guard tests (no-confusing-void-expression);
  - open-in-app `2254873307`: dropped redundant `!`/`as` on the mocked spawn tuple and made `env` access total with `?? {}` (also fixed the TS18048 that the first lint fix exposed).
- Baseline `master` lint: 0 errors, 1 pre-existing warning. After the fixes, every branch reports 0 errors.
- Lesson: the staged-file oxlint profile is weaker than `pnpm run lint`; full lint must run per branch before claiming CI readiness.

### 2026-11-05 (late 18) — Phase 1 unit 19
- Completed the #11476 audit across all model-facing character budgets. Found one more confirmed carrier: `plugin-market` clamps market-supplied titles/descriptions with a raw UTF-16 slice (model-facing tool output).
- Fixed with the shared code-point-safe helper (`7d21dde5b6`), dependency/reference/lockfile wiring, and a boundary regression that fails on the old slice; 136 package tests, `tools.ts` 100% coverage, typecheck 5/5.
- Verified non-carriers: session-search snippets are code-point-safe; PTC/persistent-bash budgets already safe; remaining raw cuts are identifier or client-rendering only.
- Published the audit addendum on #11476; status still **published**, not accepted.
- Next: watch threads; keep thirteen branches green.

### 2026-11-05 (late 17) — Phase 1 unit 18
- Read the screenshot on #12296 (attachment fetched and inspected): the failure is `Unknown agent preset: ptc`, i.e. a stored default preset (`agent-preset-registry.selectedDefault`) that is no longer in the roster.
- Answered the Q&A with the exact in-product fix path (Settings → Agent presets → Standard → Set as new task default, or pick Standard in the new-task dialog), the persisted field, and the honest boundary that an empty roster is a profile-composition problem.
- Shipped a small host patch (`490c780120`): one `unknownPreset()` helper makes the failure name the available presets (or "none") so the toast is actionable; 50/50 tests, `index.ts` 100% coverage, typecheck 5/5, Oxlint clean.
- Status: item 15 = **published**, patch not merged/accepted.
- Next: watch threads; keep twelve branches green.

### 2026-11-05 (late 16) — Phase 1 unit 17
- Fresh report #12301 (landed 11:57): bundled `cordis-plugin-development` skill tells agents that replacing an installed package always requires a restart, contradicting Plugin Manager + HMR.
- Verified all three sides in source: README contract, `application: 'applied'` when HMR exists, `restartReason` taxonomy, HMR recomposition behavior.
- Shipped a one-sentence docs branch (`0bc94bb307`) that makes the reported outcome authoritative; ran doc budgets, skill metadata suite, Oxlint; confirmed the sentence appears nowhere else and no snapshot embeds it.
- Also assessed #12271/#12272: #12272's stats feature is absent from this checkout (nightly-only), and #12271 needs a cross-package ownership decision (row status dot vs schedule mark seat), so neither is a unilateral patch candidate.
- Status: item 14 = **published**, doc-only, not merged/accepted.
- Next: watch #12301 and the index; keep branches green.

### 2026-11-05 (late 15) — Phase 1 unit 16 (audit complete; two more real gaps fixed)
- hmr: our changed lines are 100% branch-covered; the one uncovered function (`mappedDirectories`) is baseline code covered elsewhere in CI.
- open-in-app: `resolver.ts` **100%** all metrics (64 tests).
- dsh-bug-triage: `settings/schema.ts` 100%; `settings/index.ts` changed lines covered (the uncovered range is baseline and owned by other suites); `session/src/index.ts` **100%** when the turn-scope suite runs with it; ptc.ts initially 99.04 branches.
- Real defect found in my own PTC patch: both drop-site catches rethrew non-turn-scope failures from detached log tasks → **unhandled rejection** instead of a surfaced error, and the rethrow branches were untestable. Now every append failure is logged and dropped (log-only records, append committed nothing); bilingual README updated; `ptc.ts` 100% (252 tests); 835 session+ptc tests; typecheck 5/5. Pushed `481e399b2c`, addendum on #11971.
- Audit status: all coverage-gate-relevant changed files are 100%; `apps/cli/src` is outside `packages/*/*/src` gate scope.
- Total: two branches hardened by this audit phase (profile-guard `b11bc7be8f`, triage `481e399b2c`).

### 2026-11-05 (late 14) — Phase 1 unit 15 (per-branch coverage audit)
- Audited changed files on their own checkouts against the real gate (`test:coverage`, per-file 100%):
  - truncation: `read-render.ts` + `fetch.ts` **100%** all metrics (425 tests).
  - static-index: `index.ts` **100%** (3 tests).
  - file-reference: `index.ts` **100%** (21 tests) — the teardown guard's branches are covered.
  - windows-alias: helper branches fully covered; the only uncovered lines are terminal paths owned by the excluded host-flaky shell-activity spec (covered in CI).
  - profile-guard: branch 99.15 → found the >3-entries ellipsis untested, added the regression; `profile.ts` now **100%** (5,668 tests); pushed `b11bc7be8f`.
  - boot-version: `profile.ts`, `profile-context.ts`, `compatibility-preflight.ts`, plugin-manager `index.ts` all **100%** with the three sandbox-network tests filtered.
- Learned/reconfirmed: vitest skips coverage reporting on failing suites (`reportOnFailure` off), so audits filter known-environment failures first.
- Remaining: hmr, settings+dsh-bug-triage, open-in-app, CLI line in boot-version.

### 2026-11-05 (late 13) — Phase 1 unit 14 (self-review under the repo's review skill)
- Loaded `dsh-code-review` and audited the accepted quality gates rather than guessing: the CI gate is `test:coverage` with per-file 100% statements/branches/functions/lines.
- Ran a targeted coverage pass; discovered the earlier audit mixed branches (working tree only carries this branch's change), so per-branch measurement is required.
- On the current branch, found and fixed a real gap: pinning `latest` inside the sort comparator was a partial order and left branch coverage short. Replaced with sort + move-to-front, added three regressions; `versions.ts` now 100% across all four metrics; package suite 438 pass (3 pre-existing sandbox-network failures); typecheck 5/5.
- Published the quality follow-up; branch tip `0c43a2b89e`.
- Next: audit the other nine branches' changed files the same way (each on its own checkout) before claiming acceptance readiness.

### 2026-11-05 (late 12) — Phase 1 unit 13
- Finalized the #11476 audit: no further confirmed raw UTF-16 truncation carriers (persistent bash already uses the safe helper; byte-budget paths yield replacement characters, not lone surrogates). Left the unverified carriers explicitly unfixed rather than speculate.
- Strategy: consolidated the eleven verified reports into one index Discussion (#12299) instead of more scattered comments, since sustained engagement is the real bottleneck and Discussions is the team's stated monitoring channel. No merge ask; explicit offer to reshape/rebase/split on request.
- Evidence: branches and commits re-listed against `fcc0ad4621`; statuses honest (0 accepted).
- Next: watch #12299 and individual threads for maintainer direction; keep ten branches green; plugin publication still awaits owner approval.

### 2026-11-05 (late 11) — Phase 1 unit 12
- Sweep: upstream frozen, no replies. Assessed #12288 (volatile port in system prompt) as a maintainer-directed design decision, not a unilateral patch; #12292/#12293 are screenshots.
- Selected #12209 (plugin-manager offers an older line as update): source path confirmed, registry already returns `dist-tags` and `time`.
- Shipped: `fix(plugin-manager): judge updates by the registry latest line, not semver alone` — latest-not-newer guard, publish-time filter, latest-first ordering, version list preserved.
- Evidence: three regressions fail on the old logic (renumbered line, latest ordering, time fallback) and pass after; existing multi-version listing test unchanged; 435 package tests pass with only the three pre-existing real-Git network failures; typecheck 5/5; Oxlint clean.
- Status word: item 13 = **published**, not acknowledged/accepted.
- Next: keep ten branches green; plugin publication still awaits owner approval.

### 2026-11-05 (late 10) — Phase 1 unit 11 (plugin hardening, no public side effect)
- Verified all nine fix branches still based on current `master` (`fcc0ad4621`), worktree clean; no rebase needed.
- Read the two "sessions unusable after upgrade" reports (#12292/#12293): bodies are screenshots with no text, not actionable without maintainer-provided details.
- Checked the remaining surrogate carriers: PTC output budgets already use the code-point-aligned `truncateJsonStringBytes`; the `run_code`/cancellation claims are not reproducible from the checkout, so no speculative patch.
- Plugin: added `--all-generations` audit (highest generation by default), CLI flag, README contract, and a multi-generation regression; 10/10 unit tests, strict tsc pass, dist rebuilt; fixture demo shows 2 vs 3 scanned and finds the corrupt predecessor.
- Status word: plugin remains **publish-ready, unpublished** (owner approval pending).

### 2026-11-05 (late 9) — Phase 1 unit 10
- Strategy sweep: checked all six 2-point reviewer accounts' public events; none active in dsh Discussions, all activity is on the superagent prototype repo (also with closed contribution surfaces).
- Selected #11476/#11831 (surrogate-pair truncation poisoning sessions; thread already had exact mechanism + dependency-cost analysis but no implementation).
- Shipped: `fix(tools): truncate tool output without splitting surrogate pairs` — read `truncateLine` and three `web_fetch` cuts now use `truncateWithoutSplittingSurrogatePair`; tool-fs gained the dependency wiring (package.json, tsconfig reference, lockfile importer).
- Evidence: two boundary regressions fail on unfixed source (read: lone `U+D83D` in output; web_fetch: lone surrogate at one cap) and pass after; 425 tests; typecheck 5/5; docs gates 20/21 (local scratch dir only); branch pushed; comment published with honest carrier-audit scope.
- Next: `run_code` print / cancellation carriers if wanted; keep nine branches green; plugin publish awaits owner approval.

### 2026-11-05 (late 8) — Phase 1 unit 9
- Swept threads looking for maintainer-active reports; none of the six 2-point reviewer logins appear in recent threads, so continued with contained community reports.
- Selected #12287/#9599 (Electron env leak): mechanism fully documented by the reporter with a two-arm experiment; source path confirmed (`scrubbedParentEnv` keeps `ELECTRON_RUN_AS_NODE`).
- Shipped: `fix(open-in-app): keep Electron node-mode variables out of detached launches` — `externalAppEnvironment()` strips inherited Electron node-mode variables before adapter overrides merge, so Electron editors start their GUI while GitHub Desktop's intentional override still wins.
- Evidence: mocked-spawn regression asserts the child env omits the variable and preserves explicit overrides; pre-fix assertion fails; open-in-app 64/64; typecheck 5/5; bilingual README pairing recorded; branch pushed; comment published.
- Next: keep eight branches green; continue triage; plugin publish awaits owner approval.

### 2026-11-05 (late 7) — Phase 1 unit 8
- Sweep: upstream frozen, no maintainer replies, no new reports; #12290 reporter endorsed the guard and asked for a recovery path (replied with the two shapes; did not implement the unrequested backup design).
- Investigated the persistent subprocess test failure instead of guessing: the host exports `NoDefaultCurrentDirectoryInExePath=1`, and the Windows resolution spec depended on the ambient value. Fixed the six default-policy calls with explicit `currentEnv` (second commit on the alias branch).
- Evidence: targeted Windows-resolution spec passes; full subprocess-local suite 380 pass with only the known environment-timing shell-activity failure left; typecheck 5/5; Oxlint clean; published the test-isolation note on #12275.
- Branch pushed @ `8fc89ac081`; next: keep seven branches green, continue triage, plugin publish awaits approval.

### 2026-11-05 (late 6) — Phase 1 unit 7
- Extended #10458 from preflight-only to the complete compatibility surface: `loadProfileDirectory`/`loadProfile` options carry `runtimeVersion`, `readBundlePatches` forwards `profileContext.runtimeVersion`, and `plugin-manager` judges bundles against it. Caught a missing `getDshRuntimeVersion` import that the per-bundle catch had silently converted into skipping every bundle; fixed and re-verified.
- Evidence: regression with published `999.0.0` — layer loads and `listBundles` agrees; reverting only the manager change reproduces `incompatible-version`; app-boot + plugin-manager 6,099 pass (3 pre-existing sandbox-network git tests fail identically with changes stashed); typecheck 5/5; Oxlint clean after wrapping one 142-char line.
- Branch extended and pushed; follow-up comment published.
- Next: keep eight branches green; continue triage; plugin publish still awaits owner approval.

### 2026-11-05 (late 5) — Phase 1 unit 6
- Triaged leftover fresh reports; #9695 needs a core reconcile redesign and #12192 is already addressed by upstream `6e77ea0131` (optional entries warn), so selected #12275 (contained resolver bug).
- Shipped: `fix(subprocess): accept Windows App Execution Aliases as executables` — Windows-gated EACCES/EPERM + lstat file/symlink acceptance in `resolveExecutable()`.
- Evidence: 4 new tests (real symlink, injected stat failure, platform stub, negative cases); the positive integration test fails with the catch handling removed; package suite 379 pass with 2 pre-existing environment failures reproduced without the change; typecheck 5/5; Oxlint 0 errors.
- Branch pushed; comment published.
- Status word: item 10 = **published**, not acknowledged/accepted.
- Next: keep seven branches rebased; continue daily triage.

### 2026-11-05 (late 4) — Phase 1 unit 5
- Triaged the reactivated Desktop data-loss reports (#9940 → fresh #12290); the deletion cause is not reproducible from a checkout, but the silent-reset amplifier is.
- Reproduced deterministically: a shipped profile directory holding `node_modules` but no `package.json` makes unmodified `master` silently write the 211-byte default manifest (exit 0); with the guard it fails loud and preserves the directory.
- Shipped: `fix(boot): refuse to reset a profile that lost its manifest` — `initProfile()` initializes only a fresh directory (allowing patch/workspace/lock), diagnostic names surviving state.
- Evidence: app-boot 5,668 tests; typecheck 5/5; Oxlint 0 errors; README EN+ZH pairing recorded; branch pushed. Recovery note: the first commit attempt conflicted on stashed README context and was rebuilt cleanly; remote branch now holds `8e14c8dfb0`.
- Status word: item 9 = **published**, not acknowledged/accepted.
- Next: keep six fix branches rebased; continue triage.

### 2026-11-05 (late 3) — Phase 1 unit 4
- Triaged #9695/#12192/#10458; #9695 is a design-level reconcile/transaction fix, #12192 is a boot-policy decision, #10458 is contained.
- Shipped: `fix(boot): judge plugin compatibility against the launcher runtime` — launcher publishes `profileContext.runtimeVersion`; composition preflight prefers it over the app-boot package-local read; regression boots a profile whose published runtime is unreachable from this package version.
- Evidence: regression fails pre-fix (plugin denied, `[]`) and passes post-fix; app-boot 21 files / 5666 tests; typecheck 5/5; Oxlint 0 errors; README EN+ZH updated with pairing re-recorded; branch pushed.
- Status word: item 8 = **published**, not acknowledged/accepted.
- Next: keep five fix branches rebased; continue triage.

### 2026-11-05 (late 2) — Phase 1 unit 3
- Triaged fresh reports; selected #12286 (deterministic lifecycle race, no model key) over browser-only reports.
- Shipped: `fix(context): skip teardown-scoped agents when installing file-reference prompts` — guard in `installPrompt()` for `uid === null || state === UNLOADING`; regression uses a real disposed child scope with a surviving registry entry.
- Evidence: regression fails pre-fix with `INACTIVE_EFFECT`, passes post; package 21/21; typecheck 5/5; Oxlint 0 errors; branch pushed to fork.
- Status word: item 7 = **published**, not acknowledged/accepted.
- Next: keep the four fix branches rebased; continue triage.

### 2026-11-05 (late) — Phase 1 unit 2
- Triage: fresh failure reports since Nov 4; picked #6374 (deterministic, keyless, server-side) over browser-only reports.
- Shipped: `fix(host): mark the served index uncacheable` — `cache-control: no-store` on the rendered index, `no-cache`+ETag kept for assets; regression pins `/`, `/index.html`, `/?token=stale`.
- Evidence: new assertion fails on pre-fix source (`null` vs `no-store`), passes after; package spec 3/3; typecheck 5/5; Oxlint clean; branch pushed to fork.
- Status word: item 6 = **published** (comment + branch), not acknowledged/accepted.
- Next: await maintainer preference; keep the branch rebased; continue daily triage.

### 2026-11-05 (evening) — Phase 1 unit 1
- Shipped: `dsh-session-doctor` plugin project (CLI + dsh bundle + model tool) built and verified locally:
  `.tools/plugins/dsh-session-doctor/`, spec at `.context-map/playbook/07-plugin-session-doctor.md`.
- Evidence: unit tests 9/9 (`vitest --root`), synthetic corrupt fixture reports both orphan PTC events (exit 1),
  real `~/.dsh` scan **35 sessions / 0 signatures**, one workspace bucket 16 sessions clean, `--json` mode verified,
  strict `tsc --noEmit` pass (engine + CLI + plugin shim).
- Install rehearsal: `dsh plugin add` linked the bundle into scratch `demo`/`headless` profiles; manifest + composed
  row verified; a real headless boot mounted the plugin (temporary marker) before the expected missing-credential exit.
- Full build after the release wave (`pnpm run build`, 10/10 gates) unblocked the **web-profile rehearsal**: bundle
  added to the `web` profile, real boot with **no startup failures**, plugin mounted, served page `HTTP 200`.
- Published-shape verified: standalone install resolved real `@deepseek-ai/cordis@4.1.0` / `@deepseek-ai/dsh-tools@0.2.2-rc.1`;
  `tsc`, 9 tests, build pass; `pnpm pack` contains only the intended files.
- Publish assets prepared (CI, .gitignore, PUBLISHING runbook, announcement draft).
- Status word: item 5 (plugin) = **publish-ready** (fully rehearsed, unpublished). Not public, so not acknowledged.
- Blocked by: public publishing needs owner approval (GitHub repo/npm); install rehearsal needs a scratch profile.
- Next: ask for publish approval; rehearse `dsh plugin add` against a scratch profile; consider scanning all retained
  generations and an optional quarantine action.
