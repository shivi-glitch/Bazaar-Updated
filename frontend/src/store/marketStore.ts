import { create } from 'zustand';

interface NewsItem {
  id: string;
  source: string;
  text: string;
  ticker: string;
  timestamp: number;
}

export interface HistoryPoint {
  time: number;
  value: number;
  volume: number; // Captured directly from backend message data[1]
}

export interface OrderBook {
  bids: [number, number][]; // [price, size]
  asks: [number, number][];
}

interface MarketState {
  connected: boolean;
  sessionState: string;
  currentSession: number;
  serverTime: number;
  globalTick: number;
  remainingSeconds: number | null;
  prices: Record<string, [number, number]>;
  priceHistory: Record<string, HistoryPoint[]>; 
  orderBooks: Record<string, OrderBook>;
  news: NewsItem[];
  latestToast: NewsItem | null;
  portfolioData: any | null;
  setConnected: (status: boolean) => void;
  clearToast: () => void;
  updateFromMessage: (msg: any) => void;
  setPortfolioData: (data: any) => void;
  updateSessionFromPoll: (sessionData: { state: string; g: number; n?: number; is_frozen?: boolean }) => void;
  setPriceHistory: (history: Record<string, HistoryPoint[]>) => void;
  clearPriceHistory: () => void;
  isChartFullscreen: boolean;
  setChartFullscreen: (isFullscreen: boolean) => void;
}

const DEFAULT_R1_PRICES: Record<string, [number, number]> = {
  "RLNT": [245000, 1000],
  "TYRL": [88000, 1500],
  "INFN": [152000, 1200],
  "HRZN": [164000, 1100],
  "BZR-V": [64000, 2500],
  "GOLDCORE": [620000, 500],
  "PULSE": [85000, 3000]
};

export const useMarketStore = create<MarketState>((set) => ({
  connected: false,
  sessionState: "LOCKED",
  currentSession: 1, 
  serverTime: 0,
  globalTick: 0,
  remainingSeconds: null,
  prices: DEFAULT_R1_PRICES,
  priceHistory: {},
  orderBooks: {},
  news: [],
  latestToast: null,
  portfolioData: null,
  isChartFullscreen: false,
  setChartFullscreen: (isFullscreen) => set({ isChartFullscreen: isFullscreen }),
  setConnected: (status) => set({ connected: status }),
  clearToast: () => set({ latestToast: null }),
  setPortfolioData: (data) => set({ portfolioData: data }),
  setPriceHistory: (history) => set({ priceHistory: history }),
  clearPriceHistory: () => set({ priceHistory: {} }),
  updateSessionFromPoll: (sessionData) => {
    set((state) => {
      if (
        state.sessionState !== sessionData.state ||
        (sessionData.g !== undefined && state.currentSession !== sessionData.g)
      ) {
        return {
          sessionState: sessionData.state,
          currentSession: sessionData.g !== undefined ? sessionData.g : state.currentSession,
          globalTick: typeof sessionData.n === 'number' ? sessionData.n : state.globalTick,
          priceHistory: state.priceHistory
        };
      }
      return state;
    });
  },
  updateFromMessage: (msg) => {
    if (msg.type === "hello") {
      set((state) => {
        const initialPrices = (msg.prices && Object.keys(msg.prices).length > 0) ? msg.prices : state.prices;
        return { 
          sessionState: msg.state, 
          serverTime: msg.server_time, 
          currentSession: msg.g !== undefined ? msg.g : state.currentSession,
          globalTick: typeof msg.n === 'number' ? msg.n : state.globalTick,
          remainingSeconds: typeof msg.remaining_seconds === 'number' ? msg.remaining_seconds : state.remainingSeconds,
          priceHistory: state.priceHistory,
          prices: initialPrices
        };
      });
    } else if (msg.type === "session") {
      set((state) => {
        const updatedPrices = (msg.prices && Object.keys(msg.prices).length > 0)
          ? msg.prices
          : state.prices;
        return { 
          sessionState: msg.state, 
          currentSession: msg.g !== undefined ? msg.g : state.currentSession,
          globalTick: typeof msg.n === 'number' ? msg.n : state.globalTick,
          remainingSeconds: typeof msg.remaining_seconds === 'number' ? msg.remaining_seconds : state.remainingSeconds,
          priceHistory: state.priceHistory,
          prices: updatedPrices
        };
      });
    } else if (msg.type === "reset") {
      set(() => ({
        sessionState: msg.state || "READY",
        currentSession: msg.g !== undefined ? msg.g : 1,
        globalTick: 0,
        remainingSeconds: 300,
        priceHistory: {},
        prices: msg.prices || DEFAULT_R1_PRICES,
        orderBooks: {}
      }));
    } else if (msg.type === "price_history" && msg.history) {
      set((state) => {
        const mergedHistory: Record<string, HistoryPoint[]> = { ...state.priceHistory };
        Object.entries(msg.history as Record<string, HistoryPoint[]>).forEach(([ticker, points]) => {
          if (!Array.isArray(points)) return;
          const existing = mergedHistory[ticker] || [];
          const pointMap = new Map<number, HistoryPoint>();
          existing.forEach(p => pointMap.set(p.time, p));
          points.forEach(p => pointMap.set(p.time, p));
          const sorted = Array.from(pointMap.values()).sort((a, b) => a.time - b.time);
          mergedHistory[ticker] = sorted.slice(-5000);
        });
        return { priceHistory: mergedHistory };
      });
    } else if (msg.type === "tick") {
      set((state) => {
        const g = msg.g || state.currentSession || 1;
        const n = typeof msg.n === 'number' ? msg.n : state.globalTick;
        const rem = typeof msg.remaining_seconds === 'number'
          ? msg.remaining_seconds
          : Math.max(0, Math.floor((200 - n) * 1.5));
        const continuousTime = (g - 1) * 201 + Math.min(200, n);
        const newHistory = { ...state.priceHistory };
        const newBooks = { ...state.orderBooks };
        
        // msg.prices format: { "RLNT": [price_paise, volume, bids, asks], ... }
        Object.entries(msg.prices as Record<string, any[]>).forEach(([ticker, data]) => {
          let currentArr = state.priceHistory[ticker] ? [...state.priceHistory[ticker]] : [];
          
          if (currentArr.length > 0) {
            const lastTime = currentArr[currentArr.length - 1].time;
            if (continuousTime <= lastTime) {
              return;
            }
          }

          currentArr.push({ 
            time: continuousTime, 
            value: data[0],
            volume: data[1]
          });
          
          if (currentArr.length > 5000) currentArr.shift(); 
          newHistory[ticker] = currentArr;
          
          // Capture the bot-generated bids and asks
          if (data[2] && data[3]) {
            newBooks[ticker] = { bids: data[2], asks: data[3] };
          }
        });
        
        return { 
          prices: { ...state.prices, ...msg.prices }, 
          priceHistory: newHistory,
          orderBooks: newBooks,
          globalTick: n,
          remainingSeconds: rem,
          currentSession: g
        };
      });
    } else if (msg.type === "news") {
      const newItem: NewsItem = { id: msg.id, source: msg.source, text: msg.text, ticker: msg.ticker, timestamp: Date.now() };
      set((state) => {
        if (state.news.some(n => n.id === newItem.id)) return state;
        return { news: [newItem, ...state.news], latestToast: newItem };
      });
    } else if (msg.type === "news_history" && Array.isArray(msg.news)) {
      set((state) => {
        const existingIds = new Set(state.news.map(n => n.id));
        const newItems = msg.news.filter((n: any) => !existingIds.has(n.id));
        // Keep existing news, prepend newer items or maintain chronological order
        return { news: [...state.news, ...newItems] };
      });
    }
  },
}));
