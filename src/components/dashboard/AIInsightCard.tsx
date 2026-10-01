import { Brain, Lightbulb, Target } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function AIInsightCard() {
  const { aiInsight } = useAppStore();

  if (!aiInsight) return null;

  return (
    <div className="glass-card-elevated p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-violet to-brand-500">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-surface-900 dark:text-white">
            AI Intelligence Summary
          </h3>
          <p className="text-[10px] font-medium tracking-wider text-surface-200/50 uppercase dark:text-surface-200/30">
            Powered by NLP Engine
          </p>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm leading-relaxed text-surface-900/80 dark:text-surface-200/70">
        {aiInsight.summary}
      </p>

      {/* Key Findings */}
      <div className="mt-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-accent-amber" />
          <span className="text-xs font-semibold tracking-wider text-surface-900 uppercase dark:text-white">
            Key Findings
          </span>
        </div>
        <ul className="space-y-2">
          {aiInsight.keyFindings.map((finding, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm text-surface-900/70 dark:text-surface-200/60"
            >
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
              {finding}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendation */}
      <div className="mt-5 rounded-xl border border-accent-emerald/20 bg-accent-emerald/5 p-4 dark:border-accent-emerald/10 dark:bg-accent-emerald/5">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-accent-emerald" />
          <span className="text-xs font-semibold tracking-wider text-accent-emerald uppercase">
            Recommendation
          </span>
        </div>
        <p className="text-sm leading-relaxed text-surface-900/70 dark:text-surface-200/60">
          {aiInsight.recommendation}
        </p>
      </div>
    </div>
  );
}
