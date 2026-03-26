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

export const metadata = {
  title: "FLOTAPP - Gestión de Flota",
  description: "Sistema premium de gestión de flota de vehículos",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  appleMobileWebappTitle: "FLOTAPP",
  applicationName: "FLOTAPP",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
