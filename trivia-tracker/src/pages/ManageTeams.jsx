import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveSession, renameTeam } from '../lib/repository';
import TopBar from '../components/TopBar';

// FR-M28/UX-M24: rename any team at any point in an active session.
export default function ManageTeams() {
  const navigate = useNavigate();
  const [session] = useState(getActiveSession());
  const [names, setNames] = useState(() => Object.fromEntries((session?.teams || []).map((t) => [t.id, t.name])));
  const [error, setError] = useState('');

  if (!session) { navigate('/'); return null; }

  function handleSave() {
    if (session.teams.some((t) => !(names[t.id] || '').trim())) { setError('Every team needs a name'); return; }
    session.teams.forEach((t) => {
      if (names[t.id].trim() !== t.name) renameTeam(t.id, names[t.id]);
    });
    navigate('/home');
  }

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col">
      <TopBar label="Manage teams" />
      <div className="flex-1 p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted">TEAM NAMES</p>
        {session.teams.map((t, i) => (
          <label key={t.id} className="flex flex-col gap-1">
            <span className="text-xs text-muted">Team {i + 1}</span>
            <input
              value={names[t.id]}
              onChange={(e) => { setNames({ ...names, [t.id]: e.target.value }); setError(''); }}
              className="bg-card border border-espresso/25 rounded-xl px-3.5 py-3 text-base"
            />
          </label>
        ))}
        {error && <p className="text-coral text-sm font-medium">{error}</p>}
        <button onClick={handleSave} className="mt-auto bg-teal text-cream font-semibold py-3.5 rounded-xl">Save changes</button>
      </div>
    </div>
  );
}
