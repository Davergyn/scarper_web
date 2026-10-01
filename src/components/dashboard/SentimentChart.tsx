import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

type ChartType = 'donut' | 'bar';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-2.5 text-sm shadow-xl">
        <p className="font-semibold text-surface-900 dark:text-white">{payload[0].name}</p>
        <p className="text-surface-200/60 dark:text-surface-200/40">
          Count: <span className="font-bold text-brand-400">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function SentimentChart() {
  const { sentimentData } = useAppStore();
  const [chartType, setChartType] = useState<ChartType>('donut');

  if (sentimentData.length === 0) return null;

  const total = sentimentData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      className="glass-card p-6 animate-fade-in-up"
      style={{ animationDelay: '0.3s' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-surface-900 dark:text-white">
            Sentiment Analysis
          </h3>
          <p className="text-xs text-surface-200/50 dark:text-surface-200/30">
            Distribution of {total.toLocaleString()} analyzed items
          </p>
        </div>

        {/* Chart Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-surface-200/20 p-1 dark:border-white/[0.06]">
          <button
            onClick={() => setChartType('donut')}
            className={cn(
              'rounded-md p-1.5 transition-all',
              chartType === 'donut'
                ? 'bg-brand-500/10 text-brand-400'
                : 'text-surface-200/40 hover:text-surface-200/60 dark:text-surface-200/30'
            )}
          >
            <PieIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={cn(
              'rounded-md p-1.5 transition-all',
              chartType === 'bar'
                ? 'bg-brand-500/10 text-brand-400'
                : 'text-surface-200/40 hover:text-surface-200/60 dark:text-surface-200/30'
            )}
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'donut' ? (
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs font-medium text-surface-200/60 dark:text-surface-200/40">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          ) : (
            <BarChart data={sentimentData} barSize={40}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'rgba(148,163,184,0.6)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'rgba(148,163,184,0.4)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {sentimentData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Stats Row */}
      <div className="mt-4 flex gap-4 justify-center">
        {sentimentData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs font-medium text-surface-200/60 dark:text-surface-200/40">
              {item.name}:{' '}
              <span className="font-bold text-surface-900 dark:text-white">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
