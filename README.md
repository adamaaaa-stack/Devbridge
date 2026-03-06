# Codeveria

Platform for companies to hire verified student developers for paid projects. Next.js 14, TypeScript, Supabase, Lemon Squeezy.

## Deploy on Vercel

1. **Push your code to GitHub** (e.g. [adamaaaa-stack/Devbridge](https://github.com/adamaaaa-stack/Devbridge) or your Codeveria repo).

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
   - Import your GitHub repo
   - Vercel will detect Next.js; keep the default build settings

3. **Environment variables**  
   In the project **Settings → Environment Variables**, add:

   | Variable | Required | Notes |
   |----------|----------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Yes | For webhooks (escrow/ledger); keep secret |
   | `LEMON_SQUEEZY_API_KEY` | Yes | For creating checkouts |
   | `LEMON_SQUEEZY_STORE_ID` | Yes | Lemon Squeezy store ID |
   | `LEMON_SQUEEZY_VARIANT_ID` | Yes | Product variant for workspace funding |
   | `LEMON_SQUEEZY_WEBHOOK_SECRET` | Yes | Signing secret from your Lemon Squeezy webhook |
   | `NEXT_PUBLIC_APP_URL` | No | e.g. `https://your-app.vercel.app` (used for checkout redirect; falls back to request origin) |

   Add them for **Production** (and Preview if you use preview deploys).

4. **Deploy**  
   Click **Deploy**. The first deployment will run `npm run build`.

5. **Lemon Squeezy webhook**  
   After the first deploy you have a URL like `https://your-project.vercel.app`:
   - In [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com) → **Settings** → **Webhooks**, add a webhook
   - **URL:** `https://your-project.vercel.app/api/lemonsqueezy/webhook`
   - **Events:** `order_created`, `order_paid`
   - Copy the **Signing secret** and set it as `LEMON_SQUEEZY_WEBHOOK_SECRET` in Vercel (then redeploy if the env was missing)

6. **Supabase**  
   Run your Supabase migrations (e.g. locally with `supabase db push` or via Supabase dashboard SQL) so the production database has tables from `supabase/migrations/`.

---

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

Use `.env.local` for Supabase and Lemon Squeezy keys (see table above). Never commit `.env.local`. See `.env.example` for variable names.
