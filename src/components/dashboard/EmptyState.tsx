import { Globe, Sparkles, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function EmptyState() {
  const { status } = useAppStore();

  if (status !== 'idle') return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      {/* Illustration */}
      <div className="relative mx-auto mb-8 h-32 w-32">
        {/* Orbiting rings */}
        <div className="absolute inset-0 animate-spin rounded-full border border-dashed border-brand-500/20" style={{ animationDuration: '20s' }} />
        <div className="absolute inset-3 animate-spin rounded-full border border-dashed border-accent-violet/15" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        <div className="absolute inset-6 animate-spin rounded-full border border-dashed border-accent-cyan/10" style={{ animationDuration: '10s' }} />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-violet/20 backdrop-blur-sm">
            <Globe className="h-8 w-8 text-brand-400" />
          </div>
        </div>

        {/* Floating sparkles */}
        <Sparkles className="absolute left-2 top-4 h-4 w-4 animate-sparkle text-accent-amber" style={{ animationDelay: '0s' }} />
        <Sparkles className="absolute right-3 top-8 h-3 w-3 animate-sparkle text-accent-cyan" style={{ animationDelay: '0.5s' }} />
        <Sparkles className="absolute bottom-6 left-6 h-3.5 w-3.5 animate-sparkle text-accent-violet" style={{ animationDelay: '1s' }} />
      </div>

      {/* Text */}
      <h2 className="text-xl font-bold text-surface-900 sm:text-2xl dark:text-white">
        Mulai Eksplorasi Data Web
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-surface-200/60 dark:text-surface-200/40">
        Masukkan URL dan perintah AI di atas untuk memulai scraping dan analisis.
        WebIntel AI akan secara otomatis mengekstrak, menganalisis sentimen, dan menyusun laporan untuk Anda.
      </p>

      {/* Quick Start Tips */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            title: 'YouTube Analysis',
            desc: 'Analisis komentar & sentimen video',
            example: 'youtube.com/watch?v=...',
          },
          {
            title: 'Google Maps Scraper',
            desc: 'Ekstrak review bisnis & lokasi',
            example: 'maps.google.com/place/...',
          },
          {
            title: 'Document Harvester',
            desc: 'Kumpulkan PDF & dokumen publik',
            example: 'site.com/research/papers',
          },
        ].map((tip) => (
          <div
            key={tip.title}
            className="glass-card group cursor-pointer p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:border-brand-400/20"
          >
            <h4 className="text-xs font-bold text-surface-900 dark:text-white">
              {tip.title}
            </h4>
            <p className="mt-1 text-[11px] text-surface-200/50 dark:text-surface-200/30">
              {tip.desc}
            </p>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-brand-400 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="truncate">{tip.example}</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
