import {
  Activity,
  Moon,
  RotateCcw,
  Sun,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export function Header() {
  const { theme, toggleTheme, apiConnected, status, reset } = useAppStore();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient line at top */}
      <div className="h-[2px] bg-gradient-to-r from-brand-500 via-accent-violet to-accent-cyan" />

      <div className="glass-card-elevated rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet shadow-lg">
              <Zap className="h-5 w-5 text-white" />
              <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface-950 bg-accent-emerald dark:border-surface-950">
                <div className="h-full w-full animate-pulse-ring rounded-full bg-accent-emerald" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight sm:text-lg">
                <span className="bg-gradient-to-r from-brand-400 to-accent-cyan bg-clip-text text-transparent">
                  WebIntel
                </span>{' '}
                <span className="text-surface-900 dark:text-white">AI</span>
              </h1>
              <p className="hidden text-[10px] font-medium tracking-wider text-surface-200/80 uppercase sm:block dark:text-surface-200/40">
                Smart Web Scraper
              </p>
            </div>
          </div>

          {/* Center - Status */}
          <div className="hidden items-center gap-6 md:flex">
            {/* API Status */}
            <div className="flex items-center gap-2">
              {apiConnected ? (
                <Wifi className="h-3.5 w-3.5 text-accent-emerald" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-accent-rose" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  apiConnected
                    ? 'text-accent-emerald'
                    : 'text-accent-rose'
                )}
              >
                {apiConnected ? 'API Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Activity Status */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  status === 'processing'
                    ? 'animate-pulse bg-accent-amber'
                    : status === 'completed'
                    ? 'bg-accent-emerald'
                    : status === 'error'
                    ? 'bg-accent-rose'
                    : 'bg-surface-200 dark:bg-surface-700'
                )}
              />
              <span className="text-xs font-medium text-surface-200 dark:text-surface-200/60">
                {status === 'processing'
                  ? 'Processing...'
                  : status === 'completed'
                  ? 'Completed'
                  : status === 'error'
                  ? 'Error'
                  : 'Idle'}
              </span>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            {(status === 'completed' || status === 'error') && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-surface-200 transition-all hover:bg-surface-200/10 hover:text-brand-400 dark:text-surface-200/60 dark:hover:text-brand-400"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* Mobile Status */}
            <div className="flex items-center gap-1.5 md:hidden">
              <Activity
                className={cn(
                  'h-4 w-4',
                  status === 'processing'
                    ? 'animate-pulse text-accent-amber'
                    : 'text-surface-200/40'
                )}
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-surface-200/20 transition-all duration-300 hover:border-brand-400/30 hover:bg-brand-500/10 dark:border-white/[0.06] dark:hover:border-brand-400/30"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-accent-amber transition-transform hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 text-brand-500 transition-transform hover:-rotate-12" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
