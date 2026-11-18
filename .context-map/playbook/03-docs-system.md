# Docs system and project knowledge map

## One-line purpose

The repository's documentation is a governed corpus: every fact has one owning tier, every human-facing page is a bilingual pair, the reference catalogs are generated from source and freshness-gated, and the public website is a tested projection of `docs/` — never a second copy. This page is the navigable index and the rule map for contributing to it.

## Corpus shape (as checked out)

659 Markdown files under `docs/`: 332 English sources plus 327 `.zh.md` counterparts, with 327 `.i18n.yaml` pairing records. Top-level `docs/*.md` (24) are cross-cutting references; subdirectories carry the rest.

| Area | Path | English `.md` | What lives there |
|---|---|---|---|
| Subsystems | `docs/subsystems/` | 69 | One reference page per subsystem: type definitions, semantics, generated Cordis API |
| Persistence history | `docs/persistence-changes/` | 57 | Dated type-change records, release comparisons, `historical-formats/vN.md` |
| Upgrade guides | `docs/upgrade-guide/v<version>/<item>/guide.md` | 119 | One externally perceptible break per directory |
| User product docs | `docs/user/` | 20 | Published quick start, guides, plugin-author tutorials |
| Cookbook | `docs/cookbook/` | 13 | Step-by-step contributor how-tos |
| Cordis tutorial | `docs/cordis-tutorial/` | 8 | Ordered 01→07 tutorial path |
| Cordis core API | `docs/cordis-api/` | 6 | Generated framework API tiers |
| Defensive patterns | `docs/defensive-patterns/` | 6 | Review-enforced rules per artifact |
| Postmortems | `docs/postmortem/` | 5 | Incident stories, the only war-story tier |
| i18n contract | `docs/i18n/` | 5 | Pairing contract, translation rules, terminology |

Outside `docs/`: every package README (`packages/<group>/<pkg>/README.md`), group maps (`packages/README.md`, `packages/<group>/README.md`), `python/**`, root `CONTRIBUTING.md` / `BRAND_GUIDELINES.md` / `SAFETY.md`, and active `.agents/notes/**` are in the same bilingual corpus. `docs/AGENTS.md`, root `AGENTS.md`, and `.agents/notes/**/AGENTS.md` are English-only by policy.

## Doc tier taxonomy and one-home-per-fact

The authority is `docs/AGENTS.md:15-36`. Each fact has one home: the tier whose job it is; everywhere else, link there.

| Tier | Job | Does not belong there |
|---|---|---|
| Root `AGENTS.md` | Standing orders an agent needs in every session, 1–3 lines each, linking the home | Stories, worked examples, restated linked content |
| Subtree `AGENTS.md` (`packages/`, `docs/`, `.agents/notes/`) | Orders specific to that subtree | Repo-wide rules the root file carries |
| `docs/architecture.md` | Ordered map: composition, core packages, loop, seams, extension points; read before changing `packages/` | Type definitions, per-package detail, decision rationale, status annotations |
| `docs/subsystems/` | One reference page per subsystem: types, semantics, generated Cordis API | Behavior narration (→ architecture.md) |
| `.agents/notes/` | Active decision records: the why and what was given up | Migration plans, checklists, spec-speak once shipped |
| `docs/defensive-patterns/` | Rules enforced in review, split by artifact | Type definitions, rationale |
| `docs/postmortem/` | Incident stories | — |
| `docs/persistence-changes/` + `historical-formats/` | Type-change acknowledgements and complete historical schemas | Behavior-only changes, current contracts |
| `docs/cookbook/` | Step-by-step how-tos with numbered verify steps | Design rationale (→ the Agent Note each guide links) |
| `docs/user/` | Product-facing guides published by the website | Generated tables, contributor procedures |
| Package README | The per-package contract: config, semantics, limitations, extension points, Model Experience | JSDoc restatement, generated-catalog restatement, other packages' concerns |
| `docs/development.md` | Contributor setup, daily workflow, CI summary | Runtime/version rationale, drifting check lists |
| Generated reference (`cordis-surface` regions, `cordis-api/`, `tool-catalog`, `config-catalog`, `persistence-catalog`, `module-graph`, `cli-help`, `graph-atlas`) | Exhaustive English sources regenerated from source, freshness-gated | Hand edits |
| `.agents/skills/` | Reusable workflows and decision standards | Product and runtime contracts |

Placement shorthand (`docs/AGENTS.md:36`): bugs → postmortems; rationale → Agent Notes; procedures → cookbooks; type definitions → subsystems; package contracts → READMEs; standing orders → root `AGENTS.md`; review-enforced rules → `defensive-patterns/`.

Authoring order (`docs/AGENTS.md:13`): locate the document and its permitted detail; classify tutorial vs reference; for a tutorial order concepts by prerequisite; relocate descendant-owned detail; replace lower-level explanation with links.

## Kind system and page structure

`kind` in YAML frontmatter selects exactly one template in `.agents/skills/dsh-doc/templates/`, and no template exists without a kind. Package README kinds are derived mechanically, in order: group README → `package-group`; manifest declares `dsh.bundle.patch` → `package-bundle`; audited library registry → `package-library`; everything else (default service export or `apply` plugin) → `package-reference`. Dated records derive `persistence-change`, `persistence-release`, `persistence-format` from path, and `docs/upgrade-guide/v<version>/<item>/guide.md` derives `upgrade-guide`. The documentation check derives the expected kind from the same facts and rejects a wrong value plus `name`, `audience`, `tags`, and README-local `i18n` metadata (`scripts/doc-standard.spec.ts`).

Authored page order (`.agents/skills/dsh-doc/references/structure-hierarchy.md`): YAML metadata → H1 → language switcher → `## Summary` (3–5 sentences, what the reader can do) → `## Table of Contents` → user-facing content → developer detail → optional `## Further Exploration` → final `## Dev Note` (the only non-authoritative section). Package READMEs must end with `Model Experience` and `Known Limitations and Deferred Work` as the final two H2s, `Further Exploration` before them, and `### Dev Note` inside the limitations H2. Heavy developer detail folds behind `<details>` and stays concept-level — no API catalogs, column lists, or event-payload enumerations.

## Writing rules that are actually gated

- **Current state only** (`docs/AGENTS.md:40`). History belongs in commits, PRs, Agent Notes, postmortems, or scoped persistence records. General Session-format prose links `docs/session-format-status.md` instead of restating a version.
- **One physical line per paragraph** (`verify-md-wrap`, `docs/AGENTS.md:42`). Use editor soft-wrap; tables, lists, and code blocks keep their formatting.
- **Fenced `ts` blocks must compile** (`doc-typecheck`, `docs/AGENTS.md:43`). Source-equivalence pastes use ` ```ts type-equiv ` or ` ```ts public-api ` instead.
- **Direct terms** (`verify-concrete-terms`): name the exact check, type, API, operation, or behavior instead of metaphorical "gate", "vocabulary", or "surface". Keep `contract` for obligations; keep `seam` for the defined capability.
- **Repository references** (`docs/AGENTS.md:75-77`): relative Markdown links for current files, tags/PR numbers for history; `verify-md-links` checks targets, `verify-repository-references` rejects hexadecimal commit ids and disallowed org URLs, and `verify-doc-refs` checks root-relative `docs/*.md` citations inside TypeScript.
- **No reasoning transcripts** in any prose surface. Use `.agents/skills/dsh-trim-cot-leakage/SKILL.md` for dead session citations, "used to" narration, stack vantage, and reviewer-addressed justification; use `.agents/skills/dsh-prose-standard/SKILL.md` for the complete-proposition rule (actor, condition, timing, modality, failure, consequence all survive a trim).
- **The slop checklist** (`docs/AGENTS.md:61-73`) is the audit list: duplicated rules, history outside its tier, status annotations, hand-restated catalogs, reasoning transcripts, repeated rationale, paragraph walls, emphasis inflation, spec-speak in `implemented/` notes.

## Doc budgets

`scripts/doc-budgets.manifest.json` is the enforced source; `pnpm run verify-doc-budgets` rejects excess or missing entries.

| File | Ceiling |
|---|---|
| `AGENTS.md` | 2,080 |
| `docs/AGENTS.md` | 1,430 |
| `docs/architecture.md` | 2,410 |
| `docs/cordis-primer.md` | 600 |
| `docs/testing.md` | 1,350 |
| `packages/AGENTS.md` | 810 |
| `packages/README.md` | 994 |

Red gate order (`docs/AGENTS.md:53-59`): relocate to the owning tier → condense → raise the ceiling only when the words need the space, justified in the PR diff. Ceilings are guardrails, not targets: keep ≥5% headroom below the ceiling, freeze a ceiling that is over target, lower one only when the document still has room. Review governs unbudgeted tiers.

## Generated catalogs: never hand-edit

Each generated file carries a "Generated by … do not edit by hand" header and has a paired `--check` verifier that runs in `doc-sync`.

| Artifact | Generator | Verifier |
|---|---|---|
| `docs/tool-catalog.md` | `gen-tool-catalog` | `verify-tool-catalog` |
| `docs/config-catalog.md` | `gen-config-catalog` | `verify-config-catalog` |
| `docs/persistence-catalog.md`, `docs/experimental-persistence-catalog.md`, `docs/persistence-schema.json`, `packages/core/session/src/known-event-types.ts` | `gen-persistence-catalog` | `verify-persistence-catalog` |
| `docs/cli-help.md` | `gen-cli-help` | `verify-cli-help` |
| `docs/module-graph.md` | `gen-module-graph` | `verify-module-graph` |
| `docs/graph-atlas.md`, `docs/capability-seams.md`, `docs/event-producer-consumer.md`, `docs/agent-lifecycle.md`, `docs/tool-execution-pipeline.md` | `gen-doc-graphs` | `verify-doc-graphs` |
| `docs/cordis-api/*.md` | `gen-cordis-api` | `verify-cordis-api` |
| Per-page `cordis-surface` regions in `docs/subsystems/` | `gen-cordis-catalog` | `verify-cordis-catalog` |
| `docs/dependency-catalog.json` | `gen-dependency-catalog` | `verify-dependency-catalog` |
| `docs/session-format-status.md` records and persistence-change artifacts | `persistence-changes` / `persistence-finalization` | `verify-persistence-changes`, `verify-persistence-formats`, `verify-persistence-releases` |

Rule: edit the owning source (JSDoc, package manifest, service definition, event declaration) and regenerate; never patch the generated English file. A generated English source omits the language switcher so it stays byte-identical to generator output, while its Chinese counterpart still links back.

## type-equiv and public-api fences

Subsystem pages paste source-equivalent declarations with their original JSDoc. Register each primary block in `scripts/type-equiv.manifest.json` as `{ doc, symbol, source }`; add `"projection": "public-api"` for a body-stripped class declaration. `pnpm run verify-type-equiv` extracts the symbol and attached JSDoc from source and asserts the block matches; comparison ignores whitespace and non-JSDoc comments but requires every original JSDoc. The gate enforces 1:1 correspondence by document, symbol, and projection — adding or removing a primary block requires the manifest change in the same commit. A `.zh.md` block reuses its sibling's entry only when the whole tracked fence sequence is byte-identical and identically ordered; `doc-typecheck` applies the same derivative rule to compilable fences and skips both equivalence kinds from compilation. `docs/development.md:213-221` is the normative explanation.

The owning subsystems page must be updated in the same change that reshapes a documented type (`docs/AGENTS.md:44`); `verify-type-equiv` catches drifted pastes, not a never-documented new type. Page scoping is enforced by `scripts/verify-subsystem-pages.ts`: every package group links at least one existing subsystems page or carries an explicit exemption (`acp`, `bundle`, `sdk`, `test-support`, `util`).

## Bilingual pairing workflow

The contract is `docs/i18n/README.md`; translation mechanics are `docs/i18n/translation-rules.md`; terminology is `docs/i18n/terminology.md` (bilingual by construction, English-only file).

- **A pair is three sibling files**: `foo.md`, `foo.zh.md`, `foo.i18n.yaml`. No locale directories, no separate translation repo. A PR never lands one language without the other two.
- **Both languages carry equal authority**; either side may be authored first and the other translated from it.
- **The consistency record** keys one entry per heading section still holding language-specific content, by English heading-slug path (`/` before the first heading, `~2` for a repeated path), storing `en` and `zh` hashes of that section's blocks excluding fenced code and generated regions. Edits to different sections change different lines, so Git text merge composes them.
- **Structure mirrors the counterpart**: heading depths and order, list kinds and item counts, table row/column counts, semantic link targets with exact fragments, and verbatim code blocks match one to one. An English relative link targets `.md`, the Chinese side targets `.zh.md`; a missing counterpart is a pair-completeness error, not a fallback.
- **Routine path** (`docs/AGENTS.md:45`): the working agent updates the counterpart directly in one terminology-guided pass and re-records with `pnpm run verify-translation-pairing --write <pair>`. Do not invoke a translation skill, generate a briefing, or spawn a translator for ordinary work. The extended `.agents/skills/dsh-translate-docs/SKILL.md` workflow is user-invoked only (`disable-model-invocation: true`) and keeps the briefing-driven minimal-update path for large or ambiguous diffs.
- **Commands**: `--list` prints per-document state and never fails; `<pair…>` checks named pairs in seconds; the bare form is the corpus-wide gate CI runs, and a scoped green never substitutes for it at PR level. `pnpm run gen-translation-brief <pair>` recovers last-confirmed text; `--apply` splices code-fence-only changes.
- **Scope and exclusions** (`docs/i18n/README.md:46-67`): in scope are root `CONTRIBUTING.md`/`BRAND_GUIDELINES.md`/`SAFETY.md`, every non-vendor README (case-insensitive basename), and active `.agents/notes/**`, `docs/**`, `python/**`. Excluded: `docs/cordis-api/inherited.md`, agent-instruction `AGENTS.md`/`CLAUDE.md`, `docs/i18n/terminology.md`, `docs/i18n/style-samples.md`, `docs/i18n/translation-prompt.md`, `.github/review-ownership/README.md`, and the frozen `.agents/notes/archived/` tree (its own verifier seals the triplets). Bundle detail documents under `packages/<group>/<pkg>/docs/` are outside scope: locale `meta.detail` selects the file, so no switcher and no record, though `verify-md-links`/`verify-md-wrap` still apply.
- **The gate's limit, stated plainly**: green means the pair was confirmed consistent at these exact contents, not that the confirmation was sound. It cannot judge meaning, terminology quality, or naturalness — review owns that half.

## Website publishing

`website/docs.ts` is the explicit public allowlist: `DocsPage` = `{ locale, contentLocale, source, route, label, sidebar, section, order, outline?, sourceAliases? }`. Helpers: `pairedPages()` derives the `.zh.md` sibling, content locales, and counterpart aliases for a complete pair; `mirroredPages()` projects one available source into both route trees. `docs/subsystems/README.md` projects to `reference/subsystems/index.md`; site route trees are independent of source layout (`.zh.md` → root route, `.md` → `/en/` route).

`scripts/project-doc-site.ts` rewrites mapped sources into the disposable `website/.generated/` tree; VitePress builds that. Projector link rules: a manifest target becomes a site route; an existing non-manifest target becomes a GitHub source link; an image is copied into the generated tree; external/absolute/email/fragment-only links are untouched; a missing repository-relative target fails projection. Cross-page fragments use the English GitHub heading id, so place an explicit `<a id="…">` when VitePress emits a different id.

Commands: `pnpm docs:dev` (watches and reprojects; restart after manifest changes), `pnpm docs:check` (focused projection + site tests then `docs:build`), `pnpm docs:build` (builds and runs `verify-doc-site-fragments`; doubles as the dead-link check). The build also emits a raw-Markdown twin per route and a root `llms.txt` from the same manifest.

Boundaries from `website/AGENTS.md`: `website/` owns only VitePress config, presentation assets, and the manifest; this file is its only maintained Markdown. Never edit or commit `.generated/`, `.cache/`, `.dist/`. Never add locale or route directories. Do not publish RFCs, postmortems, testing guides, `AGENTS.md`, or maintainer workflows just because they live under `docs/`. Synchronizing content is not deployment — deploying stays an explicit, separately requested step.

## Validation: which command to run

`pnpm run test:docs` is the quick aggregate — the `quick: true` subset of doc-sync, no builds, no generator regeneration, no site build. `pnpm run doc-sync` is the full documentation gate set from `scripts/run-gates.ts` (`docSyncLeafGates`), including `doc-typecheck`, `docs:build`, `verify-doc-graphs`, `verify-cli-help`, `verify-md-links`, `verify-type-equiv`, `verify-cordis-catalog`, `verify-cordis-inspect-catalog`, `verify-mermaid`, `verify-translation-pairing`, `verify-md-wrap`, `verify-client-catalog`, `verify-export-jsdoc`, `verify-tool-catalog`, `verify-config-catalog`, `verify-plugin-packages`, `verify-dependency-catalog`, the persistence/format gates, `verify-public-repository-links`, `verify-repository-references`, `verify-concrete-terms`, `verify-doc-refs`, `verify-subsystem-pages`, `verify-package-paths`, `verify-package-readme-summaries`, `verify-package-readme-model-experience`, `verify-package-readme-limitations`, the Agent Note gates, `verify-skill-invocation-metadata`, `verify-translation-prompt`, `verify-doc-budgets`, `verify-upgrade-guides`, `scripts/doc-standard.spec.ts`, and the website projection tests. `doc-typecheck` first runs `compile-referenced-projects.ts host-contracts`, so it needs a prepared contracts build.

## Navigable knowledge map

**Read in this order for orientation**: `docs/architecture.md` (behavior across subsystems) → `docs/subsystems/README.md` (type-level reference) → `docs/glossary.md` (one canonical term per concept) → `docs/capability-seams.md` (Service Definition / Provider / Consumer map) → the relevant subsystem page → the owning package README.

**Subsystem index** (grouped as the website sidebar groups them, `website/docs.ts` `subsystemGroups`):

| Group | Pages |
|---|---|
| Overview | `subsystems/README.md` |
| Core and scopes | `core`, `scope` |
| Sessions and persistence | `session`, `session-query`, `session-reference`, `session-title`, `session-projection`, `persistence`, `spill`, `session-telemetry` |
| Model and context | `llm-streaming`, `token-meter`, `system-prompt`, `compaction` |
| Execution and tools | `tools`, `shell`, `subprocess`, `terminal`, `jobs`, `filesystem`, `lsp`, `ptc-runtime`, `web`, `skills`, `workflow`, `subagent` |
| Policy and interaction | `approval`, `permission-presets`, `sandbox`, `plan`, `user-questions`, `commands`, `goal`, `schedule` |
| Platform and access | `web-server`, `web-client`, `client-modules`, `slots`, `client-resources`, `sidebar-right`, `conversation`, `typert`, `storage`, `workspace`, `settings`, `credentials` |
| Remaining reference pages (22, not in a sidebar group) | `boot`, `deliverables`, `working-directory`, `worktrees`, `forge`, `feedback`, `mcp`, `office-to-pdf`, `attachment`, `ssh`, `computer-use`, `browser-use`, `extensions`, `voice-input`, `translation`, `agent-team`, `liveshare`, `claude-code-mods`, `webhook`, `otel`, `product-telemetry`, `todo` |

**Cookbook index** (`docs/cookbook/`): `adding-a-package`, `adding-a-plugin-preview`, `adding-a-remote-api`, `adding-a-session-format-version`, `adding-a-settings-card`, `adding-a-tool`, `adding-a-vendored-package`, `adding-an-llm-adapter`, `extension-cookbook`, `maintaining-dsh-code-review`, `responding-to-pr-review-on-a-stack`, `reviewing-persistence-type-changes`, `reviewing-ui-design`.

**Cross-cutting references** (top-level `docs/`): `architecture`, `glossary`, `capability-seams`, `cordis-primer` (loader/config semantics), `development` (setup, layout, daily commands), `testing` (tiers and snapshot policy), `session-format-status` (writer/finalized/released version authority), `rescope` (vendor rescoping), `deepseek-llm-api-wire-extensions` (provider protocol, repository-only — not published to the site), `ui-radius`, `web-styling`, `ui-design-review-cases`, `api-gateway`, plus the generated catalogs and graphs above.

## Read before changing X

| If you change… | Read first |
|---|---|
| Anything under `packages/` | `docs/architecture.md`, then the owning package README and its subsystem page |
| A documented type or its JSDoc | The owning subsystem page, `docs/development.md:213-221`, `scripts/type-equiv.manifest.json` |
| An event, tool schema, config field, or service surface | The relevant generated catalog's generator and source JSDoc, not the catalog |
| Session format or a persisted type | `docs/session-format-status.md`, `docs/persistence-changes/README.md`, `docs/cookbook/reviewing-persistence-type-changes.md` (or `adding-a-session-format-version.md` for a bump) |
| A package surface, remote service, client state, session/lifecycle/concurrency code | `docs/defensive-patterns/README.md` and the page for that artifact |
| A package README | `docs/cookbook/adding-a-package.md#4-write-the-package-readme`, the kind template, `verify-package-readme-summaries` (100-word Summary cap) |
| A tool's model-facing definition or UI card | `docs/cookbook/adding-a-tool.md`, `docs/subsystems/tools.md` |
| An LLM provider adapter | `docs/cookbook/adding-an-llm-adapter.md`, `docs/subsystems/llm-streaming.md` |
| A settings form or live config field | `docs/cookbook/adding-a-settings-card.md`, `docs/subsystems/settings.md` |
| A plugin composition, profile, or bundle | `docs/cordis-primer.md`, `docs/subsystems/boot.md`, `packages/bundle/` |
| A GUI/client component or slot | `docs/subsystems/slots.md`, `docs/subsystems/web-client.md`, `.agents/skills/dsh-client-ui-ux/SKILL.md` |
| Tests or fixtures | `docs/testing.md`, `snapshots/AGENTS.md` |
| Any doc page | `docs/AGENTS.md`, the kind template, the pairing contract, then regenerate affected catalogs |
| A published website page | `website/docs.ts` and `website/.vitepress/config.ts`, `.agents/skills/dsh-doc/references/website-sync.md` |

## Constraints & gotchas

- **659 files are one corpus, not 659 independent edits.** A doc edit is usually three files (source, `.zh.md`, `.i18n.yaml`) plus any regenerated catalog and the website manifest entry.
- **Never hand-edit generated output**: the catalog files above, `cordis-surface` regions, `docs/persistence-schema.json`, `known-event-types.ts`, `session-format-catalog/src/generated.ts`, and `website/.generated|cache|dist`.
- **`website/` accepts no new Markdown** except `website/AGENTS.md`; `pnpm docs:check` rejects it.
- **`docs/subsystems/` stays flat** because its pages are logically parallel; the grouped tree in `.agents/skills/dsh-doc/references/structure-hierarchy.md` (`docs/learn|user|developer|scratch`) is a *target* map, not the current layout — do not opportunistically restructure.
- **Budget drift exists**: `docs/AGENTS.md:59` states `architecture.md ≤ 2,400` and `testing.md ≤ 1,300` and lists `examples/AGENTS.md ≤ 310`, while the manifest enforces 2,410, 1,350, and has no `examples/` entry. Trust `scripts/doc-budgets.manifest.json`; the prose is stale.
- **The pairing gate is not a quality gate**: a re-recorded pair with a sloppy counterpart passes CI and must still fail review.
- **Archived Agent Notes are frozen**: never edit, translate, or re-record them; `verify-archived-agent-notes` seals the triplets, and the pairing gate excludes the tree.
- **Frozen upgrade guides**: guides in version directories older than the root package version are excluded from current-API compilation and are not rewritten. Root version is `0.2.2-rc.1`; existing directories stop at `v0.2.2-alpha.3`, so a new guide for the current release lands in `docs/upgrade-guide/v0.2.2-rc.1/<item>/guide.md` with `## Change` and `## Migration` in ≤500 English words (`scripts/verify-upgrade-guides.ts`).
- **`verify-md-wrap` is literal**: one physical line per paragraph; a hard-wrapped paragraph fails.
- **Cross-page fragments** use the English GitHub heading id; a differing VitePress id needs an explicit `<a id="…">`.
- **`docs:build` is also the dead-link check**; link checks alone will not catch a missing site fragment — use `verify-doc-site-fragments`.
- **`doc-typecheck` has a build dependency**: it compiles `host-contracts` first, so running it on a dirty artifact plane fails for reasons unrelated to the doc.

## Open questions

1. Is the `docs/learn|user|developer|scratch` hierarchy an active migration target with an owner, or aspirational guidance? The reference calls it a target map; no migration plan or tracking note was found.
2. Which budget is intended — `docs/AGENTS.md` prose (2,400 / 1,300, plus `examples/AGENTS.md`) or `scripts/doc-budgets.manifest.json` (2,410 / 1,350, no `examples/` entry)? The gate enforces the manifest; the prose has not been reconciled.
3. Does `examples/` still exist as a documented tier? It is budgeted in prose but absent from the manifest and from the tree as inspected.
4. Should any currently unpublished `docs/` material (persistence-change records, defensive patterns, testing policy) be exposed on the website? Policy says no by default; no explicit expansion request was found.
5. The website manifest publishes 21 top-level sources plus the subsystem, Cordis API, and cookbook collections; whether that allowlist should grow with the new `docs/user/` pages is a product decision with no recorded owner.
