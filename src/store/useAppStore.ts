import { create } from 'zustand';
import type {
  AIInsight,
  ChatMessage,
  FileItem,
  KPIStat,
  ProcessingStatus,
  ScrapedRow,
  ScrapingMode,
  SentimentData,
} from '@/types';

// Backend API base URL
const API_BASE_URL = 'http://localhost:8000';

interface AppState {
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Connection
  apiConnected: boolean;

  // Input State
  url: string;
  setUrl: (url: string) => void;
  mode: ScrapingMode;
  setMode: (mode: ScrapingMode) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;

  // Processing
  status: ProcessingStatus;
  progress: number;
  errorMessage: string | null;

  // Results
  aiInsight: AIInsight | null;
  kpiStats: KPIStat[];
  sentimentData: SentimentData[];
  tableData: ScrapedRow[];
  files: FileItem[];
  processedTime: number;

  // Chat
  chatOpen: boolean;
  toggleChat: () => void;
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;

  // Actions
  checkApiConnection: () => Promise<void>;
  startProcessing: () => Promise<void>;
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Theme
  theme: 'dark',
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    set({ theme: newTheme });
  },

  // Connection
  apiConnected: true,

  // Input State
  url: '',
  setUrl: (url: string) => set({ url }),
  mode: 'auto',
  setMode: (mode: ScrapingMode) => set({ mode }),
  prompt: '',
  setPrompt: (prompt: string) => set({ prompt }),

  // Processing
  status: 'idle',
  progress: 0,
  errorMessage: null,

  // Results
  aiInsight: null,
  kpiStats: [],
  sentimentData: [],
  tableData: [],
  files: [],
  processedTime: 0,

  // Chat
  chatOpen: false,
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  chatMessages: [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Halo! 👋 Saya adalah asisten AI WebIntel. Saya bisa membantu Anda menganalisis data lebih lanjut, membuat ringkasan, atau menjawab pertanyaan tentang hasil scraping. Apa yang bisa saya bantu?',
      timestamp: new Date(),
    },
  ],
  addChatMessage: (message) =>
    set((s) => ({
      chatMessages: [
        ...s.chatMessages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),

  // Actions
  checkApiConnection: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(5000) });
      set({ apiConnected: res.ok });
    } catch {
      set({ apiConnected: false });
    }
  },

  startProcessing: async () => {
    const { url, mode, prompt } = get();
    if (!url.trim()) return;

    set({ status: 'processing', progress: 0, errorMessage: null });

    // Animate progress while waiting for backend response
    const progressSteps = [5, 12, 20, 30, 40, 50, 55, 60, 65, 70];
    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        set({ progress: progressSteps[stepIndex] });
        stepIndex++;
      }
    }, 800);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, mode, prompt }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const errorMsg =
          errorBody?.detail?.error ||
          errorBody?.detail ||
          `Server error: ${response.status} ${response.statusText}`;
        throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }

      // Animate to 90% before parsing
      set({ progress: 90 });

      const data = await response.json();

      // Small delay for smooth UX transition
      await new Promise((r) => setTimeout(r, 300));

      set({
        status: 'completed',
        progress: 100,
        aiInsight: data.aiInsight ?? null,
        kpiStats: data.kpiStats ?? [],
        sentimentData: data.sentimentData ?? [],
        tableData: data.tableData ?? [],
        files: data.files ?? [],
        processedTime: data.processedTime ?? 0,
      });
    } catch (error) {
      clearInterval(progressInterval);
      const message =
        error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
      console.error('[WebIntel] Scraping failed:', message);
      set({
        status: 'error',
        progress: 0,
        errorMessage: message,
      });
    }
  },

  reset: () =>
    set({
      status: 'idle',
      progress: 0,
      errorMessage: null,
      aiInsight: null,
      kpiStats: [],
      sentimentData: [],
      tableData: [],
      files: [],
      processedTime: 0,
      url: '',
      prompt: '',
      mode: 'auto',
    }),
}));
