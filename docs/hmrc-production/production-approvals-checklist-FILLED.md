# MTD ITSA Software Production Checklist — COMPLETED ANSWERS

**Source form:** Software Approvals Production Checklist (Version 2026-07-02)  
**How to use:** Open HMRC’s PDF and transfer these answers, or attach this completed sheet with your reply email.

---

## Header details

| Field | Value |
|-------|--------|
| Company name | **Clicado Media UK Ltd** |
| Application name | **SelfSubmit** |
| Sandbox ID (used for testing) | **\[FILL FROM DEVELOPER HUB — Sandbox application Client ID\]** |
| Production Application ID (for subscriptions) | **\[FILL FROM DEVELOPER HUB — create Production app if not already\]** |
| Company website URL | **https://www.selfsubmit.co.uk** |
| Completed by (name) | **Ullah Noor** |
| Date of completion | **24 July 2026** *(update to the day you send)* |
| Contact email | **support@selfsubmit.co.uk** |
| Company number | **16904433** |
| Registered office | **2 Ernest Johns Mews, Exeter EX2 5FP** |

---

## General — Complete in all cases

| Question | Answer | Comments |
|----------|--------|----------|
| Confirm you have read the Process for being granted Production access section in the MTD IT end to end service guide | **Yes** | Read: https://developer.service.hmrc.gov.uk/guides/income-tax-mtd-end-to-end-service-guide/ |
| Confirm testing meets the requirements set out in the service guide | **Yes** | Sandbox OAuth, Business Details, Obligations (I&E), Self-Employment cumulative quarterly submit tested via the SelfSubmit product (not a standalone submission tool). Fraud-prevention headers validated (see evidence pack). |
| Confirm that by requesting Production access you acknowledge software must be maintained and updated for legislative, regulatory, operational and technical changes | **Yes** | Understood and accepted. |
| Confirm that you understand failure to keep software up to date may result in HMRC withdrawing production access | **Yes** | Understood and accepted (Developer Hub Terms of Use). |
| Confirm software supports transmission of fraud prevention header data in all API calls | **Yes** | Connection method `WEB_APP_VIA_SERVER`. All SelfSubmit → HMRC MTD calls attach Gov-* headers via server-side client. |
| Confirm that when testing, the APIs have been called via software and not just created within a submission tool | **Yes** | Calls made through https://www.selfsubmit.co.uk (Connect HMRC, Fetch obligations, link business, Preview / Submit quarterly update). |
| Confirm software allows the customer to own and have access to all their records, and to export these records if necessary | **Yes** | Customers can view Submission history, download PDFs, and export via Settings → Leaving SelfSubmit / account export. |
| Customer base — Individuals | **Yes** | Aimed at self-employed individuals. |
| Customer base — Agents | **No** | SelfSubmit is end-user software, not agent practice software. |
| Product build type — In-Year product only | **Yes** | Applying for **in-year** Production access (iterative). |
| Product build type — End of Year product only | **No** | |
| Product build type — Full End to End product | **No** | Full E2E (Final Declaration etc.) is planned for a later stage. |
| Confirm whether you are building iteratively | **Yes** | |
| If building iteratively, which stage of the build you require production access for | **In-Year stage** | Digital records + obligations + business details + self-employment cumulative quarterly updates. End-of-year / Final Declaration not included in this request. |

---

## Scope of income / periods / accounting (General continued)

| Question | Answer | Comments |
|----------|--------|----------|
| Business income types — Self-Employment | **Yes** | Supported for MTD API quarterly updates. |
| Business income types — UK Property | **No** | Property may be recorded as bookkeeping only; **UK Property MTD API filing is not claimed** for this application. |
| Business income types — Foreign Property | **No** | Not supported. |
| Quarterly period type — Standard quarterly | **Yes** | UK tax-year aligned quarters (e.g. 6 Apr–5 Jul). |
| Quarterly period type — Calendar quarterly | **No** | Not supported in this release. |
| Accounting types — Cash | **Yes** | Digital records kept on a cash / amounts-received basis suitable for typical sole traders. |
| Accounting types — Accruals | **No** | Accruals accounting type change endpoints not in this in-year build. |
| Where non-mandated income sources are not supported, this is clearly stated and customers are linked to the GOV.UK compatible software finder | **Yes** | Product states live filing / listing status; unsupported MTD sources signposted to https://www.gov.uk/guidance/find-software-thats-compatible-with-making-tax-digital-for-income-tax *(confirm wording on site before send — see pre-send-actions.md)*. |
| Where software doesn’t support end of year functionality (including Final Declaration), this is clearly stated with link to compatible software finder | **Yes** | Applies — **in-year only**. Customers are directed to HMRC Personal Tax Account / compatible software for Final Declaration *(confirm UI/copy before send)*. |
| Allows customer to request and view a tax calculation via Individual Calculations (MTD) API | **No** | |
| If No — Signpost customer to HMRC Personal / Business Tax Account to view their calculation | **Yes** | How tax due works / dashboard guidance points users to their HMRC Personal Tax Account. |
| Software returns and displays appropriate error messages for relevant calls | **Yes** | API errors surfaced in HMRC Connect / Filing readiness UI (e.g. obligations, preview, submit, rate limits). |

---

## In-Year — Complete (this application)

| Question | Answer | Comments |
|----------|--------|----------|
| Software lists and retrieves Business Details — Business Details (MTD) API | **Yes** | Tested. `GET /individuals/business/details/{nino}/list` via SelfSubmit HMRC Connect / business link flows. |
| If calendar quarterly: Create and Amend quarterly Period Type | **N/A** | Calendar quarterly not supported. |
| Including Retrieve/Create/Update Periods of Account in in-year build | **No** | Not in this in-year stage (in-year only product). |
| Retrieve Income & Expenses (I&E) Obligations — Obligations (MTD) API | **Yes** | Tested. Open I&E obligations retrieved and displayed. |
| Final Declaration Obligation retrieved at same time as I&E | **No** | Not required for in-year only. |
| Quarterly submission data populated from customer’s digital record; no manual keying in the submission itself | **Yes** | Preview/submit builds cumulative totals from saved monthly digital records. Users change figures in records, not by free-typing the HMRC payload. |
| Software can **submit and retrieve** in-year summaries for each relevant business source (Self Employment Business MTD cumulative endpoints) | **Yes** | **Submit (PUT)** and **Retrieve (GET)** cumulative period summary implemented and available in Filing readiness (Preview / Submit / Retrieve). After submit, SelfSubmit automatically retrieves and stores the HMRC-held summary. |
| Foreign property Retrieve/Create/Update | **N/A** | Foreign property not supported. |
| Annual Submission endpoints included in in-year build | **No** | Deferred to end-of-year stage. |
| Trigger/List/Retrieve calculation via Individual Calculations API | **No** | Users signposted to HMRC Personal Tax Account. |

---

## End of Year — Do not complete for this application

Leave blank / mark **N/A — applying for In-Year product only**.  
Final Declaration, BSAS, losses, tax liability adjustments, intent-to-finalise calculations, declaration statements — **not claimed**.

---

## Declaration (sign before send)

I confirm the answers above are accurate to the best of my knowledge.

**Name:** Ullah Noor  
**Position:** Director, Clicado Media UK Ltd  
**Date:** ________________  
**Signature:** ________________
