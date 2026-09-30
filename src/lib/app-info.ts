// Central place for brand / footer configuration shown on the login screen
// and sidebar. Point these at your real assets and URLs — nothing else needs
// to change.

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0";
export const COPYRIGHT_YEAR = 2026;

export const LOGO_SRC = "/images/Centralhub.png";
export const LOGO_ALT = "Konoom Central Hub";

export const FOOTER_LINKS: { key: "faqs" | "privacy" | "terms" | "unsubscribe"; href: string }[] = [
  { key: "faqs", href: "https://qa.konoom.money/web/#" },
  { key: "privacy", href: "https://qa.konoom.money/web/#" },
  { key: "terms", href: "https://qa.konoom.money/web/#" },
  { key: "unsubscribe", href: "https://qa.konoom.money/web/#/unsubscribe" },
];
