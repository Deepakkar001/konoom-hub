let activeLocale = "en";

export function setActiveLocale(lang: "en" | "fr" | "ar") {
  activeLocale = lang === "ar" ? "ar-u-nu-latn" : lang;
}

export function countryDisplayName(code: string) {
  try {
    return new Intl.DisplayNames([activeLocale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function formatCurrency(value: number, currency = "XAF") {
  return new Intl.NumberFormat(activeLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    currencyDisplay: "code",
  })
    .format(value)
    .replace(currency, currency)
    .trim();
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat(activeLocale).format(value);
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat(activeLocale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(activeLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(activeLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(iso: string) {
  const diffMs = new Date(iso).getTime() - Date.now();
  const mins = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat(activeLocale, { numeric: "auto" });
  if (Math.abs(mins) < 1) return rtf.format(0, "second");
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  const hrs = Math.round(mins / 60);
  if (Math.abs(hrs) < 24) return rtf.format(hrs, "hour");
  return rtf.format(Math.round(hrs / 24), "day");
}
