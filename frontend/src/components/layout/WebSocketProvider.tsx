"use client";

import { useEffect, useRef } from "react";
import { useMarketStore } from "@/store/marketStore";
import { useRouter, usePathname } from "next/navigation";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const updateFromMessage = useMarketStore((s) => s.updateFromMessage);
  const setConnected = useMarketStore((s) => s.setConnected);
  const sessionState = useMarketStore((s) => s.sessionState);
  const currentSession = useMarketStore((s) => s.currentSession);
  
  const router = useRouter();
  const pathname = usePathname();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("merx_token");
    if (!token) return;

    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const wsBase = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws";
      ws.current = new WebSocket(`${wsBase}?token=${token}`);

      ws.current.onopen = () => setConnected(true);
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          updateFromMessage(data);
        } catch (e) {}
      };

      ws.current.onclose = () => {
        setConnected(false);
        reconnectTimeout = setTimeout(connect, 2000); 
      };

      ws.current.onerror = () => {
        // Only force close if it's actually open to avoid Strict Mode warnings
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.close();
        }
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect loop on unmount
        if (ws.current.readyState === WebSocket.OPEN) {
          ws.current.close();
        }
      }
    };
  }, [setConnected, updateFromMessage]);

  useEffect(() => {
    if (pathname === "/" || pathname === "/login" || pathname === "/admin") return; 
    
    const token = localStorage.getItem("merx_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // NEW: Endgame Routing Logic
    if (currentSession === 11 && sessionState === "FINISHED" && pathname !== "/podium") {
      router.push("/podium");
    }
  }, [pathname, router, currentSession, sessionState]);

  return <>{children}</>;
}