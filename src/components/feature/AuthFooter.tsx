"use client";

import { APP_VERSION, COPYRIGHT_YEAR, FOOTER_LINKS } from "@/lib/app-info";
import { useI18n } from "@/lib/i18n/i18n-context";

export function AuthFooter() {
  const { t } = useI18n();
  return (
    <footer className="flex flex-col gap-3 border-t border-border bg-background px-6 py-5 text-[13px] text-text-secondary sm:flex-row sm:items-center sm:justify-between sm:px-12">
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {FOOTER_LINKS.map((l) => (
          <a
            key={l.key}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-blue-600"
          >
            {t(`footer.${l.key}`)}
          </a>
        ))}
      </nav>
      <p className="text-[12.5px] text-text-primary/80">
        v {APP_VERSION} | {t("footer.copyright", { year: COPYRIGHT_YEAR })}
      </p>
    </footer>
  );
}
