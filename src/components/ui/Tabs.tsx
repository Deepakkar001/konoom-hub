"use client";

import { cn } from "@/lib/cn";

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative whitespace-nowrap px-3.5 py-3 text-[13.5px] font-medium transition-colors",
            active === tab.id
              ? "text-blue-600"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {tab.label}
          {active === tab.id && (
            <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-blue-600" />
          )}
        </button>
      ))}
    </div>
  );
}
