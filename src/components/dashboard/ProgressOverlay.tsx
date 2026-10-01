import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export function ProgressOverlay() {
  const { status, progress } = useAppStore();

  if (status !== 'processing') return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full border-2 border-brand-500/20" />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin"
              />
              <div className="absolute inset-1.5 rounded-full bg-brand-500/10" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-900 dark:text-white">
                Menganalisis Data...
              </p>
              <p className="text-xs text-surface-200/60 dark:text-surface-200/40">
                {progress < 30
                  ? 'Mengambil konten dari URL...'
                  : progress < 60
                  ? 'Menjalankan analisis sentimen AI...'
                  : progress < 90
                  ? 'Menyusun laporan dan visualisasi...'
                  : 'Finalisasi hasil...'}
              </p>
            </div>
          </div>
          <span className="text-lg font-bold text-brand-400">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-200/20 dark:bg-white/[0.06]">
          <div
            className="progress-gradient h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div className="shimmer absolute inset-0 rounded-full" />
        </div>

        {/* Step Indicators */}
        <div className="mt-4 flex justify-between">
          {['Fetch', 'Parse', 'Analyze', 'Report'].map((step, i) => {
            const stepProgress = (i + 1) * 25;
            const isActive = progress >= stepProgress - 25;
            const isComplete = progress >= stepProgress;
            return (
              <div key={step} className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all',
                    isComplete
                      ? 'bg-accent-emerald text-white'
                      : isActive
                      ? 'bg-brand-500/20 text-brand-400 ring-2 ring-brand-500/30'
                      : 'bg-surface-200/10 text-surface-200/30 dark:bg-white/[0.04]'
                  )}
                >
                  {isComplete ? '✓' : i + 1}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    isActive
                      ? 'text-surface-900 dark:text-white'
                      : 'text-surface-200/40 dark:text-surface-200/20'
                  )}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
