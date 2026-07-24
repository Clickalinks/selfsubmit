# SelfSubmit — Evidence pack for HMRC Production access

**Product:** SelfSubmit  
**Vendor:** Clicado Media UK Ltd (Company no. 16904433)  
**Website:** https://www.selfsubmit.co.uk  
**Build / connection method:** Web application via server (`Gov-Client-Connection-Method: WEB_APP_VIA_SERVER`)  
**Application stage:** In-year (iterative) — Self-Employment standard quarterly updates  

Attach this pack (or the key extracts) with your completed checklist when emailing Software Developer Support.

---

## 1. What we are requesting

Production access for **Making Tax Digital for Income Tax** APIs required for an **in-year** Self-Employment product:

1. OAuth authorisation (`oauth/authorize`, `oauth/token`)
2. Business Details (MTD) — list / retrieve business income sources
3. Obligations (MTD) — retrieve open Income & Expenditure obligations
4. Self Employment Business (MTD) — **cumulative** quarterly period summary **submit** (and retrieve once GET is confirmed — see §6)

We are **not** requesting End of Year / Final Declaration Production use in this application.

---

## 2. Minimum functionality mapping

| Minimum capability | How SelfSubmit meets it | Evidence |
|--------------------|-------------------------|----------|
| Digital records | Income/expense monthly records, receipts, submission history | Live product: Dashboard → Monthly records; Submission history |
| Quarterly updates | Cumulative SE update built from digital records | Dashboard → Filing readiness → Preview / Submit to HMRC sandbox |
| Customer access & export | View history, PDF, account export | Settings → Leaving SelfSubmit; Submission history → View / PDF |
| Fraud prevention headers | Gov-* headers on every HMRC MTD call | §3 below |
| Error handling | User-visible errors from HMRC / SelfSubmit APIs | Screenshots of obligations / submit error states |

---

## 3. Fraud prevention headers

### 3.1 Headers transmitted (all MTD API calls)

SelfSubmit builds and sends (connection method `WEB_APP_VIA_SERVER`), including:

- `Gov-Client-Connection-Method`
- `Gov-Vendor-Product-Name` = SelfSubmit
- `Gov-Vendor-Version` = `selfsubmit=1.0.0`
- `Gov-Vendor-License-IDs`
- `Gov-Client-Public-IP` / `Gov-Client-Public-IP-Timestamp` / `Gov-Client-Public-Port`
- `Gov-Vendor-Public-IP` / `Gov-Vendor-Forwarded`
- `Gov-Client-Browser-JS-User-Agent`
- `Gov-Client-Device-ID`
- `Gov-Client-Screens` / `Gov-Client-Window-Size` / `Gov-Client-Timezone`
- `Gov-Client-User-IDs`
- `Gov-Client-Multi-Factor`

Implementation: server-side header builder attached by the shared HMRC API client on every authenticated MTD request. Browser collects device/screen/timezone context before HMRC calls.

### 3.2 Validation results (sandbox Test Fraud Prevention Headers API)

Completed **15 July 2026** (re-run immediately before this application — HMRC retains ~30 days of logs):

| API | `validation-feedback` |
|-----|------------------------|
| `obligations-mtd` | `VALID_HEADERS` |
| `self-employment-business-mtd` | `VALID_HEADERS` |
| `business-details-mtd` | `VALID_HEADERS` |

**How to regenerate evidence (keep terminal output):**

```bash
cd frontend
node --env-file=.env.local scripts/validate-hmrc-fraud-headers.mjs
node --env-file=.env.local scripts/validate-hmrc-fraud-headers.mjs --feedback
```

Also documented in: `docs/pen-test-report-selfsubmit.md` §11.

---

## 4. APIs exercised via the SelfSubmit product (not a submission tool)

| Step | User action in SelfSubmit | HMRC API |
|------|---------------------------|----------|
| 1 | HMRC Connect → authorise on GOV.UK | OAuth |
| 2 | Fetch / auto-load obligations | Obligations (MTD) I&E |
| 3 | List / link HMRC business ID (e.g. XBIS…) | Business Details (MTD) |
| 4 | Preview HMRC totals from monthly records | (SelfSubmit aggregation; then submit) |
| 5 | Submit to HMRC sandbox | Self Employment Business (MTD) cumulative PUT |

**Sandbox test user flows** have been completed on the live site (sandbox mode), with resulting rows visible in Submission history as “HMRC quarterly” / sandbox submitted.

---

## 5. Suggested screenshots to attach (capture fresh)

Capture from https://www.selfsubmit.co.uk while signed in to a **sandbox-connected** account:

1. **HMRC Connect** — connected status + Fetch obligations result  
2. **Business link** — SelfSubmit business linked to HMRC `XBIS…` ID  
3. **Filing readiness** — “Ready for sandbox submit” + quarterly window message  
4. **Preview HMRC totals** — amounts derived from digital records  
5. **Submission history** — monthly record + HMRC quarterly sandbox row  
6. **Export / Leaving SelfSubmit** — customer can export records  
7. **How tax due works** (or equivalent) — signpost to HMRC Personal Tax Account / no in-app tax calculation claim  
8. Optional: statement that Final Declaration is not yet supported + link to GOV.UK software finder  

---

## 6. Known limitations (disclose honestly)

| Item | Status | Action |
|------|--------|--------|
| Cumulative **GET** (retrieve after submit) | **Implemented** — Filing readiness Retrieve + auto-retrieve after submit |
| Final Declaration / End of Year APIs | Not in this release — clearly disclosed in-product with GOV.UK software finder link |
| UK Property / Foreign Property MTD APIs | Not claimed — disclosed with GOV.UK link |
| Individual Calculations API | Not implemented — signpost to Personal Tax Account |
| Production filing kill-switch | Live filing remains disabled until Production credentials approved | Correct operational control |

---

## 7. Ongoing maintenance commitment

Clicado Media UK Ltd acknowledges that Production access requires ongoing maintenance for legislative, regulatory, operational and technical changes, and that failure to keep SelfSubmit up to date may result in withdrawal of Production access under the Developer Hub Terms of Use.

---

## 8. Contact

**Ullah Noor**  
Director, Clicado Media UK Ltd  
https://www.selfsubmit.co.uk  
support@selfsubmit.co.uk
