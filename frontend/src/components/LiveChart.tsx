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
  UTCTimestamp,
} from "lightweight-charts";
import { Maximize2, Minimize2, Minus, TrendingUp, Trash2 } from "lucide-react";
import clsx from "clsx";

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
  accentColor?: string;
}

type DrawMode = "none" | "level" | "trendline";

// BULLETPROOF DATA SANITIZER
function processData(data: any[]) {
  if (!data || data.length === 0) return [];

  const validData = data.filter((d) => d !== null && d !== undefined);

  const processed = validData.map((d, i) => {
    let t = i; // Fallback to index if time is corrupt
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

  // Deduplicate and strictly sort ascending
  const uniqueMap = new Map();
  processed.forEach((d) => uniqueMap.set(d.time, d));
  const sorted = Array.from(uniqueMap.values()).sort((a, b) => a.time - b.time);

  // Anchor to a valid UNIX base epoch so the chart engine never rejects small integers
  const BASE_EPOCH = 1700000000;
  return sorted.map((d) => ({
    time: (BASE_EPOCH + d.time * 60) as UTCTimestamp, // *60 creates distinct clean intervals
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
  accentColor = "#3b82f6",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const mainRef = useRef<ISeriesApi<"Area"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const sma9Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const sma20Ref = useRef<ISeriesApi<"Line"> | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawMode, setDrawMode] = useState<DrawMode>("none");
  const [trendlineStart, setTrendlineStart] = useState<{ time: UTCTimestamp; price: number } | null>(null);

  const linesRef = useRef<ISeriesApi<"Line">[]>([]);
  const priceLinesRef = useRef<any[]>([]);

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
      crosshair: { mode: 1 },
      rightPriceScale: { 
        borderColor: "rgba(255,255,255,0.1)",
        scaleMargins: { top: 0.08, bottom: 0.22 }
      },
      timeScale: {
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        borderColor: "rgba(255,255,255,0.1)",
        barSpacing: 7,
        minBarSpacing: 3,
        rightOffset: 6,
      },
      handleScroll: true,
      handleScale: true,
    });

    // Main Price Line (Area Gradient for Premium Look)
    const mainSeries = chart.addSeries(AreaSeries, {
      lineColor: accentColor,
      topColor: accentColor + "60", // Adds 60 hex opacity
      bottomColor: accentColor + "00", // Transparent
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    // Volume Series (Isolated to the bottom with breathing room from time axis)
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

    chartRef.current = chart;
    mainRef.current = mainSeries;
    volumeRef.current = volumeSeries;
    sma9Ref.current = sma9Series;
    sma20Ref.current = sma20Series;

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || height
        });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [height, accentColor]); // Removed isFullscreen so it doesn't recreate the chart on toggle

  // Chart interactivity (Drawings)
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !mainRef.current) return;

    const clickHandler = (param: any) => {
      if (!param.point || !param.time) return;
      const price = mainRef.current?.coordinateToPrice(param.point.y);
      if (price === null || price === undefined) return;

      if (drawMode === "level") {
        const line = mainRef.current?.createPriceLine({
          price: price,
          color: "rgba(255, 255, 255, 0.5)",
          lineWidth: 1,
          lineStyle: 1,
          axisLabelVisible: true,
        });
        priceLinesRef.current.push(line);
        setDrawMode("none");
      } else if (drawMode === "trendline") {
        if (!trendlineStart) {
          setTrendlineStart({ time: param.time, price });
        } else {
          const lineSeries = chart.addSeries(LineSeries, {
            color: "rgba(255, 255, 255, 0.7)",
            lineWidth: 2,
            lastValueVisible: false,
            priceLineVisible: false,
          });
          lineSeries.setData([
            { time: trendlineStart.time, value: trendlineStart.price },
            { time: param.time, value: price },
          ].sort((a, b) => (a.time as number) - (b.time as number)));
          linesRef.current.push(lineSeries);
          setTrendlineStart(null);
          setDrawMode("none");
        }
      }
    };

    chart.subscribeClick(clickHandler);
    return () => chart.unsubscribeClick(clickHandler);
  }, [drawMode, trendlineStart]);

  // Toggle series visibility
  useEffect(() => {
    if (sma9Ref.current) sma9Ref.current.applyOptions({ visible: showSma9 });
    if (sma20Ref.current) sma20Ref.current.applyOptions({ visible: showSma20 });
  }, [showSma9, showSma20]);

  // UPDATE DATA SAFELY
  useEffect(() => {
    if (!mainRef.current || priceHistory.length === 0) return;

    try {
      const cleanPrice = processData(priceHistory);
      mainRef.current.setData(cleanPrice);

      if (volumeRef.current && volumeHistory.length > 0) {
        const cleanVolume = processData(volumeHistory);

        // Color volume based on safely processed price data
        const coloredVolume = cleanVolume.map((v, i) => {
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

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const clearDrawings = () => {
    linesRef.current.forEach(series => chartRef.current?.removeSeries(series));
    linesRef.current = [];
    priceLinesRef.current.forEach(line => mainRef.current?.removePriceLine(line));
    priceLinesRef.current = [];
    setTrendlineStart(null);
    setDrawMode("none");
  };

  return (
    <div
      ref={chartWrapperRef}
      className={clsx(
        "flex flex-col gap-2 transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 p-6 bg-[#0B1120]/95 backdrop-blur-xl" : "relative w-full"
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="text-xs font-bold text-slate-500 tracking-wider">LIVE PRICE ACTION</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawMode(drawMode === "level" ? "none" : "level")}
            className={clsx("p-1.5 rounded-lg border transition-colors", drawMode === "level" ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "bg-[#111827] border-white/10 text-slate-500 hover:text-white")}
            title="Mark Level"
          ><Minus size={16} /></button>
          <button
            onClick={() => { setDrawMode(drawMode === "trendline" ? "none" : "trendline"); setTrendlineStart(null); }}
            className={clsx("p-1.5 rounded-lg border transition-colors", drawMode === "trendline" ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "bg-[#111827] border-white/10 text-slate-500 hover:text-white")}
            title="Draw Trendline"
          ><TrendingUp size={16} /></button>
          <button
            onClick={clearDrawings}
            className="p-1.5 rounded-lg border bg-[#111827] border-white/10 text-slate-500 hover:text-red-400 transition-colors"
            title="Clear Drawings"
          ><Trash2 size={16} /></button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg border bg-[#111827] border-white/10 text-slate-500 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >{isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
        </div>
      </div>

      <div 
        ref={containerRef} 
        className={clsx("w-full rounded-xl overflow-hidden", isFullscreen ? "flex-1" : (className || "h-[290px] sm:h-[350px] lg:h-[400px]"))} 
        style={{ height: isFullscreen ? undefined : (className ? undefined : height) }} 
      />
      {drawMode !== "none" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none animate-pulse">
          {drawMode === "level" ? "Click to place level" : trendlineStart ? "Click to place end point" : "Click to place start point"}
        </div>
      )}
    </div>
  );
}