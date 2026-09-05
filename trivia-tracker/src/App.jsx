import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isReturningEditor } from './lib/repository';
import Landing from './pages/Landing';
import SessionCreate from './pages/SessionCreate';
import Home from './pages/Home';
import LiveScoring from './pages/LiveScoring';
import Deduction from './pages/Deduction';
import Leaderboard from './pages/Leaderboard';
import AuditTrail from './pages/AuditTrail';
import Join from './pages/Join';
import FinalResults from './pages/FinalResults';
import PastSessions from './pages/PastSessions';

function Entry() {
  // FR-M24/M25 — skip the landing choice for a returning editor with an active session.
  return isReturningEditor() ? <Navigate to="/home" replace /> : <Landing />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/create" element={<SessionCreate />} />
        <Route path="/join" element={<Join />} />
        <Route path="/home" element={<Home />} />
        <Route path="/score/:questionId" element={<LiveScoring />} />
        <Route path="/deduct" element={<Deduction />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/audit" element={<AuditTrail />} />
        <Route path="/leaderboard-final" element={<FinalResults />} />
        <Route path="/past-sessions" element={<PastSessions />} />
      </Routes>
    </BrowserRouter>
  );
}
