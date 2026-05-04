export const saveRegistroDiario = async (data) => {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({ where: { patente: data.patente } });
    if (!vehiculo) throw new Error("Vehículo no encontrado");
    
    const registro = await prisma.registroDiario.create({ 
      data: { 
        kmActual: data.kmActual ? parseInt(data.kmActual) : null, 
        novedades: data.novedades || "", 
        nombreConductor: data.nombreConductor || "Anónimo", 
        vehiculoId: vehiculo.id,
        novedadResuelta: false
      } 
    });
    revalidatePath("/admin");
    // DEVOLVEMOS EL ID PARA QUE EL FORMULARIO SEPA A DÓNDE IR
    return { success: true, id: registro.id };
  } catch (e) { return { success: false, error: e.message }; }
};
