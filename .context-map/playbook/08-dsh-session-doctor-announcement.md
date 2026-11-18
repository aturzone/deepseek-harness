POSTED 2026-11-11 as Discussion #12927 (Show Your Plugins!); the shorter plugin note was posted on #11971 and #11981.
The canonical body is the live announcement; the draft below is kept for history.

---

I built a small read-only diagnostic for the failure class in this thread: **dsh-session-doctor**.

It scans `$DSH_HOME/sessions/<workspace>/<session>/session.vN.jsonl[.zstd]`, decodes the canonical generation, and replays
the current V4 reader's turn/step/scope rules. Instead of just "stored session is corrupt", it names the offending
signature:

```text
✗ …/session-bad
  events: 4, version: 4
  - seq 2 tool/ptc-dispatch-start: turn-scope: tool/ptc-dispatch-start outside an open turn
  - seq 3 tool/ptc-dispatch: turn-scope: tool/ptc-dispatch outside an open turn
```

It detects both signatures discussed here: the PTC-dispatch orphan (class A) and step numbers restarting inside one open
turn (class B), plus row-level damage and missing headers. Exit codes: `0` clean, `1` suspect generation, `2` usage/I/O.

- Read-only: never opens a session file for writing, never touches `session.lock`.
- No internal dsh imports: the engine is `node:` builtins only; the plugin shim depends on `@deepseek-ai/cordis` and
  `@deepseek-ai/dsh-tools` peers, `engines.dsh >=0.2.2-rc.1 <0.3.0`.
- It ships as a CLI **and** a dsh bundle that registers a model-facing `session_doctor` tool. Verified: 9 unit tests;
  35 real sessions scanned clean on my machine; synthetic corrupt fixture detected; bundle installed into scratch
  `demo`/`headless`/`web` profiles and mounted in a real boot; served Web page returns 200 with no startup failures.

Repository: <link after publication>

To be clear about scope: this diagnoses and reports. The writer-side fix is still the real cure (our branch adds a
`SessionTurnScopeError` guard at `Session.append` for the PTC pair), and a repair/quarantine path for already-corrupted
generations remains an open question.
