# Before you email HMRC — action list

Do these in order. HMRC asked you **not** to apply until requirements are met, and their testing logs only cover **~30 days**.

## A. Fill the blanks only you can fill

1. Open HMRC Developer Hub → copy **Sandbox Application Client ID** into the checklist header.  
2. Create / open the **Production** application (if missing) → copy **Production Application ID**.  
3. Update completion date to the day you send.

## B. Refresh sandbox evidence (mandatory)

Within a few days of sending:

1. Sign in to https://www.selfsubmit.co.uk with a sandbox HMRC test user.  
2. Connect HMRC → fetch obligations → confirm business link.  
3. Preview and submit a sandbox quarterly update (from digital monthly records).  
4. On your machine:

```bash
cd c:\selfsubmit\frontend
node --env-file=.env.local scripts/validate-hmrc-fraud-headers.mjs
node --env-file=.env.local scripts/validate-hmrc-fraud-headers.mjs --feedback
```

5. Save the full terminal output as e.g. `docs/hmrc-production/fph-feedback-YYYY-MM-DD.txt` and attach it.  
6. Capture the screenshots listed in `evidence-pack.md` §5.

Prior FPH `VALID_HEADERS` evidence from **15 July 2026** is still inside a 30-day window as of 24 July 2026, but **re-running is strongly recommended** so HMRC see fresh traffic.

## C. Close checklist honesty gaps

| Gap | Recommended action |
|-----|--------------------|
| Unsupported sources clearly stated + GOV.UK software link | Confirm UI notice live on dashboard / HMRC connect |
| No Final Declaration clearly stated + link | Confirm `MtdInYearScopeNotice` on dashboard |
| Cumulative submit **and** retrieve | **Done** — re-test in sandbox before emailing HMRC |
| Do not claim UK Property MTD | Keep Property = No on checklist even if bookkeeping exists |
| FAQ / marketing that implies Final Declaration live | Softened — re-check landing copy before send |

## D. What to send

1. Completed checklist (answers from `production-approvals-checklist-FILLED.md` transferred into HMRC’s PDF or sent as this completed sheet).  
2. `evidence-pack.md` (PDF/print optional).  
3. Fresh FPH terminal output.  
4. Screenshot set.  
5. Email from `reply-email-draft.md`.

## E. After approval (not before)

1. Subscribe Production app to the same MTD APIs.  
2. Point production env at production API base + Production client credentials.  
3. Remove sandbox-only test headers/scenarios from production paths.  
4. Enable live filing only after a controlled pilot (`HMRC_LIVE_FILING_ENABLED`).

---

**Bottom line:** Refresh FPH + sandbox submit/retrieve this weekend, fill Developer Hub IDs, then complete the checklist Monday. In-Year checklist items for SE cumulative submit/retrieve and disclosures are implemented in product.
