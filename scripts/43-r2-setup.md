# Cloudflare R2 for Theos Art (Vercel)

R2 is Cloudflare’s S3-compatible object storage. Theos Art already prefers R2 for product images, gallery uploads, course materials, receipts, and hero videos when these env vars are set on Vercel. Without them, uploads fall back to Supabase Storage.

> Note: R2 lives in a Cloudflare account. You do **not** need Cloudflare Pages or DNS migration — only an R2 bucket + API token, then wire the public URL into Vercel.

---

## A. Create the R2 bucket (Cloudflare)

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 Object Storage**.
2. **Create bucket** → name: `platform-media` (or match `R2_BUCKET_NAME`).
3. Storage class: **Standard**.

### Public access URL (pick one)

**Option 1 — R2.dev subdomain (fastest)**

1. Bucket → **Settings** → **Public access** → **Allow Access**.
2. Copy the public URL, e.g. `https://pub-xxxxxxxx.r2.dev`.
3. Use that as `R2_PUBLIC_BASE_URL` and `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`.

**Option 2 — Custom domain (recommended in production)**

1. Bucket → **Settings** → **Custom Domains** → connect e.g. `media.theosart.com`.
2. Use `https://media.theosart.com` as both public base URLs.

### API token

1. R2 overview → **Manage R2 API Tokens** → **Create API token**.
2. Permissions: **Object Read & Write** (scoped to `platform-media` if possible).
3. Copy **Access Key ID**, **Secret Access Key**, and note your **Account ID** (R2 overview sidebar).

### CORS (required for browser uploads)

Hero videos and large lesson files upload with **presigned PUT** from the browser.

Bucket → **Settings** → **CORS policy** → paste `scripts/43-r2-cors.json`.

This file includes `www.theosartltd.com`, `theosart.com`, localhost, and `*` so admin uploads from Vercel or a custom domain are not blocked. Without matching CORS, the admin UI shows a generic **network error** during video upload.

Add your live admin origin if it is different. Example:

```json
[
  {
    "AllowedOrigins": [
      "https://www.theosartltd.com",
      "https://theosartltd.com",
      "https://www.theosart.com",
      "https://theosart.com",
      "https://your-project.vercel.app",
      "http://localhost:3000",
      "*"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD", "POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Type"],
    "MaxAgeSeconds": 86400
  }
]
```

---

## B. Configure Vercel

1. Vercel project for **theosartdeveloper/Theos-art** → **Settings** → **Environment Variables**.
2. Add for **Production** (and Preview if you test uploads there):

| Variable | Example | Notes |
|----------|---------|--------|
| `R2_ACCOUNT_ID` | `abc123…` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | token access key | From R2 API token |
| `R2_SECRET_ACCESS_KEY` | token secret | Keep secret |
| `R2_BUCKET_NAME` | `platform-media` | Bucket name |
| `R2_PUBLIC_BASE_URL` | `https://pub-….r2.dev` or `https://media.theosart.com` | No trailing slash |
| `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` | **same as above** | Required for hero videos & client URLs |

3. **Redeploy** the Production deployment (env vars apply on new builds).

Optional:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_HERO_VIDEOS_BASE_URL` | Override hero video folder base (defaults to `{R2 public}/hero`) |
| `NEXT_PUBLIC_HERO_IMAGES_BASE_URL` | Force hero stills from a custom/R2 path |
| `NEXT_PUBLIC_HERO_USE_R2=true` | Serve bundled hero PNGs from `{R2}/hero` instead of `/public/hero` |

---

## C. What the website does once configured

Code path: `lib/storage/object-storage.ts`.

- Admin uploads (shop, gallery, announcements, courses, receipts) go to R2 when `isR2Configured()`.
- Public file URLs become `{R2_PUBLIC_BASE_URL}/products/...`, `/energy-library/...`, `/hero/...`, etc.
- Hero video playlist uses `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` automatically.

### Verify

1. Admin → Products (or Art Gallery) → upload an image → URL host should match your R2 public base.
2. Admin → Settings → Hero videos → upload; homepage loads `…/hero/…` from R2.
3. Open the image URL in a private browser window (confirms public access).

---

## D. Local development

Copy values into `.env.local` (never commit secrets). Restart `pnpm dev` after changes.

See also `.env.example` and `scripts/43-r2-cors.json`.
