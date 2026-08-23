import type { Metadata, Viewport } from "next";
import { Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "SV Wacker Burghausen eSports | Team-Hub",
  description:
    "Digitales Team- und Match-Management-System von SV Wacker Burghausen eSports — Kader, Spielplan, Aufstellung, Taktik.",
};

export const viewport: Viewport = {
  themeColor: "#07090c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`dark ${inter.variable} ${rajdhani.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
