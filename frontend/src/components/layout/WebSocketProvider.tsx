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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const connect = () => {
      if (typeof window === "undefined" || !isSubscribed) return;
      const token = localStorage.getItem("merx_token");
      
      if (!token) {
        if (ws.current) {
          try {
            ws.current.onclose = null;
            ws.current.close();
          } catch (e) {}
          ws.current = null;
        }
        setConnected(false);
        return;
      }

      // If already connected or connecting, do not duplicate
      if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
        return;
      }

      try {
        const wsBase = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws";
        const socket = new WebSocket(`${wsBase}?token=${token}`);
        ws.current = socket;

        socket.onopen = () => {
          if (isSubscribed && ws.current === socket) {
            setConnected(true);
          }
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type !== "pong") {
              updateFromMessage(data);
            }
          } catch (e) {}
        };

        socket.onclose = (event: CloseEvent) => {
          if (ws.current === socket) {
            setConnected(false);
            ws.current = null;
            if (event.code === 1008) {
              // Token invalid or expired - clear and redirect to login
              if (typeof window !== "undefined") {
                localStorage.removeItem("merx_token");
              }
              if (pathname !== "/" && pathname !== "/login" && pathname !== "/admin") {
                router.push("/login");
              }
              return;
            }
            if (isSubscribed && localStorage.getItem("merx_token")) {
              if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = setTimeout(connect, 1500);
            }
          }
        };

        socket.onerror = () => {
          try {
            socket.close();
          } catch (e) {}
        };
      } catch (err) {}
    };

    // Run connection attempt
    connect();

    // Ping interval to keep connection alive through NAT / idle timeouts
    pingIntervalRef.current = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        try {
          ws.current.send(JSON.stringify({ type: "ping" }));
        } catch (e) {}
      } else if (localStorage.getItem("merx_token")) {
        connect();
      }
    }, 5000);

    const handleAuthChange = () => connect();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") connect();
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("merx_auth_change", handleAuthChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isSubscribed = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("merx_auth_change", handleAuthChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (ws.current) {
        ws.current.onclose = null;
        if (ws.current.readyState === WebSocket.OPEN) {
          ws.current.close();
        }
      }
    };
  }, [pathname, setConnected, updateFromMessage]);

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