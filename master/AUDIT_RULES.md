# AUDIT RULES — how a phase is closed

These rules bind the building agent (Antigravity). They exist so that "done" means *measured*, not *believed*.

1. **One audit section per phase** in `audit/AUDIT_LOG.md`, created from `AUDIT_LOG_TEMPLATE.md`, completed by the agent **after** the work and **before** the next phase starts.
2. **Gates are copied verbatim** from `08_PHASE_PLAN.md` (ID, requirement, threshold). The agent may not rephrase, weaken or drop a gate. If a gate seems wrong, file a `CHANGE_REQUESTS.md` entry; the gate stays as written until the organizer edits it.
3. **Every gate needs a measured number**, not a word. "Works", "passes", "looks fine", "should be" are invalid. Required: `measured value`, `threshold`, `result = PASS | FAIL` where PASS means the measured value satisfies the threshold arithmetically.
4. **Every number needs provenance:** the exact command, the git commit hash, UTC timestamp, environment (OS, CPU, RAM, Python/Node versions, dataset sizes, seed) and a **raw output file** saved at `audit/evidence/Pxx/<gate>-<name>.txt|json|png`. A SHA-256 of each evidence file is recorded in the log.
5. **No hand-typed results.** Numbers in the log must come from scripts that write machine-readable output (`audit/evidence/Pxx/*.json`), and the log values must equal those files. A verification script `tools/audit_verify.py Pxx` recomputes PASS/FAIL from the JSON and must exit 0.
6. **Regression is part of every phase.** Every ★ gate from earlier phases is re-run against the current commit and listed in the "Regression" table. A regression FAIL fails the phase.
7. **HARD gates have no waivers.** SOFT gates (none are SOFT by default) may be waived only by the organizer, in writing, inside the log with a reason and an expiry phase.
8. **FAIL handling:** log the FAIL honestly with the number, fix, re-run, and append a new "Run n" block. Never overwrite or delete a previous run. The phase passes only when the **latest** run has all gates PASS.
9. **Defect register:** any bug found during the phase is listed with severity (Sev-1 data loss/crash/leak, Sev-2 wrong behaviour, Sev-3 cosmetic), status and the commit that fixed it. Open Sev-1/Sev-2 at close = FAIL.
10. **Freeze and tag:** on pass, create git tag `phase-Pxx-pass`, record the tag, update `master/MANIFEST.sha256` check result, and list artefact hashes (frozen arrays, params, migrations).
11. **Independence:** the organizer (or a second agent session) must run `tools/audit_verify.py Pxx` and re-run **at least 3 randomly chosen gates** from the commands in the log before signing. Re-run results go in the "Independent verification" table. If any differ from the log by more than the stated tolerance, the phase is FAIL.
12. **Sign-off:** a phase is closed only when the **Sign-off block** has agent declaration + organizer signature/date. Next phase may start only after that.
13. **Integrity:** editing a closed phase's section is forbidden except to append an "Addendum" with date and reason.
14. **Honesty clause:** if a measurement could not be taken (tool missing, environment limit) the gate is FAIL (not N/A) unless 08 explicitly marks it N/A.
