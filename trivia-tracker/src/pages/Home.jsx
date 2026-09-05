import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { getActiveSession, getLeaderboard, getTeamsInOrder, getAllQuestionsFlat, endSession } from '../lib/repository';
import PersistentPane from '../components/PersistentPane';

export default function Home() {
  const navigate = useNavigate();
  const [session] = useState(getActiveSession());
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  if (!session) {
    navigate('/');
    return null;
  }

  const teamsRanked = getLeaderboard(session);
  const teamsInOrder = getTeamsInOrder(session);
  const leader = teamsRanked[0];
  const allQuestions = getAllQuestionsFlat(session);
  const scoredCount = allQuestions.filter((q) => q.status === 'scored').length;

  function handleEndSession() {
    endSession();
    navigate('/leaderboard-final');
  }

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col">
      <div className="bg-espresso text-cream px-4 py-3.5 flex items-center justify-between">
        <h1 className="font-display text-lg">Tigu-Tiguay</h1>
        <span className="text-xs font-semibold tracking-wide text-gold">SCORE TRACKER</span>
      </div>

      <div className="p-4 flex flex-col gap-3.5">
        <div className="bg-card border border-espresso/10 rounded-xl p-3.5 flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-lg bg-[repeating-linear-gradient(45deg,#3B2417_0_4px,#FBF6EC_4px_8px)] shrink-0" />
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted mb-0.5">JOIN CODE</p>
            <p className="font-body text-2xl font-extrabold tracking-widest text-espresso">{session.joinCode}</p>
            <p className="text-xs text-muted mt-0.5">Scan or enter to view scores</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/leaderboard')}
            className="flex-[1.2] bg-teal text-cream text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5"
          >
            <Trophy size={15} /> Leaderboard
          </button>
          <button
            onClick={() => navigate('/deduct')}
            className="flex-1 border border-coral text-coral text-sm font-semibold py-3 rounded-xl"
          >
            Deduct
          </button>
          <button
            onClick={() => setShowEndConfirm(true)}
            className="flex-1 border border-espresso/30 text-espresso text-sm font-semibold py-3 rounded-xl"
          >
            End session
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 pb-2 flex flex-col gap-4 overflow-y-auto">
        {session.rounds.map((round) => {
          const totalQ = round.categories.reduce((s, c) => s + c.questions.length, 0);
          const scoredQ = round.categories.reduce((s, c) => s + c.questions.filter((q) => q.status === 'scored').length, 0);

          if (round.isTieBreaker) {
            const firstUnscored = round.categories[0]?.questions.find((q) => q.status !== 'scored') || round.categories[0]?.questions[0];
            return (
              <button
                key={round.id}
                onClick={() => firstUnscored && navigate(`/score/${firstUnscored.id}`)}
                className="bg-card border border-dashed border-gold/60 rounded-xl px-3.5 py-2.5 flex items-center justify-between"
              >
                <span className="font-display text-base">Tie-breaker</span>
                <span className="text-xs text-muted">{scoredQ} / {totalQ}</span>
              </button>
            );
          }

          return (
            <div key={round.id} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-base">{round.name}</p>
                <span className="text-xs text-muted">{scoredQ} / {totalQ}</span>
              </div>
              <div className="bg-card border border-espresso/10 rounded-xl overflow-hidden">
                {round.categories.map((cat, i) => {
                  const catScored = cat.questions.filter((q) => q.status === 'scored').length;
                  const inProgress = catScored > 0 && catScored < cat.questions.length;
                  const firstUnscored = cat.questions.find((q) => q.status !== 'scored') || cat.questions[0];
                  return (
                    <button
                      key={cat.id}
                      onClick={() => firstUnscored && navigate(`/score/${firstUnscored.id}`)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left ${i > 0 ? 'border-t border-espresso/5' : ''} ${inProgress ? 'bg-teal/5' : ''}`}
                    >
                      <span className={`text-sm ${inProgress ? 'font-semibold' : ''}`}>{cat.name}</span>
                      <span className={`text-xs font-medium ${catScored === cat.questions.length && cat.questions.length > 0 ? 'text-teal' : inProgress ? 'text-teal' : 'text-muted'}`}>
                        {inProgress ? `In progress · ${catScored} / ${cat.questions.length}` : `${catScored} / ${cat.questions.length}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <PersistentPane session={session} teams={teamsInOrder} />

      {showEndConfirm && (
        <div className="fixed inset-0 bg-espresso/55 flex items-center justify-center p-5 z-40">
          <div className="bg-card rounded-2xl p-6 max-w-xs w-full flex flex-col gap-4">
            <h2 className="font-display text-2xl">End session?</h2>
            <p className="text-sm leading-relaxed">
              Scores lock and no further edits are possible. The leaderboard and audit trail stay viewable.
            </p>
            <div className="bg-cream rounded-lg p-3.5 flex flex-col gap-2">
              <div className="flex justify-between text-sm"><span className="text-muted">Questions scored</span><span className="font-semibold">{scoredCount} of {allQuestions.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Unscored count as</span><span className="font-semibold">0 points</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Current leader</span><span className="font-semibold">{leader ? `${leader.name} · ${leader.total}` : '—'}</span></div>
            </div>
            <div className="flex flex-col gap-2.5">
              <button onClick={handleEndSession} className="bg-coral text-cream font-semibold py-3.5 rounded-lg">End session</button>
              <button onClick={() => setShowEndConfirm(false)} className="border border-espresso/30 text-espresso font-semibold py-3.5 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
