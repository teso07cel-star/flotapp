import { getAllVehiculos, getUltimosRegistros } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function TestQueryPage() {
  try {
    console.log("--- DEBUG: TestQueryPage START ---");
    
    const [vRes, rRes] = await Promise.all([
      getAllVehiculos(),
      getUltimosRegistros(5)
    ]);
    
    return (
      <div className="bg-black text-green-500 p-10 font-mono text-xs">
        <h1 className="text-xl mb-4 uppercase">Resultado de Depuración Táctica</h1>
        
        <section className="mb-8">
          <h2 className="text-blue-500 mb-2">VEHICULOS: {vRes.success ? "OK" : "ERROR"}</h2>
          <pre>{JSON.stringify(vRes.success ? { count: vRes.data?.length } : vRes.error, null, 2)}</pre>
        </section>

        <section>
          <h2 className="text-blue-500 mb-2">ULTIMOS REGISTROS: {rRes.success ? "OK" : "ERROR"}</h2>
          <pre>{JSON.stringify(rRes.success ? { count: rRes.data?.length, sample: rRes.data?.[0] } : rRes.error, null, 2)}</pre>
        </section>
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-black text-red-500 p-10 font-mono text-xs">
        <h1 className="text-xl mb-4 uppercase">Fallo Crítico de Inicialización</h1>
        <p>{error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }
}
