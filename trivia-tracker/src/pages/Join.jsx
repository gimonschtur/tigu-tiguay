import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MonitorPlay } from 'lucide-react';
import { findSessionByJoinCode } from '../lib/repository';

// UX-M17/FR-M39/UX-M26: join with a session code as a Viewer or as a
// Display. Without a cloud backend (FR-M23) this only finds the session
// stored on this same device.
export default function Join() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [mode, setMode] = useState('viewer');
  const [error, setError] = useState('');

  function handleJoin() {
    const session = findSessionByJoinCode(code);
    if (!session) {
      setError('No session with that code on this device. Joining from another device needs the cloud database.');
      return;
    }
    navigate(mode === 'display' ? '/display?view=game' : '/leaderboard');
  }

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col">
      <div className="bg-espresso text-cream px-4 py-3.5 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-sm font-semibold">Back</button>
        <span className="flex-1 text-center font-display text-lg">Join a session</span>
        <span className="w-10" />
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 max-w-sm mx-auto w-full">
        <p className="text-sm text-muted leading-relaxed">
          Enter the code shown on the score tracker's home screen, then choose how this device should show scores.
        </p>

        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-semibold tracking-wide text-muted">SESSION CODE</p>
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            placeholder="ABC123"
            maxLength={6}
            aria-label="Session code"
            className="bg-card border border-espresso/25 rounded-xl px-4 py-4 text-center text-2xl font-extrabold tracking-widest"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-semibold tracking-wide text-muted">JOIN AS</p>
          <div className="flex gap-2">
            {[['viewer', 'Viewer', Eye, 'Phone, view-only'], ['display', 'Display', MonitorPlay, 'Projector or TV']].map(([key, label, Icon, hint]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                aria-pressed={mode === key}
                className={`flex-1 rounded-xl border-[1.5px] p-3 flex flex-col items-center gap-1 ${mode === key ? 'border-teal bg-teal/10 text-teal' : 'border-espresso/20'}`}
              >
                <Icon size={20} />
                <span className="text-sm font-bold">{label}</span>
                <span className="text-xs text-muted">{hint}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-coral text-sm font-medium">{error}</p>}

        <button onClick={handleJoin} className="bg-teal text-cream font-semibold py-3.5 rounded-xl">Join</button>
      </div>
    </div>
  );
}
