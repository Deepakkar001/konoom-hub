"use client";

import { useState } from "react";
import {
  Activity,
  Eye,
  EyeOff,
  Globe2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AuthError } from "@/lib/services/auth-service";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { MessageKey } from "@/lib/i18n/messages";
import { Input } from "@/components/ui/Field";
import { BrandLogo } from "@/components/feature/BrandLogo";
import { AuthFooter } from "@/components/feature/AuthFooter";
import { LanguageSelect } from "@/components/ui/LanguageSelect";

const FEATURES: { icon: typeof Globe2; title: MessageKey; desc: MessageKey }[] = [
  {
    icon: Globe2,
    title: "login.feature.markets.title",
    desc: "login.feature.markets.desc",
  },
  {
    icon: ShieldCheck,
    title: "login.feature.compliance.title",
    desc: "login.feature.compliance.desc",
  },
  {
    icon: Activity,
    title: "login.feature.visibility.title",
    desc: "login.feature.visibility.desc",
  },
];

function FloatingField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="absolute -top-2 left-3 z-10 bg-surface px-1 text-[11px] font-medium leading-none text-text-primary"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(t(`login.error.${err.code}`, err.vars));
      } else {
        setError(t("login.error.generic"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-240 overflow-hidden rounded-3xl bg-surface shadow-[0_10px_40px_rgba(16,24,40,0.10)] md:grid-cols-2">
          <div className="relative flex flex-col overflow-hidden bg-navy-950 px-8 py-8 text-start text-white md:min-h-125 md:px-10 md:py-9">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />

            <div className="relative flex flex-1 flex-col justify-center">
              <p className="text-[12px] font-medium uppercase tracking-wide text-gold-500">
                {t("login.eyebrow")}
              </p>
              <h2 className="mt-3 max-w-sm text-[30px] font-semibold leading-[1.15] tracking-tight">
                {t("login.heroTitle")}
              </h2>
              <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-white/55">
                {t("login.heroBody")}
              </p>

              <div className="mt-7 space-y-4">
                {FEATURES.map((feature) => (
                  <div key={feature.title} className="flex gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <feature.icon className="h-4 w-4 text-white/80" />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-medium text-white">
                        {t(feature.title)}
                      </p>
                      <p className="text-[13px] leading-snug text-white/45">
                        {t(feature.desc)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center px-7 py-9 sm:px-10">
            <div className="mx-auto mb-7 w-fit rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
              <div className="w-48">
                <BrandLogo priority />
              </div>
            </div>
            <h1 className="text-center text-xl font-semibold text-text-primary">
              {t("login.title")}
            </h1>
            <p className="mx-auto mt-2 max-w-xs text-center text-[12.5px] leading-relaxed text-text-secondary">
              {t("login.subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <FloatingField id="email" label={t("login.userId")}>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.userIdPlaceholder")}
                  className="h-11"
                  required
                />
              </FloatingField>

              <FloatingField id="password" label={t("login.password")}>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  className="h-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword
                      ? t("login.hidePassword")
                      : t("login.showPassword")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </FloatingField>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-[13px] font-medium text-blue-600 hover:underline"
                >
                  {t("login.forgot")}
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-danger-100 bg-danger-100/60 px-3 py-2.5 text-[12.5px] text-danger-600"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-[14.5px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("login.submit")}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-4">
              <span className="text-[13.5px] text-text-secondary">
                {t("login.language")}
              </span>
              <LanguageSelect className="w-36" />
            </div>
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
