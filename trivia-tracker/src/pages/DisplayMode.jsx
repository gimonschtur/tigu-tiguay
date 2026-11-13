import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getActiveSession, getLeaderboard, getTeamTotal } from '../lib/repository';

// FR-M38/FR-M42/UX-M25: a passive, non-interactive large-screen view, dark
// themed for projector contrast. Supports the same three breakdowns as the
// Leaderboard screen (FR-M42) — which view to show comes from the "view"
// query param, set when launched from Leaderboard (FR-M43/UX-M31) to carry
// over whatever was currently selected there; defaults to "game" when
// opened cold (e.g. from the Join screen's Display option, UX-M26).
// Polls localStorage every 2s — genuinely live for a second tab on the same
// device; true cross-device sync still needs FR-M23.
export default function DisplayMode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'game';
  const [session, setSession] = useState(getActiveSession());

  useEffect(() => {
    const id = setInterval(() => setSession(getActiveSession()), 2000);
    return () => clearInterval(id);
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-espresso text-cream flex flex-col items-center justify-center gap-4">
        <p className="text-xl">No active session on this device</p>
        <button onClick={() => navigate('/')} className="text-cream/70 text-sm underline">Back</button>
      </div>
    );
  }

  const teams = getLeaderboard(session);

  const groups = view === 'round'
    ? session.rounds.map((r) => ({ id: r.id, label: r.name }))
    : view === 'category'
      ? session.rounds.flatMap((r) => r.categories.map((c) => ({ id: c.id, label: `${r.name} \u00b7 ${c.name}`, roundId: r.id })))
      : null;

  return (
    <div className="min-h-screen bg-espresso text-cream flex flex-col p-10">
      <h1 className="font-display text-4xl text-center mb-2">Tigu-Tiguay</h1>
      <p className="text-center text-sm font-semibold tracking-wide text-gold mb-10">
        {view === 'game' ? 'LEADERBOARD \u00b7 WHOLE GAME' : view === 'round' ? 'LEADERBOARD \u00b7 PER ROUND' : 'LEADERBOARD \u00b7 PER CATEGORY'}
      </p>

      {view === 'game' && (
        <div className="flex-1 flex flex-col gap-4 max-w-3xl mx-auto w-full justify-center">
          {teams.map((t, i) => (
            <div
              key={t.id}
              className={`flex items-center justify-between rounded-2xl px-8 py-6 ${i === 0 ? 'bg-gold text-espresso' : 'bg-white/10'}`}
            >
              <span className="text-3xl font-semibold">{i + 1}. {t.name}</span>
              <span className="text-5xl font-extrabold">{t.total}</span>
            </div>
          ))}
        </div>
      )}

      {groups && (
        <div className="flex-1 flex flex-col gap-8 max-w-3xl mx-auto w-full overflow-y-auto">
          {groups.map((g) => {
            const groupTeams = [...session.teams]
              .map((t) => ({ ...t, total: getTeamTotal(session, t.id, view === 'round' ? { roundId: g.id } : { categoryId: g.id }) }))
              .sort((a, b) => b.total - a.total);
            return (
              <div key={g.id} className="flex flex-col gap-3">
                <p className="text-xl font-semibold tracking-wide text-gold">{g.label}</p>
                {groupTeams.map((t, i) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between rounded-xl px-6 py-4 ${i === 0 ? 'bg-gold text-espresso' : 'bg-white/10'}`}
                  >
                    <span className="text-xl font-semibold">{i + 1}. {t.name}</span>
                    <span className="text-4xl font-extrabold">{t.total}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
