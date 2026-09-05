import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Minus, ListChecks } from 'lucide-react';
import NavigateSheet from './NavigateSheet';

export default function PersistentPane({ session, teams, currentQuestionId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigateOpen, setNavigateOpen] = useState(false);
  // Displayed in the order given (team-number order, matching every other
  // screen) — never resorted by score here, unlike the leaderboard itself.
  const leaderId = teams.reduce((max, t) => (t.total > (max?.total ?? -1) ? t : max), null)?.id;

  const tabs = [
    { key: 'home', label: 'Home', icon: Home, path: '/home' },
    { key: 'navigate', label: 'Navigate', icon: Compass, action: () => setNavigateOpen(true) },
    { key: 'deduct', label: 'Deduct', icon: Minus, path: '/deduct' },
    { key: 'audit', label: 'Audit', icon: ListChecks, path: '/audit' },
  ];

  return (
    <>
      <div className="bg-espresso sticky bottom-0">
        <div className="flex gap-1.5 px-2.5 pt-2.5 pb-2 overflow-x-auto">
          {teams.map((t) => (
            <div key={t.id} className="flex-1 min-w-[74px] bg-white/10 rounded-lg px-2 py-1.5">
              <p className="text-[10px] text-cream/65 truncate">{t.name}</p>
              <p className={`text-sm font-semibold leading-tight ${t.id === leaderId ? 'text-gold' : 'text-cream'}`}>{t.total}</p>
            </div>
          ))}
        </div>
        <div className="flex border-t border-white/15">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.path && location.pathname === tab.path;
            return (
              <button
                key={tab.key}
                onClick={() => (tab.action ? tab.action() : navigate(tab.path))}
                className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs font-medium ${active ? 'text-gold' : 'text-cream/80'}`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {navigateOpen && (
        <NavigateSheet session={session} currentQuestionId={currentQuestionId} onClose={() => setNavigateOpen(false)} />
      )}
    </>
  );
}
