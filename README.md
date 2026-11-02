# Today, for two

A pregnancy daily tracker: tap-to-complete goals, food/drink/movement logging,
reminders and insights. Plain HTML, no build step.

## Deploy to Vercel

Option A, command line (fastest):
1. Install Node.js if you don't have it.
2. In this folder, run: `npx vercel`
3. Answer the prompts (no build command, output directory is `.`).
4. Run `npx vercel --prod` to get the permanent URL.

Option B, GitHub:
1. Create a new GitHub repo and upload these files.
2. On vercel.com choose Add New > Project, import the repo.
3. Framework preset: "Other". Leave build settings empty. Deploy.

## Put it on her phone

- iPhone: open the URL in Safari > Share > Add to Home Screen. Open it from the
  Home Screen icon, then go to Settings in the app > Turn on reminders.
- Android: open in Chrome > menu > Add to Home screen / Install app.

## Good to know

- Data is saved in the phone's browser storage, on that one device. Use
  Settings > Export backup now and then.
- Reminders fire while the app is open or recently backgrounded. Guaranteed
  push notifications when the app is fully closed would need a small backend
  (e.g. Vercel + a push service), which is a good next step.
- Food, caffeine and exercise ratings follow general ACOG/FDA guidance and
  live in the `LIB` list in index.html, so they're easy to edit.
