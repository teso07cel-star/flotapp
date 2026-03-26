import { getAllSucursales, addSucursal, updateSucursal, deleteSucursal, generarCodigoAutorizacion, createRegistroDiario, getVehiculoByPatente } from './src/lib/actions.js';

async function test() {
  console.log("--- Testing Sucursales ---");
  const addRes = await addSucursal("Sucursal Test", "Calle Falsa 123");
  console.log("Add Sucursal:", addRes.success ? "OK" : "Error: " + addRes.error);
  
  if (addRes.success) {
    const sId = addRes.data.id;
    const updateRes = await updateSucursal(sId, { nombre: "Sucursal Modificada", direccion: "Nueva Calle 456" });
    console.log("Update Sucursal:", updateRes.success ? "OK" : "Error: " + updateRes.error);
    
    const deleteRes = await deleteSucursal(sId);
    console.log("Delete Sucursal:", deleteRes.success ? "OK" : "Error: " + deleteRes.error);
  }

  console.log("\n--- Testing Mileage Authorization ---");
  const patente = "AD724VP"; // Assumes this vehicle exists
  const vehRes = await getVehiculoByPatente(patente);
  if (!vehRes.success || !vehRes.data) {
    console.log("Vehicle AD724VP not found, skipping mileage test.");
    return;
  }
  
  const vId = vehRes.data.id;
  const lastKm = vehRes.data.registros?.[0]?.kmActual || 1000;
  
  console.log(`Last KM for ${patente}: ${lastKm}`);
  
  // Try to submit with same KM without code
  const failRes = await createRegistroDiario({
    vehiculoId: vId,
    kmActual: lastKm,
    nombreConductor: "Test Driver",
    sucursalIds: []
  });
  console.log("Submit same KM (no code):", failRes.success === false && failRes.error === "MILEAGE_AUTH_REQUIRED" ? "OK (Blocked)" : "FAIL (Not blocked or different error)");

  // Generate code
  const codeRes = await generarCodigoAutorizacion(vId);
  console.log("Generated Code:", codeRes.success ? codeRes.code : "Error");
  
  if (codeRes.success) {
    // Try to submit with same KM WITH correct code
    const successRes = await createRegistroDiario({
      vehiculoId: vId,
      kmActual: lastKm,
      nombreConductor: "Test Driver",
      sucursalIds: [],
      authCode: codeRes.code
    });
    console.log("Submit same KM (correct code):", successRes.success ? "OK" : "Error: " + successRes.error);
    
    // Try again with same code (should fail because code is cleared)
    const failAgainRes = await createRegistroDiario({
      vehiculoId: vId,
      kmActual: lastKm,
      nombreConductor: "Test Driver",
      sucursalIds: [],
      authCode: codeRes.code
    });
    console.log("Submit same KM (used code):", failAgainRes.success === false && failAgainRes.error === "MILEAGE_AUTH_REQUIRED" ? "OK (Blocked - Code consumed)" : "FAIL");
  }
}

test().catch(console.error);
