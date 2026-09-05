import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { getActiveSession, getLeaderboard, clearActiveSession } from '../lib/repository';

export default function FinalResults() {
  const navigate = useNavigate();
  const session = getActiveSession();
  if (!session) { navigate('/'); return null; }
  const teams = getLeaderboard(session);

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col px-6 py-8 items-center">
      <h1 className="font-display text-2xl mb-1 flex items-center gap-2"><Trophy className="text-gold" /> Final results</h1>
      <p className="text-muted text-sm mb-6">Session ended &middot; view-only</p>

      <div className="w-full max-w-sm flex flex-col gap-2 mb-8">
        {teams.map((team, i) => (
          <div key={team.id} className={`flex items-center justify-between rounded-xl p-3 border ${i === 0 ? 'bg-gold/20 border-gold' : 'bg-card border-espresso/10'}`}>
            <span className="font-medium text-sm">{i + 1}. {team.name}</span>
            <span className="font-display text-lg">{team.total}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/audit')} className="border border-espresso/30 rounded-xl px-4 py-2 text-sm font-medium">
          View audit trail
        </button>
        <button
          onClick={() => { clearActiveSession(); navigate('/'); }}
          className="bg-teal text-cream rounded-xl px-4 py-2 text-sm font-medium"
        >
          Done
        </button>
      </div>
    </div>
  );
}
