import { useState, useEffect, useRef } from 'react';
import { Users, Check } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getActiveSession, getTeamsInOrder, getLatestQuestionEntry, saveQuestionScores, getAllQuestionsFlat } from '../lib/repository';
import PersistentPane from '../components/PersistentPane';
import TopBar from '../components/TopBar';

// FR-M40/FR-M41: the input variant for a question is decided purely by its
// default point value — 5 or less gets a tap-target row, more than 5 gets
// quick actions plus a custom option.
const TAP_ROW_MAX = 5;

function findQuestionContext(session, questionId) {
  for (const round of session.rounds) {
    for (const category of round.categories) {
      const question = category.questions.find((q) => q.id === questionId);
      if (question) return { round, category, question };
    }
  }
  return null;
}

// Outer wrapper — keying on questionId forces React to fully unmount and
// remount LiveScoringInner on every question change, so its staged/error
// state (initialized via useState lazy initializers, which only run once
// per mount) correctly resets instead of carrying over from the previous
// question. Without this, React Router keeps the same component instance
// alive across navigations within the same route and only swaps the URL
// param, so those initializers never re-run.
export default function LiveScoring() {
  const { questionId } = useParams();
  return <LiveScoringInner key={questionId} />;
}

function LiveScoringInner() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(getActiveSession());
  const toastTimer = useRef(null);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  if (!session) { navigate('/'); return null; }
  const ctx = findQuestionContext(session, questionId);
  if (!ctx) { navigate('/home'); return null; }
  const { round, category, question } = ctx;

  // Position within the current category — "Question 3 of 5" — so it's
  // never ambiguous whether the tracker is mid-category or about to finish.
  const catIndex = category.questions.findIndex((q) => q.id === question.id);
  const catTotal = category.questions.length;

  // A category transition is only flagged when arriving via the normal
  // Save-and-next flow (commitSave passes fromCategoryId in nav state) —
  // not when jumping around manually via the Navigate sheet, since that's
  // a deliberate browse, not "did I just move on without noticing."
  const isNewCategory = !!location.state?.fromCategoryId && location.state.fromCategoryId !== category.id;

  useEffect(() => {
    if (isNewCategory && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(60); // a distinct buzz specifically for category changes, not every question
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLowRange = question.defaultPointValue <= TAP_ROW_MAX;
  const teams = getTeamsInOrder(session);

  // Staged values are local UI state only — nothing is written to the audit
  // trail, the leaderboard, or the question's status until Save is pressed
  // (FR-M29). Seeded from any previously recorded value, defaulting to '0'
  // (FR-M32's counterpart on the input side).
  const [staged, setStaged] = useState(() => {
    const seed = {};
    teams.forEach((t) => {
      const existing = getLatestQuestionEntry(session, question.id, t.id);
      seed[t.id] = existing ? String(existing.pointValue) : '0';
    });
    return seed;
  });
  const [stagedVia, setStagedVia] = useState({});
  const [customOpen, setCustomOpen] = useState(() => {
    const seed = {};
    teams.forEach((t) => {
      const v = Number(staged[t.id]) || 0;
      seed[t.id] = !isLowRange && v !== 0 && v !== question.defaultPointValue;
    });
    return seed;
  });
  const [errors, setErrors] = useState({});
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  // FR-M51/FR-M52: all-teams toggle. preBulk remembers each team's value
  // from before the bulk add, so turning it off can give it back.
  const [bulkOn, setBulkOn] = useState(false);
  const [preBulk, setPreBulk] = useState({});
  const [toast, setToast] = useState(null);

  const allQuestions = getAllQuestionsFlat(session);

  // UX-M28: tap-target row, 1 through the default value (no 0 target —
  // a team with nothing selected scores 0, FR-M32). Selecting the
  // already-staged target again reverts it to zero (FR-M30, generalized to
  // any discrete target, not just the default/full-marks one).
  function selectTapValue(teamId, value) {
    const current = Number(staged[teamId]) || 0;
    const next = current === value ? 0 : value;
    setStaged({ ...staged, [teamId]: String(next) });
    setStagedVia({ ...stagedVia, [teamId]: 'tap' });
    setErrors({ ...errors, [teamId]: null });
  }

  // UX-M29: "Full marks" quick action, togglable like the tap targets.
  function selectFullMarks(teamId) {
    const current = Number(staged[teamId]) || 0;
    const alreadyFull = ['quick', 'bulk'].includes(stagedVia[teamId]) && current === question.defaultPointValue;
    const next = alreadyFull ? 0 : question.defaultPointValue;
    setStaged({ ...staged, [teamId]: String(next) });
    setStagedVia({ ...stagedVia, [teamId]: 'quick' });
    setCustomOpen({ ...customOpen, [teamId]: false });
    setErrors({ ...errors, [teamId]: null });
  }

  function openCustom(teamId) {
    setCustomOpen({ ...customOpen, [teamId]: true });
  }

  function handleCustomChange(teamId, value) {
    setStaged({ ...staged, [teamId]: value });
    setStagedVia({ ...stagedVia, [teamId]: 'input' });
    setErrors({ ...errors, [teamId]: null });
  }

  function showToast(message, undo) {
    clearTimeout(toastTimer.current);
    setToast({ message, undo });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }

  // FR-M51/FR-M52/UX-M37: one tap stages the default for every team. Tapping
  // again gives each team still holding the bulk value its earlier value
  // back (0 on a fresh question); teams changed by hand keep their change.
  function toggleBulk() {
    const def = String(question.defaultPointValue);
    if (!bulkOn) {
      const before = {};
      const next = { ...staged };
      const via = { ...stagedVia };
      teams.forEach((t) => { before[t.id] = staged[t.id]; next[t.id] = def; via[t.id] = 'bulk'; });
      setPreBulk(before);
      setStaged(next);
      setStagedVia(via);
      setCustomOpen({});
      setErrors({});
      setBulkOn(true);
      setToast(null);
      return;
    }
    const snapshot = { staged, stagedVia };
    const next = { ...staged };
    const via = { ...stagedVia };
    const reverted = [];
    const kept = [];
    teams.forEach((t) => {
      if (stagedVia[t.id] === 'bulk') {
        next[t.id] = preBulk[t.id] ?? '0';
        delete via[t.id];
        reverted.push(t);
      } else {
        kept.push(t);
      }
    });
    setStaged(next);
    setStagedVia(via);
    setBulkOn(false);
    const keptText = kept.length === 1
      ? ` ${kept[0].name} keeps its hand-entered ${staged[kept[0].id]}.`
      : kept.length > 1 ? ` ${kept.length} hand-edited teams keep their values.` : '';
    showToast(
      `Removed +${def} from ${reverted.length} team${reverted.length === 1 ? '' : 's'}.${keptText}`,
      () => {
        setStaged(snapshot.staged);
        setStagedVia(snapshot.stagedVia);
        setBulkOn(true);
        setToast(null);
      },
    );
  }

  function validateStaged() {
    const newErrors = {};
    let ok = true;
    const max = question.defaultPointValue;
    teams.forEach((t) => {
      const raw = staged[t.id];
      const n = Number(raw);
      if (raw === '' || raw === undefined || n === 0) return; // 0/blank is always valid — nothing to save
      if (!Number.isInteger(n) || n < 1 || n > max) {
        newErrors[t.id] = `Enter a whole number from 1 to ${max}`;
        ok = false;
      }
    });
    setErrors(newErrors);
    return ok;
  }

  function commitSave() {
    saveQuestionScores(question.id, round.id, category.id, staged);
    const updated = getActiveSession();
    setSession(updated);
    const idx = allQuestions.findIndex((q) => q.id === question.id);
    const next = allQuestions[idx + 1];
    navigate(next ? `/score/${next.id}` : '/home', { state: { fromCategoryId: category.id } });
  }

  // FR-M33 revised/UX-M16 revised: the overwrite confirmation now fires only
  // when a team's staged value actually differs from what's already
  // recorded — not merely because the question's status is "scored." A
  // team being scored for the FIRST time within an already-touched
  // question is a new entry, not an overwrite, and doesn't count. This is
  // intentionally separate from the "EDITING SCORED QUESTION" banner/border
  // above, which stays tied to question.status regardless — that's
  // informational context, this is a destructive-action warning.
  //
  // Bug fixed here: staged===0 must NOT short-circuit this for a team who
  // already has a recorded score — reducing them to zero is a real
  // correction (FR-M50), not "nothing to save." That exclusion only
  // applies when there's no existing entry at all (nothing to compare
  // against — see saveQuestionScores' matching FR-M32 handling).
  function hasActualChanges() {
    return teams.some((t) => {
      const existing = getLatestQuestionEntry(session, question.id, t.id);
      if (!existing) return false; // no prior record — a new entry, not an overwrite
      const stagedVal = Number(staged[t.id]) || 0;
      return stagedVal !== existing.pointValue;
    });
  }

  function handleSaveAndNext() {
    if (!validateStaged()) return;
    if (question.status === 'scored' && hasActualChanges()) { setShowOverwriteConfirm(true); return; }
    commitSave();
  }

  // FR-M47/UX-M34: Back navigates to the previous question WITHOUT saving
  // anything staged for the current one — same category-transition
  // treatment as Save-and-next (FR-M46), since this is still genuine
  // sequential movement, just backward.
  const questionIndex = allQuestions.findIndex((q) => q.id === question.id);
  const isFirstQuestion = questionIndex === 0;

  function handleBack() {
    const prev = allQuestions[questionIndex - 1];
    if (!prev) return;
    navigate(`/score/${prev.id}`, { state: { fromCategoryId: category.id } });
  }

  const pointsLabel = question.defaultPointValue === 1 ? 'Worth 1 pt' : `Worth up to ${question.defaultPointValue} pts`;

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col">
      <TopBar label={`${round.name} · ${category.name}`} />

      <div className="flex-1 p-4 flex flex-col gap-3.5">
        {isNewCategory && (
          <div className="bg-teal text-cream rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Now in: {category.name}</span>
            <span className="text-xs opacity-80">{round.name}</span>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-semibold">{category.name}</p>
            <p className="text-xs text-muted">Question {catIndex + 1} of {catTotal}</p>
          </div>
          <div className="flex gap-1">
            {category.questions.map((q) => (
              <div
                key={q.id}
                className={`flex-1 h-1.5 rounded-full ${
                  q.id === question.id ? 'bg-espresso' : q.status === 'scored' ? 'bg-teal' : 'bg-espresso/15'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <p className={`text-xs mb-0.5 ${question.status === 'scored' ? 'text-gold font-semibold tracking-wide' : 'text-muted'}`}>
              {question.status === 'scored' ? 'EDITING SCORED QUESTION' : 'Question'}
            </p>
            <p className="font-display text-3xl font-extrabold">{question.id}</p>
          </div>
          <p className="text-sm text-muted">{pointsLabel}</p>
        </div>

        {/* UX-M37: all-teams toggle, directly above the team list. */}
        <button
          onClick={toggleBulk}
          aria-pressed={bulkOn}
          className={`h-[52px] rounded-xl border-[1.5px] border-teal flex items-center justify-center gap-2.5 font-extrabold ${bulkOn ? 'bg-teal text-cream' : 'text-teal'}`}
        >
          {bulkOn ? <Check size={18} strokeWidth={2.6} /> : <Users size={18} />}
          <span className="text-base">
            {bulkOn ? `+${question.defaultPointValue} given to all teams` : `Give +${question.defaultPointValue} to all teams`}
          </span>
          {bulkOn && <span className="text-[13px] font-semibold opacity-85">· Tap to undo</span>}
        </button>

        <div className="flex flex-col gap-2.5">
          {teams.map((team) => {
            const stagedValue = Number(staged[team.id]) || 0;
            const hasError = !!errors[team.id];

            return (
              <div
                key={team.id}
                className={`bg-card rounded-xl p-3.5 flex flex-col gap-2.5 border ${
                  hasError ? 'border-coral' : stagedValue > 0 ? 'border-teal' : 'border-espresso/10'
                }`}
              >
                <span className="text-base font-medium truncate">{team.name}</span>

                {isLowRange ? (
                  <div className="flex gap-1.5">
                    {Array.from({ length: question.defaultPointValue }, (_, i) => i + 1).map((v) => {
                      const active = stagedValue === v;
                      return (
                        <button
                          key={v}
                          onClick={() => selectTapValue(team.id, v)}
                          aria-pressed={active}
                          className={`flex-1 h-12 rounded-lg text-base font-extrabold ${
                            active ? 'bg-teal text-cream' : 'border border-teal text-teal'
                          }`}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => selectFullMarks(team.id)}
                        className={`flex-[2] h-12 rounded-lg text-base font-extrabold ${
                          ['quick', 'bulk'].includes(stagedVia[team.id]) && stagedValue === question.defaultPointValue
                            ? 'bg-teal text-cream'
                            : 'border border-teal text-teal'
                        }`}
                      >
                        Full marks · {question.defaultPointValue}
                      </button>
                      <button
                        onClick={() => openCustom(team.id)}
                        className={`flex-1 h-12 rounded-lg text-sm font-semibold ${
                          customOpen[team.id] ? 'bg-gold text-espresso' : 'border border-gold text-gold'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                    {customOpen[team.id] && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">Points</span>
                        <input
                          type="number"
                          min={1}
                          max={question.defaultPointValue}
                          value={staged[team.id] ?? ''}
                          onChange={(e) => handleCustomChange(team.id, e.target.value)}
                          className={`w-16 border rounded-lg px-1.5 py-2 text-center text-sm font-semibold bg-cream ${
                            hasError ? 'border-coral text-coral' : 'border-gold'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                )}

                {hasError && <p className="text-coral text-xs font-medium">{errors[team.id]}</p>}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2.5 mt-1">
          <p className="text-xs text-muted text-center">
            {bulkOn ? 'Change any team by hand · undo keeps hand edits' : 'Teams left blank score 0 · nothing is saved until you press Save'}
          </p>
          <div className="flex gap-3">
            {!isFirstQuestion && (
              <button onClick={handleBack} className="flex-1 border border-espresso/30 text-espresso font-semibold py-3.5 rounded-xl">
                Back
              </button>
            )}
            <button onClick={handleSaveAndNext} className={`${isFirstQuestion ? 'w-full' : 'flex-[2]'} bg-teal text-cream font-semibold py-3.5 rounded-xl`}>
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
            <p className="text-sm leading-relaxed">
              {question.id} was already scored. Saving will overwrite the recorded scores with the staged values shown above. The change is logged in the audit trail.
            </p>
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
