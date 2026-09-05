import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Join() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col">
      <div className="bg-espresso text-cream px-4 py-3.5 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-sm font-semibold">Back</button>
        <span className="flex-1 text-center font-display text-lg">Join a session</span>
        <span className="w-10" />
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 max-w-sm mx-auto w-full">
        <p className="text-sm text-muted leading-relaxed">
          Enter the code shown on the score tracker's home screen, or scan the QR code. You will join as a view-only viewer.
        </p>

        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-semibold tracking-wide text-muted">SESSION CODE</p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="bg-card border border-espresso/25 rounded-xl px-4 py-4 text-center text-2xl font-extrabold tracking-widest"
          />
        </div>

        <button
          onClick={() => alert('Live multi-device join requires a cloud backend — see the high-level design doc, section 7.')}
          className="bg-teal text-cream font-semibold py-3.5 rounded-xl"
        >
          Join
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-espresso/15" />
          <span className="text-xs text-muted">or</span>
          <div className="flex-1 h-px bg-espresso/15" />
        </div>

        <div className="bg-card border border-espresso/10 rounded-xl p-6 flex flex-col items-center gap-3.5">
          <div className="w-36 h-36 rounded-lg bg-[repeating-linear-gradient(45deg,#8A6A4A_0_6px,#F1E4D0_6px_12px)]" />
          <button className="border border-espresso/30 rounded-lg px-5 py-3 text-sm font-semibold">Scan QR code</button>
        </div>
      </div>
    </div>
  );
}
