import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { ScrapedRow, SentimentType } from '@/types';

const sentimentBadge: Record<SentimentType, { bg: string; text: string; dot: string }> = {
  positive: {
    bg: 'bg-accent-emerald/10',
    text: 'text-accent-emerald',
    dot: 'bg-accent-emerald',
  },
  negative: {
    bg: 'bg-accent-rose/10',
    text: 'text-accent-rose',
    dot: 'bg-accent-rose',
  },
  neutral: {
    bg: 'bg-brand-500/10',
    text: 'text-brand-400',
    dot: 'bg-brand-400',
  },
};

type SortKey = 'title' | 'sentiment' | 'score' | 'date';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 5;

export function DataTable() {
  const { tableData } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSentiment, setFilterSentiment] = useState<SentimentType | 'all'>('all');

  const filtered = useMemo(() => {
    let data = [...tableData];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (row) =>
          row.title.toLowerCase().includes(q) ||
          row.content.toLowerCase().includes(q) ||
          row.source.toLowerCase().includes(q)
      );
    }

    // Filter by sentiment
    if (filterSentiment !== 'all') {
      data = data.filter((row) => row.sentiment === filterSentiment);
    }

    // Sort
    data.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'sentiment':
          cmp = a.sentiment.localeCompare(b.sentiment);
          break;
        case 'score':
          cmp = a.score - b.score;
          break;
        case 'date':
          cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return data;
  }, [tableData, searchQuery, sortKey, sortDir, filterSentiment]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function handleExportCSV() {
    const headers = ['Title', 'Source', 'Sentiment', 'Score', 'Date', 'Content'];
    const rows = filtered.map((r) => [
      r.title,
      r.source,
      r.sentiment,
      r.score.toString(),
      r.date,
      r.content,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webintel_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (tableData.length === 0) return null;

  return (
    <div
      className="glass-card overflow-hidden animate-fade-in-up"
      style={{ animationDelay: '0.5s' }}
    >
      {/* Table Header */}
      <div className="flex flex-col gap-3 border-b border-surface-200/20 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.04]">
        <div>
          <h3 className="text-sm font-bold text-surface-900 dark:text-white">
            Extracted Data
          </h3>
          <p className="text-xs text-surface-200/50 dark:text-surface-200/30">
            {filtered.length} of {tableData.length} records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sentiment Filter */}
          <div className="flex items-center gap-1 rounded-lg border border-surface-200/20 p-1 dark:border-white/[0.06]">
            {(['all', 'positive', 'negative', 'neutral'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setFilterSentiment(s);
                  setCurrentPage(1);
                }}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all',
                  filterSentiment === s
                    ? 'bg-brand-500/10 text-brand-400'
                    : 'text-surface-200/40 hover:text-surface-200/60 dark:text-surface-200/30'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-surface-200/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search data..."
              className={cn(
                'h-8 w-48 rounded-lg border bg-transparent pl-8 pr-3 text-xs font-medium outline-none',
                'border-surface-200/20 placeholder:text-surface-200/30 focus:border-brand-400/40',
                'dark:border-white/[0.06] dark:text-white dark:focus:border-brand-400/40'
              )}
            />
          </div>

          {/* Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-surface-200/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-surface-200/60 transition-all hover:border-brand-400/30 hover:text-brand-400 dark:border-white/[0.06] dark:text-surface-200/40"
          >
            <Download className="h-3 w-3" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200/10 dark:border-white/[0.03]">
              {[
                { key: 'title' as SortKey, label: 'Title / Content' },
                { key: 'sentiment' as SortKey, label: 'Sentiment' },
                { key: 'score' as SortKey, label: 'Score' },
                { key: 'date' as SortKey, label: 'Date' },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="cursor-pointer px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-200/50 transition-colors hover:text-brand-400 dark:text-surface-200/30"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              ))}
              <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-200/50 dark:text-surface-200/30">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => {
              const badge = sentimentBadge[row.sentiment];
              return (
                <tr
                  key={row.id}
                  className={cn(
                    'group border-b transition-colors',
                    'border-surface-200/10 hover:bg-brand-500/[0.02]',
                    'dark:border-white/[0.02] dark:hover:bg-brand-500/[0.03]'
                  )}
                >
                  {/* Title */}
                  <td className="max-w-xs px-5 py-3.5">
                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                      {row.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-surface-200/50 dark:text-surface-200/30">
                      {row.content}
                    </p>
                  </td>

                  {/* Sentiment */}
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
                        badge.bg,
                        badge.text
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', badge.dot)} />
                      {row.sentiment}
                    </span>
                  </td>

                  {/* Score */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-200/10 dark:bg-white/[0.04]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${row.score * 100}%`,
                            backgroundColor:
                              row.score > 0.6
                                ? '#10b981'
                                : row.score > 0.3
                                ? '#f59e0b'
                                : '#ef4444',
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums text-surface-200/60 dark:text-surface-200/40">
                        {row.score.toFixed(2)}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium text-surface-200/50 dark:text-surface-200/30">
                      {new Date(row.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>

                  {/* Source */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-surface-200/50 dark:text-surface-200/30">
                        {row.source}
                      </span>
                      {row.url && (
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-surface-200/20 opacity-0 transition-all hover:text-brand-400 group-hover:opacity-100"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-surface-200/10 px-5 py-3 dark:border-white/[0.03]">
          <p className="text-xs text-surface-200/40 dark:text-surface-200/20">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg p-1.5 text-surface-200/40 transition-colors hover:bg-brand-500/10 hover:text-brand-400 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'h-7 w-7 rounded-lg text-xs font-semibold transition-all',
                  currentPage === page
                    ? 'bg-brand-500/10 text-brand-400'
                    : 'text-surface-200/40 hover:bg-brand-500/5 hover:text-brand-400 dark:text-surface-200/20'
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg p-1.5 text-surface-200/40 transition-colors hover:bg-brand-500/10 hover:text-brand-400 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
