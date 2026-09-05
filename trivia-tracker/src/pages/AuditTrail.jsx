import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveSession, getAuditEntries, getTeamsInOrder } from '../lib/repository';
import PersistentPane from '../components/PersistentPane';
import TopBar from '../components/TopBar';

export default function AuditTrail() {
  const navigate = useNavigate();
  const [session] = useState(getActiveSession());
  const [filterType, setFilterType] = useState('round');
  const [filterValue, setFilterValue] = useState('');

  if (!session) { navigate('/'); return null; }
  const teams = getTeamsInOrder(session);

  const filters = filterValue ? { [filterType === 'round' ? 'roundId' : filterType === 'category' ? 'categoryId' : filterType === 'question' ? 'questionId' : 'teamId']: filterValue } : {};
  const entries = getAuditEntries(session, filters);
  const teamName = (id) => session.teams.find((t) => t.id === id)?.name || '—';

  const optionsFor = {
    round: session.rounds.map((r) => ({ id: r.id, label: r.name })),
    category: session.rounds.flatMap((r) => r.categories.map((c) => ({ id: c.id, label: c.name }))),
    question: session.rounds.flatMap((r) => r.categories.flatMap((c) => c.questions.map((q) => ({ id: q.id, label: q.id })))),
    team: session.teams.map((t) => ({ id: t.id, label: t.name })),
  };

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col">
      <TopBar label="Audit trail" />

      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap">
          {['round', 'category', 'question', 'team'].map((key) => (
            <button
              key={key}
              onClick={() => { setFilterType(key); setFilterValue(''); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filterType === key ? 'bg-espresso text-cream' : 'border border-espresso/30 text-espresso'}`}
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="border border-espresso/25 rounded-lg px-3 py-2 text-sm bg-card"
        >
          <option value="">All {filterType}s</option>
          {optionsFor[filterType].map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>

        <p className="text-xs text-muted">{entries.length} changes · newest first</p>

        <div className="flex flex-col gap-2">
          {entries.length === 0 && <p className="text-muted text-sm">No point changes yet.</p>}
          {entries.map((e) => {
            const color = e.type === 'correction' ? 'text-gold' : e.pointValue >= 0 ? 'text-teal' : 'text-coral';
            const meta = e.type === 'deduction'
              ? `Deduction${e.reason ? ` · ${e.reason}` : ''} · ${new Date(e.timestamp).toLocaleTimeString()}`
              : e.type === 'correction'
                ? `${e.questionId} · edited · ${new Date(e.timestamp).toLocaleTimeString()}`
                : `${e.questionId} · ${new Date(e.timestamp).toLocaleTimeString()}`;
            return (
              <div key={e.id} className={`bg-card rounded-xl px-3.5 py-3 flex items-center justify-between border ${e.type === 'correction' ? 'border-gold' : 'border-espresso/10'}`}>
                <div>
                  <p className="text-sm font-semibold">{teamName(e.teamId)}</p>
                  <p className="text-xs text-muted">{meta}</p>
                </div>
                <p className={`text-lg font-extrabold ${color}`}>{e.type !== 'correction' && e.pointValue >= 0 ? '+' : ''}{e.pointValue}</p>
              </div>
            );
          })}
        </div>
      </div>

      <PersistentPane session={session} teams={teams} />
    </div>
  );
}
