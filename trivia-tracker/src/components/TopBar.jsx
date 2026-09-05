import { useNavigate } from 'react-router-dom';

export default function TopBar({ label }) {
  const navigate = useNavigate();
  return (
    <div className="bg-espresso text-cream px-4 py-3.5 flex items-center justify-between">
      <button onClick={() => navigate('/home')} className="text-sm font-semibold text-cream">
        Home
      </button>
      <span className="text-xs text-cream/70">{label}</span>
    </div>
  );
}
