import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

export default function NavigateSheet({ session, currentQuestionId, onClose }) {
  const navigate = useNavigate();

  function goTo(questionId) {
    onClose();
    navigate(`/score/${questionId}`);
  }

  return (
    <div className="fixed inset-0 bg-espresso/50 flex items-end z-30" onClick={onClose}>
      <div
        className="w-full bg-card rounded-t-2xl px-5 pt-5 pb-7 max-h-[75vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-espresso">Navigate</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted mb-4">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal inline-block" /> Scored</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-espresso/30 inline-block" /> Unanswered</span>
        </div>

        {/* Every round, category, and question below is clickable (UX-M04) — nothing is collapsed to a summary-only state. */}
        <div className="flex flex-col gap-4">
          {session.rounds.map((round) => (
            <div key={round.id}>
              <p className="font-display text-base text-espresso mb-2">
                {round.name}{round.isTieBreaker ? ' (tie-breaker)' : ''}
              </p>
              <div className="flex flex-col gap-2">
                {round.categories.map((cat) => {
                  const scoredCount = cat.questions.filter((q) => q.status === 'scored').length;
                  const isCurrentCategory = cat.questions.some((q) => q.id === currentQuestionId);
                  return (
                    <div
                      key={cat.id}
                      className={`bg-cream rounded-lg p-2.5 flex flex-col gap-2.5 border ${isCurrentCategory ? 'border-teal' : 'border-transparent'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-espresso flex-1">{cat.name}</span>
                        <span className="text-xs font-medium text-teal">{scoredCount} / {cat.questions.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cat.questions.map((q) => (
                          <button
                            key={q.id}
                            onClick={() => goTo(q.id)}
                            className={`flex-1 min-w-[52px] text-center py-2 rounded-md text-xs font-medium ${
                              q.id === currentQuestionId
                                ? 'bg-espresso text-cream'
                                : q.status === 'scored'
                                  ? 'bg-teal/15 text-teal'
                                  : 'border border-espresso/20 text-muted'
                            }`}
                          >
                            {q.id}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
