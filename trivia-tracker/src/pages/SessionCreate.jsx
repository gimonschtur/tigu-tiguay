import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Wand2, ChevronDown, ChevronRight } from 'lucide-react';
import { createSession } from '../lib/repository';
import { makeId, deriveCategoryPrefix, makeCategoryQuestionId } from '../lib/id';

// FR-M48: buttons cover 1-5, matching the live scoring screen's own
// threshold (FR-M40) — a question worth 5 or less gets the tap-target row
// there, so this keeps setup visually and numerically consistent with play.
const POINT_BUTTON_MAX = 5;

function pointModeFor(value) {
  const n = Number(value) || 0;
  return n >= 1 && n <= POINT_BUTTON_MAX ? 'button' : 'input';
}

function buildQuestions(count, defaultPoints, prefix) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const value = Number(defaultPoints) || 1;
    questions.push({ id: makeCategoryQuestionId(prefix, i), order: i, defaultPointValue: value, pointMode: pointModeFor(value), status: 'unanswered' });
  }
  return questions;
}

// All prefixes currently in use across every round/category, optionally
// excluding one category (used when recomputing that category's own prefix).
function allOtherPrefixes(rounds, excludeCatId) {
  return rounds.flatMap((r) => r.categories.filter((c) => c.id !== excludeCatId).map((c) => c.prefix));
}

// Default session structure: 3 rounds with real category names (not the
// "XX" placeholder), 5 questions per category. Since names are real from
// the start, prefixes are genuinely name-derived (FR-M34) — all 8 land on
// distinct prefixes (CE, SC, GE, PC, MA, HI, FM, NT), no collision
// fallback needed, but deriveCategoryPrefix is still called through the
// normal collision-checking path for correctness if that ever changes.
const DEFAULT_STRUCTURE = [
  { name: 'Round 1', categories: ['Current Events', 'Science', 'Geography'] },
  { name: 'Round 2', categories: ['Pop Culture', 'Math', 'History'] },
  { name: 'Round 3', categories: ['Famous Movie Lines', 'Name that Song'] },
];

function buildDefaultRounds(defaultPoints) {
  const usedPrefixes = [];
  return DEFAULT_STRUCTURE.map((roundDef) => {
    const categories = roundDef.categories.map((catName) => {
      const prefix = deriveCategoryPrefix(catName, usedPrefixes);
      usedPrefixes.push(prefix);
      const questions = buildQuestions(5, defaultPoints, prefix);
      return { id: makeId('cat'), name: catName, questionCount: 5, commonDefault: defaultPoints, commonDefaultMode: pointModeFor(defaultPoints), prefix, questions };
    });
    return { id: makeId('round'), name: roundDef.name, isTieBreaker: false, categories };
  });
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

// FR-M48/FR-M49/UX-M35/UX-M36: buttons 1-5 plus a custom input above 5,
// mutually exclusive — selecting a button clears/disables the input;
// selecting the already-active button again deselects it (toggle) and
// re-enables the input; typing stages a custom value directly.
function PointField({ value, mode, onSelectButton, onCustomChange }) {
  const isButtonMode = mode === 'button';
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: POINT_BUTTON_MAX }, (_, i) => i + 1).map((b) => {
        const active = isButtonMode && Number(value) === b;
        return (
          <button
            key={b}
            type="button"
            onClick={() => onSelectButton(b)}
            className={`w-7 h-7 rounded-md text-xs font-bold shrink-0 ${active ? 'bg-teal text-cream' : 'border border-teal text-teal'}`}
          >
            {b}
          </button>
        );
      })}
      <input
        type="number"
        min={POINT_BUTTON_MAX + 1}
        max={100}
        placeholder={`>${POINT_BUTTON_MAX}`}
        disabled={isButtonMode}
        value={isButtonMode ? '' : value}
        onChange={(e) => onCustomChange(e.target.value)}
        className={`w-14 h-7 border rounded-md px-1 text-xs text-center bg-white shrink-0 ${
          isButtonMode ? 'border-espresso/15 text-muted/50 cursor-not-allowed' : 'border-gold'
        }`}
      />
    </div>
  );
}


const STEPS = ['Basics', 'Rounds', 'Teams'];

export default function SessionCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [defaultPoints, setDefaultPoints] = useState(1);
  const [defaultPointsMode, setDefaultPointsMode] = useState(pointModeFor(1));
  const [teams, setTeams] = useState(['Team 1', 'Team 2', 'Team 3']);
  const [rounds, setRounds] = useState(() => buildDefaultRounds(1));
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
    const prefix = deriveCategoryPrefix('', allOtherPrefixes(rounds, null));
    const questions = buildQuestions(5, defaultPoints, prefix);
    const newCat = { id: makeId('cat'), name: '', questionCount: 5, commonDefault: defaultPoints, commonDefaultMode: pointModeFor(defaultPoints), prefix, questions };
    setRounds(rounds.map((r, i) => (i !== roundIndex ? r : { ...r, categories: [...r.categories, newCat] })));
    setExpandedCatId(newCat.id);
  }

  // FR-M36: renaming a category regenerates its question IDs (new prefix,
  // renumbered from 01) — point values stay put, only the ID strings change.
  function updateCategoryName(roundId, catId, name) {
    setRounds(rounds.map((r) => {
      if (r.id !== roundId) return r;
      return {
        ...r,
        categories: r.categories.map((c) => {
          if (c.id !== catId) return c;
          const prefix = deriveCategoryPrefix(name, allOtherPrefixes(rounds, catId));
          const questions = c.questions.map((q, i) => ({ ...q, id: makeCategoryQuestionId(prefix, i) }));
          return { ...c, name, prefix, questions };
        }),
      };
    }));
  }

  function updateCategoryField(roundId, catId, field, value) {
    setRounds(rounds.map((r) => {
      if (r.id !== roundId) return r;
      return { ...r, categories: r.categories.map((c) => (c.id === catId ? { ...c, [field]: value } : c)) };
    }));
  }

  // FR-M49/UX-M36: sets the category's common-default value and its mode
  // together, atomically — the field driving PointField's button/input state.
  function updateCategoryCommonDefault(roundId, catId, value, mode) {
    setRounds(rounds.map((r) => {
      if (r.id !== roundId) return r;
      return { ...r, categories: r.categories.map((c) => (c.id === catId ? { ...c, commonDefault: value, commonDefaultMode: mode } : c)) };
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
            const fallback = Number(c.commonDefault) || 1;
            return existing ? { ...existing, id } : { id, order: i, defaultPointValue: fallback, pointMode: pointModeFor(fallback), status: 'unanswered' };
          });
          return { ...c, questionCount: n, questions };
        }),
      };
    }));
  }

  // FR-M49/UX-M36: sets a question's point value and mode together.
  function updateQuestionPoint(roundId, catId, questionId, value, mode) {
    setRounds(rounds.map((r) => {
      if (r.id !== roundId) return r;
      return {
        ...r,
        categories: r.categories.map((c) => (c.id !== catId ? c : {
          ...c,
          questions: c.questions.map((q) => (q.id === questionId ? { ...q, defaultPointValue: value, pointMode: mode } : q)),
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
          questions: c.questions.map((q) => {
            const v = Number(c.commonDefault) || 1;
            return { ...q, defaultPointValue: v, pointMode: pointModeFor(v) };
          }),
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

  // FR-M49/UX-M36: Step 1's default-points field uses the same button/input
  // toggle rule as the category and per-question fields below.
  function selectDefaultPointsButton(b) {
    const alreadySelected = defaultPointsMode === 'button' && Number(defaultPoints) === b;
    if (alreadySelected) {
      setDefaultPoints('');
      setDefaultPointsMode('input');
    } else {
      setDefaultPoints(b);
      setDefaultPointsMode('button');
    }
  }

  function handleDefaultPointsCustom(value) {
    setDefaultPoints(value);
    setDefaultPointsMode('input');
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
      const tbPrefix = deriveCategoryPrefix('Tie-breaker', allOtherPrefixes(rounds, null));
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
              <PointField
                value={defaultPoints}
                mode={defaultPointsMode}
                onSelectButton={selectDefaultPointsButton}
                onCustomChange={handleDefaultPointsCustom}
              />
              <span className="text-xs text-muted">Override per question later.</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <>
            {rounds.map((round) => (
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
                          <span className="text-xs font-mono text-muted shrink-0">{cat.prefix}</span>
                          <span className="text-sm flex-1 truncate">{cat.name || 'Untitled category'}</span>
                          <span className="text-xs text-muted shrink-0">{cat.questions.length} questions</span>
                        </button>

                        {isOpen && (
                          <div className="px-3 pb-3 flex flex-col gap-2.5 border-t border-espresso/10 pt-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-muted w-6 shrink-0">{cat.prefix}</span>
                              <input
                                value={cat.name}
                                onChange={(e) => updateCategoryName(round.id, cat.id, e.target.value)}
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
                            <p className="text-xs text-muted -mt-1">
                              Question IDs use the prefix <span className="font-mono">{cat.prefix}</span>, derived from the category name above.
                            </p>

                            <div className="flex items-center gap-2 flex-wrap">
                              <PointField
                                value={cat.commonDefault}
                                mode={cat.commonDefaultMode}
                                onSelectButton={(b) => {
                                  const alreadySelected = cat.commonDefaultMode === 'button' && Number(cat.commonDefault) === b;
                                  updateCategoryCommonDefault(round.id, cat.id, alreadySelected ? '' : b, alreadySelected ? 'input' : 'button');
                                }}
                                onCustomChange={(v) => updateCategoryCommonDefault(round.id, cat.id, v, 'input')}
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
                                  <span className="w-12 font-mono text-muted shrink-0">{q.id}</span>
                                  <PointField
                                    value={q.defaultPointValue}
                                    mode={q.pointMode}
                                    onSelectButton={(b) => {
                                      const alreadySelected = q.pointMode === 'button' && Number(q.defaultPointValue) === b;
                                      updateQuestionPoint(round.id, cat.id, q.id, alreadySelected ? '' : b, alreadySelected ? 'input' : 'button');
                                    }}
                                    onCustomChange={(v) => updateQuestionPoint(round.id, cat.id, q.id, v, 'input')}
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
