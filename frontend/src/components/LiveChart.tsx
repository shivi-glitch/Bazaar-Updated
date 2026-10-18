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

interface ReticleState {
  x: number;
  y: number;
  price: number;
  time: UTCTimestamp;
  formattedDate: string;
}

interface TrendlineAnchor {
  x: number;
  y: number;
  price: number;
  time: UTCTimestamp;
}

// 18-MONTH TIMELINE MATHEMATICS:
// Curriculum: 12 sessions = 18 months (Jan 1, 2025 to Jun 25, 2026).
// Each session represents 1.5 months (45 days = 3,888,000 seconds).
// In each 200-tick session, each tick advances 19,440 seconds (5.4 hours).
// d.time from backend is continuous_t = (g - 1) * 201 + n.
// Tick 0 = Jan 1, 2025 (1735689600 UTC).
// Tick 200 = Feb 15, 2025 (end of Session 1).
// Tick 201 = Feb 15, 2025 (start of Session 2). Tick 401 = Mar 31, 2025 (end of Session 2).
// Tick 2400 = Jun 25, 2026 (Session 12 finish).
const BASE_EPOCH = 1735689600; // Jan 1, 2025 00:00:00 UTC
const SECONDS_PER_TICK = 19440; // 45 days / 200 ticks = 5.4 hours per tick

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDateTick(time: any): string | null {
  const tSec = typeof time === "number" ? time : Number(time);
  if (!tSec || isNaN(tSec)) return null;
  const date = new Date(tSec * 1000);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = MONTH_NAMES[date.getUTCMonth()];
  return `${day} ${month}`;
}

function formatFullDate(time: any): string {
  const tSec = typeof time === "number" ? time : Number(time);
  if (!tSec || isNaN(tSec)) return "";
  const date = new Date(tSec * 1000);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = MONTH_NAMES[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

export function processData(data: any[]) {
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
    return { rawTime: t, value: val };
  });

  const uniqueMap = new Map<number, { rawTime: number; value: number }>();
  processed.forEach((d) => uniqueMap.set(d.rawTime, d));
  const sorted = Array.from(uniqueMap.values()).sort((a, b) => a.rawTime - b.rawTime);

  return sorted.map((d) => ({
    time: (BASE_EPOCH + d.rawTime * SECONDS_PER_TICK) as UTCTimestamp,
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
  const marketPricePaise = useMarketStore((s) => s.prices[stockId]?.[0] || 0);
  const effectivePricePaise = currentPricePaise ?? marketPricePaise;

  // Drawing tools state
  const [drawMode, setDrawMode] = useState<DrawMode>("none");
  const [reticle, setReticle] = useState<ReticleState | null>(null);
  const [trendlineStart, setTrendlineStart] = useState<TrendlineAnchor | null>(null);
  const [pointerPrice, setPointerPrice] = useState<number | null>(null);
  const [, setDrawingsCount] = useState<number>(0);

  // Synchronized refs
  const drawModeRef = useRef<DrawMode>("none");
  const reticleRef = useRef<ReticleState | null>(null);
  const trendlineStartRef = useRef<TrendlineAnchor | null>(null);
  const cleanDataRef = useRef<Array<{ time: UTCTimestamp; value: number }>>([]);
  const linesRef = useRef<ISeriesApi<"Line">[]>([]);
  const priceLinesRef = useRef<any[]>([]);
  const drawingsOrderRef = useRef<DrawingItem[]>([]);
  const isPointerDownRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pointerLastRef = useRef<{ x: number; y: number } | null>(null);
  const hasMovedRef = useRef(false);

  useEffect(() => {
    drawModeRef.current = drawMode;
    reticleRef.current = reticle;
    trendlineStartRef.current = trendlineStart;
  }, [drawMode, reticle, trendlineStart]);

  // Mobile Visual Viewport Handling for Fullscreen
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

  // Fullscreen Handlers
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (drawModeRef.current !== "none") {
          toggleDrawMode("none");
        } else if (isChartFullscreen) {
          handleExitFullscreen();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isChartFullscreen]);

  // Calculate chart price and time coordinates from pixel X, Y
  const getCoordinatesFromPixel = (
    x: number,
    y: number
  ): { price: number; time: UTCTimestamp; formattedDate: string } | null => {
    const chart = chartRef.current;
    const series = mainRef.current;
    const clean = cleanDataRef.current;
    if (!chart || !series || clean.length === 0) return null;

    const price = series.coordinateToPrice(y);
    if (price === null || price === undefined || isNaN(price)) return null;

    let time = chart.timeScale().coordinateToTime(x) as UTCTimestamp | null;

    if (!time) {
      const logical = chart.timeScale().coordinateToLogical(x);
      if (logical !== null) {
        const idx = Math.max(0, Math.min(clean.length - 1, Math.round(logical)));
        time = clean[idx]?.time ?? null;
      }
    }
    if (!time) {
      const width = containerRef.current?.clientWidth || 500;
      const ratio = Math.max(0, Math.min(1, x / width));
      const idx = Math.min(clean.length - 1, Math.floor(ratio * clean.length));
      time = clean[idx]?.time ?? clean[clean.length - 1].time;
    }

    return {
      price: Number(price.toFixed(2)),
      time: time as UTCTimestamp,
      formattedDate: formatFullDate(time),
    };
  };

  // Toggle drawing tools and manage pointer capture / chart scrolling
  const toggleDrawMode = (mode: "level" | "trendline" | "none") => {
    const next = mode === "none" || drawMode === mode ? "none" : mode;
    drawModeRef.current = next;
    setDrawMode(next);
    setTrendlineStart(null);
    trendlineStartRef.current = null;

    if (next === "none") {
      setReticle(null);
      reticleRef.current = null;
      chartRef.current?.applyOptions({ handleScroll: true, handleScale: true });
    } else {
      // Disable scrolling so drag moves reticle pointer instead of panning chart
      chartRef.current?.applyOptions({ handleScroll: false, handleScale: false });

      // Initialize reticle in chart center
      const width = containerRef.current?.clientWidth || 400;
      const height = containerRef.current?.clientHeight || 300;
      const initX = Math.round(width * 0.5);
      const initY = Math.round(height * 0.5);
      const coords = getCoordinatesFromPixel(initX, initY);
      if (coords) {
        const initReticle: ReticleState = {
          x: initX,
          y: initY,
          price: coords.price,
          time: coords.time,
          formattedDate: coords.formattedDate,
        };
        setReticle(initReticle);
        reticleRef.current = initReticle;
        setPointerPrice(coords.price);
      }
    }
  };

  // Confirm point placement (used by both canvas tap and header button)
  const confirmPoint = (customX?: number, customY?: number) => {
    const currentMode = drawModeRef.current;
    if (currentMode === "none") return;
    const chart = chartRef.current;
    const main = mainRef.current;
    if (!chart || !main) return;

    const currentReticle = reticleRef.current;
    const targetX = customX ?? currentReticle?.x ?? (containerRef.current?.clientWidth || 400) / 2;
    const targetY = customY ?? currentReticle?.y ?? (containerRef.current?.clientHeight || 300) / 2;

    const coords = getCoordinatesFromPixel(targetX, targetY);
    if (!coords) return;

    if (currentMode === "level") {
      const line = main.createPriceLine({
        price: coords.price,
        color: "#38bdf8",
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
      });
      if (line) {
        priceLinesRef.current.push(line);
        drawingsOrderRef.current.push({ type: "level", item: line });
        setDrawingsCount((c) => c + 1);
      }
      toggleDrawMode("none");
    } else if (currentMode === "trendline") {
      if (!trendlineStartRef.current) {
        // Anchor Point 1
        const startAnchor: TrendlineAnchor = {
          x: targetX,
          y: targetY,
          price: coords.price,
          time: coords.time,
        };
        trendlineStartRef.current = startAnchor;
        setTrendlineStart(startAnchor);
      } else {
        // Anchor Point 2 & build permanent white trendline
        let t1 = trendlineStartRef.current.time as number;
        let t2 = coords.time as number;
        const p1 = trendlineStartRef.current.price;
        const p2 = coords.price;

        if (t1 === t2) {
          t2 = t1 + SECONDS_PER_TICK;
        }

        const lineSeries = chart.addSeries(LineSeries, {
          color: "#ffffff",
          lineWidth: 2,
          lastValueVisible: false,
          priceLineVisible: false,
          crosshairMarkerVisible: false,
        });

        const points = [
          { time: t1 as UTCTimestamp, value: p1 },
          { time: t2 as UTCTimestamp, value: p2 },
        ].sort((a, b) => (a.time as number) - (b.time as number));

        lineSeries.setData(points);
        linesRef.current.push(lineSeries);
        drawingsOrderRef.current.push({ type: "trendline", item: lineSeries });
        setDrawingsCount((c) => c + 1);

        toggleDrawMode("none");
      }
    }
  };

  // Groww-style touchpad sliding & tap detection
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drawModeRef.current !== "none") {
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch (err) {}
      isPointerDownRef.current = true;
      pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
      pointerLastRef.current = { x: e.clientX, y: e.clientY };
      hasMovedRef.current = false;
      // Note: Pointer stays centered/preserved without jumping to touch coordinates!
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drawModeRef.current !== "none") {
      if (!isPointerDownRef.current || !pointerLastRef.current) {
        // Desktop mouse hover when mouse button is not held
        if (e.pointerType === "mouse" && !isPointerDownRef.current) {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
          const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
          const coords = getCoordinatesFromPixel(x, y);
          if (coords) {
            const nextReticle: ReticleState = {
              x,
              y,
              price: coords.price,
              time: coords.time,
              formattedDate: coords.formattedDate,
            };
            setReticle(nextReticle);
            reticleRef.current = nextReticle;
            setPointerPrice(coords.price);
          }
        }
        return;
      }

      // Dragging / Sliding on screen (Groww-style relative motion)
      const dx = e.clientX - pointerLastRef.current.x;
      const dy = e.clientY - pointerLastRef.current.y;
      pointerLastRef.current = { x: e.clientX, y: e.clientY };

      const totalDist = Math.hypot(
        e.clientX - (pointerStartRef.current?.x ?? e.clientX),
        e.clientY - (pointerStartRef.current?.y ?? e.clientY)
      );
      if (totalDist > 6) {
        hasMovedRef.current = true;
      }

      if (!containerRef.current || !reticleRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      // Displace reticle by finger delta (sliding from anywhere on screen)
      const newX = Math.max(0, Math.min(rect.width, reticleRef.current.x + dx));
      const newY = Math.max(0, Math.min(rect.height, reticleRef.current.y + dy));

      const coords = getCoordinatesFromPixel(newX, newY);
      if (coords) {
        const nextReticle: ReticleState = {
          x: newX,
          y: newY,
          price: coords.price,
          time: coords.time,
          formattedDate: coords.formattedDate,
        };
        setReticle(nextReticle);
        reticleRef.current = nextReticle;
        setPointerPrice(coords.price);
      }
    } else {
      if (!mainRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      if (y >= 0 && y <= rect.height) {
        const p = mainRef.current.coordinateToPrice(y);
        if (p !== null && !isNaN(p)) {
          setPointerPrice(Number(p.toFixed(2)));
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drawModeRef.current !== "none") {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}

      const wasDown = isPointerDownRef.current;
      isPointerDownRef.current = false;

      if (!wasDown || !pointerStartRef.current) return;

      const duration = Date.now() - pointerStartRef.current.time;
      const dist = Math.hypot(
        e.clientX - pointerStartRef.current.x,
        e.clientY - pointerStartRef.current.y
      );

      // Tap detection:
      // If user tapped on screen (short tap < 350ms or minimal movement < 12px)
      if (!hasMovedRef.current || (duration < 350 && dist < 12)) {
        confirmPoint();
      }
    }
  };

  const handlePointerCancel = () => {
    isPointerDownRef.current = false;
  };

  const handlePointerLeave = () => {
    if (drawModeRef.current === "none") {
      setPointerPrice(null);
    }
  };

  // Initialize Lightweight Charts
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
        mode: CrosshairMode.Normal,
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
        timeFormatter: formatFullDate,
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.1)",
        scaleMargins: { top: 0.08, bottom: 0.22 },
      },
      timeScale: {
        visible: true,
        timeVisible: false, // Forces clean calendar date tick grouping
        secondsVisible: false,
        borderColor: "rgba(255,255,255,0.1)",
        barSpacing: 8,
        minBarSpacing: 3,
        rightOffset: 6,
        tickMarkFormatter: formatDateTick,
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

    // Crosshair listener for normal hover readout
    chart.subscribeCrosshairMove((param) => {
      if (drawModeRef.current !== "none") return;
      if (!param.point || param.point.x < 0 || param.point.y < 0) {
        setPointerPrice(null);
        return;
      }
      const price = mainSeries.coordinateToPrice(param.point.y);
      if (price !== null && price !== undefined && !isNaN(price)) {
        setPointerPrice(Number(price.toFixed(2)));
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

  // Toggle SMA visibility
  useEffect(() => {
    if (sma9Ref.current) sma9Ref.current.applyOptions({ visible: showSma9 });
    if (sma20Ref.current) sma20Ref.current.applyOptions({ visible: showSma20 });
  }, [showSma9, showSma20]);

  // Update data safely across 18-month simulation timeline
  useEffect(() => {
    if (!mainRef.current || priceHistory.length === 0) return;

    try {
      const cleanPrice = processData(priceHistory);
      cleanDataRef.current = cleanPrice;
      mainRef.current.setData(cleanPrice);

      if (volumeRef.current && volumeHistory.length > 0) {
        const cleanVolume = processData(volumeHistory);
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

      if (sma9Ref.current) sma9Ref.current.setData(processData(sma9History));
      if (sma20Ref.current) sma20Ref.current.setData(processData(sma20History));

    } catch (err) {
      console.error("LW Charts SetData Error gracefully caught:", err);
    }
  }, [priceHistory, volumeHistory, sma9History, sma20History]);

  const undoLastDrawing = () => {
    if (trendlineStartRef.current) {
      trendlineStartRef.current = null;
      setTrendlineStart(null);
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
    linesRef.current.forEach((series) => chartRef.current?.removeSeries(series));
    linesRef.current = [];
    priceLinesRef.current.forEach((line) => mainRef.current?.removePriceLine(line));
    priceLinesRef.current = [];
    drawingsOrderRef.current = [];
    toggleDrawMode("none");
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

          {/* Middle Spacer */}
          <div className="flex-1" />

          {/* Right: Technical Tools (Icon-only, No Text!) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
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

            {/* Level Marking Tool */}
            <button
              onClick={() => toggleDrawMode("level")}
              className={clsx(
                "p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer",
                drawMode === "level"
                  ? "bg-sky-500/20 border-sky-500/40 text-sky-400"
                  : "bg-[#111827] border-white/10 text-slate-400 hover:text-white"
              )}
              title="Mark Horizontal Level"
              aria-label="Mark Level"
            >
              <Minus size={16} />
            </button>

            {/* Trendline Tool */}
            <button
              onClick={() => toggleDrawMode("trendline")}
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
              onClick={() => toggleDrawMode("level")}
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
              onClick={() => toggleDrawMode("trendline")}
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

      {/* ─── CHART CANVAS CONTAINER & INTERACTIVE RETICLE OVERLAY ─── */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
        className={clsx(
          "w-full transition-all duration-200 relative overflow-hidden select-none",
          drawMode !== "none" ? "cursor-crosshair" : "cursor-default",
          isChartFullscreen
            ? "flex-1 min-h-0"
            : (className || "h-[290px] sm:h-[350px] lg:h-[400px] rounded-xl")
        )}
        style={{
          height: isChartFullscreen ? undefined : (className ? undefined : height),
          touchAction: drawMode !== "none" ? "none" : "auto",
        }}
      >
        {/* ─── CLEAN RETICLE & DRAWING OVERLAY ─── */}
        {drawMode !== "none" && reticle && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
              {/* Horizontal Crosshair Line */}
              <line
                x1={0}
                y1={reticle.y}
                x2="100%"
                y2={reticle.y}
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Vertical Crosshair Line */}
              <line
                x1={reticle.x}
                y1={0}
                x2={reticle.x}
                y2="100%"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Live Trendline Stretching between Point 1 and Pointer */}
              {drawMode === "trendline" && trendlineStart && (
                <>
                  {(() => {
                    const p1X = chartRef.current?.timeScale().timeToCoordinate(trendlineStart.time) ?? trendlineStart.x;
                    const p1Y = mainRef.current?.priceToCoordinate(trendlineStart.price) ?? trendlineStart.y;
                    return (
                      <>
                        <line
                          x1={p1X}
                          y1={p1Y}
                          x2={reticle.x}
                          y2={reticle.y}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        {/* Point 1 Clean Anchor Dot */}
                        <circle
                          cx={p1X}
                          cy={p1Y}
                          r="4"
                          fill="#ffffff"
                          stroke="#070b12"
                          strokeWidth="1.5"
                        />
                      </>
                    );
                  })()}
                </>
              )}

              {/* Minimalist Pointer Dot at Crosshair Junction */}
              <circle
                cx={reticle.x}
                cy={reticle.y}
                r="3.5"
                fill="#ffffff"
                stroke="#070b12"
                strokeWidth="1"
              />
            </svg>

            {/* Price Tag Badge on Right Axis */}
            <div
              className="absolute right-0 pointer-events-none transform -translate-y-1/2 bg-[#00D4AA] text-[#070b12] text-[11px] font-mono font-bold px-2 py-0.5 rounded-l shadow-lg z-30"
              style={{ top: reticle.y }}
            >
              ₹{reticle.price.toFixed(2)}
            </div>

            {/* Date Tag Badge on Bottom Axis */}
            <div
              className="absolute bottom-0 pointer-events-none transform -translate-x-1/2 bg-[#111827] border border-white/20 text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded-t shadow-lg z-30 whitespace-nowrap"
              style={{
                left: Math.max(50, Math.min((containerRef.current?.clientWidth || 300) - 50, reticle.x)),
              }}
            >
              {reticle.formattedDate}
            </div>
          </div>
        )}
      </div>

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