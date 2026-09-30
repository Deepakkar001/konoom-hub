"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<{
  push: (kind: ToastKind, message: string) => void;
} | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const remove = (id: number) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  const ICONS: Record<ToastKind, React.ReactNode> = {
    success: <CheckCircle2 className="h-4 w-4 text-success-600" />,
    error: <XCircle className="h-4 w-4 text-danger-600" />,
    info: <Info className="h-4 w-4 text-info-600" />,
  };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed start-1/2 top-5 z-[100] flex w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "animate-fade-in pointer-events-auto flex w-full items-start gap-2.5 rounded-lg border px-4 py-3 shadow-lg",
              t.kind === "info" && "border-info-600/25 bg-info-100",
              t.kind === "success" && "border-success-600/25 bg-success-100",
              t.kind === "error" && "border-danger-600/25 bg-danger-100",
            )}
          >
            {ICONS[t.kind]}
            <p className="flex-1 text-[13px] font-semibold text-text-primary">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-text-tertiary hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
