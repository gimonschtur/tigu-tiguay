import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActiveSession, appendAuditEntry, getTeamTotal, getLatestQuestionEntry, getAllQuestionsFlat } from '../lib/repository';
import PersistentPane from '../components/PersistentPane';
import TopBar from '../components/TopBar';

function findQuestionContext(session, questionId) {
  for (const round of session.rounds) {
    for (const category of round.categories) {
      const question = category.questions.find((q) => q.id === questionId);
      if (question) return { round, category, question };
    }
  }
  return null;
}

export default function LiveScoring() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(getActiveSession());
  const [manualValues, setManualValues] = useState({});
  const [errors, setErrors] = useState({});
  const [pendingOverwrite, setPendingOverwrite] = useState(null);

  if (!session) { navigate('/'); return null; }

  const ctx = findQuestionContext(session, questionId);
  if (!ctx) { navigate('/home'); return null; }
  const { round, category, question } = ctx;

  // Captured once, at the moment this screen was opened for this question —
  // does NOT change as entries are added during this visit. Distinguishes
  // "revisiting an already-answered question via Navigate" (UX-M08) from
  // "progressing live through a fresh question", independent of per-team
  // scoring state (which is tracked separately, per team, below).
  const [wasAlreadyScored] = useState(() => session.auditEntries.some((e) => e.questionId === questionId));

  // Fixed creation order, not sorted by score — a live-scoring row must never
  // change position mid-question, or a fast second tap can land on a
  // different team after the first tap's score reorders a sorted list.
  const teams = session.teams.map((t) => ({ ...t, total: getTeamTotal(session, t.id) }));
  const allQuestions = useMemo(() => getAllQuestionsFlat(session), [session]);
  const scoredCount = teams.filter((t) => getLatestQuestionEntry(session, question.id, t.id)).length;

  function validate(value) {
    const n = Number(value);
    return Number.isInteger(n) && n >= 1 && n <= 100;
  }

  function commitScore(teamId, pointValue) {
    // Per-team, not per-question: a team's FIRST entry on this question is
    // always a 'score', even if another team was already scored here.
    const hadExisting = !!getLatestQuestionEntry(session, question.id, teamId);
    appendAuditEntry({
      teamId, questionId: question.id, roundId: round.id, categoryId: category.id,
      pointValue, type: hadExisting ? 'correction' : 'score',
    });
    const updated = getActiveSession();
    setSession(updated);

    // UX-M15: auto-advance once every team has a score for this question —
    // but only when progressing live, not when revisiting a past question
    // (jumping forward again after a deliberate correction would be surprising).
    const nowScored = teams.every((t) => t.id === teamId || getLatestQuestionEntry(updated, question.id, t.id));
    if (nowScored && !wasAlreadyScored) goToNext();
  }

  function goToNext() {
    const idx = allQuestions.findIndex((q) => q.id === question.id);
    const next = allQuestions[idx + 1];
    navigate(next ? `/score/${next.id}` : '/home');
  }

  function handleDefaultTap(teamId) {
    const hasExisting = !!getLatestQuestionEntry(session, question.id, teamId);
    if (hasExisting) { setPendingOverwrite({ teamId, pointValue: question.defaultPointValue }); return; }
    commitScore(teamId, question.defaultPointValue);
  }

  function handleManualSubmit(teamId) {
    const value = manualValues[teamId];
    if (!validate(value)) { setErrors({ ...errors, [teamId]: 'Enter a whole number from 1 to 100' }); return; }
    setErrors({ ...errors, [teamId]: null });
    const hasExisting = !!getLatestQuestionEntry(session, question.id, teamId);
    if (hasExisting) { setPendingOverwrite({ teamId, pointValue: Number(value) }); return; }
    commitScore(teamId, Number(value));
  }

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col">
      <TopBar label={`${round.name} · ${category.name}`} />

      <div className="p-4 flex flex-col gap-3.5">
        <div className={`bg-card rounded-xl p-4 flex items-center justify-between border ${wasAlreadyScored ? 'border-gold' : 'border-espresso/10'}`}>
          <div>
            <p className={`text-xs font-semibold tracking-wide mb-1 ${wasAlreadyScored ? 'text-gold' : 'text-muted'}`}>
              {wasAlreadyScored ? 'EDITING SCORED QUESTION' : 'QUESTION'}
            </p>
            <p className="font-body text-2xl font-extrabold">{question.id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Default</p>
            <p className="text-lg font-extrabold text-teal">{question.defaultPointValue} pts</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {teams.map((team) => {
            const existing = getLatestQuestionEntry(session, question.id, team.id);
            const hasError = !!errors[team.id];
            // Revisiting an already-answered question (UX-M08) shows every
            // row pre-filled and editable, matching the mockup's edit
            // screen — not collapsed to a static "Scored" badge, which is
            // reserved for the live first-time-through flow.
            const showEditableRow = !existing || wasAlreadyScored;
            const displayValue = manualValues[team.id] !== undefined ? manualValues[team.id] : (existing ? String(existing.pointValue) : '');

            return (
              <div
                key={team.id}
                className={`bg-card rounded-xl p-3 flex flex-col gap-2 border ${
                  hasError ? 'border-coral' : existing ? 'border-teal' : 'border-espresso/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex-1 text-sm font-semibold">{team.name}</span>
                  {showEditableRow ? (
                    <>
                      <button
                        onClick={() => handleDefaultTap(team.id)}
                        className="bg-teal text-cream text-sm font-extrabold px-3.5 py-2.5 rounded-lg min-w-[68px]"
                      >
                        +{question.defaultPointValue}
                      </button>
                      <input
                        type="number"
                        placeholder="pts"
                        value={displayValue}
                        onChange={(e) => setManualValues({ ...manualValues, [team.id]: e.target.value })}
                        onBlur={() => {
                          const v = manualValues[team.id];
                          if (v === undefined || v === '') return;
                          if (existing && Number(v) === existing.pointValue) return; // unchanged, no-op
                          handleManualSubmit(team.id);
                        }}
                        className={`w-16 border rounded-lg px-1.5 py-2.5 text-center text-sm font-semibold bg-cream ${hasError ? 'border-coral text-coral' : 'border-espresso/25'}`}
                      />
                    </>
                  ) : (
                    <>
                      <div className="bg-teal/10 text-teal rounded-lg px-3.5 py-2.5 min-w-[68px] text-center text-sm font-extrabold">
                        {existing.pointValue >= 0 ? '+' : ''}{existing.pointValue}
                      </div>
                      <span className="w-16 text-center text-xs font-semibold text-teal">Scored</span>
                    </>
                  )}
                </div>
                {hasError && <p className="text-coral text-xs font-medium">{errors[team.id]}</p>}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2.5 mt-2">
          <p className="text-xs text-muted text-center">
            {scoredCount < teams.length
              ? `${scoredCount} of ${teams.length} teams scored`
              : 'Advances automatically when all teams are scored'}
          </p>
          <button onClick={goToNext} className="bg-teal text-cream font-semibold py-3.5 rounded-xl">
            Save and next question
          </button>
        </div>
      </div>

      <PersistentPane session={session} teams={teams} currentQuestionId={question.id} />

      {pendingOverwrite && (
        <div className="fixed inset-0 bg-espresso/55 flex items-end z-40">
          <div className="bg-card w-full rounded-t-2xl px-5 pt-6 pb-8 flex flex-col gap-4">
            <p className="font-display text-2xl">Overwrite score?</p>
            <p className="text-sm leading-relaxed">
              {teams.find((t) => t.id === pendingOverwrite.teamId)?.name} on {question.id} changes to{' '}
              <strong>{pendingOverwrite.pointValue}</strong>. The change is logged in the audit trail.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPendingOverwrite(null)} className="flex-1 border border-espresso/30 rounded-lg py-3.5 text-sm font-semibold">
                Cancel
              </button>
              <button
                onClick={() => { commitScore(pendingOverwrite.teamId, pendingOverwrite.pointValue); setPendingOverwrite(null); }}
                className="flex-1 bg-coral text-cream rounded-lg py-3.5 text-sm font-semibold"
              >
                Overwrite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
