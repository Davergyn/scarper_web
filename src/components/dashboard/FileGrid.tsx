import {
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  PackageCheck,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

function getFileIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-accent-rose" />;
    case 'excel':
    case 'csv':
      return <FileSpreadsheet className="h-5 w-5 text-accent-emerald" />;
    case 'image':
      return <FileImage className="h-5 w-5 text-accent-violet" />;
    case 'word':
      return <FileText className="h-5 w-5 text-blue-500" />;
    default:
      return <File className="h-5 w-5 text-surface-200/50" />;
  }
}

export function FileGrid() {
  const { files, mode } = useAppStore();

  // Show file grid for document harvester mode or when files are available
  if (files.length === 0) return null;

  return (
    <div
      className="glass-card p-6 animate-fade-in-up"
      style={{ animationDelay: '0.4s' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-violet/10">
            <PackageCheck className="h-5 w-5 text-accent-violet" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-900 dark:text-white">
              Extracted Files
            </h3>
            <p className="text-xs text-surface-200/50 dark:text-surface-200/30">
              {files.length} files found
            </p>
          </div>
        </div>

        <button
          className={cn(
            'flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all',
            'border-brand-500/30 bg-brand-500/10 text-brand-400',
            'hover:bg-brand-500/20 hover:shadow-md'
          )}
        >
          <Download className="h-3.5 w-3.5" />
          Download All as ZIP
        </button>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              'group flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-200',
              'border-surface-200/20 hover:border-brand-400/30 hover:bg-brand-500/5',
              'dark:border-white/[0.04] dark:hover:border-brand-400/20 dark:hover:bg-brand-500/5'
            )}
          >
            {/* File Icon */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-surface-200/10 dark:bg-white/[0.04]">
              {getFileIcon(file.type)}
            </div>

            {/* File Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-surface-900 dark:text-white">
                {file.name}
              </p>
              <p className="text-[10px] text-surface-200/50 dark:text-surface-200/30">
                {file.type} • {file.size}
              </p>
            </div>

            {/* Download Button */}
            <button className="flex-shrink-0 rounded-lg p-2 text-surface-200/30 opacity-0 transition-all hover:bg-brand-500/10 hover:text-brand-400 group-hover:opacity-100">
              <Download className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
