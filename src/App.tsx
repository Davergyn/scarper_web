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

function App() {
  const { status } = useAppStore();
  const showResults = status === 'completed';

  return (
    <div className="relative min-h-screen">
      {/* Background Pattern */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Top gradient */}
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-500/[0.07] to-transparent blur-3xl" />
        {/* Bottom left orb */}
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-accent-violet/[0.04] blur-3xl" />
        {/* Bottom right orb */}
        <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-accent-cyan/[0.04] blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <CommandBar />

        <main className="mx-auto max-w-7xl space-y-6 px-4 pb-24 sm:px-6 lg:px-8">
          {/* Processing State */}
          <ProgressOverlay />

          {/* Empty State */}
          <EmptyState />

          {/* Results - Executive Summary */}
          {showResults && (
            <>
              {/* Top Layer: AI Insight + KPI */}
              <section className="space-y-6">
                <AIInsightCard />
                <KPICards />
              </section>

              {/* Middle Layer: Chart + Files */}
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <SentimentChart />
                <FileGrid />
              </section>

              {/* Bottom Layer: Data Table */}
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
