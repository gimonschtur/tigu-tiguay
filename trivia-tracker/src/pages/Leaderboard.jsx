import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveSession, getLeaderboard, getTeamsInOrder, getTeamTotal } from '../lib/repository';
import PersistentPane from '../components/PersistentPane';
import TopBar from '../components/TopBar';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [session] = useState(getActiveSession());
  const [tab, setTab] = useState('game');

  if (!session) { navigate('/'); return null; }
  const teams = getLeaderboard(session);
  const teamsInOrder = getTeamsInOrder(session);
  const leader = teams[0];

  let rows = teams;
  if (tab !== 'game') {
    // Round/category view collapses to whichever group is currently selected via a simple picker below.
  }

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col">
      <TopBar label="Leaderboard" />

      <div className="p-4 flex flex-col gap-3.5">
        <div className="flex gap-1.5 bg-card border border-espresso/10 rounded-xl p-1">
          {[['game', 'Game'], ['round', 'Round'], ['category', 'Category']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold ${tab === key ? 'bg-espresso text-cream' : 'text-muted'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'game' && (
          <div className="flex flex-col gap-2">
            {teams.map((t, i) =>
              i === 0 ? (
                <div key={t.id} className="bg-card border-[3px] border-gold rounded-xl p-[18px] flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-gold text-cream flex items-center justify-center font-extrabold text-lg shrink-0">1</div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold">{t.name}</p>
                    <p className="text-xs font-semibold tracking-wide text-gold">LEADING</p>
                  </div>
                  <p className="text-3xl font-extrabold">{t.total}</p>
                </div>
              ) : (
                <div key={t.id} className="bg-card border border-espresso/10 rounded-xl p-3.5 flex items-center gap-3.5">
                  <div className="w-8 text-center text-base font-extrabold text-muted">{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-sm">{t.name}</p>
                    {session.auditEntries.some((e) => e.type === 'deduction' && e.teamId === t.id) && (
                      <p className="text-xs text-coral font-medium">Deduction applied</p>
                    )}
                  </div>
                  <p className="text-xl font-extrabold">{t.total}</p>
                </div>
              ),
            )}
          </div>
        )}

        {tab !== 'game' && (
          <div className="flex flex-col gap-3">
            {(tab === 'round' ? session.rounds : session.rounds.flatMap((r) => r.categories.map((c) => ({ ...c, roundName: r.name })))).map((group) => {
              const groupTeams = [...session.teams]
                .map((t) => ({ ...t, total: getTeamTotal(session, t.id, tab === 'round' ? { roundId: group.id } : { categoryId: group.id }) }))
                .sort((a, b) => b.total - a.total);
              return (
                <div key={group.id} className="bg-card border border-espresso/10 rounded-xl p-3.5">
                  <p className="text-xs font-semibold tracking-wide text-muted mb-2">
                    {(group.roundName ? `${group.roundName} · ` : '') + group.name}
                  </p>
                  {groupTeams.map((t) => (
                    <div key={t.id} className="flex justify-between text-sm py-1">
                      <span>{t.name}</span>
                      <span className="font-semibold">{t.total}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {leader && (
          <div className="bg-card border border-espresso/10 rounded-xl p-3.5">
            <p className="text-xs font-semibold tracking-wide text-muted mb-2">{leader.name.toUpperCase()} · BY ROUND</p>
            {session.rounds.map((r) => (
              <div key={r.id} className="flex justify-between text-sm py-1">
                <span>{r.name}</span>
                <span className="font-semibold">{getTeamTotal(session, leader.id, { roundId: r.id })}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <PersistentPane session={session} teams={teamsInOrder} />
    </div>
  );
}
