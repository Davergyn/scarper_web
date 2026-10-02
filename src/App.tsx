import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { CommandBar } from '@/components/input/CommandBar';
import { ProgressOverlay } from '@/components/dashboard/ProgressOverlay';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { KPICards } from '@/components/dashboard/KPICards';
import { SentimentChart } from '@/components/dashboard/SentimentChart';
import { FileGrid } from '@/components/dashboard/FileGrid';
import { DataTable } from '@/components/dashboard/DataTable';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { useAppStore } from '@/store/useAppStore';
import { AlertTriangle, RotateCcw } from 'lucide-react';

function App() {
  const { status, errorMessage, checkApiConnection, reset } = useAppStore();
  const showResults = status === 'completed';

  // Cek koneksi backend saat aplikasi pertama kali dimuat
  useEffect(() => {
    checkApiConnection();
  }, [checkApiConnection]);

  // Apply tema dari localStorage saat pertama load
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background Pattern */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-500/[0.07] to-transparent blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-accent-violet/[0.04] blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-accent-cyan/[0.04] blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <CommandBar />

        <main className="mx-auto max-w-7xl space-y-6 px-4 pb-24 sm:px-6 lg:px-8">
          {/* Processing State */}
          <ProgressOverlay />

          {/* Error State */}
          {status === 'error' && (
            <div className="glass-card mx-auto max-w-4xl animate-fade-in p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent-rose/10">
                  <AlertTriangle className="h-5 w-5 text-accent-rose" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white">
                    Scraping Gagal
                  </h3>
                  <p className="mt-1 text-sm text-surface-200/60 dark:text-surface-200/40">
                    {errorMessage ?? 'Terjadi kesalahan saat memproses URL. Pastikan backend berjalan dan URL valid.'}
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-accent-rose transition-all hover:bg-accent-rose/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          <EmptyState />

          {/* Results */}
          {showResults && (
            <>
              <section className="space-y-6">
                <AIInsightCard />
                <KPICards />
              </section>

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <SentimentChart />
                <FileGrid />
              </section>

              <section>
                <DataTable />
              </section>
            </>
          )}
        </main>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

export default App;
