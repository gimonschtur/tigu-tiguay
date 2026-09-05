export function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

export function makeJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// FR-M08: question IDs are two uppercase letters + two digits. The first
// letter identifies the round, the second identifies the category within
// that round (both by creation position) — so every question ID reveals
// its category at a glance. The two digits number questions within that
// specific category, starting at 01, independent of any other category.
export function letterAt(index) {
  return String.fromCharCode(65 + (index % 26));
}

export function categoryPrefix(roundIndex, categoryIndexInRound) {
  return `${letterAt(roundIndex)}${letterAt(categoryIndexInRound)}`;
}

export function makeCategoryQuestionId(prefix, indexInCategory) {
  return `${prefix}${String(indexInCategory + 1).padStart(2, '0')}`;
}
