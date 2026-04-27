import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import ShortcutGuide from "@/components/ShortcutGuide";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FlotApp Premium",
  description: "Orquestador Logístico de Alta Gama",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FlotApp",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020617] text-white selection:bg-blue-500/30`}>
        {/* BANNER DE VERIFICACION NUCLEAR v9.0.1 */}
        <div className="bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] py-2 text-center fixed top-0 left-0 w-full z-[9999] shadow-2xl animate-pulse no-print">
           VERSIÓN v9.0.1 PRESTIGE - BRIAN, ESTA ES LA ACTUALIZACIÓN REAL
        </div>
        
        <ServiceWorkerRegistration />
        <ShortcutGuide />
        <main className="relative z-0 pt-8">
           {children}
        </main>
      </body>
    </html>
  );
}
