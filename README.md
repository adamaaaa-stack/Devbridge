# Aerial Concepts — redesign prototype

A mobile-first redesign prototype of [aerialconcepts.co.za](https://aerialconcepts.co.za/) for pitch / demo use.

- **No database** — 55 sampled products with original names, prices, brands and categories from the live shop
- **Proper category tree** — three levels deep, every route resolves to real stock
- **Responsive** — phone, tablet and desktop

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS

## Deploy to Vercel

No environment variables required.

1. In Vercel: **Add New → Project → Import** this repo.
2. Leave **Root Directory** as `./` — the app lives at the repo root.
3. Framework preset **Next.js**; keep the default build command and output directory.
4. **Deploy**.

## Structure

```
src/
  app/                 routes (home, shop, category, product, about, contact)
  components/          Header, Footer, Hero, ProductCard, CategoryTile, Logo
  data/products.json   the 55-product demo catalogue
  lib/catalog.ts       category tree, search, price formatting, store details
public/
  products/            product imagery (WebP)
  hero/                hero imagery (WebP)
```

## Note

Product images and names are scraped from the existing Aerial Concepts catalogue for demonstration only. Cart and contact form are UI stubs.
