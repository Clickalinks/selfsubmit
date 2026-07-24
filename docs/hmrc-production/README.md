# HMRC MTD ITSA — Production access pack (SelfSubmit)

Prepared for **Clicado Media UK Ltd** trading as **SelfSubmit**, in response to HMRC Software Developer Support (Aleesah Sher).

## Files in this folder

| File | Purpose |
|------|---------|
| `production-approvals-checklist-FILLED.md` | Completed answers for the official checklist (copy into HMRC PDF / Word reply) |
| `evidence-pack.md` | Evidence to attach or quote when requesting Production access |
| `reply-email-draft.md` | Suggested email back to HMRC |
| `pre-send-actions.md` | Must-do steps **before** you send (30-day testing window) |

Official blank checklist (from HMRC): `../Software-Approvals-Production-Checklist-2026-07-02.pdf`

## Recommended application scope

Apply as:

- **In-Year product only** (iterative build)
- **Individuals** (not agents)
- **Self-Employment** only (do **not** claim UK Property / Foreign Property MTD filing yet)
- **Standard quarterly** periods
- Digital records → cumulative quarterly updates via Self Employment Business (MTD) API
- Tax calculation / Final Declaration: **not in SelfSubmit yet** — customers signposted to HMRC Personal Tax Account / compatible software list

Do **not** tick Full End to End or End of Year until those APIs and UI exist.

## Honest readiness

| Requirement | Status |
|-------------|--------|
| Fraud prevention headers on MTD API calls | Ready (validated 15 Jul 2026 — **re-run before send**) |
| OAuth connect, business details, obligations | Ready (sandbox) |
| Quarterly cumulative **submit** (SE) | Ready (sandbox) |
| Quarterly cumulative **retrieve** (GET) | Ready — auto after submit + Retrieve button |
| Customer export of records | Ready (Settings → Leaving SelfSubmit / account export) |
| Clear “no Final Declaration” statement + GOV.UK software link | Ready (`MtdInYearScopeNotice` on dashboard / HMRC connect) |
| Live production filing flag | Still off until approval (`HMRC_LIVE_FILING_ENABLED`) |

HMRC only retains testing logs for **the previous 30 days**. Refresh sandbox traffic + FPH feedback immediately before you email them.

**Honest note on “100% HMRC recognised”:** Production listing for a **Full End-to-End** product also needs Final Declaration, calculations, BSAS, losses, etc. This pack targets **In-Year recognition** — the correct next step. End-of-year is a later iterative stage.
