"use client";

import { RouteGuard } from "@/components/feature/RouteGuard";
import { Sidebar } from "@/components/layout/Sidebar";

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard role="hub_admin">
      <div className="min-h-screen bg-background">
        <Sidebar role="hub_admin" />
        <div className="ps-64">{children}</div>
      </div>
    </RouteGuard>
  );
}
