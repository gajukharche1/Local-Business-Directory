"use client";

import { Phone, MessageCircle, Navigation, Globe, Send } from "lucide-react";

interface ActionBreakdownProps {
  breakdown: {
    calls: number;
    whatsapp: number;
    directions: number;
    website: number;
    enquiries: number;
  };
  totalActions: number;
}

export function AnalyticsBreakdownBar({ breakdown, totalActions }: ActionBreakdownProps) {
  const safeTotal = totalActions > 0 ? totalActions : 1;

  const items = [
    {
      key: "calls",
      label: "Phone Calls",
      count: breakdown.calls,
      pct: Math.round((breakdown.calls / safeTotal) * 100),
      color: "bg-emerald-500",
      textColor: "text-emerald-700 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      icon: Phone,
    },
    {
      key: "whatsapp",
      label: "WhatsApp Chats",
      count: breakdown.whatsapp,
      pct: Math.round((breakdown.whatsapp / safeTotal) * 100),
      color: "bg-[#25D366]",
      textColor: "text-[#20BD5A] dark:text-[#25D366]",
      bgColor: "bg-[#25D366]/10",
      borderColor: "border-[#25D366]/20",
      icon: MessageCircle,
    },
    {
      key: "directions",
      label: "Map Directions",
      count: breakdown.directions,
      pct: Math.round((breakdown.directions / safeTotal) * 100),
      color: "bg-amber-500",
      textColor: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      icon: Navigation,
    },
    {
      key: "website",
      label: "Website Clicks",
      count: breakdown.website,
      pct: Math.round((breakdown.website / safeTotal) * 100),
      color: "bg-blue-500",
      textColor: "text-blue-700 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      icon: Globe,
    },
    {
      key: "enquiries",
      label: "Direct Leads",
      count: breakdown.enquiries,
      pct: Math.round((breakdown.enquiries / safeTotal) * 100),
      color: "bg-purple-500",
      textColor: "text-purple-700 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      icon: Send,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Segmented Stacked Bar */}
      <div className="h-4 w-full rounded-full bg-muted/60 overflow-hidden flex shadow-inner">
        {totalActions === 0 ? (
          <div className="h-full w-full bg-muted/40" />
        ) : (
          items.map(
            (item) =>
              item.count > 0 && (
                <div
                  key={item.key}
                  style={{ width: `${(item.count / safeTotal) * 100}%` }}
                  className={`h-full ${item.color} transition-all duration-300`}
                  title={`${item.label}: ${item.count} (${item.pct}%)`}
                />
              )
          )
        )}
      </div>

      {/* Grid of Action Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={`p-3 rounded-2xl border ${item.borderColor} ${item.bgColor} flex flex-col justify-between space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground">{item.label}</span>
                <Icon className={`h-3.5 w-3.5 ${item.textColor}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black font-mono tabular-nums text-foreground">
                  {item.count}
                </span>
                <span className={`text-[10px] font-bold font-mono ${item.textColor}`}>
                  {totalActions > 0 ? `${item.pct}%` : "0%"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
