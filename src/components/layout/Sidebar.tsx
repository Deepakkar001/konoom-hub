"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Waypoints,
  ArrowLeftRight,
  Users,
  Landmark,
  GitCompareArrows,
  FileBarChart2,
  Settings,
  UserCircle2,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/types";
import { APP_VERSION } from "@/lib/app-info";
import { useToast } from "@/lib/toast-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { MessageKey } from "@/lib/i18n/messages";
import { BrandLockup } from "@/components/layout/BrandLockup";

interface NavItem {
  href: string;
  labelKey: MessageKey;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavChild[];
}

interface NavChild {
  labelKey: MessageKey;
  comingSoon?: boolean;
}

const HUB_NAV: NavItem[] = [
  { href: "/hub/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/hub/partners", labelKey: "nav.partners", icon: Building2 },
  { href: "/hub/corridors", labelKey: "nav.corridors", icon: Waypoints },
  { href: "/hub/transactions", labelKey: "nav.transactions", icon: ArrowLeftRight },
  { href: "/hub/users", labelKey: "nav.users", icon: Users },
  { href: "/hub/settlement", labelKey: "nav.settlement", icon: Landmark },
  { href: "/hub/reconciliation", labelKey: "nav.reconciliation", icon: GitCompareArrows },
  { href: "/hub/reports", labelKey: "nav.reports", icon: FileBarChart2 },
  {
    href: "",
    labelKey: "nav.configuration",
    icon: SlidersHorizontal,
    children: [
      { labelKey: "nav.serviceChargeRule", comingSoon: true },
      { labelKey: "nav.transactionRule", comingSoon: true },
    ],
  },
  { href: "/hub/settings", labelKey: "nav.settings", icon: Settings },
];

const PARTNER_NAV: NavItem[] = [
  { href: "/partner/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/partner/profile", labelKey: "nav.profile", icon: UserCircle2 },
  {
    href: "/partner/configuration",
    labelKey: "nav.configuration",
    icon: SlidersHorizontal,
  },
  { href: "/partner/transactions", labelKey: "nav.transactions", icon: ArrowLeftRight },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { push } = useToast();
  const items = role === "hub_admin" ? HUB_NAV : PARTNER_NAV;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "nav.configuration": true,
  });

  return (
    <aside className="fixed inset-y-0 start-0 z-30 flex w-64 flex-col bg-navy-950">
      <div className="flex h-19 items-center px-4">
        <BrandLockup compact dark stacked />
      </div>

      <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {items.map((item) => {
          if (item.children) {
            const isOpen = openGroups[item.labelKey] ?? false;
            return (
              <div key={item.labelKey} className="pt-1">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenGroups((groups) => ({
                      ...groups,
                      [item.labelKey]: !isOpen,
                    }))
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-[13.5px] font-medium text-white/55 transition-colors hover:bg-navy-900 hover:text-white/90"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t(item.labelKey)}</span>
                  <ChevronDown className={cn("ms-auto h-3.5 w-3.5 text-white/35 transition-transform", !isOpen && "-rotate-90")} />
                </button>
                {isOpen && (
                  <div className="ms-7 space-y-0.5 border-s border-white/10 ps-3">
                    {item.children.map((child) => (
                      <button
                        type="button"
                        key={child.labelKey}
                        onClick={() => child.comingSoon && push("info", t("nav.comingSoonMessage"))}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-start text-[12.5px] text-white/45 transition-colors hover:bg-navy-900 hover:text-white/75"
                      >
                        <span className="truncate">{t(child.labelKey)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-navy-800 text-white"
                  : "text-white/55 hover:bg-navy-900 hover:text-white/90",
              )}
            >
              {active && (
                <span className="absolute start-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-e bg-gold-500" />
              )}
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-[11px] leading-relaxed text-white/35">
          {t("sidebar.tagline")}
          <br />v{APP_VERSION}
        </p>
      </div>
    </aside>
  );
}
