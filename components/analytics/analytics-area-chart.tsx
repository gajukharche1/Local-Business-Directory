"use client";

import { useState } from "react";
import { DailyDataPoint } from "@/lib/services/analytics.service";

interface AnalyticsAreaChartProps {
  data: DailyDataPoint[];
  height?: number;
}

export function AnalyticsAreaChart({ data, height = 280 }: AnalyticsAreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 text-xs text-muted-foreground"
      >
        No activity recorded in this period yet.
      </div>
    );
  }

  const padding = { top: 24, right: 20, bottom: 36, left: 40 };
  const width = 800; // Reference coordinate viewBox

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.pageViews, d.actions)),
    10
  );
  // Round up maxVal for clean grid lines
  const ceiling = Math.ceil(maxVal * 1.15);

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const pointsViews = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * innerWidth;
    const y = padding.top + innerHeight - (d.pageViews / ceiling) * innerHeight;
    return { x, y, data: d };
  });

  const pointsActions = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * innerWidth;
    const y = padding.top + innerHeight - (d.actions / ceiling) * innerHeight;
    return { x, y, data: d };
  });

  // Construct SVG polygon/paths
  const makePath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return "";
    return points.reduce(
      (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
      ""
    );
  };

  const makeAreaPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return "";
    const line = makePath(points);
    const bottomY = padding.top + innerHeight;
    const firstX = points[0]?.x ?? 0;
    const lastX = points[points.length - 1]?.x ?? 0;
    return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const viewsLine = makePath(pointsViews);
  const viewsArea = makeAreaPath(pointsViews);

  const actionsLine = makePath(pointsActions);
  const actionsArea = makeAreaPath(pointsActions);

  // Y-axis grid ticks (4 steps)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    val: Math.round(ceiling * pct),
    y: padding.top + innerHeight - pct * innerHeight,
  }));

  // X-axis label stride based on point count
  const labelStride = Math.ceil(data.length / 7);

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="relative w-full space-y-3">
      {/* Legend & Hover Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-xs" />
            <span className="font-semibold text-foreground">Page Views</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" />
            <span className="font-semibold text-foreground">Customer CTAs</span>
          </div>
        </div>

        {activePoint ? (
          <div className="font-mono text-xs text-foreground bg-muted/60 px-3 py-1 rounded-lg border border-border/60">
            <span className="font-bold text-muted-foreground mr-2">{activePoint.date}:</span>
            <span className="text-blue-600 font-extrabold mr-3">{activePoint.pageViews} views</span>
            <span className="text-emerald-600 font-extrabold">{activePoint.actions} actions</span>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground">Hover points to view daily metrics</span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="actionsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y-Labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="currentColor"
                className="text-border/40"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-muted-foreground"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Area fills */}
          <path d={viewsArea} fill="url(#viewsGradient)" />
          <path d={actionsArea} fill="url(#actionsGradient)" />

          {/* Lines */}
          <path
            d={viewsLine}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={actionsLine}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Hover Columns & Dots */}
          {pointsViews.map((p, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Transparent hit area */}
                <rect
                  x={p.x - innerWidth / (data.length * 2)}
                  y={padding.top}
                  width={innerWidth / data.length}
                  height={innerHeight}
                  fill="transparent"
                />

                {isHovered && (
                  <line
                    x1={p.x}
                    y1={padding.top}
                    x2={p.x}
                    y2={padding.top + innerHeight}
                    stroke="currentColor"
                    className="text-foreground/40"
                    strokeWidth="1.5"
                  />
                )}

                {/* Dots on hover */}
                {isHovered && (
                  <>
                    <circle cx={p.x} cy={p.y} r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                    <circle
                      cx={p.x}
                      cy={pointsActions[i]?.y ?? p.y}
                      r="5"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* X-axis Date Labels */}
          {data.map((d, i) => {
            if (i % labelStride !== 0 && i !== data.length - 1) return null;
            const x = padding.left + (i / (data.length - 1 || 1)) * innerWidth;
            const label = d.date.slice(5); // MM-DD
            return (
              <text
                key={i}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="text-[10px] font-mono fill-muted-foreground"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
