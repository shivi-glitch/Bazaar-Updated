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
}

const DEFAULT_R1_PRICES: Record<string, [number, number]> = {
  "RELI-X": [245000, 1000],
  "INFY-Z": [152000, 1200],
  "HDFC-W": [168000, 1100],
  "BZR-V": [32000, 2500],
  "PULSE": [11500, 3000],
  "GOLDCORE": [620000, 500],
  "TATA-Y": [98000, 1500]
};

export const useMarketStore = create<MarketState>((set) => ({
  connected: false,
  sessionState: "LOCKED",
  currentSession: 1, 
  serverTime: 0,
  globalTick: 0,
  prices: DEFAULT_R1_PRICES,
  priceHistory: {},
  orderBooks: {},
  news: [],
  latestToast: null,
  portfolioData: null,
  setConnected: (status) => set({ connected: status }),
  clearToast: () => set({ latestToast: null }),
  setPortfolioData: (data) => set({ portfolioData: data }),
  updateFromMessage: (msg) => {
    if (msg.type === "hello") {
      set((state) => {
        const isNewSession = msg.g && msg.g !== state.currentSession;
        const initialPrices = (msg.prices && Object.keys(msg.prices).length > 0) ? msg.prices : state.prices;
        return { 
          sessionState: msg.state, 
          serverTime: msg.server_time, 
          currentSession: msg.g || 1,
          globalTick: typeof msg.n === 'number' ? msg.n : 0,
          priceHistory: isNewSession ? {} : state.priceHistory,
          prices: initialPrices
        };
      });
    } else if (msg.type === "session") {
      set((state) => {
        const isNewSession = msg.g !== undefined && msg.g !== state.currentSession;
        const isRestart = msg.state === 'STARTING' || msg.state === 'READY';
        return { 
          sessionState: msg.state, 
          currentSession: msg.g !== undefined ? msg.g : state.currentSession,
          globalTick: typeof msg.n === 'number' ? msg.n : (isRestart ? 0 : state.globalTick),
          priceHistory: (isNewSession || isRestart) ? {} : state.priceHistory
        };
      });
    } else if (msg.type === "tick") {
      set((state) => {
        const isNewSession = msg.g !== undefined && msg.g !== state.currentSession;
        const nextTick = typeof msg.n === 'number' ? msg.n : (state.globalTick + 1);
        const newHistory = isNewSession ? {} : { ...state.priceHistory };
        const newBooks = isNewSession ? {} : { ...state.orderBooks };
        
        // msg.prices format: { "RELI-X": [price_paise, volume, bids, asks], ... }
        Object.entries(msg.prices as Record<string, any[]>).forEach(([ticker, data]) => {
          let currentArr = isNewSession ? [] : (state.priceHistory[ticker] || []);
          
          // If time jumped backwards (e.g. session restarted or switched), purge previous session history
          if (currentArr.length > 0) {
            const lastTime = currentArr[currentArr.length - 1].time;
            if (nextTick < lastTime) {
              currentArr = [];
            } else if (nextTick === lastTime) {
              // Ignore duplicate ticks to prevent resetting the history
              return;
            }
          }

          const updatedArr = [...currentArr, { 
            time: nextTick, 
            value: data[0],
            volume: data[1]
          }];
          
          if (updatedArr.length > 300) updatedArr.shift(); 
          newHistory[ticker] = updatedArr;
          
          // Capture the bot-generated bids and asks
          if (data[2] && data[3]) {
            newBooks[ticker] = { bids: data[2], asks: data[3] };
          }
        });
        
        return { 
          prices: { ...state.prices, ...msg.prices }, 
          priceHistory: newHistory,
          orderBooks: newBooks,
          globalTick: nextTick,
          currentSession: msg.g !== undefined ? msg.g : state.currentSession
        };
      });
    } else if (msg.type === "news") {
      const newItem: NewsItem = { id: msg.id, source: msg.source, text: msg.text, ticker: msg.ticker, timestamp: Date.now() };
      set((state) => {
        if (state.news.some(n => n.id === newItem.id)) return state;
        return { news: [newItem, ...state.news], latestToast: newItem };
      });
    }
  },
}));
