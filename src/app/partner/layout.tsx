"use client";

import { RouteGuard } from "@/components/feature/RouteGuard";
import { Sidebar } from "@/components/layout/Sidebar";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard role="partner_admin">
      <div className="min-h-screen bg-background">
        <Sidebar role="partner_admin" />
        <div className="ps-64">{children}</div>
      </div>
    </RouteGuard>
  );
}
