import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Users, Check } from 'lucide-react';
import {
  getActiveSession, getTeamsInOrder, getLatestQuestionEntry, getAllQuestionsFlat, saveQuestionScores,
} from '../lib/repository';
import PersistentPane from '../components/PersistentPane';
import TopBar from '../components/TopBar';

// FR-M40/FR-M41: questions worth this much or less get a 1..N tap row;
// anything above gets Full marks + Custom.
export const TAP_ROW_MAX = 5;

function findQuestionContext(session, questionId) {
  if (!session) return null;
  for (const round of session.rounds) {
    for (const category of round.categories) {
      const question = category.questions.find((q) => q.id === questionId);
      if (question) return { round, category, question };
    }
  }
  return null;
}

// Keyed by question ID so every piece of staged state (values, open custom
// inputs, the all-teams toggle, errors) starts fresh on each question.
export default function LiveScoring() {
  const { questionId } = useParams();
  return <LiveScoringInner key={questionId} questionId={questionId} />;
}

function LiveScoringInner({ questionId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(getActiveSession());
  const ctx = findQuestionContext(session, questionId);
  const teams = session ? getTeamsInOrder(session) : [];
  const defaultValue = ctx?.question.defaultPointValue ?? 0;
  const isLowRange = defaultValue <= TAP_ROW_MAX;

  // FR-M29: staged values live only in component state until Save. A
  // question that was already scored opens pre-filled from its records.
  const [staged, setStaged] = useState(() => {
    const seed = {};
    teams.forEach((t) => {
      const existing = ctx ? getLatestQuestionEntry(session, ctx.question.id, t.id) : null;
      seed[t.id] = existing ? existing.pointValue : 0;
    });
    return seed;
  });
  // Which control last set each team's value: 'tap' | 'full' | 'custom' | 'bulk'.
  const [stagedVia, setStagedVia] = useState({});
  const [customOpen, setCustomOpen] = useState(() => {
    const seed = {};
    teams.forEach((t) => {
      const v = staged[t.id];
      seed[t.id] = !isLowRange && v !== 0 && v !== defaultValue;
    });
    return seed;
  });
  const [customText, setCustomText] = useState(() => {
    const seed = {};
    teams.forEach((t) => { seed[t.id] = staged[t.id] ? String(staged[t.id]) : ''; });
    return seed;
  });
  // All-teams toggle (UX-M37): what each team held before the bulk add, so
  // tapping again can give back exactly what was there.
  const [bulkOn, setBulkOn] = useState(false);
  const [preBulk, setPreBulk] = useState({});
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [errors, setErrors] = useState({});
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

  const isNewCategory = !!ctx && !!location.state?.fromCategoryId && location.state.fromCategoryId !== ctx.category.id;

  useEffect(() => {
    // UX-M33: a short buzz only when a new category begins.
    if (isNewCategory && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    if (!session) navigate('/');
    else if (!ctx) navigate('/home');
  }, [session, ctx, navigate]);

  if (!session || !ctx) return null;
  const { round, category, question } = ctx;

  const allQuestions = getAllQuestionsFlat(session);
  const questionIndex = allQuestions.findIndex((q) => q.id === question.id);
  const isFirstQuestion = questionIndex === 0;
  const catIndex = category.questions.findIndex((q) => q.id === question.id);
  const catTotal = category.questions.length;
  const wasScored = question.status === 'scored';

  function setTeamValue(teamId, value, via) {
    setStaged((s) => ({ ...s, [teamId]: value }));
    setStagedVia((s) => ({ ...s, [teamId]: via }));
    setErrors((e) => ({ ...e, [teamId]: null }));
  }

  function showToast(message, undo) {
    clearTimeout(toastTimer.current);
    setToast({ message, undo });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }

  // UX-M28: tapping the staged value again clears it (FR-M30).
  function selectTapValue(teamId, value) {
    setTeamValue(teamId, staged[teamId] === value ? 0 : value, 'tap');
  }

  // UX-M29: Full marks toggles the same way.
  function selectFullMarks(teamId) {
    const next = staged[teamId] === defaultValue && !customOpen[teamId] ? 0 : defaultValue;
    setTeamValue(teamId, next, 'full');
    setCustomOpen((c) => ({ ...c, [teamId]: false }));
  }

  function openCustom(teamId) {
    setCustomOpen((c) => ({ ...c, [teamId]: true }));
    setCustomText((c) => ({ ...c, [teamId]: staged[teamId] ? String(staged[teamId]) : '' }));
  }

  function handleCustomChange(teamId, text) {
    setCustomText((c) => ({ ...c, [teamId]: text }));
    const n = text === '' ? 0 : Number(text);
    setTeamValue(teamId, Number.isFinite(n) ? n : NaN, 'custom');
  }

  function applyBulk(baseStaged = staged) {
    const before = {};
    const next = { ...baseStaged };
    const via = { ...stagedVia };
    teams.forEach((t) => {
      before[t.id] = baseStaged[t.id];
      next[t.id] = defaultValue;
      via[t.id] = 'bulk';
    });
    setPreBulk(before);
    setStaged(next);
    setStagedVia(via);
    setCustomOpen({});
    setErrors({});
    setBulkOn(true);
  }

  // FR-M51/FR-M52: the all-teams button. On: every team gets the default.
  // Off: only teams still holding the bulk value get their earlier value
  // back; any team changed by hand since keeps that change.
  function toggleBulk() {
    if (!bulkOn) {
      applyBulk();
      setToast(null);
      return;
    }
    const next = { ...staged };
    const via = { ...stagedVia };
    const reverted = [];
    const kept = [];
    teams.forEach((t) => {
      if (stagedVia[t.id] === 'bulk') {
        next[t.id] = preBulk[t.id] ?? 0;
        delete via[t.id];
        reverted.push(t);
      } else {
        kept.push(t);
      }
    });
    const snapshot = staged;
    setStaged(next);
    setStagedVia(via);
    setBulkOn(false);
    const keptText = kept.length === 1
      ? ` ${kept[0].name} keeps its hand-entered ${staged[kept[0].id]}.`
      : kept.length > 1 ? ` ${kept.length} hand-edited teams keep their values.` : '';
    showToast(`Removed +${defaultValue} from ${reverted.length} team${reverted.length === 1 ? '' : 's'}.${keptText}`, () => {
      setStaged(snapshot);
      setStagedVia({ ...via, ...Object.fromEntries(reverted.map((t) => [t.id, 'bulk'])) });
      setBulkOn(true);
      setToast(null);
    });
  }

  function validateStaged() {
    const newErrors = {};
    let ok = true;
    teams.forEach((t) => {
      const n = staged[t.id];
      if (n === 0) return;
      if (!Number.isInteger(n) || n < 1 || n > defaultValue) {
        newErrors[t.id] = `Enter a whole number from 1 to ${defaultValue}`;
        ok = false;
      }
    });
    setErrors(newErrors);
    return ok;
  }

  function goTo(target) {
    navigate(target ? `/score/${target.id}` : '/home', { state: { fromCategoryId: category.id } });
  }

  function commitSave() {
    saveQuestionScores(question.id, round.id, category.id, staged);
    setSession(getActiveSession());
    goTo(allQuestions[questionIndex + 1]);
  }

  // UX-M16: confirm only when a recorded value would actually change.
  function hasActualChanges() {
    return teams.some((t) => {
      const existing = getLatestQuestionEntry(session, question.id, t.id);
      if (!existing) return false;
      return (staged[t.id] || 0) !== existing.pointValue;
    });
  }

  function handleSaveAndNext() {
    if (!validateStaged()) return;
    if (wasScored && hasActualChanges()) { setShowOverwriteConfirm(true); return; }
    commitSave();
  }

  // FR-M47/UX-M34: Back leaves without saving anything staged here.
  function handleBack() {
    if (isFirstQuestion) return;
    goTo(allQuestions[questionIndex - 1]);
  }

  const changedTeams = teams.filter((t) => {
    const existing = getLatestQuestionEntry(session, question.id, t.id);
    return existing && (staged[t.id] || 0) !== existing.pointValue;
  });

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col">
      <TopBar label={`${round.name} · ${category.name}`} />

      <div className="flex-1 p-4 flex flex-col gap-3">
        {isNewCategory && (
          <div role="status" className="bg-teal text-cream rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Now in: {category.name}</span>
            <span className="text-xs opacity-80">{round.name}</span>
          </div>
        )}

        <div className={`bg-card rounded-xl px-4 py-3.5 flex flex-col gap-2.5 border ${wasScored ? 'border-gold/60' : 'border-espresso/10'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-bold tracking-wide ${wasScored ? 'text-gold' : 'text-muted'}`}>
                {wasScored ? 'EDITING SCORED QUESTION' : `QUESTION ${catIndex + 1} OF ${catTotal}`}
              </p>
              <p className="text-[28px] leading-tight font-extrabold tracking-wide">{question.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Default</p>
              <p className="text-[22px] font-extrabold text-teal">{defaultValue} pts</p>
            </div>
          </div>
          {/* FR-M45/UX-M32: position within the category. */}
          <div className="flex gap-1" aria-label={`Question ${catIndex + 1} of ${catTotal} in ${category.name}`}>
            {category.questions.map((q) => (
              <div
                key={q.id}
                className={`flex-1 h-1 rounded-full ${q.id === question.id ? 'bg-espresso' : q.status === 'scored' ? 'bg-teal' : 'bg-espresso/15'}`}
              />
            ))}
          </div>
        </div>

        {/* UX-M37: one button stages the default for every team; tap again to undo. */}
        <button
          onClick={toggleBulk}
          aria-pressed={bulkOn}
          className={`h-[52px] rounded-xl border-[1.5px] border-teal flex items-center justify-center gap-2.5 font-extrabold ${bulkOn ? 'bg-teal text-card' : 'text-teal'}`}
        >
          {bulkOn ? <Check size={18} strokeWidth={2.6} /> : <Users size={18} />}
          <span className="text-base">{bulkOn ? `+${defaultValue} given to all teams` : `Give +${defaultValue} to all teams`}</span>
          {bulkOn && <span className="text-[13px] font-semibold opacity-85">· Tap to undo</span>}
        </button>

        <div className="flex flex-col gap-2">
          {teams.map((team) => {
            const value = staged[team.id];
            const existing = getLatestQuestionEntry(session, question.id, team.id);
            const hasError = !!errors[team.id];
            const isStaged = Number.isFinite(value) && value > 0;
            const indicator = isStaged ? `+${value}` : existing ? '0' : '—';

            const nameBlock = (
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-[15px] font-bold leading-tight">{team.name}</span>
                <span className={`text-xs ${isStaged ? 'font-extrabold text-teal' : 'font-semibold text-muted'}`}>{indicator}</span>
              </div>
            );

            return (
              <div
                key={team.id}
                className={`bg-card rounded-xl px-3 py-2.5 flex flex-col gap-2 border ${
                  hasError ? 'border-coral border-[1.5px]' : isStaged ? 'border-teal border-[1.5px]' : 'border-espresso/10'
                }`}
              >
                {isLowRange ? (
                  <div className="flex items-center gap-2">
                    {nameBlock}
                    <div className="flex gap-1.5">
                      {Array.from({ length: defaultValue }, (_, i) => i + 1).map((v) => (
                        <button
                          key={v}
                          onClick={() => selectTapValue(team.id, v)}
                          aria-pressed={value === v}
                          aria-label={`${team.name}: ${v} point${v === 1 ? '' : 's'}`}
                          className={`w-[42px] h-11 rounded-lg border-[1.5px] border-teal text-base font-extrabold ${value === v ? 'bg-teal text-card' : 'text-teal'}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-bold">{team.name}</span>
                      <span className={`text-xs ${isStaged ? 'font-extrabold text-teal' : 'font-semibold text-muted'}`}>{indicator}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => selectFullMarks(team.id)}
                        aria-pressed={value === defaultValue && !customOpen[team.id]}
                        className={`flex-1 h-11 rounded-lg border-[1.5px] border-teal text-base font-extrabold ${
                          value === defaultValue && !customOpen[team.id] ? 'bg-teal text-card' : 'text-teal'
                        }`}
                      >
                        Full marks · {defaultValue}
                      </button>
                      {customOpen[team.id] ? (
                        <label className={`w-[118px] h-11 flex items-center gap-1.5 rounded-lg border-[1.5px] px-2.5 bg-cream ${hasError ? 'border-coral' : 'border-espresso'}`}>
                          <span className="text-xs font-bold">Custom</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={defaultValue}
                            autoFocus
                            value={customText[team.id] ?? ''}
                            onChange={(e) => handleCustomChange(team.id, e.target.value)}
                            aria-label={`${team.name}: custom points`}
                            className={`w-10 bg-transparent text-right text-[17px] font-extrabold outline-none ${hasError ? 'text-coral' : ''}`}
                          />
                        </label>
                      ) : (
                        <button
                          onClick={() => openCustom(team.id)}
                          className="w-[118px] h-11 rounded-lg border-[1.5px] border-espresso/40 text-sm font-bold"
                        >
                          Custom
                        </button>
                      )}
                    </div>
                  </>
                )}
                {hasError && <p className="text-coral text-xs font-semibold">{errors[team.id]}</p>}
              </div>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <p className="text-xs text-muted text-center">
            {bulkOn ? 'Change any team by hand · undo keeps hand edits' : 'Teams left blank score 0 · tap a selected value again to clear it'}
          </p>
          <div className="flex gap-2.5">
            {!isFirstQuestion && (
              <button onClick={handleBack} className="flex-1 h-[50px] border-[1.5px] border-espresso/35 rounded-xl text-[15px] font-bold">
                Back
              </button>
            )}
            <button onClick={handleSaveAndNext} className="flex-[2.4] h-[50px] bg-teal text-card rounded-xl text-[15px] font-bold">
              Save and next question
            </button>
          </div>
        </div>
      </div>

      <PersistentPane session={session} teams={teams} currentQuestionId={question.id} />

      {toast && (
        <div role="status" className="fixed left-4 right-4 bottom-[200px] z-30 bg-espresso text-cream rounded-xl px-3.5 py-3 flex items-center gap-2.5 shadow-lg">
          <span className="flex-1 text-[13px] leading-snug">{toast.message}</span>
          <button onClick={toast.undo} className="text-[13px] font-extrabold text-gold">Undo</button>
        </div>
      )}

      {showOverwriteConfirm && (
        <div className="fixed inset-0 bg-espresso/55 flex items-end z-40">
          <div className="bg-card w-full rounded-t-2xl px-5 pt-6 pb-8 flex flex-col gap-4">
            <p className="font-display text-2xl">Overwrite scores?</p>
            <div className="text-sm leading-relaxed flex flex-col gap-1">
              {changedTeams.map((t) => (
                <p key={t.id}>
                  {t.name}: <strong>{getLatestQuestionEntry(session, question.id, t.id).pointValue}</strong> → <strong>{staged[t.id] || 0}</strong>
                </p>
              ))}
              <p className="text-muted">Changes are logged in the audit trail.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowOverwriteConfirm(false)} className="flex-1 border border-espresso/30 rounded-lg py-3.5 text-sm font-semibold">
                Cancel
              </button>
              <button
                onClick={() => { setShowOverwriteConfirm(false); commitSave(); }}
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
