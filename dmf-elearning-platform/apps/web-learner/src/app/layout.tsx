import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Outfit, Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { MobileBottomNav } from "@/components/ui/mobile-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DMF German Learning - Học Tiếng Đức Thông Minh",
  description: "Nền tảng học tiếng Đức với AI, từ A1 đến C2. 15,000+ từ vựng, Flashcards, Quiz và AI Sensei hỗ trợ 24/7.",
  keywords: ["học tiếng đức", "german learning", "flashcard", "quiz", "A1", "A2", "B1", "B2", "goethe"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF2FF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0D1A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <ThemeProvider>
          <ToastProvider>
            {children}
            <MobileBottomNav />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
