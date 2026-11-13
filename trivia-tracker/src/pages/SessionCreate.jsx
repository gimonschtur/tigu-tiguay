import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Wand2, ChevronDown, ChevronRight } from 'lucide-react';
import { createSession } from '../lib/repository';
import { makeId, assignPrefixes } from '../lib/id';

// FR-M48: the same 1..5 threshold as the live scoring tap row.
export const POINT_BUTTON_MAX = 5;

function buildQuestions(count, defaultPoints) {
  return Array.from({ length: count }, (_, i) => ({
    id: `tmp${i}`, order: i, defaultPointValue: Number(defaultPoints) || 1, status: 'unanswered',
  }));
}

function makeCategory(name, defaultPoints) {
  return { id: makeId('cat'), name, questionCount: 5, commonDefault: defaultPoints, prefix: '', questions: buildQuestions(5, defaultPoints) };
}

// UX-M23: three rounds of named categories, five questions each.
const DEFAULT_STRUCTURE = [
  ['Current Events', 'Science', 'Geography'],
  ['Pop Culture', 'Math', 'History'],
  ['Famous Movie Lines', 'Name that Song'],
];

function buildDefaultRounds(defaultPoints) {
  return assignPrefixes(DEFAULT_STRUCTURE.map((names, r) => ({
    id: makeId('round'),
    name: `Round ${r + 1}`,
    isTieBreaker: false,
    categories: names.map((n) => makeCategory(n, defaultPoints)),
  })));
}

// FR-M48/FR-M49/UX-M35/UX-M36: buttons for 1..5 plus a custom input for
// larger values. Picking a button clears and disables the input; picking
// the same button again deselects it and re-enables the input.
function PointPicker({ value, onChange, label, size = 'md' }) {
  const n = Number(value);
  const inButtonRange = value !== '' && Number.isInteger(n) && n >= 1 && n <= POINT_BUTTON_MAX;
  const [typed, setTyped] = useState(() => (value !== '' && !inButtonRange ? String(value) : ''));
  const [usingInput, setUsingInput] = useState(() => value !== '' && !inButtonRange);
  // Re-sync when the value changes from outside (e.g. "Apply to all").
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    const nextUsing = value !== '' && !inButtonRange;
    setUsingInput(nextUsing);
    setTyped(nextUsing ? String(value) : '');
  }
  const emit = (v) => { setSyncedValue(v); onChange(v); };
  const showButtonActive = inButtonRange && !usingInput;
  const btn = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base';

  return (
    <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label={label}>
      {Array.from({ length: POINT_BUTTON_MAX }, (_, i) => i + 1).map((v) => {
        const active = showButtonActive && n === v;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={active}
            onClick={() => {
              setTyped('');
              setUsingInput(false);
              emit(active ? '' : v);
            }}
            className={`${btn} rounded-lg border-[1.5px] border-teal font-extrabold ${active ? 'bg-teal text-card' : 'text-teal'}`}
          >
            {v}
          </button>
        );
      })}
      <input
        type="number"
        inputMode="numeric"
        min={POINT_BUTTON_MAX + 1}
        max={100}
        placeholder={`${POINT_BUTTON_MAX + 1}+`}
        disabled={showButtonActive}
        value={typed}
        aria-label={`${label} — custom value`}
        onChange={(e) => {
          setTyped(e.target.value);
          setUsingInput(e.target.value !== '');
          emit(e.target.value === '' ? '' : Number(e.target.value));
        }}
        className={`${size === 'sm' ? 'w-14 h-8 text-sm' : 'w-16 h-10 text-base'} border-[1.5px] border-espresso/30 rounded-lg px-2 text-center font-bold bg-white disabled:opacity-40`}
      />
    </div>
  );
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
  const [defaultPoints, setDefaultPoints] = useState(1);
  const [teams, setTeams] = useState(['Team 1', 'Team 2', 'Team 3']);
  const [rounds, setRoundsRaw] = useState(() => buildDefaultRounds(1));
  // FR-M34–M37: every structural change re-derives prefixes and question IDs.
  const setRounds = (next) => setRoundsRaw(assignPrefixes(next));
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
    const newCat = makeCategory('', defaultPoints);
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
            return existing || { id: `tmp${i}`, order: i, defaultPointValue: Number(c.commonDefault) || 1, status: 'unanswered' };
          });
          return { ...c, questionCount: n, questions };
        }),
      };
    }));
  }

  function updateQuestionPoint(roundId, catId, questionIndex, value) {
    setRounds(rounds.map((r) => {
      if (r.id !== roundId) return r;
      return {
        ...r,
        categories: r.categories.map((c) => (c.id !== catId ? c : {
          ...c,
          questions: c.questions.map((q, i) => (i === questionIndex ? { ...q, defaultPointValue: value } : q)),
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
    const structure = rounds.map((r) => ({
      id: r.id,
      name: r.name || 'Round',
      isTieBreaker: false,
      categories: r.categories.map((c) => ({ id: c.id, name: c.name, questions: c.questions })),
    }));
    if (tieBreaker.enabled) {
      structure.push({
        id: makeId('round'),
        name: 'Tie-breaker',
        isTieBreaker: true,
        categories: [{ id: makeId('cat'), name: 'Tie-breaker', questions: buildQuestions(Number(tieBreaker.questionCount) || 0, defaultPoints) }],
      });
    }
    // FR-M35: an unnamed category keeps its XX-style prefix; it only gets a
    // display name here.
    const finalRounds = assignPrefixes(structure).map((r) => ({
      ...r,
      categories: r.categories.map(({ prefix, ...c }) => ({
        ...c,
        prefix,
        name: c.name.trim() || 'Untitled category',
        questions: c.questions.map((q) => ({ ...q, defaultPointValue: Number(q.defaultPointValue), status: 'unanswered' })),
      })),
    }));

    const allPointValues = finalRounds.flatMap((r) => r.categories.flatMap((c) => c.questions.map((q) => q.defaultPointValue)));
    if (allPointValues.some((v) => !isValidPoint(v))) {
      alert('Every question\u2019s point value must be a whole number from 1 to 100.');
      return;
    }
    if (!isValidPoint(defaultPoints)) {
      alert('Default point value must be a whole number from 1 to 100.');
      return;
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
              <PointPicker value={defaultPoints} onChange={setDefaultPoints} label="Default points per question" />
            </div>
            <p className="text-xs text-muted">Tap 1&ndash;5, or type 6&ndash;100. Override per question later.</p>
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
                          <span className="text-sm flex-1 truncate">{cat.name || 'Untitled category'}</span>
                          <span className="text-xs text-muted shrink-0">{cat.questions.length} questions</span>
                        </button>

                        {isOpen && (
                          <div className="px-3 pb-3 flex flex-col gap-2.5 border-t border-espresso/10 pt-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-muted w-6 shrink-0" title="Question ID prefix">{cat.prefix}</span>
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

                            <div className="flex flex-col items-start gap-2">
                              <PointPicker
                                size="sm"
                                value={cat.commonDefault}
                                onChange={(v) => updateCategoryField(round.id, cat.id, 'commonDefault', v)}
                                label="Common default point value"
                              />
                              <button
                                onClick={() => applyCommonDefault(round.id, cat.id)}
                                className="flex items-center gap-1 text-teal text-xs font-medium border border-teal/40 rounded-lg px-2 py-1.5"
                              >
                                <Wand2 size={12} /> Apply to all questions
                              </button>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              {cat.questions.map((q, qi) => (
                                <div key={`${cat.id}-${qi}`} className="flex items-center gap-2 text-sm">
                                  <span className="w-12 font-mono text-muted">{q.id}</span>
                                  <PointPicker
                                    size="sm"
                                    value={q.defaultPointValue}
                                    onChange={(v) => updateQuestionPoint(round.id, cat.id, qi, v)}
                                    label={`Points for ${q.id}`}
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
