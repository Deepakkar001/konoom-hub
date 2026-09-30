"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else router.replace(user.role === "hub_admin" ? "/hub/dashboard" : "/partner/dashboard");
  }, [user, loading, router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-navy-950">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500">
        <Shield className="h-6 w-6 text-navy-950" strokeWidth={2.5} />
      </div>
      <Loader2 className="h-5 w-5 animate-spin text-white/60" />
    </div>
  );
}
