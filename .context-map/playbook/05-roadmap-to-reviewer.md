# Roadmap: from outsider contributor to trusted reviewer

Goal (persisted as session goal `goal-99ab20bb…`): master every repository rule, ship verified work daily, keep
patches current, earn maintainer trust, reach accepted contributions and reviewer/merge rights. Report status honestly.

## Baseline (2026-11-05)

- Published: 4 Discussions contributions (#11763 settings crash, #11971/#11981 session-log corruption, #11121 HMR
  transaction leak) with deterministic repros and three tested patches on 2 fork branches.
- Real engagement: 1 community expert (PerryLink) peer-reviewed and refined the settings fix; implemented the
  refinement (pending status: peer-reviewed, not accepted).
- Accepted/merged upstream: **0**. Upstream policy: external PRs closed (`CONTRIBUTING.md`); Issues disabled; only
  Discussions is available.
- Infrastructure: repo synced to `fcc0ad4621` (`0.2.2-rc.1`), workspace-local Node 24 + pnpm 11.28.5 toolchain, daily
  sync script, build verified earlier, artifacts currently stale.

## Phase 0 — Rule mastery (week 1, COMPLETE 2026-11-05)

Outcomes: this playbook complete and internalized; daily procedure running; every future deliverable compliant on
labels/description/evidence/docs; acceptance ledger maintained.

Exit criteria: playbook 01–04 written from source ✅; compliance checklist rehearsed on one small change end-to-end
(including docs pairing) ⏳; zero overclaim incidents ✅.

## Phase 1 — Visible, trustworthy contributions (weeks 1–4)

Daily: sync + one unit of real work. Weekly: one publishable technical artifact.

Targets:
1. Keep the three patches rebased and green on each upstream release (typecheck + owning suites; no stale claims).
2. Publish 2–3 additional **independently verified** reports with deterministic repros (no model key), each with a
   proposed fix shape and test plan.
3. Start the explicitly welcomed route: a `dsh-plugin`-tagged tool from our findings — session-log validator /
   corruption quarantine built on the #11971/#11981 analysis. This is a contribution that does not need PR permission.
4. Answer/review other users' Discussions threads technically (become a useful reviewer of reports, not only a
   reporter). Track: replies that are accepted/cited by others.

Signals: maintainer login appearing in a thread; a maintainer relaying a patch internally (PerryLink may be a
channel); plugin interest/use.

## Phase 2 — Inside the tent (weeks 4–8)

Targets:
1. A DeepSeek team member explicitly asks for a PR/patch, or external PRs open → submit our prepared branch(es)
   immediately with compliant labels, Issue reference, four-section description and AI Usage declaration.
2. Land at least one accepted change upstream (even docs/typo-scale counts as the first merged PR; then scale).
3. Get module depth: documented knowledge of one or two subsystems (settings, session log, HMR, PTC) such that we can
   answer questions and review other users' patches in those areas.
4. Plugin v1 published with README, tests, docs; linked from related Discussions.

Signals: write access invitation, reviewer addition, first merged PR, "please review" requests.

## Phase 3 — Reviewer and sustained impact (weeks 8–16)

Targets:
1. Repository write/admin permission (reviewer eligibility per `.github/review-ownership/README.md`) or explicit
   team membership for review.
2. Regular review activity on upstream PRs; approval weight grows with production-line ownership of modules we
   maintain, so focus contributions on the subsystems we know deepest.
3. Maintain a visible, honest track record: every claim reproducible, every patch current, every status word
   accurate.
4. Keep the day-one routine: sync, one unit, ledger. Daily merges of upstream into our bases.

## Metrics (leading indicators, weekly)

| Metric | Start | Target |
|---|---|---|
| Upstream-accepted commits | 0 | ≥1 by week 8, ≥5 by week 16 |
| Maintainer replies | 0 | ≥1 per 2 weeks |
| Peer-reviewed reports (non-maintainer expert verified) | 1 | ≥4 |
| Patches green on latest master | 2 branches | all active branches |
| Independently reproducible bug reports filed | 2 | ≥6 |
| Plugin ecosystem artifacts | 0 | 1 mature plugin |
| Overclaim incidents | 0 | 0 (hard rule) |

## Risks and mitigations

- **PR policy stays closed** → plugin ecosystem, Discussions influence, maintainer relay asks; never pressure.
- **Patch staleness** → daily sync + rebase; drop or redesign patches that upstream supersedes.
- **Reviewer invitation never comes** → keep the record impeccable; the work itself compounds (plugins, reports,
  docs) regardless of role.
- **Time/scale**: 5,539 Markdown files and 400 packages; learn by subsystem, not by exhaustive reading. Use the
  playbook index as the map.
- **AI transparency**: declare AI usage per `dsh-pr-description` (AI-DECLARATION v0.1.2) on any future PR.
