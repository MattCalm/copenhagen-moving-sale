const titleWordMap = new Map<string, string>([
  ["椅子", "chair"],
  ["椅", "chair"],
  ["桌子", "table"],
  ["桌", "table"],
  ["沙发", "sofa"],
  ["灯", "lamp"],
  ["台灯", "lamp"],
  ["书架", "bookshelf"],
  ["床", "bed"],
  ["柜子", "cabinet"],
  ["柜", "cabinet"],
  ["镜子", "mirror"],
  ["镜", "mirror"],
  ["地毯", "rug"],
  ["餐具", "tableware"],
  ["杯子", "cup"],
  ["杯", "cup"]
]);

function shortId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }

  return Math.random().toString(36).slice(2, 10);
}

function translateKnownTitleWords(value: string) {
  let translated = value;

  for (const [source, replacement] of titleWordMap) {
    translated = translated.replaceAll(source, ` ${replacement} `);
  }

  return translated;
}

export function createSlugBase(value: string, fallbackPrefix = "item") {
  const translated = translateKnownTitleWords(value);
  const slug = translated
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-{2,}/g, "-");

  return slug || `${fallbackPrefix}-${shortId()}`;
}

export function chooseUniqueSlug(preferredSlug: string, existingSlugs: string[]) {
  const base = createSlugBase(preferredSlug);
  const used = new Set(existingSlugs);

  if (!used.has(base)) {
    return base;
  }

  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
}

