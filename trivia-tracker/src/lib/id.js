export function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

export function makeJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function makeCategoryQuestionId(prefix, indexInCategory) {
  return `${prefix}${String(indexInCategory + 1).padStart(2, '0')}`;
}

// FR-M34: split on whitespace AND hyphens (hyphens count as word breaks).
function splitWords(name) {
  return (name || '').trim().split(/[\s-]+/).filter(Boolean);
}

// FR-M34: the "primary" (first-choice) prefix for a category name.
function primaryPrefix(name) {
  const words = splitWords(name);
  if (words.length === 0) return 'XX'; // FR-M35 placeholder
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase().padEnd(2, 'X');
  return (words[0][0] + words[1][0]).toUpperCase(); // first two words only, even if 3+
}

// FR-M37(a)/(b): alternative prefixes drawn from the name itself, in reading
// order, tried before ever falling back to an arbitrary unused prefix.
function alternativePrefixes(name) {
  const words = splitWords(name);
  const alts = [];
  if (words.length === 1) {
    const w = words[0].toUpperCase();
    for (let i = 2; i < w.length; i++) alts.push(w[0] + w[i]);
  } else if (words.length >= 2) {
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        if (i === 0 && j === 1) continue; // that's the primary, already tried
        alts.push((words[i][0] + words[j][0]).toUpperCase());
      }
    }
  }
  return alts;
}

// FR-M37(c): first unused prefix, AA through ZZ, in alphabetical order.
function fallbackPrefix(usedSet) {
  for (let a = 0; a < 26; a++) {
    for (let b = 0; b < 26; b++) {
      const p = String.fromCharCode(65 + a) + String.fromCharCode(65 + b);
      if (!usedSet.has(p)) return p;
    }
  }
  return 'ZZ';
}

// FR-M34/35/37: derive a category's two-letter question-ID prefix from its
// name, resolving collisions against every OTHER category's current prefix
// in the session, in the documented priority order.
export function deriveCategoryPrefix(name, otherPrefixes) {
  const used = new Set(otherPrefixes);
  const primary = primaryPrefix(name);
  if (!used.has(primary)) return primary;
  for (const alt of alternativePrefixes(name)) {
    if (!used.has(alt)) return alt;
  }
  return fallbackPrefix(used);
}
