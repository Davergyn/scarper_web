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
import {
  mockAIInsight,
  mockFiles,
  mockKPIStats,
  mockSentimentData,
  mockTableData,
} from '@/mock/data';

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
  startProcessing: () => void;
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
  startProcessing: () => {
    const { url } = get();
    if (!url.trim()) return;

    set({ status: 'processing', progress: 0 });

    // Simulate progressive loading
    const steps = [12, 25, 38, 50, 62, 75, 88, 95, 100];
    let step = 0;

    const interval = setInterval(() => {
      if (step < steps.length) {
        set({ progress: steps[step] });
        step++;
      } else {
        clearInterval(interval);
        set({
          status: 'completed',
          progress: 100,
          aiInsight: mockAIInsight,
          kpiStats: mockKPIStats,
          sentimentData: mockSentimentData,
          tableData: mockTableData,
          files: mockFiles,
          processedTime: 4.2,
        });
      }
    }, 350);
  },

  reset: () =>
    set({
      status: 'idle',
      progress: 0,
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
