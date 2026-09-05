import { useNavigate } from 'react-router-dom';
import { getPastSessions, getLeaderboard, getAllQuestionsFlat } from '../lib/repository';

export default function PastSessions() {
  const navigate = useNavigate();
  const sessions = getPastSessions();

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col">
      <div className="bg-espresso text-cream px-4 py-3.5 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-sm font-semibold">Back</button>
        <span className="flex-1 text-center font-display text-lg">Past sessions</span>
        <span className="w-10" />
      </div>

      <div className="flex-1 p-4 flex flex-col gap-2.5">
        {sessions.length === 0 && <p className="text-muted text-sm">No past sessions yet.</p>}
        {sessions.map((s) => {
          const leaders = getLeaderboard(s);
          const winner = leaders[0];
          const questionCount = getAllQuestionsFlat(s).length;
          return (
            <div key={s.id} className="bg-card border border-espresso/10 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-lg">{new Date(s.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                <span className="text-xs text-muted tracking-wide">{s.joinCode}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">Winner</span>
                <span className="font-semibold text-gold">{winner?.name} &middot; {winner?.total}</span>
              </div>
              <p className="text-xs text-muted">{s.teams.length} teams &middot; {s.rounds.length} rounds &middot; {questionCount} questions</p>
            </div>
          );
        })}
        {sessions.length > 0 && <p className="text-xs text-muted text-center mt-2">Ended sessions are view-only</p>}
      </div>
    </div>
  );
}
