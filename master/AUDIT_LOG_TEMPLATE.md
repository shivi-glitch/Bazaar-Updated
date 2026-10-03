# AUDIT LOG — Phase Pxx : <phase name>

> Copy this block into `audit/AUDIT_LOG.md` for each phase. Fill every field. Do not leave placeholders. Numbers come from `audit/evidence/Pxx/*.json`.

## 0. Header
| Field | Value |
|---|---|
| Phase | Pxx — <name> |
| Run # | 1 |
| Git commit (full SHA) | |
| Git tag on pass | `phase-Pxx-pass` |
| Date/time (UTC) start → end | |
| Agent / model / session id | |
| Master docs version & MANIFEST check | `sha256sum -c master/MANIFEST.sha256` → OK / FAIL (attach output) |
| Environment | OS, CPU model/cores, RAM, Python, Node, Postgres versions |
| Dataset / scale used | e.g. 500 teams, 600 WS clients, seed, N sessions |

## 1. Scope check
| Deliverable (from 08) | Path / commit | Exists (Y/N) |
|---|---|---|

## 2. Gate results (this phase)
| Gate ID | Requirement (verbatim from 08) | Threshold | **Measured (real number)** | Command used | Evidence file | SHA-256 of evidence | Result |
|---|---|---|---|---|---|---|---|

`Result` must be computed by `tools/audit_verify.py Pxx`: PASS only if measured satisfies the threshold.

## 3. Regression (all ★ gates from earlier phases re-run on this commit)
| Gate ID | Threshold | Measured now | Measured at its own phase | Result |
|---|---|---|---|---|

## 4. Distributions & raw statistics (attach for every performance/latency gate)
| Metric | n | min | p50 | p95 | p99 | max | Evidence file |
|---|---|---|---|---|---|---|---|

## 5. Defect register
| ID | Severity (1/2/3) | Description | Found by gate | Status | Fix commit |
|---|---|---|---|---|---|
Open Sev-1 / Sev-2 at close ⇒ phase FAIL.

## 6. Frozen artefacts (hashes)
| Artefact | Path | SHA-256 |
|---|---|---|

## 7. Deviations & change requests
| Item | Linked CHANGE_REQUESTS id | Approved by organizer (Y/N, date) |
|---|---|---|
HARD gates cannot be waived here.

## 8. Run history
| Run | Commit | Gates FAIL | Notes |
|---|---|---|---|

## 9. Independent verification (organizer or second session)
| Gate re-run (≥ 3 random + `audit_verify.py`) | Command | Log value | Re-run value | Within tolerance (Y/N) |
|---|---|---|---|---|

## 10. Decision
- Agent declaration: "All HARD gates of Phase Pxx are PASS on commit `<sha>` in Run <n>; evidence is stored under `audit/evidence/Pxx/`." — _agent id, UTC timestamp_
- Overall: **PASS / FAIL**
- Organizer sign-off: ____________  Date: ________  (**next phase blocked until signed**)
