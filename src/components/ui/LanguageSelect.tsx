"use client";

import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { LANGUAGES, type Lang } from "@/lib/i18n/messages";
import { cn } from "@/lib/cn";

export function LanguageSelect({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div className={cn("relative", className)}>
      <select
        aria-label={t("login.language")}
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-transparent bg-slate-50 pl-3.5 pr-9 text-[13.5px] text-text-primary transition-colors hover:bg-slate-100 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
    </div>
  );
}
