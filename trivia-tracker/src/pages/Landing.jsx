import { useNavigate } from 'react-router-dom';
import { getPastSessions } from '../lib/repository';

export default function Landing() {
  const navigate = useNavigate();
  const pastSessions = getPastSessions();

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col">
      <div className="h-13 bg-espresso" style={{ height: 52 }} />
      <div className="flex-1 flex flex-col justify-center px-7 gap-10">
        <div>
          <h1 className="font-display text-4xl leading-tight">Tigu-Tiguay</h1>
          <p className="text-sm text-muted mt-1">Borongan trivia night &middot; ThirdTry Coffee</p>
        </div>

        <div className="flex flex-col gap-3.5">
          <button onClick={() => navigate('/create')} className="bg-teal text-cream font-semibold py-4.5 rounded-xl" style={{ padding: '18px' }}>
            Start a session
          </button>
          <button onClick={() => navigate('/join')} className="border border-espresso/35 text-espresso font-semibold rounded-xl" style={{ padding: '18px' }}>
            Join a session
          </button>
        </div>

        {pastSessions.length > 0 && (
          <div className="flex justify-center">
            <button onClick={() => navigate('/past-sessions')} className="text-sm font-medium text-muted border-b border-muted/40 pb-0.5">
              Past sessions
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-muted text-center pb-8">No active session on this device</p>
    </div>
  );
}
