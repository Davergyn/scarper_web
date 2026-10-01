import { useState, useMemo } from 'react';
import {
  Globe,
  MapPin,
  CirclePlay,
  Users,
  FileText,
  Sparkles,
  Search,
  ChevronDown,
  Loader2,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { ScrapingMode, UrlType } from '@/types';

const modeOptions: { value: ScrapingMode; label: string; icon: React.ReactNode }[] = [
  { value: 'auto', label: 'Auto Detect', icon: <Zap className="h-4 w-4" /> },
  { value: 'google-maps', label: 'Google Maps', icon: <MapPin className="h-4 w-4" /> },
  { value: 'youtube', label: 'YouTube', icon: <CirclePlay className="h-4 w-4" /> },
  { value: 'social-media', label: 'Social Media', icon: <Users className="h-4 w-4" /> },
  { value: 'document-harvester', label: 'Document Harvester', icon: <FileText className="h-4 w-4" /> },
];

function detectUrlType(url: string): UrlType {
  if (!url) return 'general';
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('maps.google') || lower.includes('goo.gl/maps')) return 'google-maps';
  if (
    lower.includes('twitter.com') ||
    lower.includes('x.com') ||
    lower.includes('instagram.com') ||
    lower.includes('facebook.com') ||
    lower.includes('tiktok.com')
  )
    return 'social-media';
  if (lower.endsWith('.pdf') || lower.endsWith('.doc') || lower.endsWith('.docx'))
    return 'pdf-docs';
  return 'general';
}

function getUrlIcon(type: UrlType) {
  switch (type) {
    case 'youtube':
      return <CirclePlay className="h-4 w-4 text-red-500" />;
    case 'google-maps':
      return <MapPin className="h-4 w-4 text-accent-emerald" />;
    case 'social-media':
      return <Users className="h-4 w-4 text-blue-500" />;
    case 'pdf-docs':
      return <FileText className="h-4 w-4 text-accent-amber" />;
    default:
      return <Globe className="h-4 w-4 text-surface-200/50 dark:text-surface-200/40" />;
  }
}

export function CommandBar() {
  const { url, setUrl, mode, setMode, prompt, setPrompt, startProcessing, status } =
    useAppStore();
  const [modeOpen, setModeOpen] = useState(false);

  const urlType = useMemo(() => detectUrlType(url), [url]);
  const isProcessing = status === 'processing';
  const selectedMode = modeOptions.find((m) => m.value === mode)!;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pt-8 pb-4 sm:px-6 lg:px-8">
      <div className="glass-card-elevated glow-brand p-6 sm:p-8">
        {/* Section Title */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl dark:text-white">
            Mulai Scraping & Analisis
          </h2>
          <p className="mt-1.5 text-sm text-surface-200/70 dark:text-surface-200/40">
            Masukkan URL, pilih mode, dan biarkan AI menganalisis data untuk Anda
          </p>
        </div>

        {/* URL Input Row */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* URL Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
              {getUrlIcon(urlType)}
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste URL here... (YouTube, Google Maps, Twitter, etc.)"
              disabled={isProcessing}
              className={cn(
                'h-12 w-full rounded-xl border bg-white/50 pl-10 pr-4 text-sm font-medium outline-none transition-all duration-200',
                'placeholder:text-surface-200/40 dark:placeholder:text-surface-200/30',
                'border-surface-200/30 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
                'dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white dark:focus:border-brand-400',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
            {url && urlType !== 'general' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-brand-400 uppercase">
                {urlType}
              </span>
            )}
          </div>

          {/* Mode Selector */}
          <div className="relative">
            <button
              onClick={() => setModeOpen(!modeOpen)}
              disabled={isProcessing}
              className={cn(
                'flex h-12 w-full items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all sm:w-52',
                'border-surface-200/30 bg-white/50 hover:border-brand-400/30',
                'dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white dark:hover:border-brand-400/30',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {selectedMode.icon}
              <span className="flex-1 text-left">{selectedMode.label}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-surface-200/50 transition-transform dark:text-surface-200/30',
                  modeOpen && 'rotate-180'
                )}
              />
            </button>

            {modeOpen && (
              <div className="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-xl border border-surface-200/30 bg-white shadow-xl sm:w-52 dark:border-white/[0.08] dark:bg-surface-900">
                {modeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setMode(opt.value);
                      setModeOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors',
                      'hover:bg-brand-500/10 dark:hover:bg-brand-500/10',
                      mode === opt.value
                        ? 'bg-brand-500/10 text-brand-500'
                        : 'text-surface-900 dark:text-surface-200/70'
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Prompt Textarea */}
        <div className="mt-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Tulis perintah AI... (contoh: "Saring komentar negatif", "Analisis harga produk", "Cari file PDF jurnal")'
            disabled={isProcessing}
            rows={3}
            className={cn(
              'w-full resize-none rounded-xl border bg-white/50 p-4 text-sm font-medium outline-none transition-all duration-200',
              'placeholder:text-surface-200/40 dark:placeholder:text-surface-200/30',
              'border-surface-200/30 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
              'dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white dark:focus:border-brand-400',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={startProcessing}
            disabled={isProcessing || !url.trim()}
            className={cn(
              'glow-submit group relative flex h-12 items-center gap-2.5 rounded-xl px-8 text-sm font-semibold text-white transition-all duration-300',
              'bg-gradient-to-r from-brand-600 via-brand-500 to-accent-violet',
              'hover:shadow-lg hover:shadow-brand-500/25',
              'active:scale-[0.98]',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none',
              isProcessing && 'cursor-wait'
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Memproses Data...</span>
              </>
            ) : (
              <>
                <Search className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                <span>Proses & Analisis Data</span>
                <Sparkles className="h-3.5 w-3.5 animate-sparkle text-accent-amber" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
