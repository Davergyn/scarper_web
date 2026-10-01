// ============================================
// WebIntel AI - Type Definitions
// ============================================

export type ScrapingMode = 'auto' | 'google-maps' | 'youtube' | 'social-media' | 'document-harvester';

export type UrlType = 'youtube' | 'google-maps' | 'social-media' | 'pdf-docs' | 'general';

export type SentimentType = 'positive' | 'negative' | 'neutral';

export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface KPIStat {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface SentimentData {
  name: string;
  value: number;
  color: string;
}

export interface ScrapedRow {
  id: string;
  title: string;
  source: string;
  sentiment: SentimentType;
  score: number;
  date: string;
  content: string;
  url?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIInsight {
  summary: string;
  keyFindings: string[];
  recommendation: string;
}

export interface ScrapingResult {
  status: ProcessingStatus;
  progress: number;
  aiInsight: AIInsight | null;
  kpiStats: KPIStat[];
  sentimentData: SentimentData[];
  tableData: ScrapedRow[];
  files: FileItem[];
  processedTime: number;
}
