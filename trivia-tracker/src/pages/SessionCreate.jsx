import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Wand2, ChevronDown, ChevronRight } from 'lucide-react';
import { createSession } from '../lib/repository';
import { makeId, letterAt, categoryPrefix, makeCategoryQuestionId } from '../lib/id';

function buildQuestions(count, defaultPoints, prefix) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push({ id: makeCategoryQuestionId(prefix, i), order: i, defaultPointValue: Number(defaultPoints) || 1, status: 'unanswered' });
  }
  return questions;
}

function buildDefaultRounds(defaultPoints) {
  const rounds = [];
  for (let r = 0; r < 2; r++) {
    const categories = [];
    for (let c = 0; c < 2; c++) {
      const prefix = categoryPrefix(r, c);
      const questions = buildQuestions(5, defaultPoints, prefix);
      categories.push({ id: makeId('cat'), name: '', questionCount: 5, commonDefault: defaultPoints, prefix, questions });
    }
    rounds.push({ id: makeId('round'), name: `Round ${r + 1}`, isTieBreaker: false, categories });
  }
  return rounds;
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-[46px] h-[27px] rounded-full flex items-center p-[3px] shrink-0 ${checked ? 'bg-teal justify-end' : 'bg-espresso/20 justify-start'}`}
      aria-pressed={checked}
    >
      <span className="w-[21px] h-[21px] rounded-full bg-card" />
    </button>
  );
}

const STEPS = ['Basics', 'Rounds', 'Teams'];

export default function SessionCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [defaultPoints, setDefaultPoints] = useState(2);
  const [teams, setTeams] = useState(['Team 1', 'Team 2', 'Team 3']);
  const [rounds, setRounds] = useState(() => buildDefaultRounds(2));
  const [tieBreaker, setTieBreaker] = useState({ enabled: false, questionCount: 3 });
  const [expandedCatId, setExpandedCatId] = useState(null);

  function addRound() {
    setRounds([...rounds, { id: makeId('round'), name: `Round ${rounds.length + 1}`, isTieBreaker: false, categories: [] }]);
  }

  function updateRoundName(roundId, name) {
    setRounds(rounds.map((r) => (r.id === roundId ? { ...r, name } : r)));
  }

  function removeRound(roundId) {
    setRounds(rounds.filter((r) => r.id !== roundId));
  }

  function addCategory(roundId) {
    const roundIndex = rounds.findIndex((r) => r.id === roundId);
    if (roundIndex === -1) return;
    const categoryIndex = rounds[roundIndex].categories.length;
    const prefix = categoryPrefix(roundIndex, categoryIndex);
    const questions = buildQuestions(5, defaultPoints, prefix);
    const newCat = { id: makeId('cat'), name: '', questionCount: 5, commonDefault: defaultPoints, prefix, questions };
    setRounds(rounds.map((r, i) => (i !== roundIndex ? r : { ...r, categories: [...r.categories, newCat] })));
    setExpandedCatId(newCat.id);
  }

  function updateCategoryField(roundId, catId, field, value) {
    setRounds(rounds.map((r) => {
      if (r.id !== roundId) return r;
      return { ...r, categories: r.categories.map((c) => (c.id === catId ? { ...c, [field]: value } : c)) };
    }));
  }

  function resizeQuestions(roundId, catId, count) {
    const n = Math.max(0, Number(count) || 0);
    setRounds(rounds.map((r) => {
      if (r.id !== roundId) return r;
      return {
        ...r,
        categories: r.categories.map((c) => {
          if (c.id !== catId) return c;
          const questions = Array.from({ length: n }, (_, i) => {
            const existing = c.questions[i];
            const id = makeCategoryQuestionId(c.prefix, i);
            return existing ? { ...existing, id } : { id, order: i, defaultPointValue: Number(c.commonDefault) || 1, status: 'unanswered' };
          });
          return { ...c, questionCount: n, questions };
        }),
      };
    }));
  }

  function updateQuestionPoint(roundId, catId, questionId, value) {
    setRounds(rounds.map((r) => {
      if (r.id !== roundId) return r;
      return {
        ...r,
        categories: r.categories.map((c) => (c.id !== catId ? c : {
          ...c,
          questions: c.questions.map((q) => (q.id === questionId ? { ...q, defaultPointValue: value } : q)),
        })),
      };
    }));
  }

  function applyCommonDefault(roundId, catId) {
    setRounds(rounds.map((r) => {
      if (r.id !== roundId) return r;
      return {
        ...r,
        categories: r.categories.map((c) => (c.id !== catId ? c : {
          ...c,
          questions: c.questions.map((q) => ({ ...q, defaultPointValue: Number(c.commonDefault) || 1 })),
        })),
      };
    }));
  }

  function removeCategory(roundId, catId) {
    setRounds(rounds.map((r) => (r.id !== roundId ? r : { ...r, categories: r.categories.filter((c) => c.id !== catId) })));
  }

  function addTeam() { setTeams([...teams, '']); }
  function updateTeam(index, value) { setTeams(teams.map((t, i) => (i === index ? value : t))); }
  function removeTeam(index) { setTeams(teams.filter((_, i) => i !== index)); }

  function isValidPoint(v) {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 100;
  }

  function handleBack() {
    if (step === 0) navigate('/');
    else setStep(step - 1);
  }

  function handleNext() {
    if (step < 2) { setStep(step + 1); return; }
    handleStart();
  }

  function handleStart() {
    const finalRounds = rounds.map((r) => ({
      id: r.id,
      name: r.name,
      isTieBreaker: false,
      categories: r.categories.map((c) => ({
        id: c.id,
        name: c.name || 'Category',
        questions: c.questions.map((q) => ({ ...q, defaultPointValue: Number(q.defaultPointValue) || 1 })),
      })),
    }));

    const allPointValues = finalRounds.flatMap((r) => r.categories.flatMap((c) => c.questions.map((q) => q.defaultPointValue)));
    if (allPointValues.some((v) => !isValidPoint(v))) {
      alert('Every question\u2019s point value must be a whole number from 1 to 100.');
      return;
    }
    if (tieBreaker.enabled && !isValidPoint(defaultPoints)) {
      alert('Default point value must be a whole number from 1 to 100.');
      return;
    }
    if (tieBreaker.enabled) {
      const tbPrefix = categoryPrefix(rounds.length, 0);
      finalRounds.push({
        id: makeId('round'),
        name: 'Tie-breaker',
        isTieBreaker: true,
        categories: [{
          id: makeId('cat'),
          name: 'Tie-breaker',
          questions: buildQuestions(Number(tieBreaker.questionCount) || 0, defaultPoints, tbPrefix),
        }],
      });
    }

    const finalTeams = teams.filter((t) => t.trim()).map((name) => ({ id: makeId('team'), name: name.trim() }));
    if (finalTeams.length < 1) { alert('Add at least one team.'); return; }

    createSession({ rounds: finalRounds, teams: finalTeams });
    navigate('/home');
  }

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col pb-24">
      <div className="bg-espresso text-cream px-4 py-3.5 flex items-center gap-3">
        <button onClick={handleBack} className="text-sm font-semibold">Back</button>
        <span className="flex-1 text-center font-display text-lg">New session</span>
        <span className="w-10" />
      </div>

      <div className="flex gap-1.5 px-4 pt-3.5">
        {STEPS.map((_, i) => (
          <div key={i} className={`flex-1 h-1 rounded-sm ${i <= step ? 'bg-teal' : 'bg-espresso/15'}`} />
        ))}
      </div>
      <p className="px-4 pt-2 text-xs font-semibold tracking-wide text-muted">
        STEP {step + 1} OF {STEPS.length} &middot; {STEPS[step].toUpperCase()}
      </p>

      <div className="flex-1 px-4 pt-3 flex flex-col gap-3 max-w-lg mx-auto w-full">

        {step === 0 && (
          <div className="bg-card border border-espresso/10 rounded-xl p-3.5 flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-wide text-muted">DEFAULT POINTS PER QUESTION</p>
            <div className="flex items-center gap-2.5">
              <input
                type="number" min={1} max={100} value={defaultPoints}
                onChange={(e) => setDefaultPoints(e.target.value)}
                className="w-20 border border-espresso/25 rounded-lg px-3 py-3 text-center text-xl font-bold bg-cream"
              />
              <span className="text-xs text-muted">Whole number, 1&ndash;100. Override per question later.</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <>
            {rounds.map((round, roundIndex) => (
              <div key={round.id} className="bg-card border border-espresso/10 rounded-xl p-3.5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <input
                    value={round.name} onChange={(e) => updateRoundName(round.id, e.target.value)}
                    className="font-display text-lg bg-transparent flex-1 min-w-0"
                  />
                  <span className="text-xs font-semibold text-muted shrink-0">{round.categories.length} categories</span>
                  <button onClick={() => removeRound(round.id)} aria-label="Remove round" className="text-coral shrink-0"><Trash2 size={16} /></button>
                </div>

                <div className="flex flex-col gap-2">
                  {round.categories.map((cat) => {
                    const isOpen = expandedCatId === cat.id;
                    return (
                      <div key={cat.id} className="bg-cream rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedCatId(isOpen ? null : cat.id)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
                        >
                          {isOpen ? <ChevronDown size={14} className="text-muted shrink-0" /> : <ChevronRight size={14} className="text-muted shrink-0" />}
                          <span className="text-sm flex-1 truncate">{cat.name || 'Untitled category'}</span>
                          <span className="text-xs text-muted shrink-0">{cat.questions.length} questions</span>
                        </button>

                        {isOpen && (
                          <div className="px-3 pb-3 flex flex-col gap-2.5 border-t border-espresso/10 pt-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-muted w-6 shrink-0">{cat.prefix}</span>
                              <input
                                value={cat.name}
                                onChange={(e) => updateCategoryField(round.id, cat.id, 'name', e.target.value)}
                                placeholder="Category name"
                                className="flex-1 border border-espresso/20 rounded-lg px-2 py-1.5 text-sm bg-white"
                              />
                              <input
                                type="number" min={0} value={cat.questionCount}
                                onChange={(e) => resizeQuestions(round.id, cat.id, e.target.value)}
                                className="w-14 border border-espresso/20 rounded-lg px-2 py-1.5 text-sm bg-white"
                                aria-label="Number of questions"
                              />
                              <button onClick={() => removeCategory(round.id, cat.id)} aria-label="Remove category" className="text-coral shrink-0"><Trash2 size={14} /></button>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="number" min={1} max={100} value={cat.commonDefault}
                                onChange={(e) => updateCategoryField(round.id, cat.id, 'commonDefault', e.target.value)}
                                className="w-16 border border-teal/40 rounded-lg px-2 py-1.5 text-sm bg-white"
                                aria-label="Common default point value"
                              />
                              <button
                                onClick={() => applyCommonDefault(round.id, cat.id)}
                                className="flex items-center gap-1 text-teal text-xs font-medium border border-teal/40 rounded-lg px-2 py-1.5"
                              >
                                <Wand2 size={12} /> Apply to all questions
                              </button>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              {cat.questions.map((q) => (
                                <div key={q.id} className="flex items-center gap-2 text-sm">
                                  <span className="w-14 font-mono text-muted">{q.id}</span>
                                  <span className="text-xs text-muted">pts</span>
                                  <input
                                    type="number" min={1} max={100} value={q.defaultPointValue}
                                    onChange={(e) => updateQuestionPoint(round.id, cat.id, q.id, e.target.value)}
                                    className="w-16 border border-espresso/20 rounded-lg px-2 py-1 text-sm bg-white"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => addCategory(round.id)}
                  className="self-start border border-dashed border-teal/50 text-teal text-xs font-semibold rounded-lg px-3 py-2 flex items-center gap-1"
                >
                  <Plus size={13} /> Add category
                </button>
              </div>
            ))}

            <button onClick={addRound} className="border border-dashed border-espresso/30 text-espresso text-sm font-semibold rounded-xl py-3 flex items-center justify-center gap-1">
              <Plus size={15} /> Add round
            </button>

            <div className="bg-card border border-gold/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-base">Tie-breaker round</p>
                {tieBreaker.enabled && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-muted">Number of questions</span>
                    <input
                      type="number" min={1} value={tieBreaker.questionCount}
                      onChange={(e) => setTieBreaker({ ...tieBreaker, questionCount: e.target.value })}
                      className="w-14 border border-espresso/25 rounded-lg px-2 py-1 text-xs bg-cream"
                    />
                  </div>
                )}
              </div>
              <Toggle checked={tieBreaker.enabled} onChange={(v) => setTieBreaker({ ...tieBreaker, enabled: v })} />
            </div>
          </>
        )}

        {step === 2 && (
          <div className="bg-card border border-espresso/10 rounded-xl p-3.5 flex flex-col gap-2.5">
            {teams.map((team, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={team} onChange={(e) => updateTeam(i, e.target.value)}
                  placeholder={`Team ${i + 1} name`}
                  className="flex-1 border border-espresso/25 rounded-lg px-3 py-2.5 bg-cream"
                />
                <button onClick={() => removeTeam(i)} aria-label="Remove team" className="text-coral"><Trash2 size={18} /></button>
              </div>
            ))}
            <button onClick={addTeam} className="self-start flex items-center gap-1 text-teal text-sm font-semibold mt-1">
              <Plus size={16} /> Add team
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-espresso px-4 py-3.5 flex gap-3">
        <button onClick={handleBack} className="flex-1 border border-cream/40 text-cream font-semibold rounded-lg py-3.5 text-sm">
          Back
        </button>
        <button onClick={handleNext} className="flex-[2] bg-teal text-cream font-semibold rounded-lg py-3.5 text-sm">
          {step < 2 ? `Next \u00b7 ${STEPS[step + 1]}` : 'Start session'}
        </button>
      </div>
    </div>
  );
}
