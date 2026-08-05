import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atanıyorum Hocam | KPSS ÖABT Eğitimleri",
  description: "Türkiye'nin en kaliteli KPSS ÖABT online eğitim platformu.",
};

import Providers from "@/providers/Providers";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import { getSiteSettings } from "@/lib/settings";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <MaintenanceGuard initialSettings={settings}>
            {children}
          </MaintenanceGuard>
        </Providers>
      </body>
    </html>
  );
}
