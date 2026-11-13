export function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

export function makeJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// FR-M08: question IDs are two uppercase letters + two digits. The letters
// come from the category's name (FR-M34), the digits number questions
// within that category starting at 01.
export const PLACEHOLDER_PREFIX = 'XX'; // FR-M35

function words(name) {
  return (name || '')
    .split(/[\s-]+/) // FR-M34: hyphens count as word breaks
    .map((w) => w.replace(/[^A-Za-z0-9]/g, ''))
    .filter(Boolean);
}

// FR-M34: one word → its first two characters; two or more words → the
// first letter of each of the first two words. Always uppercase.
export function derivePrefix(name) {
  const w = words(name);
  if (w.length === 0) return PLACEHOLDER_PREFIX;
  if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
  return (w[0][0] + w[1][0]).toUpperCase();
}

// FR-M37: alternatives tried, in order, when the derived prefix is taken.
function alternativePrefixes(name) {
  const w = words(name);
  const out = [];
  if (w.length === 1) {
    const word = w[0].toUpperCase();
    for (let i = 1; i < word.length; i++) out.push(word[0] + word[i]);
  } else {
    for (let i = 0; i < w.length; i++) {
      for (let j = i + 1; j < w.length; j++) out.push((w[i][0] + w[j][0]).toUpperCase());
    }
  }
  return out;
}

function alphabeticalFallback(taken) {
  for (let a = 0; a < 26; a++) {
    for (let b = 0; b < 26; b++) {
      const p = String.fromCharCode(65 + a) + String.fromCharCode(65 + b);
      if (!taken.has(p)) return p;
    }
  }
  return PLACEHOLDER_PREFIX;
}

// Resolves one category's prefix against prefixes already claimed by
// earlier categories in the session (FR-M34, FR-M35, FR-M37).
export function resolvePrefix(name, taken) {
  const first = derivePrefix(name);
  if (first.length === 2 && !taken.has(first)) return first;
  if (first === PLACEHOLDER_PREFIX && words(name).length === 0) return alphabeticalFallback(taken);
  for (const alt of alternativePrefixes(name)) {
    if (alt.length === 2 && !taken.has(alt)) return alt;
  }
  return alphabeticalFallback(taken);
}

export function makeCategoryQuestionId(prefix, indexInCategory) {
  return `${prefix}${String(indexInCategory + 1).padStart(2, '0')}`;
}

// Walks every category in session order, assigns each a unique prefix and
// regenerates its question IDs from it (FR-M36). Earlier categories keep
// priority on a shared prefix, so renaming a later category never steals
// an earlier one's letters.
export function assignPrefixes(rounds) {
  const taken = new Set();
  return rounds.map((r) => ({
    ...r,
    categories: r.categories.map((c) => {
      const prefix = resolvePrefix(c.name, taken);
      taken.add(prefix);
      return {
        ...c,
        prefix,
        questions: c.questions.map((q, i) => ({ ...q, id: makeCategoryQuestionId(prefix, i), order: i })),
      };
    }),
  }));
}
