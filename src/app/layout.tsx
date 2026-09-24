import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader, MobileBottomNav } from "@/components/layout/site-header";
import { AuthProvider } from "@/components/auth/auth-provider";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/translate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: {
      default: dict.meta.titleDefault,
      template: `%s | ${dict.brand}`,
    },
    description: dict.meta.description,
    metadataBase: new URL("https://kozosugyunk.hu"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <LocaleProvider initialLocale={locale}>
          <AuthProvider>
            <SiteHeader />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <MobileBottomNav />
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
