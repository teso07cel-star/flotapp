import { Suspense } from "react";
import { cookies } from "next/headers";
import HomePageClient from "@/components/HomePageClient";

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const success = params.success === "true";

  // Determinamos si hay un conductor en el servidor (más rápido)
  const cookieStore = await cookies();
  const hasDriver = cookieStore.has("driver_name");

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-blue-500 font-black animate-pulse uppercase tracking-widest">Iniciando Protocolo...</div>}>
      <HomePageClient success={success} hasDriver={hasDriver} />
    </Suspense>
  );
}
