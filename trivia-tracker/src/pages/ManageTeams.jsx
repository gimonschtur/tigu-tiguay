import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveSession, renameTeam } from '../lib/repository';
import TopBar from '../components/TopBar';

export default function ManageTeams() {
  const navigate = useNavigate();
  const session = getActiveSession();
  if (!session) { navigate('/'); return null; }

  const [names, setNames] = useState(() => Object.fromEntries(session.teams.map((t) => [t.id, t.name])));

  function handleSave() {
    session.teams.forEach((t) => {
      const newName = (names[t.id] || '').trim();
      if (newName && newName !== t.name) renameTeam(t.id, newName);
    });
    navigate('/home');
  }

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col">
      <TopBar label="Manage teams" />

      <div className="flex-1 p-4 flex flex-col gap-2.5 max-w-sm mx-auto w-full">
        <p className="text-xs text-muted mb-1">Rename any team. Names update everywhere immediately after saving.</p>
        {session.teams.map((t) => (
          <input
            key={t.id}
            value={names[t.id]}
            onChange={(e) => setNames({ ...names, [t.id]: e.target.value })}
            className="border border-espresso/25 rounded-lg px-3 py-2.5 bg-card"
          />
        ))}
      </div>

      <div className="p-4">
        <button onClick={handleSave} className="w-full bg-teal text-cream font-semibold py-3.5 rounded-xl">
          Save changes
        </button>
      </div>
    </div>
  );
}
