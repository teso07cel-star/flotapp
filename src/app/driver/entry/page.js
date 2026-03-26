import Link from "next/link";
import { getChoferesActivos } from "@/lib/actions";
import WebAuthnLogin from "@/components/WebAuthnLogin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DriverEntry() {
  const cookieStore = await cookies();
  const driverId = cookieStore.get("flotapp_driver_session")?.value;
  if (driverId) {
    redirect("/driver/vehicle"); // Si ya está logueado, lo pasamos a elegir patente
  }

  const res = await getChoferesActivos();
  const choferes = res.success ? res.data : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6 selection:bg-blue-500/30">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-3xl opacity-50 mix-blend-screen" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full blur-3xl opacity-50 mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link 
          href="/"
          className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver al Inicio
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 mb-6 shadow-xl shadow-blue-500/20 text-white border border-white/20 backdrop-blur-xl">
             <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">Identidad Segura</h1>
          <p className="text-gray-400 font-medium">Validación biométrica obligatoria</p>
        </div>

        {/* COMPONENTE CLIENTE DE WEBAUTHN */}
        <WebAuthnLogin choferes={choferes} />

        <div className="mt-8 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-800 p-6 shadow-xl">
           <h3 className="text-gray-400 font-bold mb-3 text-sm tracking-wide">¿Vehículo o Chofer Tercerizado?</h3>
           <Link 
              href="/driver/vehicle"
              className="inline-flex w-full items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-colors border border-gray-700 hover:border-gray-500 shadow-md"
           >
              Soy Chofer Externo
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
           </Link>
        </div>
      </div>
    </div>
  );
}
