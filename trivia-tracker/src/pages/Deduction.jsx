import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveSession, appendAuditEntry, getTeamsInOrder } from '../lib/repository';
import PersistentPane from '../components/PersistentPane';
import TopBar from '../components/TopBar';

export default function Deduction() {
  const navigate = useNavigate();
  const [session] = useState(getActiveSession());
  const [teamId, setTeamId] = useState('');
  const [amount, setAmount] = useState('5');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!session) { navigate('/'); return null; }
  const teams = getTeamsInOrder(session);
  const selected = teams.find((t) => t.id === teamId);

  function apply() {
    const n = Number(amount);
    if (!teamId) { setError('Select a team'); return; }
    if (!Number.isInteger(n) || n < 1 || n > 100) { setError('Enter a whole number from 1 to 100'); return; }
    appendAuditEntry({ teamId, questionId: null, roundId: null, categoryId: null, pointValue: -n, type: 'deduction', reason: reason || null });
    navigate('/home');
  }

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col">
      <TopBar label="Deduct points" />

      <div className="flex-1 p-4 flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-wide text-muted">SELECT TEAM</p>
        <div className="flex flex-col gap-2 -mt-2">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setTeamId(t.id)}
              className={`bg-card rounded-xl px-4 py-3.5 flex items-center justify-between border ${teamId === t.id ? 'border-2 border-coral' : 'border-espresso/10'}`}
            >
              <span className={`text-sm ${teamId === t.id ? 'font-semibold' : ''}`}>{t.name}</span>
              <span className={`text-sm font-extrabold ${teamId === t.id ? 'text-espresso' : 'text-muted'}`}>{t.total}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wide text-muted">POINTS TO DEDUCT</p>
          <div className="flex items-center gap-2.5">
            <input
              type="number" min={1} max={100} value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-28 border border-espresso/25 rounded-xl px-3.5 py-3.5 text-center text-2xl font-extrabold bg-card"
            />
            <span className="text-xs text-muted">Whole number, 1–100</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wide text-muted">REASON (OPTIONAL)</p>
          <input
            value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="Phone used during round"
            className="border border-espresso/25 rounded-xl px-3.5 py-3.5 text-sm bg-card"
          />
        </div>

        {error && <p className="text-coral text-sm">{error}</p>}

        <div className="mt-auto flex flex-col gap-2.5">
          {selected && (
            <p className="text-sm text-center">
              {selected.name}: <strong>{selected.total}</strong> &rarr;{' '}
              <strong className="text-coral">{Math.max(0, selected.total - (Number(amount) || 0))}</strong>
            </p>
          )}
          <button onClick={apply} className="bg-coral text-cream font-semibold py-3.5 rounded-xl">
            Deduct {amount || 0} points
          </button>
        </div>
      </div>

      <PersistentPane session={session} teams={teams} />
    </div>
  );
}
