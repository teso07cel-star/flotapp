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
        {/* BANNER DE VALIDACIÓN TÁCTICA - INDICA VERSIÓN FINAL v3.0.4 */}
        <div className="fixed top-0 left-0 w-full z-[9999] bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.4em] py-2 text-center shadow-2xl">
           SISTEMA TÁCTICO v3.0.4 - DESPLIEGUE FINAL DEPURADO
        </div>
        <div className="pt-8 flex-1 flex flex-col">
          <ServiceWorkerRegistration />
          {children}
        </div>
      </body>
    </html>
  );
}
