// Standalone test harness for the data-layer logic (src/lib/repository.js),
// run directly with Node — no browser needed, since this exercises pure
// logic against a mocked localStorage. This is the part of the app that
// can be verified without a real browser in this environment.

const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
};

const repo = await import('../src/lib/repository.js');
const ids = await import('../src/lib/id.js');

let pass = 0, fail = 0;
function assert(desc, cond) {
  if (cond) { pass++; console.log(`  PASS  ${desc}`); }
  else { fail++; console.log(`  FAIL  ${desc}`); }
}

function freshSession() {
  Object.keys(store).forEach((k) => delete store[k]);
  return repo.createSession({
    rounds: [{
      id: 'r1', name: 'Round 1', isTieBreaker: false,
      categories: [{
        id: 'c1', name: 'Cat A',
        questions: [
          { id: 'AA01', order: 0, defaultPointValue: 2, status: 'unanswered' },
          { id: 'AA02', order: 1, defaultPointValue: 2, status: 'unanswered' },
        ],
      }],
    }],
    teams: [{ id: 't1', name: 'Team A' }, { id: 't2', name: 'Team B' }, { id: 't3', name: 'Team C' }],
  });
}

console.log('\n1. Basic scoring — FR-M01, FR-M02, FR-M03');
{
  const session = freshSession();
  repo.appendAuditEntry({ teamId: 't1', questionId: 'AA01', roundId: 'r1', categoryId: 'c1', pointValue: 10, type: 'score' });
  const s = repo.getActiveSession();
  assert('team total reflects the score just entered', repo.getTeamTotal(s, 't1') === 10);
  assert('other teams remain at zero', repo.getTeamTotal(s, 't2') === 0);
}

console.log('\n2. Correction supersedes original — FR-M11, UX-M08, UX-M16');
{
  const session = freshSession();
  repo.appendAuditEntry({ teamId: 't1', questionId: 'AA01', roundId: 'r1', categoryId: 'c1', pointValue: 10, type: 'score' });
  repo.appendAuditEntry({ teamId: 't1', questionId: 'AA01', roundId: 'r1', categoryId: 'c1', pointValue: 8, type: 'correction' });
  const s = repo.getActiveSession();
  assert('total reflects the CORRECTED value, not the sum of both entries', repo.getTeamTotal(s, 't1') === 8);
  const latest = repo.getLatestQuestionEntry(s, 'AA01', 't1');
  assert('getLatestQuestionEntry returns the correction, not the original', latest.pointValue === 8);
  const trail = repo.getAuditEntries(s, { questionId: 'AA01', teamId: 't1' });
  assert('audit trail still keeps BOTH entries for history (FR-M12)', trail.length === 2);
}

console.log('\n3. Deduction floors at zero — FR-M13, FR-M22');
{
  const session = freshSession();
  repo.appendAuditEntry({ teamId: 't1', questionId: 'AA01', roundId: 'r1', categoryId: 'c1', pointValue: 5, type: 'score' });
  repo.appendAuditEntry({ teamId: 't1', questionId: null, roundId: null, categoryId: null, pointValue: -20, type: 'deduction' });
  const s = repo.getActiveSession();
  assert('total never goes below zero even after a large deduction', repo.getTeamTotal(s, 't1') === 0);
}

console.log('\n4. Multiple deductions accumulate independently of scoring — FR-M13');
{
  const session = freshSession();
  repo.appendAuditEntry({ teamId: 't1', questionId: 'AA01', roundId: 'r1', categoryId: 'c1', pointValue: 10, type: 'score' });
  repo.appendAuditEntry({ teamId: 't1', questionId: null, roundId: null, categoryId: null, pointValue: -3, type: 'deduction' });
  repo.appendAuditEntry({ teamId: 't1', questionId: null, roundId: null, categoryId: null, pointValue: -2, type: 'deduction' });
  const s = repo.getActiveSession();
  assert('deductions stack additively (10 - 3 - 2 = 5)', repo.getTeamTotal(s, 't1') === 5);
}

console.log('\n5. Unanswered question contributes zero, no error — FR-M18, UX-M14');
{
  const session = freshSession();
  const s = repo.getActiveSession();
  assert('leaderboard computes cleanly with zero entries', repo.getTeamTotal(s, 't1') === 0);
  const board = repo.getLeaderboard(s);
  assert('getLeaderboard does not throw and returns all teams', board.length === 3);
}

console.log('\n6. Audit trail filtering — FR-M12, NFR-S03');
{
  const session = freshSession();
  repo.appendAuditEntry({ teamId: 't1', questionId: 'AA01', roundId: 'r1', categoryId: 'c1', pointValue: 4, type: 'score' });
  repo.appendAuditEntry({ teamId: 't2', questionId: 'AA02', roundId: 'r1', categoryId: 'c1', pointValue: 6, type: 'score' });
  const s = repo.getActiveSession();
  assert('filter by teamId returns only that team\'s entries', repo.getAuditEntries(s, { teamId: 't1' }).length === 1);
  assert('filter by questionId returns only that question\'s entries', repo.getAuditEntries(s, { questionId: 'AA02' }).length === 1);
  assert('filter by roundId returns entries from that round', repo.getAuditEntries(s, { roundId: 'r1' }).length === 2);
}

console.log('\n7. Editor lock on ended session — FR-M14');
{
  const session = freshSession();
  repo.endSession();
  const result = repo.appendAuditEntry({ teamId: 't1', questionId: 'AA01', roundId: 'r1', categoryId: 'c1', pointValue: 5, type: 'score' });
  assert('appendAuditEntry refuses writes after the session has ended', result === null);
}


console.log('\n8. Staged save writes nothing until Save — FR-M29, FR-M33');
{
  freshSession();
  const s0 = repo.getActiveSession();
  assert('question starts unanswered', s0.rounds[0].categories[0].questions[0].status === 'unanswered');
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: 2, t2: 0, t3: 1 });
  const s = repo.getActiveSession();
  assert('save marks the question scored', s.rounds[0].categories[0].questions[0].status === 'scored');
  assert('scores written for non-zero teams', repo.getTeamTotal(s, 't1') === 2 && repo.getTeamTotal(s, 't3') === 1);
  assert('staged 0 with no record writes no entry (FR-M32)', repo.getAuditEntries(s, { teamId: 't2' }).length === 0);
}

console.log('\n9. Correction type decided per team, not per question');
{
  freshSession();
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: 2 });
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: 2, t2: 1 });
  const s = repo.getActiveSession();
  const t2 = repo.getLatestQuestionEntry(s, 'AA01', 't2');
  assert('first score for t2 is a score, not a correction', t2.type === 'score');
  assert('unchanged t1 value writes no duplicate entry', repo.getAuditEntries(s, { teamId: 't1' }).length === 1);
}

console.log('\n10. Zero correction — FR-M50');
{
  freshSession();
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: 2 });
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: 0 });
  const s = repo.getActiveSession();
  const latest = repo.getLatestQuestionEntry(s, 'AA01', 't1');
  assert('zeroing a scored team writes a 0 correction', latest.pointValue === 0 && latest.type === 'correction');
  assert('team total reflects the zero correction', repo.getTeamTotal(s, 't1') === 0);
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: 0 });
  assert('re-zeroing writes nothing new', repo.getAuditEntries(repo.getActiveSession(), { teamId: 't1' }).length === 2);
}

console.log('\n11. All-teams bulk save — FR-M51');
{
  freshSession();
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: 2, t2: 2, t3: 2 });
  const s = repo.getActiveSession();
  assert('every team gets the default from one save', ['t1', 't2', 't3'].every((t) => repo.getTeamTotal(s, t) === 2));
}

console.log('\n12. Rename team mid-session — FR-M28');
{
  freshSession();
  repo.renameTeam('t1', '  Baybay boys ');
  const s = repo.getActiveSession();
  assert('team name updated and trimmed', s.teams[0].name === 'Baybay boys');
  assert('blank name rejected', repo.renameTeam('t1', '   ') === null);
}

console.log('\n13. Join code lookup — FR-M39');
{
  const session = freshSession();
  assert('own join code resolves', !!repo.findSessionByJoinCode(session.joinCode.toLowerCase()));
  assert('other code does not', repo.findSessionByJoinCode('ZZZZZZ') === null);
}

console.log('\n14. Category-derived prefixes — FR-M34, FR-M35, FR-M37');
{
  assert('one word → first two letters', ids.derivePrefix('Science') === 'SC');
  assert('two words → initials', ids.derivePrefix('Current Events') === 'CE');
  assert('three+ words → first two initials', ids.derivePrefix('Famous Movie Lines') === 'FM');
  assert('hyphen is a word break', ids.derivePrefix('Tie-breaker') === 'TB');
  assert('blank name → XX placeholder', ids.derivePrefix('') === 'XX');
  const taken = new Set(['MO']);
  assert('one-word collision tries first letter + later letters', ids.resolvePrefix('Movies', taken) === 'MV');
  const taken2 = new Set(['PC']);
  assert('multi-word collision tries other word pairs', ids.resolvePrefix('Pop Culture Quiz', taken2) === 'PQ');
  const rounds = ids.assignPrefixes([
    { id: 'r1', categories: [
      { id: 'a', name: 'Math', questions: [{}, {}] },
      { id: 'b', name: 'Maps', questions: [{}] },
      { id: 'c', name: '', questions: [{}] },
      { id: 'd', name: '', questions: [{}] },
    ] },
  ]);
  const cats = rounds[0].categories;
  assert('IDs numbered from 01 per category', cats[0].questions[1].id === 'MA02');
  assert('collision gets a name-derived alternative', cats[1].prefix === 'MP');
  assert('first unnamed category uses XX', cats[2].prefix === 'XX');
  assert('second unnamed category still gets a unique prefix', cats[3].prefix !== 'XX' && cats[3].prefix.length === 2);
}

console.log('\n15. Default structure prefixes are all distinct — UX-M23');
{
  const names = ['Current Events', 'Science', 'Geography', 'Pop Culture', 'Math', 'History', 'Famous Movie Lines', 'Name that Song'];
  const rounds = ids.assignPrefixes([{ id: 'r', categories: names.map((n) => ({ name: n, questions: [{}] })) }]);
  const got = rounds[0].categories.map((c) => c.prefix).join(',');
  assert('CE,SC,GE,PC,MA,HI,FM,NT', got === 'CE,SC,GE,PC,MA,HI,FM,NT');
}

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail > 0 ? 1 : 0);
