# Suggested reply to HMRC (Aleesah Sher)

**To:** softwaredevelopersupport@service.hmrc.gov.uk  
**Subject:** SelfSubmit (Clicado Media UK Ltd) — Production Approvals Checklist (In-Year) + evidence

---

Hi Aleesah,

Thank you for your email and for sending the Production Approvals Checklist.

Please find attached:

1. Completed **MTD ITSA Software Production Checklist** (Version 2026-07-02) for **SelfSubmit** / **Clicado Media UK Ltd**
2. Our **evidence pack** covering fraud prevention headers, APIs exercised via the SelfSubmit product, and supporting notes

### Application scope

We are requesting Production access for an **iterative In-Year product only**:

- **Individuals** (not agents)
- **Self-Employment** income sources
- **Standard quarterly** periods
- Digital record-keeping and **cumulative** quarterly updates via the Self Employment Business (MTD) API
- Business Details (MTD) and Obligations (MTD) I&E retrieval
- Fraud prevention headers on all MTD API calls (`WEB_APP_VIA_SERVER`)

We are **not** applying for End of Year / Final Declaration functionality in this request. Customers are signposted to their HMRC Personal Tax Account / GOV.UK compatible software guidance for tax calculation and Final Declaration until that stage is delivered.

### Testing

All listed APIs were exercised **through SelfSubmit** (sandbox), not via a standalone submission tool. Fraud prevention header validation-feedback for `obligations-mtd`, `business-details-mtd` and `self-employment-business-mtd` returned `VALID_HEADERS` (fresh terminal output attached / dated \[DATE\]).

### Developer Hub IDs

- Sandbox Application ID: \[PASTE\]
- Production Application ID: \[PASTE\]

Please let us know if you need any further evidence or clarification.

Kind regards,  
Ullah Noor  
Director, Clicado Media UK Ltd  
trading as SelfSubmit  
https://www.selfsubmit.co.uk  
support@selfsubmit.co.uk  
Company number: 16904433
