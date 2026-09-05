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

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail > 0 ? 1 : 0);
