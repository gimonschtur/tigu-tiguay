// SessionRepository — local-storage backed implementation.
//
// NOTE: This implements the repository interface described in the high-level
// design doc (trivia-tracker-high-level-design.md, section 4), but backs it
// with localStorage instead of a free-tier cloud database. That means this
// build works fully as a single-device app (matches Option A from the design
// options doc). To get real multi-device sync (Option C), swap the internals
// of this file for calls to Firebase/Supabase while keeping the same
// function signatures — nothing else in the app needs to change.

const SESSION_KEY = 'trivia_active_session';
const PAST_SESSIONS_KEY = 'trivia_past_sessions';
const EDITOR_TOKEN_KEY = 'trivia_editor_token';

import { makeId, makeJoinCode } from './id.js';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function createSession({ rounds, teams }) {
  const joinCode = makeJoinCode();
  const session = {
    id: makeId('session'),
    joinCode,
    status: 'active',
    createdAt: Date.now(),
    endedAt: null,
    editorDeviceToken: makeId('editor'),
    rounds,
    teams,
    auditEntries: [],
  };
  save(SESSION_KEY, session);
  save(EDITOR_TOKEN_KEY, session.editorDeviceToken);
  return session;
}

export function getActiveSession() {
  return load(SESSION_KEY, null);
}

export function isReturningEditor() {
  const session = getActiveSession();
  const token = load(EDITOR_TOKEN_KEY, null);
  return !!(session && session.status === 'active' && token && session.editorDeviceToken === token);
}

export function appendAuditEntry(entry) {
  const session = getActiveSession();
  if (!session || session.status !== 'active') return null;
  const fullEntry = {
    id: makeId('audit'),
    timestamp: Date.now(),
    ...entry,
  };
  session.auditEntries.push(fullEntry);
  // mark question scored
  if (entry.questionId) {
    for (const round of session.rounds) {
      for (const category of round.categories) {
        const q = category.questions.find((q) => q.id === entry.questionId);
        if (q) q.status = 'scored';
      }
    }
  }
  save(SESSION_KEY, session);
  return fullEntry;
}

export function endSession() {
  const session = getActiveSession();
  if (!session) return null;
  session.status = 'ended';
  session.endedAt = Date.now();
  save(SESSION_KEY, session);
  const past = load(PAST_SESSIONS_KEY, []);
  past.unshift(session);
  save(PAST_SESSIONS_KEY, past);
  localStorage.removeItem(EDITOR_TOKEN_KEY);
  return session;
}

export function clearActiveSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(EDITOR_TOKEN_KEY);
}

export function getPastSessions() {
  return load(PAST_SESSIONS_KEY, []);
}

// --- Derived totals (see design doc §3.1: computed from AuditEntry, not stored) ---

export function getTeamTotal(session, teamId, { roundId, categoryId } = {}) {
  const entries = session.auditEntries.filter((e) => e.teamId === teamId
    && (!roundId || e.roundId === roundId)
    && (!categoryId || e.categoryId === categoryId));

  // Score/correction entries are tied to a question — only the most recent
  // entry per question counts toward the total (a correction supersedes the
  // original, it does not add on top of it). Deductions have no questionId
  // and always count individually/cumulatively.
  const latestByQuestion = new Map();
  let deductionSum = 0;
  for (const e of entries) {
    if (e.questionId) {
      const existing = latestByQuestion.get(e.questionId);
      // >= (not >) so that on a timestamp tie, the later-inserted entry wins —
      // ties are realistic since Date.now() has only millisecond resolution.
      if (!existing || e.timestamp >= existing.timestamp) latestByQuestion.set(e.questionId, e);
    } else {
      deductionSum += e.pointValue;
    }
  }
  const scoreSum = [...latestByQuestion.values()].reduce((sum, e) => sum + e.pointValue, 0);
  return Math.max(0, scoreSum + deductionSum); // FR-M22: floor at zero
}

export function getLeaderboard(session) {
  return session.teams
    .map((team) => ({ ...team, total: getTeamTotal(session, team.id) }))
    .sort((a, b) => b.total - a.total);
}

// Same shape as getLeaderboard, but preserves team-number/creation order —
// used anywhere teams are displayed but not ranked (the persistent pane,
// the live scoring rows), so a team's position never shifts as scores change.
export function getTeamsInOrder(session) {
  return session.teams.map((team) => ({ ...team, total: getTeamTotal(session, team.id) }));
}

export function getAuditEntries(session, filters = {}) {
  return session.auditEntries
    .filter((e) => (!filters.roundId || e.roundId === filters.roundId)
      && (!filters.categoryId || e.categoryId === filters.categoryId)
      && (!filters.questionId || e.questionId === filters.questionId)
      && (!filters.teamId || e.teamId === filters.teamId))
    .sort((a, b) => b.timestamp - a.timestamp);
}

// Returns the most recent entry for a given team on a given question, or
// undefined if none exists. A plain .find() would return the FIRST match,
// which is wrong once a correction entry exists alongside the original.
export function getLatestQuestionEntry(session, questionId, teamId) {
  const matches = session.auditEntries.filter((e) => e.questionId === questionId && e.teamId === teamId);
  if (matches.length === 0) return undefined;
  // >= so a timestamp tie favors the later-inserted entry (array order),
  // not whichever one reduce() happened to see first.
  return matches.reduce((latest, e) => (e.timestamp >= latest.timestamp ? e : latest));
}

export function getAllQuestionsFlat(session) {
  const list = [];
  for (const round of session.rounds) {
    for (const category of round.categories) {
      for (const question of category.questions) {
        list.push({ ...question, roundId: round.id, roundName: round.name, categoryId: category.id, categoryName: category.name });
      }
    }
  }
  return list;
}
