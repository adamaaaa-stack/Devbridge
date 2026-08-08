# Aerial Concepts — redesign prototype

A mobile-first redesign prototype of [aerialconcepts.co.za](https://aerialconcepts.co.za/) for pitch / demo use.

- **No database** — 55 sampled products with original names, prices, brands and categories from the live shop
- **Proper category tree** — only departments that appear in the demo catalogue
- **Responsive** — phone, tablet and desktop

## Run

```bash
cd aerial-concepts
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS

## Deploy to Vercel

The app is a standard Next.js project — Vercel needs no environment variables.

1. Push this folder to GitHub (see below).
2. In Vercel: **Add New → Project → Import** the repo.
3. Set **Root Directory**:
   - `aerial-concepts` if the repo contains this folder at the top level
   - `./` (leave default) if you copied the folder's *contents* to the repo root
4. Framework preset **Next.js**, build command `next build`, output directory left as default.
5. **Deploy**.

## Push to your own repo

If you want this at the root of `Aerial-concepts-`:

```bash
git clone https://github.com/adamaaaa-stack/Aerial-concepts-.git
cp -R /path/to/aerial-concepts/. Aerial-concepts-/
cd Aerial-concepts-
git add -A
git commit -m "Aerial Concepts redesign prototype"
git push origin main
```

Then Vercel's **Root Directory** stays `./`.

## Note

Product images and names are scraped from the existing Aerial Concepts catalogue for demonstration only. Cart and contact form are UI stubs.
