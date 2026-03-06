# Codeveria

Platform for companies to connect with verified student developers. Message, create workspaces, and track milestones. Next.js 14, TypeScript, Supabase.

## Deploy on Vercel

1. **Push your code to GitHub** (e.g. your Codeveria repo).

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
   | `SUPABASE_SERVICE_ROLE_KEY` | No | Optional; for server-only operations |
   | `NEXT_PUBLIC_APP_URL` | No | e.g. `https://your-app.vercel.app` |

   Add them for **Production** (and Preview if you use preview deploys).

4. **Deploy**  
   Click **Deploy**. The first deployment will run `npm run build`.

5. **Supabase**  
   Run your Supabase migrations (e.g. `supabase db push` or run SQL from `supabase/migrations/`) so the production database has all tables. Apply migrations in order; use `999_remove_payment_usage.sql` to drop payment tables if you previously had payment features.

---

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

Use `.env.local` for Supabase keys (see table above). Never commit `.env.local`. See `.env.example` for variable names.
