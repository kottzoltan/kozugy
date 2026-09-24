import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader, MobileBottomNav } from "@/components/layout/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KÖZÜGY – Közösségi ügyek, követhető megoldások",
    template: "%s | KÖZÜGY",
  },
  description:
    "Mutasd meg a térképen, mi a gond a környékeden – és nézd meg, másokat is érint-e. Közösségi ügyek, nyilvános válaszok, követhető megoldások.",
  metadataBase: new URL("https://kozosugyunk.hu"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <MobileBottomNav />
      </body>
    </html>
  );
}
