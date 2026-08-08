import { products, type Product } from './catalog';

export type ParsedQuery = {
  raw: string;
  keywords: string[];
  maxPrice?: number;
  minPrice?: number;
  skill?: Product['skill'];
  intent: string[];
  /** Departments named in the query, most important first. */
  departments: string[];
  onSpecial: boolean;
  /** Human-readable summary of what we understood. */
  understood: string[];
};

/**
 * Words that name a department. The first one in a sentence is almost always
 * the thing being bought - "a lipo battery for a big electric plane" is a
 * battery search, not an aeroplane search.
 */
const DEPARTMENT_CUES: { pattern: RegExp; department: string }[] = [
  { pattern: /\b(batter(y|ies)|lipo|life|nimh|cell)\b/, department: 'Batteries' },
  { pattern: /\b(propell?ers?|props?)\b/, department: 'Propellers' },
  { pattern: /\b(servos?)\b/, department: 'Servo & Accessories' },
  { pattern: /\b(radios?|transmitters?|receivers?|tx|rx|telemetry)\b/, department: 'Radio & Equipment' },
  { pattern: /\b(motors?|brushless|outrunner)\b/, department: 'Electric Motors' },
  { pattern: /\b(turbines?|edf|ducted)\b/, department: 'Jet Kits, Turbine & EDF' },
  { pattern: /\b(jets?)\b/, department: 'Jet Kits, Turbine & EDF' },
  { pattern: /\b(helicopters?|helis?|choppers?|trex)\b/, department: 'Helicopters' },
  { pattern: /\b(drones?|multicopters?|quads?|quadcopters?|hexacopters?|fpv)\b/, department: 'Multicopters/Drones' },
  { pattern: /\b(boats?|yachts?|cars?|sails?)\b/, department: 'Cars & Boats' },
  { pattern: /\b(tools?|drills?|sanding|files?|bearings?)\b/, department: 'Tools & Bearings' },
  { pattern: /\b(glues?|adhesives?|covering|film|balsa|ply|spruce|epoxy)\b/, department: 'Building Supplies' },
  { pattern: /\b(kits?|planes?|aeroplanes?|airplanes?|aircraft|gliders?|warbirds?|trainers?|foamies)\b/, department: 'Aircraft / Glider Kits' },
];

function detectDepartments(q: string) {
  const found: { department: string; at: number }[] = [];
  for (const { pattern, department } of DEPARTMENT_CUES) {
    const m = q.match(pattern);
    if (m && m.index !== undefined) {
      const existing = found.find((f) => f.department === department);
      if (!existing || m.index < existing.at) {
        if (existing) existing.at = m.index;
        else found.push({ department, at: m.index });
      }
    }
  }
  return found.sort((a, b) => a.at - b.at).map((f) => f.department);
}

const STOP_WORDS = new Set([
  'i', 'im', 'a', 'an', 'the', 'is', 'am', 'are', 'was', 'were', 'be', 'been',
  'looking', 'look', 'for', 'want', 'wanted', 'need', 'needs', 'needed', 'find',
  'get', 'buy', 'some', 'something', 'anything', 'that', 'which', 'who', 'whom',
  'to', 'of', 'in', 'on', 'at', 'by', 'with', 'and', 'or', 'but', 'my', 'me',
  'we', 'you', 'your', 'it', 'its', 'this', 'these', 'those', 'can', 'could',
  'would', 'should', 'will', 'about', 'around', 'under', 'over', 'up', 'down',
  'price', 'range', 'budget', 'rand', 'rands', 'zar', 'r', 'please', 'plz',
  'old', 'year', 'years', 'yr', 'yrs', 'age', 'aged', 'build', 'building',
  'learn', 'learning', 'have', 'has', 'do', 'does', 'good', 'best', 'nice',
]);

/** Words that map onto catalogue vocabulary the shop actually uses. */
const SYNONYMS: Record<string, string[]> = {
  plane: ['aircraft', 'kits', 'glider'],
  planes: ['aircraft', 'kits', 'glider'],
  aeroplane: ['aircraft', 'kits'],
  airplane: ['aircraft', 'kits'],
  aircraft: ['aircraft', 'kits'],
  bulsa: ['balsa'],
  balsa: ['balsa', 'kits'],
  wood: ['balsa'],
  wooden: ['balsa'],
  chopper: ['helicopter', 'heli'],
  helicopter: ['helicopters', 'heli'],
  heli: ['helicopters', 'heli'],
  drone: ['multicopters', 'drones', 'dji'],
  drones: ['multicopters', 'drones'],
  quad: ['multicopters', 'drones'],
  quadcopter: ['multicopters', 'drones'],
  jet: ['jet', 'turbine', 'edf'],
  jets: ['jet', 'turbine', 'edf'],
  turbine: ['turbine', 'jet'],
  glider: ['glider', 'gliders'],
  sailplane: ['glider'],
  battery: ['batteries', 'lipo'],
  batteries: ['batteries', 'lipo'],
  lipo: ['lipo', 'batteries'],
  motor: ['motors', 'brushless'],
  motors: ['motors', 'brushless'],
  engine: ['motors', 'gas', 'nitro'],
  radio: ['radio', 'receiver', 'transmitter'],
  transmitter: ['radio', 'transmitter'],
  receiver: ['receiver', 'radio'],
  servo: ['servo'],
  servos: ['servo'],
  prop: ['propellers'],
  props: ['propellers'],
  propeller: ['propellers'],
  propellers: ['propellers'],
  glue: ['glues', 'adhesive'],
  tools: ['tools'],
  tool: ['tools'],
  boat: ['boats', 'cars'],
  boats: ['boats'],
  starter: ['trainer', 'beginner'],
  beginner: ['trainer', 'beginner', 'foam'],
  beginners: ['trainer', 'beginner'],
  starting: ['trainer', 'beginner'],
  first: ['trainer', 'beginner'],
  kid: ['trainer', 'beginner', 'foam'],
  kids: ['trainer', 'beginner', 'foam'],
  child: ['trainer', 'beginner'],
  son: ['trainer', 'beginner'],
  daughter: ['trainer', 'beginner'],
  teenager: ['trainer', 'beginner'],
  novice: ['trainer', 'beginner'],
  cheap: [],
  affordable: [],
  kit: ['kits', 'kit'],
  kits: ['kits', 'kit'],
};

const BEGINNER_CUES =
  /\b(beginners?|starter|starting|first|learn|learning|novice|easy|simple|kids?|child|children|son|daughter|teenager|entry|new to|never flown)\b/;

const ADVANCED_CUES =
  /\b(advanced|expert|competition|professional|experienced|aerobatics?|giant scale|turbine)\b/;

function parsePrices(q: string) {
  const out: { min?: number; max?: number } = {};
  const norm = q.replace(/,/g, '');

  const num = (s: string) => {
    const v = parseFloat(s.replace(/[^\d.]/g, ''));
    return /k\b/i.test(s) ? v * 1000 : v;
  };

  // "between R500 and R1500", "R500 - R1500"
  const between = norm.match(
    /(?:between\s*)?r?\s*(\d+(?:\.\d+)?k?)\s*(?:-|–|to|and)\s*r?\s*(\d+(?:\.\d+)?k?)/i,
  );
  if (between) {
    const a = num(between[1]);
    const b = num(between[2]);
    out.min = Math.min(a, b);
    out.max = Math.max(a, b);
    return out;
  }

  // "under R1500", "less than 1500", "up to R1500", "max 1500", "below 1500"
  const under = norm.match(
    /(?:under|below|less than|cheaper than|up to|max(?:imum)?|no more than|within)\s*r?\s*(\d+(?:\.\d+)?k?)/i,
  );
  if (under) {
    out.max = num(under[1]);
    return out;
  }

  // "over R500", "more than 500", "at least 500"
  const over = norm.match(/(?:over|above|more than|at least|from)\s*r?\s*(\d+(?:\.\d+)?k?)/i);
  if (over) {
    out.min = num(over[1]);
    return out;
  }

  // Bare amount with a currency marker or "price range": treat as a ceiling
  // with headroom, e.g. "R1500 price range" -> up to R1725.
  const bare = norm.match(/r\s*(\d+(?:\.\d+)?k?)|(\d{3,}(?:\.\d+)?k?)\s*(?:price|budget|range|rand)/i);
  if (bare) {
    const v = num(bare[1] || bare[2]);
    if (v > 0) out.max = Math.round(v * 1.15);
  }
  return out;
}

export function parseQuery(raw: string): ParsedQuery {
  const q = raw.toLowerCase().trim();
  const understood: string[] = [];

  const { min, max } = parsePrices(q);
  if (max && min) understood.push(`R${min.toLocaleString()}–R${max.toLocaleString()}`);
  else if (max) understood.push(`under R${max.toLocaleString()}`);
  else if (min) understood.push(`over R${min.toLocaleString()}`);

  // Age is a strong signal for skill level.
  const age = q.match(/(\d{1,2})\s*(?:year|yr)s?\s*old|\bage[d]?\s*(\d{1,2})/);
  let skill: Product['skill'] | undefined;
  if (age) {
    const years = parseInt(age[1] || age[2], 10);
    if (years <= 16) {
      skill = 'beginner';
      understood.push(`suitable for a ${years}-year-old`);
    }
  }
  if (!skill && BEGINNER_CUES.test(q)) {
    skill = 'beginner';
    understood.push('beginner friendly');
  }
  if (!skill && ADVANCED_CUES.test(q)) {
    skill = 'advanced';
    understood.push('for experienced flyers');
  }

  const departments = detectDepartments(q);
  if (departments.length) understood.unshift(departments[0]);

  const onSpecial = /\b(special|specials|sale|deal|deals|discount|marked down|bargain)\b/.test(q);
  if (onSpecial) understood.push('on special');

  const words = q
    .replace(/[^\w\s.]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !/^\d+$/.test(w))
    .filter((w) => !STOP_WORDS.has(w));

  const keywords = new Set<string>();
  const intent: string[] = [];
  for (const w of words) {
    const syn = SYNONYMS[w];
    if (syn) {
      syn.forEach((s) => keywords.add(s));
      if (syn.length) intent.push(w);
    } else if (w.length > 2) {
      keywords.add(w);
    }
  }
  return {
    raw,
    keywords: [...keywords],
    maxPrice: max,
    minPrice: min,
    skill,
    intent,
    departments,
    onSpecial,
    understood,
  };
}

export type ScoredProduct = { product: Product; score: number; reasons: string[] };

export function smartSearch(raw: string): {
  parsed: ParsedQuery;
  results: ScoredProduct[];
} {
  const parsed = parseQuery(raw);
  const { keywords, maxPrice, minPrice, skill, departments, onSpecial } = parsed;

  const scored: ScoredProduct[] = [];

  for (const product of products) {
    const reasons: string[] = [];
    let score = 0;

    const haystack = [
      product.name,
      product.brand,
      product.sku,
      ...product.categoryPath,
      ...(product.tags || []),
    ]
      .join(' ')
      .toLowerCase();

    // The department named first in the sentence is what's being bought.
    let deptRank = -1;
    if (departments.length) {
      deptRank = departments.indexOf(product.categoryPath[0]);
      if (deptRank === 0) {
        score += 60;
        reasons.push(`in ${product.categoryPath[0]}`);
      } else if (deptRank > 0) {
        score += 22;
      } else {
        // Not in any named department - keep it, but well behind.
        score -= 30;
      }
    }

    let hits = 0;
    for (const k of keywords) {
      if (haystack.includes(k)) {
        hits += 1;
        // Category matches say more about intent than a stray name match.
        const inCategory = product.categoryPath.join(' ').toLowerCase().includes(k);
        score += inCategory ? 12 : 6;
      }
    }
    if (keywords.length && hits === 0 && deptRank !== 0) continue;
    if (hits) reasons.push(`matches ${hits} term${hits === 1 ? '' : 's'}`);

    if (onSpecial) {
      if (!product.wasPrice) continue;
      score += 25;
    }

    // Price is a hard filter when stated, with a little tolerance either side.
    if (maxPrice !== undefined) {
      if (product.price > maxPrice * 1.05) continue;
      score += 12;
      reasons.push(`within budget at R${product.price.toLocaleString()}`);
    }
    if (minPrice !== undefined) {
      if (product.price < minPrice * 0.95) continue;
      score += 6;
    }

    if (skill) {
      if (product.skill === skill) {
        score += 18;
        reasons.push(skill === 'beginner' ? 'beginner friendly' : `suits ${skill} pilots`);
      } else if (skill === 'beginner' && product.skill === 'advanced') {
        score -= 22;
      }
    }

    if (product.inStock) score += 5;
    if (product.wasPrice) {
      score += 4;
      reasons.push(`${product.discountPct}% off`);
    }
    // Nudge closer to the top of the stated budget - people rarely want the
    // cheapest thing that technically matches.
    if (maxPrice) score += (product.price / maxPrice) * 6;

    if (score > 0) scored.push({ product, score, reasons });
  }

  scored.sort((a, b) => b.score - a.score);
  return { parsed, results: scored };
}

export const SAMPLE_QUERIES = [
  'A balsa kit a 13 year old could learn to build, around R1500',
  'Beginner foam plane under R1000',
  'LiPo battery for a big electric plane',
  'Something on special for a first-time flyer',
  'Jet turbine parts',
];
