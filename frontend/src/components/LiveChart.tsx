"use client";
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  TrackingModeExitMode,
  UTCTimestamp,
} from "lightweight-charts";
import { Maximize2, Minimize2, Minus, TrendingUp, Trash2, Undo2, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { useMarketStore } from "@/store/marketStore";
import { TradeBar } from "./TradeBar";

export interface PricePoint {
  time: number | string;
  value: number;
}

interface Props {
  stockId: string;
  priceHistory: PricePoint[];
  sma9History: Array<{ time: number | string; value: number } | null>;
  sma20History: Array<{ time: number | string; value: number } | null>;
  volumeHistory?: PricePoint[];
  height?: number;
  className?: string;
  showSma9?: boolean;
  showSma20?: boolean;
  onToggleSma9?: () => void;
  onToggleSma20?: () => void;
  accentColor?: string;
  currentPricePaise?: number;
  onBack?: () => void;
}

type DrawMode = "none" | "level" | "trendline";

interface DrawingItem {
  type: "level" | "trendline";
  item: any;
}

// 18-MONTH TIMELINE MATHEMATICS:
// The 12-session curriculum spans an 18-month economic timeline (Jan 1, 2025 to Jun 30, 2026).
// Each session represents 1.5 months (45 days = 3,888,000 seconds).
// In each 200-tick session, each tick advances 19,440 seconds (~5.4 hours).
// This cleanly projects realistic calendar dates (e.g. Jan 15, Feb 01) across the 18-month journey.
function processData(data: any[], session: number = 1) {
  if (!data || data.length === 0) return [];

  const validData = data.filter((d) => d !== null && d !== undefined);

  const processed = validData.map((d, i) => {
    let t = i;
    if (typeof d.time === "number" && !isNaN(d.time)) {
      t = d.time;
    } else if (typeof d.time === "string") {
      const parsed = parseInt(d.time.replace(/\D/g, ""), 10);
      if (!isNaN(parsed)) t = parsed;
    }
    let val = Number(d.value);
    if (isNaN(val)) val = 0;
    return { time: t, value: val };
  });

  const uniqueMap = new Map();
  processed.forEach((d) => uniqueMap.set(d.time, d));
  const sorted = Array.from(uniqueMap.values()).sort((a, b) => a.time - b.time);

  const BASE_EPOCH = 1735689600; // Jan 1, 2025, 00:00:00 UTC
  const SESSION_SECONDS = 45 * 86400; // 45 days per session (~1.5 months)
  const sessionStartEpoch = BASE_EPOCH + (Math.max(1, session) - 1) * SESSION_SECONDS;
  const SECONDS_PER_TICK = 19440; // 45 days / 200 ticks = 5.4 hours per tick

  return sorted.map((d) => ({
    time: (sessionStartEpoch + d.time * SECONDS_PER_TICK) as UTCTimestamp,
    value: d.value,
  }));
}

export default function LiveChart({
  stockId,
  priceHistory,
  sma9History,
  sma20History,
  volumeHistory = [],
  height = 280,
  className,
  showSma9 = true,
  showSma20 = true,
  onToggleSma9,
  onToggleSma20,
  accentColor = "#00D4AA",
  currentPricePaise,
  onBack,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const mainRef = useRef<ISeriesApi<"Area"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const sma9Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const sma20Ref = useRef<ISeriesApi<"Line"> | null>(null);

  // Global store
  const isChartFullscreen = useMarketStore((s) => s.isChartFullscreen);
  const setChartFullscreen = useMarketStore((s) => s.setChartFullscreen);
  const currentSession = useMarketStore((s) => s.currentSession);
  const marketPricePaise = useMarketStore((s) => s.prices[stockId]?.[0] || 0);
  const effectivePricePaise = currentPricePaise ?? marketPricePaise;

  const [drawMode, setDrawMode] = useState<DrawMode>("none");
  const [trendlineStart, setTrendlineStart] = useState<{ time: UTCTimestamp; price: number } | null>(null);
  const [pointerPrice, setPointerPrice] = useState<number | null>(null);
  const [, setDrawingsCount] = useState<number>(0);

  // Refs to eliminate stale closures in crosshair listeners
  const drawModeRef = useRef<DrawMode>("none");
  const trendlineStartRef = useRef<{ time: UTCTimestamp; price: number } | null>(null);
  const linesRef = useRef<ISeriesApi<"Line">[]>([]);
  const priceLinesRef = useRef<any[]>([]);
  const drawingsOrderRef = useRef<DrawingItem[]>([]);
  const previewLineRef = useRef<ISeriesApi<"Line"> | null>(null);

  // Keep refs synchronized
  useEffect(() => {
    drawModeRef.current = drawMode;
    trendlineStartRef.current = trendlineStart;
  }, [drawMode, trendlineStart]);

  // Mobile Visual Viewport Handling:
  // When mobile keyboard opens, window.visualViewport shrinks.
  // We dynamically adjust the wrapper's height and top so the bottom trading dock
  // rides above the keyboard and is never obscured!
  useEffect(() => {
    if (!isChartFullscreen) return;
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;

    const onVisualViewportChange = () => {
      if (chartWrapperRef.current) {
        chartWrapperRef.current.style.height = `${vv.height}px`;
        chartWrapperRef.current.style.top = `${vv.offsetTop}px`;
      }
    };

    vv.addEventListener("resize", onVisualViewportChange);
    vv.addEventListener("scroll", onVisualViewportChange);
    onVisualViewportChange();

    return () => {
      vv.removeEventListener("resize", onVisualViewportChange);
      vv.removeEventListener("scroll", onVisualViewportChange);
      if (chartWrapperRef.current) {
        chartWrapperRef.current.style.height = "";
        chartWrapperRef.current.style.top = "";
      }
    };
  }, [isChartFullscreen]);

  // Native Fullscreen API integration (removes browser URL/search bar like YouTube video)
  const handleEnterFullscreen = async () => {
    try {
      const elem = chartWrapperRef.current || document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        await (elem as any).mozRequestFullScreen();
      }
    } catch (err) {}
    setChartFullscreen(true);
  };

  const handleExitFullscreen = async () => {
    try {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {}
    setChartFullscreen(false);
    if (onBack) onBack();
  };

  // Sync state with native browser fullscreen changes
  useEffect(() => {
    const onFsChange = () => {
      const isNativeFs = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isNativeFs && isChartFullscreen) {
        setChartFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, [isChartFullscreen, setChartFullscreen]);

  // Escape key exits fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isChartFullscreen) {
        handleExitFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isChartFullscreen]);

  // Handle pointer tracking directly on container for touch & mouse
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mainRef.current || !containerRef.current || !chartRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const x = e.clientX - rect.left;
    if (y >= 0 && y <= rect.height) {
      const p = mainRef.current.coordinateToPrice(y);
      if (p !== null && p !== undefined && !isNaN(p)) {
        setPointerPrice(Number(p.toFixed(2)));

        // Live Trendline Preview on container pointer move
        if (drawModeRef.current === "trendline" && trendlineStartRef.current && previewLineRef.current) {
          const timeAtX = chartRef.current.timeScale().coordinateToTime(x) as number | null;
          if (timeAtX && timeAtX !== (trendlineStartRef.current.time as number)) {
            const t1 = trendlineStartRef.current.time as number;
            const t2 = timeAtX;
            const data = t1 < t2
              ? [{ time: t1 as UTCTimestamp, value: trendlineStartRef.current.price }, { time: t2 as UTCTimestamp, value: p }]
              : [{ time: t2 as UTCTimestamp, value: p }, { time: t1 as UTCTimestamp, value: trendlineStartRef.current.price }];
            try {
              previewLineRef.current.setData(data);
            } catch (err) {}
          }
        }
      }
    }
  };

  const handlePointerLeave = () => {
    setPointerPrice(null);
  };

  // Create Chart
  useEffect(() => {
    if (!containerRef.current) return;

    const initialHeight = containerRef.current.clientHeight || height;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: initialHeight,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal, // 0: Freely tracks cursor coordinate
        vertLine: {
          visible: true,
          labelVisible: true,
          color: "rgba(255, 255, 255, 0.25)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#1e293b",
        },
        horzLine: {
          visible: true,
          labelVisible: true,
          color: "rgba(255, 255, 255, 0.5)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#00D4AA",
        },
      },
      trackingMode: {
        exitMode: TrackingModeExitMode.OnTouchEnd,
      },
      localization: {
        dateFormat: "dd MMM yyyy",
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.1)",
        scaleMargins: { top: 0.08, bottom: 0.22 },
      },
      timeScale: {
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        borderColor: "rgba(255,255,255,0.1)",
        barSpacing: 8,
        minBarSpacing: 3,
        rightOffset: 6,
      },
      handleScroll: true,
      handleScale: true,
    });

    const mainSeries = chart.addSeries(AreaSeries, {
      lineColor: accentColor,
      topColor: accentColor + "60",
      bottomColor: accentColor + "00",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "rgba(255, 255, 255, 0.1)",
      priceFormat: { type: "volume" },
      priceScaleId: "vol_scale",
      lastValueVisible: false,
    });

    chart.priceScale("vol_scale").applyOptions({
      scaleMargins: { top: 0.80, bottom: 0.05 },
    });

    const sma9Series = chart.addSeries(LineSeries, {
      color: "#60a5fa",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      visible: showSma9,
    });

    const sma20Series = chart.addSeries(LineSeries, {
      color: "#34d399",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      visible: showSma20,
    });

    // Crosshair move listener: uses fresh refs to guarantee real-time trendline preview
    chart.subscribeCrosshairMove((param) => {
      if (!param.point || param.point.x < 0 || param.point.y < 0) {
        setPointerPrice(null);
        return;
      }
      const price = mainSeries.coordinateToPrice(param.point.y);
      if (price !== null && price !== undefined && !isNaN(price)) {
        setPointerPrice(Number(price.toFixed(2)));

        // Live trendline drawing preview: stretch line from 1st point to cursor
        if (drawModeRef.current === "trendline" && trendlineStartRef.current && previewLineRef.current && param.time) {
          const t1 = trendlineStartRef.current.time as number;
          const t2 = param.time as number;
          if (t1 !== t2) {
            const data = t1 < t2
              ? [{ time: t1 as UTCTimestamp, value: trendlineStartRef.current.price }, { time: t2 as UTCTimestamp, value: price }]
              : [{ time: t2 as UTCTimestamp, value: price }, { time: t1 as UTCTimestamp, value: trendlineStartRef.current.price }];
            try {
              previewLineRef.current.setData(data);
            } catch (err) {}
          }
        }
      } else {
        setPointerPrice(null);
      }
    });

    chartRef.current = chart;
    mainRef.current = mainSeries;
    volumeRef.current = volumeSeries;
    sma9Ref.current = sma9Series;
    sma20Ref.current = sma20Series;

    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || height,
        });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [height, accentColor]);

  // Resize when fullscreen state changes
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || height,
        });
      }
    };
    const t = setTimeout(handleResize, 50);
    return () => clearTimeout(t);
  }, [isChartFullscreen, height]);

  // Interactive Drawings: Level Marking and Live-Preview White Trendlines
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !mainRef.current) return;

    const clickHandler = (param: any) => {
      if (!param.point) return;
      const price = mainRef.current?.coordinateToPrice(param.point.y);
      if (price === null || price === undefined || isNaN(price)) return;

      if (drawModeRef.current === "level") {
        const formattedPrice = Number(price.toFixed(2));
        const line = mainRef.current?.createPriceLine({
          price: formattedPrice,
          color: "#38bdf8",
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title: `Lvl ₹${formattedPrice.toFixed(2)}`,
        });
        if (line) {
          priceLinesRef.current.push(line);
          drawingsOrderRef.current.push({ type: "level", item: line });
          setDrawingsCount((c) => c + 1);
        }
        drawModeRef.current = "none";
        setDrawMode("none");
      } else if (drawModeRef.current === "trendline") {
        if (!param.time) return;
        if (!trendlineStartRef.current) {
          // Fix point 1
          const startPoint = { time: param.time, price };
          trendlineStartRef.current = startPoint;
          setTrendlineStart(startPoint);

          // Immediately create the preview line series so it is ready right now
          if (!previewLineRef.current && chartRef.current) {
            previewLineRef.current = chartRef.current.addSeries(LineSeries, {
              color: "rgba(255, 255, 255, 0.85)",
              lineWidth: 2,
              lineStyle: 2,
              lastValueVisible: false,
              priceLineVisible: false,
              crosshairMarkerVisible: false,
            });
          }
        } else {
          // Fix point 2: Remove preview and create permanent white trendline (#ffffff)
          if (previewLineRef.current) {
            chart.removeSeries(previewLineRef.current);
            previewLineRef.current = null;
          }

          const lineSeries = chart.addSeries(LineSeries, {
            color: "#ffffff",
            lineWidth: 2,
            lastValueVisible: false,
            priceLineVisible: false,
            crosshairMarkerVisible: false,
          });
          lineSeries.setData([
            { time: trendlineStartRef.current.time, value: trendlineStartRef.current.price },
            { time: param.time, value: price },
          ].sort((a, b) => (a.time as number) - (b.time as number)));
          linesRef.current.push(lineSeries);
          drawingsOrderRef.current.push({ type: "trendline", item: lineSeries });
          setDrawingsCount((c) => c + 1);

          trendlineStartRef.current = null;
          setTrendlineStart(null);
          drawModeRef.current = "none";
          setDrawMode("none");
        }
      }
    };

    chart.subscribeClick(clickHandler);
    return () => {
      chart.unsubscribeClick(clickHandler);
    };
  }, []);

  // Toggle series visibility
  useEffect(() => {
    if (sma9Ref.current) sma9Ref.current.applyOptions({ visible: showSma9 });
    if (sma20Ref.current) sma20Ref.current.applyOptions({ visible: showSma20 });
  }, [showSma9, showSma20]);

  // Update data safely with 18-month session timeline
  useEffect(() => {
    if (!mainRef.current || priceHistory.length === 0) return;

    try {
      const cleanPrice = processData(priceHistory, currentSession);
      mainRef.current.setData(cleanPrice);

      if (volumeRef.current && volumeHistory.length > 0) {
        const cleanVolume = processData(volumeHistory, currentSession);

        const coloredVolume = cleanVolume.map((v) => {
          const priceMatchIdx = cleanPrice.findIndex((p) => p.time === v.time);
          let isUp = true;
          if (priceMatchIdx > 0) {
            isUp = cleanPrice[priceMatchIdx].value >= cleanPrice[priceMatchIdx - 1].value;
          }
          return {
            ...v,
            color: isUp ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'
          };
        });
        volumeRef.current.setData(coloredVolume);
      }

      if (sma9Ref.current) sma9Ref.current.setData(processData(sma9History, currentSession));
      if (sma20Ref.current) sma20Ref.current.setData(processData(sma20History, currentSession));

    } catch (err) {
      console.error("LW Charts SetData Error gracefully caught:", err);
    }
  }, [priceHistory, volumeHistory, sma9History, sma20History, currentSession]);

  const undoLastDrawing = () => {
    if (previewLineRef.current) {
      chartRef.current?.removeSeries(previewLineRef.current);
      previewLineRef.current = null;
    }
    if (trendlineStartRef.current) {
      trendlineStartRef.current = null;
      setTrendlineStart(null);
      drawModeRef.current = "none";
      setDrawMode("none");
      return;
    }
    const last = drawingsOrderRef.current.pop();
    if (!last) return;
    if (last.type === "level") {
      mainRef.current?.removePriceLine(last.item);
      priceLinesRef.current = priceLinesRef.current.filter((l) => l !== last.item);
    } else if (last.type === "trendline") {
      chartRef.current?.removeSeries(last.item);
      linesRef.current = linesRef.current.filter((s) => s !== last.item);
    }
    setDrawingsCount((c) => Math.max(0, c - 1));
  };

  const clearDrawings = () => {
    if (previewLineRef.current) {
      chartRef.current?.removeSeries(previewLineRef.current);
      previewLineRef.current = null;
    }
    linesRef.current.forEach((series) => chartRef.current?.removeSeries(series));
    linesRef.current = [];
    priceLinesRef.current.forEach((line) => mainRef.current?.removePriceLine(line));
    priceLinesRef.current = [];
    drawingsOrderRef.current = [];
    trendlineStartRef.current = null;
    setTrendlineStart(null);
    drawModeRef.current = "none";
    setDrawMode("none");
    setDrawingsCount(0);
  };

  const hasDrawings = drawingsOrderRef.current.length > 0 || trendlineStart !== null;

  return (
    <div
      ref={chartWrapperRef}
      className={clsx(
        "flex flex-col transition-all duration-200",
        isChartFullscreen
          ? "fixed inset-0 z-50 bg-[#070b12] text-tx-primary overflow-hidden"
          : "relative w-full gap-2"
      )}
    >
      {/* ─── FULLSCREEN HEADER (Minimal, Icon-only, No clumsy text) ─── */}
      {isChartFullscreen ? (
        <div className="h-11 sm:h-12 border-b border-white/10 px-3 sm:px-4 flex items-center justify-between shrink-0 bg-[#0B1120]/95 backdrop-blur-md z-30">
          {/* Left: Just the Back Icon Button (NO text!) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExitFullscreen}
              className="p-1.5 sm:p-2 rounded-lg bg-[#111827] hover:bg-[#1f293d] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shadow-xs"
              aria-label="Back"
              title={`Exit fullscreen and return to ${stockId}`}
            >
              <ArrowLeft size={17} />
            </button>
          </div>

          {/* Middle: Subtle Drawing Guidance Pill if active */}
          <div className="flex-1 flex justify-center px-2 min-w-0">
            {drawMode !== "none" && (
              <span className="text-[11px] font-mono text-accent truncate bg-accent-dim border border-accent-border px-2.5 py-0.5 rounded-full animate-pulse shadow-xs">
                {drawMode === "level"
                  ? "Tap to place level"
                  : trendlineStart
                  ? "Tap 2nd point to finish"
                  : "Tap 1st point"}
              </span>
            )}
          </div>

          {/* Right: Technical Tools (Icon-only, No Text!) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* SMA 9 / SMA 20 compact tags */}
            {onToggleSma9 && (
              <button
                onClick={onToggleSma9}
                className={clsx(
                  "px-2 py-1 text-[10px] font-mono font-bold uppercase rounded border transition-colors cursor-pointer",
                  showSma9
                    ? "bg-accent-dim border-accent-border text-accent"
                    : "bg-[#111827] border-white/10 text-slate-400 hover:text-white"
                )}
                title="Toggle SMA 9"
              >
                9
              </button>
            )}
            {onToggleSma20 && (
              <button
                onClick={onToggleSma20}
                className={clsx(
                  "px-2 py-1 text-[10px] font-mono font-bold uppercase rounded border transition-colors cursor-pointer",
                  showSma20
                    ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                    : "bg-[#111827] border-white/10 text-slate-400 hover:text-white"
                )}
                title="Toggle SMA 20"
              >
                20
              </button>
            )}

            <div className="h-4 w-px bg-white/10 mx-0.5" />

            {/* Level Marking Tool (Icon only) */}
            <button
              onClick={() => {
                const next = drawMode === "level" ? "none" : "level";
                drawModeRef.current = next;
                setDrawMode(next);
              }}
              className={clsx(
                "p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer",
                drawMode === "level"
                  ? "bg-sky-500/20 border-sky-500/40 text-sky-400"
                  : "bg-[#111827] border-white/10 text-slate-400 hover:text-white"
              )}
              title="Mark Level"
              aria-label="Mark Level"
            >
              <Minus size={16} />
            </button>

            {/* Trendline Tool (Icon only) */}
            <button
              onClick={() => {
                const next = drawMode === "trendline" ? "none" : "trendline";
                drawModeRef.current = next;
                setDrawMode(next);
                trendlineStartRef.current = null;
                setTrendlineStart(null);
                if (previewLineRef.current && chartRef.current) {
                  chartRef.current.removeSeries(previewLineRef.current);
                  previewLineRef.current = null;
                }
              }}
              className={clsx(
                "p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer",
                drawMode === "trendline"
                  ? "bg-accent-dim border-accent-border text-accent"
                  : "bg-[#111827] border-white/10 text-slate-400 hover:text-white"
              )}
              title="Draw Trendline"
              aria-label="Draw Trendline"
            >
              <TrendingUp size={16} />
            </button>

            {/* Undo Last Drawing */}
            <button
              onClick={undoLastDrawing}
              disabled={!hasDrawings}
              className="p-1.5 sm:p-2 rounded-lg border bg-[#111827] border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Undo"
              aria-label="Undo"
            >
              <Undo2 size={16} />
            </button>

            {/* Clear All Drawings */}
            <button
              onClick={clearDrawings}
              disabled={!hasDrawings}
              className="p-1.5 sm:p-2 rounded-lg border bg-[#111827] border-white/10 text-slate-400 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Clear All"
              aria-label="Clear All"
            >
              <Trash2 size={16} />
            </button>

            <div className="h-4 w-px bg-white/10 mx-0.5" />

            {/* Minimize / Exit Fullscreen Button */}
            <button
              onClick={handleExitFullscreen}
              className="p-1.5 sm:p-2 rounded-lg border bg-[#111827] border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Exit Fullscreen"
              aria-label="Exit Fullscreen"
            >
              <Minimize2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* ─── NORMAL TOOLBAR (When not in Fullscreen) ─── */
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="text-xs font-bold text-slate-500 tracking-wider">LIVE PRICE ACTION</div>
            {pointerPrice !== null && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-bg-void border border-accent/30 text-accent text-[11px] font-mono shadow-xs">
                <span>Pointer: <span className="font-bold text-tx-primary">₹{pointerPrice.toFixed(2)}</span></span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const next = drawMode === "level" ? "none" : "level";
                drawModeRef.current = next;
                setDrawMode(next);
              }}
              className={clsx(
                "p-1.5 rounded-lg border transition-colors cursor-pointer",
                drawMode === "level"
                  ? "bg-sky-500/20 border-sky-500/40 text-sky-400"
                  : "bg-[#111827] border-white/10 text-slate-500 hover:text-white"
              )}
              title="Mark Horizontal Level"
            >
              <Minus size={16} />
            </button>
            <button
              onClick={() => {
                const next = drawMode === "trendline" ? "none" : "trendline";
                drawModeRef.current = next;
                setDrawMode(next);
                trendlineStartRef.current = null;
                setTrendlineStart(null);
                if (previewLineRef.current && chartRef.current) {
                  chartRef.current.removeSeries(previewLineRef.current);
                  previewLineRef.current = null;
                }
              }}
              className={clsx(
                "p-1.5 rounded-lg border transition-colors cursor-pointer",
                drawMode === "trendline"
                  ? "bg-accent-dim border-accent-border text-accent"
                  : "bg-[#111827] border-white/10 text-slate-500 hover:text-white"
              )}
              title="Draw Trendline"
            >
              <TrendingUp size={16} />
            </button>
            <button
              onClick={undoLastDrawing}
              disabled={!hasDrawings}
              className="p-1.5 rounded-lg border bg-[#111827] border-white/10 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Undo Last Drawing"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={clearDrawings}
              disabled={!hasDrawings}
              className="p-1.5 rounded-lg border bg-[#111827] border-white/10 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Clear All Drawings"
            >
              <Trash2 size={16} />
            </button>

            <div className="w-px h-5 bg-white/10 mx-1" />

            <button
              onClick={handleEnterFullscreen}
              className="p-1.5 rounded-lg border bg-[#111827] border-white/10 text-slate-500 hover:text-white transition-colors cursor-pointer"
              title="Open Fullscreen Chart"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── CHART CANVAS CONTAINER ─── */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={clsx(
          "w-full transition-all duration-200 relative overflow-hidden",
          isChartFullscreen
            ? "flex-1 min-h-0"
            : (className || "h-[290px] sm:h-[350px] lg:h-[400px] rounded-xl")
        )}
        style={{ height: isChartFullscreen ? undefined : (className ? undefined : height) }}
      />

      {/* ─── FULLSCREEN BOTTOM TRADING DOCK ─── */}
      {isChartFullscreen && (
        <TradeBar
          ticker={stockId}
          currentPricePaise={effectivePricePaise}
          variant="fullscreen"
        />
      )}
    </div>
  );
}