import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/noto-sans-arabic";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { ToastProvider } from "@/lib/toast-context";

export const metadata: Metadata = {
  title: "Konoom Central Hub",
  description: "Konoom CEMAC Inter-Wallet Remittance — Central Hub Platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <I18nProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
