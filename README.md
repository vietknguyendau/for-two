# Today, for two

Pregnancy tracker: daily goals, food/calorie/movement logging, mood and symptoms
with warning-sign alerts, weight tracking against the typical range, kick counter,
appointments and OB questions. Syncs through Upstash Redis, protected by a PIN.

## Files
- `index.html` – the app
- `api/state.js` – saves and loads data (all keys start with `ft:`)
- `package.json` – one dependency (`@upstash/redis`)
- `manifest.webmanifest`, `icon*` – home screen icon

## Update the existing for-two repo
Upload all files to the repo (keep `api` as a folder). Replacing `index.html`
and `README.md` is fine.

## Vercel setup
1. Import the repo (preset: Other, root `./`) or let it redeploy if already imported.
2. Storage → connect your existing Upstash Redis database. Prefix: `KV`.
   Check Production, Preview and Development.
3. Settings → Environment Variables → add `APP_PIN`. Use something longer than
   4 digits, e.g. `baby-nguyen-2027`.
4. Deployments → ⋯ → Redeploy.
5. Open the link, enter the PIN once per phone. Add to Home Screen on iPhone.

If the database or PIN isn't set, the app still works and saves on the phone only.
