import {
  Database,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  database: <Database className="h-5 w-5" />,
  'trending-up': <TrendingUp className="h-5 w-5" />,
  'trending-down': <TrendingDown className="h-5 w-5" />,
  clock: <Clock className="h-5 w-5" />,
};

const colorMap: Record<number, { gradient: string; text: string; bg: string }> = {
  0: {
    gradient: 'from-brand-500 to-accent-violet',
    text: 'text-brand-400',
    bg: 'bg-brand-500/10',
  },
  1: {
    gradient: 'from-accent-emerald to-teal-400',
    text: 'text-accent-emerald',
    bg: 'bg-accent-emerald/10',
  },
  2: {
    gradient: 'from-accent-rose to-pink-400',
    text: 'text-accent-rose',
    bg: 'bg-accent-rose/10',
  },
  3: {
    gradient: 'from-accent-cyan to-blue-400',
    text: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10',
  },
};

export function KPICards() {
  const { kpiStats } = useAppStore();

  if (kpiStats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      {kpiStats.map((stat, i) => {
        const colors = colorMap[i] || colorMap[0];
        return (
          <div
            key={stat.label}
            className="glass-card group relative overflow-hidden p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            {/* Background Gradient Orb */}
            <div
              className={cn(
                'absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20',
                `bg-gradient-to-br ${colors.gradient}`
              )}
            />

            {/* Icon */}
            <div
              className={cn(
                'mb-3 flex h-10 w-10 items-center justify-center rounded-xl',
                colors.bg,
                colors.text
              )}
            >
              {iconMap[stat.icon] || <Database className="h-5 w-5" />}
            </div>

            {/* Value */}
            <p className="text-2xl font-extrabold tracking-tight text-surface-900 sm:text-3xl dark:text-white">
              {stat.value}
            </p>

            {/* Label */}
            <p className="mt-1 text-xs font-medium text-surface-200/60 dark:text-surface-200/40">
              {stat.label}
            </p>

            {/* Change */}
            {stat.change && (
              <div className="mt-2 flex items-center gap-1">
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="h-3 w-3 text-accent-emerald" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-accent-rose" />
                )}
                <span
                  className={cn(
                    'text-xs font-semibold',
                    stat.changeType === 'positive'
                      ? 'text-accent-emerald'
                      : 'text-accent-rose'
                  )}
                >
                  {stat.change}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
