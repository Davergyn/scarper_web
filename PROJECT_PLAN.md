# Project Plan: WebIntel AI (Smart Web Scraper UI)

## 1. Project Overview
A lightweight, modern, and high-performance Dashboard UI for an "AI-Powered Web Scraper & Intelligence Agent".
The UI allows users to input URLs, select extraction modes, type natural language prompts, view AI insights, explore charts, download batch files, and filter scraped data tables.

## 2. Tech Stack & Rules
- **Build Tool:** Vite + React (TypeScript)
- **Package Manager:** `pnpm` (STRICTLY USE `pnpm`, do not use `npm` or `yarn`)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **Icons:** Lucide React
- **Charts:** Recharts
- **State Management:** Zustand

## 3. Directory Structure Target
```text
src/
├── components/
│   ├── ui/             # Shadcn UI primitives
│   ├── layout/         # Header, Footer, Navigation
│   ├── input/          # Unified Command Bar & Mode Selector
│   ├── dashboard/      # KPI Cards, Recharts, File List, Data Table
│   └── chat/           # Floating Conversational Assistant
├── store/              # Zustand state handlers
├── types/              # TypeScript interfaces
└── mock/               # Dummy scraping data for UI testing