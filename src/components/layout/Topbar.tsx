"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Info,
  LogOut,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/i18n-context";
import { LanguageSelect } from "@/components/ui/LanguageSelect";

export function Topbar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "settlement-review",
      titleKey: "notify.settlement.title" as const,
      descKey: "notify.settlement.desc" as const,
      timeKey: "notify.settlement.time" as const,
      kind: "warning",
      read: false,
    },
    {
      id: "corridor-complete",
      titleKey: "notify.corridor.title" as const,
      descKey: "notify.corridor.desc" as const,
      timeKey: "notify.corridor.time" as const,
      kind: "success",
      read: false,
    },
    {
      id: "partner-update",
      titleKey: "notify.partner.title" as const,
      descKey: "notify.partner.desc" as const,
      timeKey: "notify.partner.time" as const,
      kind: "info",
      read: true,
    },
    {
      id: "transaction-failed",
      titleKey: "notify.failed.title" as const,
      descKey: "notify.failed.desc" as const,
      timeKey: "notify.failed.time" as const,
      kind: "danger",
      read: true,
    },
  ]);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  function markAllNotificationsRead() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  }

  function markNotificationRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface/90 px-6 backdrop-blur">
      <div className="min-w-0">
        <h1 className="truncate text-[17px] font-semibold text-text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-[12.5px] text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        <div className="relative">
          <button
            onClick={() => setNotificationsOpen((value) => !value)}
            className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
            aria-label={t("topbar.notifications")}
            aria-expanded={notificationsOpen}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger-600" />
            )}
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute end-0 z-20 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-surface shadow-lg animate-fade-in">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div>
                    <h2 className="text-[14px] font-semibold text-text-primary">
                      {t("topbar.notifications")}
                    </h2>
                    <p className="mt-0.5 text-[11.5px] text-text-tertiary">
                      {unreadCount > 0
                        ? t(
                            unreadCount === 1
                              ? "topbar.unreadOne"
                              : "topbar.unreadMany",
                            { count: unreadCount },
                          )
                        : t("topbar.allCaughtUp")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="rounded-md px-2 py-1.5 text-[11.5px] font-medium text-blue-600 hover:bg-blue-50"
                      >
                        {t("topbar.markAllRead")}
                      </button>
                    )}
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="rounded-md p-1.5 text-text-tertiary hover:bg-surface-sunken hover:text-text-primary"
                      aria-label={t("topbar.closeNotifications")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[min(420px,calc(100vh-8rem))] overflow-y-auto">
                  {notifications.map((notification) => {
                    const Icon =
                      notification.kind === "warning"
                        ? AlertTriangle
                        : notification.kind === "success"
                          ? CheckCircle2
                          : notification.kind === "danger"
                            ? AlertTriangle
                            : Info;
                    const iconStyle =
                      notification.kind === "warning"
                        ? "bg-warning-100 text-warning-600"
                        : notification.kind === "success"
                          ? "bg-success-100 text-success-600"
                          : notification.kind === "danger"
                            ? "bg-danger-100 text-danger-600"
                            : "bg-info-100 text-info-600";

                    return (
                      <button
                        key={notification.id}
                        onClick={() => markNotificationRead(notification.id)}
                        className={cn(
                          "flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-sunken",
                          !notification.read && "bg-blue-50/50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                            iconStyle,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-[12.5px] font-medium text-text-primary">
                              {t(notification.titleKey)}
                            </span>
                            {!notification.read && (
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                            )}
                          </span>
                          <span className="mt-1 block text-[11.5px] leading-relaxed text-text-secondary">
                            {t(notification.descKey)}
                          </span>
                          <span className="mt-1.5 flex items-center gap-1 text-[10.5px] text-text-tertiary">
                            <Check className="h-3 w-3" /> {t(notification.timeKey)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border py-1.5 pl-1.5 pr-2.5 hover:bg-surface-sunken"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-800 text-[11px] font-semibold text-white">
              {user?.avatarInitials ?? "AD"}
            </div>
            <span className="text-[13px] font-medium text-text-primary">
              {user?.name ?? "Admin"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute end-0 z-20 mt-2 w-60 rounded-lg border border-border bg-surface py-1.5 shadow-lg animate-fade-in">
                <div className="border-b border-border px-3 py-2">
                  <p className="truncate text-[13px] font-medium text-text-primary">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs text-text-tertiary">
                    {user?.email}
                  </p>
                </div>
                <div className="border-b border-border px-3 py-2.5">
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                    {t("topbar.language")}
                  </p>
                  <LanguageSelect />
                </div>
                <button
                  onClick={() => {
                    if (user?.partnerId) {
                      router.push('/partner/profile');
                    } else {
                      router.push('/hub/profile');
                    }
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:bg-surface-sunken hover:text-text-primary",
                  )}
                >
                  <User className="h-3.5 w-3.5" /> {t("topbar.myAccount")}
                </button>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-danger-600 hover:bg-danger-100"
                >
                  <LogOut className="h-3.5 w-3.5" /> {t("topbar.signOut")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
