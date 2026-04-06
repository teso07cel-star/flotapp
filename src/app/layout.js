import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

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
  appleMobileWebappTitle: "FLOTAPP",
  applicationName: "FLOTAPP",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <div className="flex-1 flex flex-col">
          <ServiceWorkerRegistration />
          {children}
        </div>
      </body>
    </html>
  );
}
