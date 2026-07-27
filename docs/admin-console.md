# SelfSubmit Admin console

URL: `/admin` (not linked in the customer sidebar)

## Security model

1. **Signed in** via Clerk  
2. **Role** `admin` or `super_admin` in the database (`User.role`)  
3. **Allowlist** (recommended): `ADMIN_USER_IDS=user_xxx` in env — must match even if role is set  
4. **MFA required** for `/admin` always (even if `MFA_REQUIRED=false` for customers)  
5. **Rate-limited** admin APIs  
6. **Audit-logged** admin actions  
7. **noindex** + robots disallow  

Non-admins hitting `/admin` are redirected to `/dashboard`.

## First-time setup (you)

1. Copy your Clerk user id from Clerk Dashboard → Users (starts with `user_`).  
2. From `frontend/`:

```bash
node --env-file=.env.local scripts/promote-admin.mjs user_YOUR_ID
```

3. Add to `.env.local` and **Vercel** production env:

```
ADMIN_USER_IDS=user_YOUR_ID
```

4. Enable MFA on that account (Dashboard → Settings) if not already.  
5. Open `/admin`.

## What it can do (v1)

- View user / business / record counts  
- Turn on a **site announcement banner** (info / warning / maintenance)  
- Enable **maintenance mode** (blocks customer dashboard; admins still work)  
- View recent **audit log** entries  

## What it cannot do yet

- Impersonate users  
- Edit billing / HMRC credentials  
- Delete customer data  

Add those later only with the same security gates.
