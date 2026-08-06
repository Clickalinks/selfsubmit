# Reply to HMRC — Business Details retrieve gap (Aug 2026)

**To:** Reply-all on Aleesah / SDS thread  
**Subject:** Re: Production request — SelfSubmit — Business Details retrieve now tested

---

```
Hi Aleesah,

Thank you for the feedback on our production request.

We have addressed the Business Details finding:

• Our software previously called List All Businesses only
  (GET /individuals/business/details/{nino}/list).

• We have now implemented and tested Retrieve Business Details
  (GET /individuals/business/details/{nino}/{businessId}) via SelfSubmit
  in the sandbox environment, called from our application when loading
  HMRC businesses / auto-linking a self-employment income source.

Please re-check Business Details against our latest sandbox API traffic.
We note that Obligations and Self Employment Business were marked okay —
thank you.

Please let us know if you need anything further.

Kind regards,
Ullah Noor
Director, Clicado Media UK Ltd (SelfSubmit)
```

## Retest checklist (do this BEFORE sending)

1. Deploy the fix to production/sandbox app that talks to HMRC **sandbox**.
2. Sign in with your HMRC **sandbox** test user (same NINO as before).
3. Dashboard → HMRC Connect → ensure connected.
4. Open HMRC business link section → **Load HMRC businesses** (this now List + Retrieve).
5. Or run setup/auto-link for a business (also calls Retrieve).
6. Optionally take a screenshot of the linked business / load success.
7. Then send the email above.
