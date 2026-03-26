import { getAllVehiculos } from "@/lib/actions";
import VehicleSelectorClient from "@/components/VehicleSelectorClient";

export default async function DriverVehicleSelection() {
  const res = await getAllVehiculos();
  const vehiculos = res.success ? res.data : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6 selection:bg-blue-500/30">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-600/20 to-transparent rounded-full blur-3xl opacity-50 mix-blend-screen" />
      </div>

      <VehicleSelectorClient vehiculos={vehiculos} />
    </div>
  );
}
