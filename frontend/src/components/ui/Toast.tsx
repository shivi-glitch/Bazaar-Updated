"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "info", onClose, duration = 4000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: "border-gain-border bg-gain-dim text-gain",
    error: "border-loss-border bg-loss-dim text-loss",
    info: "border-accent-border bg-accent-dim text-accent"
  };

  return (
    <div 
      className={clsx(
        "fixed top-4 right-4 z-toast flex flex-col overflow-hidden rounded-md border shadow-card transition-all duration-300",
        typeStyles[type],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between p-4 gap-4 bg-bg-raised/80 backdrop-blur-md">
        <span className="text-sm font-bold">{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-tx-secondary hover:text-tx-primary touch-target p-1 -m-1 rounded-sm"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div 
        className="h-1 bg-current origin-left"
        style={{ 
          animation: `scaleX ${duration}ms linear forwards`,
        }}
      />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleX {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}} />
    </div>
  );
}
