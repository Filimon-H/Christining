# Guest photographs — setup

Guests tap a button, pick photos from their camera roll or take one, and the
files land in your Cloudinary media library. No account, no app, no sign-in for
them. Roughly five minutes to set up, once.

Until both values below are set, the photo section **hides itself** and the rest
of the invitation works exactly as before. Nothing half-configured is ever shown
to a guest.

---

## 1. Make a Cloudinary account

[cloudinary.com/users/register_free](https://cloudinary.com/users/register_free) —
free, no card. The free tier is 25 GB of storage and 25 GB of monthly bandwidth.
Phone photographs run 3–5 MB, so that is several thousand of them.

From the Dashboard, copy your **Cloud name** (something like `dxxxxxxxx`).

## 2. Create an unsigned upload preset

This is the piece that lets a guest upload without logging in.

1. **Settings** (gear, top right) → **Upload** → **Upload presets**
2. **Add upload preset**
3. Set **Signing mode** to **Unsigned** — this is the whole point; leave it
   Signed and every upload is rejected
4. Set **Folder** to `christening` so guest photos stay separate from anything
   else in the account
5. Save, and copy the **preset name**

### Worth setting while you are there

| Setting | Value | Why |
| --- | --- | --- |
| Folder | `christening` | Keeps guest uploads in one place |
| Unique filename | On | Twenty phones all send `IMG_0001.jpg` |
| Max file size | `10000000` (10 MB) | Matches the limit the site enforces |
| Auto-moderation | Off | On would hold photos for review before you see them |

## 3. Put the two values in the project

```bash
cp .env.example .env.local
```

Then fill in both lines:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxxxxxx
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

Restart `npm run dev`. Environment variables are read at build time, so a
running dev server will not pick them up.

## 4. Set the same two values on Vercel

Local `.env.local` is not deployed — it is gitignored, correctly.

Vercel dashboard → your project → **Settings** → **Environment Variables**. Add
both names with the same values, for **all** environments, then redeploy.

---

## Are these values safe to publish?

Yes, and they necessarily are — both are visible in the page source, because the
upload happens in the guest's browser.

The preset name is not a password. It grants exactly one permission: adding a
file under the rules you configured in step 2. It cannot be used to read, list,
download, delete, or transform anything already in your account.

The realistic abuse is a stranger who views source and uploads junk to your
folder. If that ever happened you would delete the preset and the ability
vanishes instantly. For a link shared privately with family, this is the right
trade against making every guest sign in to Google.

Your API **secret** is a different thing entirely, and is not used here. Never
put it in any `NEXT_PUBLIC_` variable.

## Getting the photographs afterwards

**Media Library** → the `christening` folder.

- Select all → **Download** → Cloudinary emails a zip
- Or **Download as zip** directly from the folder view

To keep them in Google Drive as originally planned, unzip and drag the folder in.
Same end result, without asking any guest to sign in to anything.

## If uploads fail

| Symptom | Cause |
| --- | --- |
| Section is missing entirely | One of the two variables is blank. This is the intended behaviour |
| Every upload fails immediately | Preset is **Signed**, not Unsigned — step 2 |
| Works locally, fails on the live site | Variables not added in Vercel, or added but not redeployed |
| "Too large to send" | The file is over 10 MB — usually a long video |
