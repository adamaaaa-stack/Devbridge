import productsJson from '@/data/products.json';

export type Product = {
  sku: string;
  slug: string;
  name: string;
  price: number;
  brand: string;
  unit: string;
  inStock: boolean;
  image: string;
  categoryPath: string[];
};

export type CategoryNode = {
  name: string;
  slug: string;
  path: string[];
  children: CategoryNode[];
  productCount: number;
};

export const products = productsJson as Product[];

function slugify(s: string) {
  return s
    .replace(/&/g, ' and ')
    .replace(/`/g, '')
    .replace(/'/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .toLowerCase();
}

export function categorySlug(path: string[]) {
  return path.map(slugify).join('/');
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(path: string[]) {
  return products.filter((p) =>
    path.every((seg, i) => p.categoryPath[i] === seg),
  );
}

/** Build a tree of only the categories that appear in the demo catalogue. */
export function buildCategoryTree(): CategoryNode[] {
  const root: CategoryNode[] = [];

  function ensure(path: string[]): CategoryNode {
    let level = root;
    let node: CategoryNode | undefined;
    for (let i = 0; i < path.length; i++) {
      const name = path[i];
      node = level.find((n) => n.name === name);
      if (!node) {
        node = {
          name,
          slug: slugify(name),
          path: path.slice(0, i + 1),
          children: [],
          productCount: 0,
        };
        level.push(node);
      }
      level = node.children;
    }
    return node!;
  }

  for (const p of products) {
    for (let depth = 1; depth <= p.categoryPath.length; depth++) {
      const node = ensure(p.categoryPath.slice(0, depth));
      node.productCount += 1;
    }
  }

  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(root);
  return root;
}

export function findCategory(slugs: string[]): CategoryNode | undefined {
  let level = buildCategoryTree();
  let found: CategoryNode | undefined;
  for (const s of slugs) {
    found = level.find((n) => n.slug === s);
    if (!found) return undefined;
    level = found.children;
  }
  return found;
}

export function getTopCategories() {
  return buildCategoryTree();
}

export function getFeaturedProducts(count = 8) {
  // Prefer in-stock kits and bigger-ticket items for the home page.
  const ranked = [...products].sort((a, b) => {
    const score = (p: Product) =>
      (p.inStock ? 2 : 0) +
      (p.categoryPath[0]?.includes('Kits') ? 3 : 0) +
      (p.price > 1000 ? 1 : 0);
    return score(b) - score(a) || b.price - a.price;
  });
  return ranked.slice(0, count);
}

export function getRelated(product: Product, count = 4) {
  return products
    .filter(
      (p) =>
        p.sku !== product.sku &&
        p.categoryPath[0] === product.categoryPath[0],
    )
    .slice(0, count);
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.categoryPath.some((c) => c.toLowerCase().includes(q)),
  );
}

export const STORE = {
  name: 'Aerial Concepts',
  tagline: 'Flown with Passion',
  phone: '(011) 802 8500',
  email: 'info@aerialconcepts.co.za',
  address: '32 Southway, Cnr Fairway & Southway, Kelvin, Sandton',
  hours: [
    { day: 'Monday – Friday', time: '09:00 – 17:00' },
    { day: 'Saturday', time: '08:30 – 13:00' },
    { day: 'Sundays & Public Holidays', time: 'Closed' },
  ],
};
