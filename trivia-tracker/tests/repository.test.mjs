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

console.log('\n8. Staged scoring — nothing saved until saveQuestionScores — FR-M29, FR-M33');
{
  const session = freshSession();
  const before = repo.getActiveSession();
  const qBefore = before.rounds[0].categories[0].questions[0];
  assert('question starts unanswered', qBefore.status === 'unanswered');
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: '10', t2: '0', t3: '5' });
  const after = repo.getActiveSession();
  assert('team with non-zero staged value gets an audit entry', repo.getTeamTotal(after, 't1') === 10);
  assert('team staged at 0 gets NO audit entry (FR-M32)', repo.getAuditEntries(after, { teamId: 't2', questionId: 'AA01' }).length === 0);
  assert('another non-zero team also recorded correctly', repo.getTeamTotal(after, 't3') === 5);
  const qAfter = after.rounds[0].categories[0].questions[0];
  assert('question status flips to scored only after save (FR-M33)', qAfter.status === 'scored');
}

console.log('\n9. Re-saving an already-scored question — correction, not duplication');
{
  const session = freshSession();
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: '10', t2: '0', t3: '0' });
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: '8', t2: '0', t3: '0' });
  const s = repo.getActiveSession();
  assert('corrected value replaces the original in the total (10\u21928)', repo.getTeamTotal(s, 't1') === 8);
  assert('both the original and the correction remain in the audit trail', repo.getAuditEntries(s, { teamId: 't1', questionId: 'AA01' }).length === 2);
  const latest = repo.getLatestQuestionEntry(s, 'AA01', 't1');
  assert('latest entry type is "correction", not "score"', latest.type === 'correction');
}

console.log('\n10. Re-saving with an unchanged value writes nothing new');
{
  const session = freshSession();
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: '10' });
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: '10' }); // same value again
  const s = repo.getActiveSession();
  assert('no duplicate entry written for an unchanged staged value', repo.getAuditEntries(s, { teamId: 't1', questionId: 'AA01' }).length === 1);
}

console.log('\n11. First score for a team is never mislabeled as a correction');
{
  const session = freshSession();
  // Team 1 scored in one save; team 2 scored in a LATER save on the same question.
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: '10', t2: '0' });
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: '10', t2: '6' });
  const s = repo.getActiveSession();
  const t2Entry = repo.getLatestQuestionEntry(s, 'AA01', 't2');
  assert('a team\u2019s own first entry is type "score" even if the question was already touched by another team', t2Entry.type === 'score');
}

console.log('\n12. Team renaming — FR-M28');
{
  const session = freshSession();
  repo.renameTeam('t1', 'The Reigning Champs');
  const s = repo.getActiveSession();
  assert('team name updates', s.teams.find((t) => t.id === 't1').name === 'The Reigning Champs');
  repo.endSession();
  const renameAfterEnd = repo.renameTeam('t2', 'Too Late');
  assert('renaming is blocked once the session has ended', renameAfterEnd === null);
}


console.log('\n13. Category-derived question ID prefixes — FR-M34/35/37');
{
  const idMod = await import('../src/lib/id.js');
  assert('one-word name uses first 2 characters', idMod.deriveCategoryPrefix('Movies', []) === 'MO');
  assert('two-word name uses initials', idMod.deriveCategoryPrefix('Pop Culture', []) === 'PC');
  assert('3+ word name uses first two words only', idMod.deriveCategoryPrefix('Pop Culture Trivia', []) === 'PC');
  assert('hyphen counts as a word break', idMod.deriveCategoryPrefix('Sci-Fi', []) === 'SF');
  assert('empty name uses XX placeholder', idMod.deriveCategoryPrefix('', []) === 'XX');
  assert('result is always uppercase', idMod.deriveCategoryPrefix('sports', []) === 'SP');
  assert('collision falls back to next letter pair within the same word', idMod.deriveCategoryPrefix('Sports', ['SP']) === 'SO');
  assert('second collision tries the next letter pair again', idMod.deriveCategoryPrefix('Sports', ['SP', 'SO']) === 'SR');
  assert('two-word collision with no alternative falls to global AA scan', idMod.deriveCategoryPrefix('Pop Culture', ['PC']) === 'AA');
  assert('multiple empty-name categories resolve via global fallback in order', idMod.deriveCategoryPrefix('', ['XX']) === 'AA');
  assert('global fallback skips already-used letters too', idMod.deriveCategoryPrefix('', ['XX', 'AA']) === 'AB');
}

console.log('\n14. Zero-correction — FR-M50 (the bug fix)');
{
  const session = freshSession();
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: '10' });
  const before = repo.getActiveSession();
  assert('team starts with the score they were given', repo.getTeamTotal(before, 't1') === 10);

  // The exact bug: correcting an already-scored team DOWN to zero.
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: '0' });
  const after = repo.getActiveSession();
  assert('correcting to zero actually writes a correction entry now', repo.getAuditEntries(after, { teamId: 't1', questionId: 'AA01' }).length === 2);
  const latest = repo.getLatestQuestionEntry(after, 'AA01', 't1');
  assert('the zero-correction is the latest entry', latest.pointValue === 0 && latest.type === 'correction');
  assert('the team\u2019s total actually reflects the correction to zero', repo.getTeamTotal(after, 't1') === 0);
}

console.log('\n15. Zero stays a no-op for a team with no prior record — FR-M32 unaffected by the FR-M50 fix');
{
  const session = freshSession();
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: '0', t2: '5' }); // t1 never had a score, stays at 0 staged
  const s = repo.getActiveSession();
  assert('team with no prior record and 0 staged still gets no audit entry', repo.getAuditEntries(s, { teamId: 't1', questionId: 'AA01' }).length === 0);
  assert('a different team\u2019s real score is unaffected', repo.getTeamTotal(s, 't2') === 5);
}

console.log('\n16. Re-zeroing an already-zero team writes nothing new');
{
  const session = freshSession();
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: '10' });
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: '0' }); // corrects to 0
  repo.saveQuestionScores('AA01', 'r1', 'c1', { t1: '0' }); // already 0 — should be a no-op
  const s = repo.getActiveSession();
  assert('no duplicate zero-correction entries written', repo.getAuditEntries(s, { teamId: 't1', questionId: 'AA01' }).length === 2);
}

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail > 0 ? 1 : 0);
