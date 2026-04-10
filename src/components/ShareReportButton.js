"use client";

export default function ShareReportButton({ title, data, type = "daily" }) {
  
  const DIVIDER = "------------------------------------------";

  function generateDailyMessage() {
    const { stats, date } = data;
    let msg = `📊 *REPORTE DIARIO DE FLOTA*\n`;
    msg += `📅 _${date}_\n`;
    msg += `${DIVIDER}\n\n`;
    
    msg += `🚛 *OPERACIÓN GLOBAL*\n`;
    msg += `• Unidades Activas: *${stats.uniqueVehicles}*\n`;
    msg += `• Visitas en Nodos: *${stats.totalVisits}*\n`;
    msg += `• KM Totales: *${stats.totalKm.toLocaleString()} KM*\n\n`;
    
    msg += `📍 *NIVEL DE ACTIVIDAD:*\n`;
    const sorted = Object.entries(stats.branchBreakdown).sort((a,b) => b[1] - a[1]);
    sorted.forEach(([name, count]) => {
      msg += `> ${name}: *${count}* visitas\n`;
    });
    
    msg += `\n${DIVIDER}\n`;
    msg += `_Sincronizado vía FlotApp Premium TACTICA b4.0_`;
    return encodeURIComponent(msg);
  }

  function generateFleetConsolidatedMessage() {
    const { stats, date, driverStats } = data;
    let msg = `🚀 *CONSOLIDADO TÁCTICO FLOTAPP*\n`;
    msg += `🏢 *AUDITORÍA OPERATIVA - ${date}*\n`;
    msg += `${DIVIDER}\n\n`;

    msg += `📈 *MÉTRICAS DE IMPACTO*\n`;
    msg += `• Kilometraje: *${stats.totalKm.toLocaleString()} KM*\n`;
    msg += `• Efectividad: *${stats.totalVisits}* Nodos\n\n`;

    msg += `👥 *DESEMPEÑO INDIVIDUAL:*\n`;
    driverStats.forEach(d => {
        msg += `👉 *${d.nombre}:* ${d.kmActual?.toLocaleString() || 0} KM | ${d.visitas} Vis.\n`;
        if (d.combustible) msg += `   ⛽ _Combustible: ${d.combustible}_\n`;
    });

    msg += `\n${DIVIDER}\n`;
    msg += `_Reporte Ejecutivo Consolidado_`;
    return encodeURIComponent(msg);
  }

  function generateDriverShiftMessage() {
    const { driver, date } = data;
    let msg = `👤 *JORNADA: ${driver.name.toUpperCase()}*\n`;
    msg += `📅 *${date}*\n`;
    msg += `${DIVIDER}\n\n`;

    if (driver.inicio) {
        msg += `✅ *LOGIN:* ${new Date(driver.inicio.fecha).toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' })}h\n`;
        msg += `🏁 *KM INICIAL:* ${driver.inicio.kmActual?.toLocaleString()} KM\n\n`;
    }

    if (driver.paradas.length > 0) {
        msg += `📍 *RUTA CUMPLIDA:*\n`;
        driver.paradas.forEach(p => {
            const time = new Date(p.fecha).toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' });
            const branches = p.sucursales?.map(s => s.nombre).join(", ") || "Operación";
            msg += `• [${time}] *${branches}*\n`;
        });
        msg += `\n`;
    }

    if (driver.cierre) {
        msg += `🏁 *CIERRE:* ${new Date(driver.cierre.fecha).toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' })}h\n`;
        msg += `🛣️ *KM FINAL:* ${driver.cierre.kmActual?.toLocaleString()} KM\n`;
        msg += `⛽ *GAS:* ${driver.cierre.nivelCombustible || 'S/D'}\n`;
    } else {
        msg += `⚠️ _OPERACIÓN EN CURSO_\n`;
    }
    
    msg += `\n${DIVIDER}\n`;
    msg += `_Bitácora Individual FlotApp_`;
    return encodeURIComponent(msg);
  }

  function generateWeeklyMessage() {
    const { stats, range } = data;
    let msg = `📅 *REPORTE SEMANAL ESTRATÉGICO*\n`;
    msg += `🗓️ *Periodo:* ${range}\n`;
    msg += `${DIVIDER}\n\n`;

    msg += `🛣️ *KM RECORRIDOS:* ${stats.totalKm.toLocaleString()} KM\n`;
    msg += `📍 *VISITAS TOTALES:* ${stats.totalVisits}\n`;
    msg += `🚛 *UNIDADES:* ${stats.uniqueVehicles}\n\n`;

    msg += `👨‍✈️ *ACTIVIDAD POR CONDUCTOR:*\n`;
    if (stats.driverBranchStats) {
      Object.entries(stats.driverBranchStats).forEach(([driver, branches]) => {
          const total = Object.values(branches).reduce((a, b) => a + b, 0);
          msg += `• *${driver}:* ${total} visitas\n`;
      });
    }

    msg += `\n${DIVIDER}\n`;
    msg += `_Dashboard Ejecutivo FlotApp_`;
    return encodeURIComponent(msg);
  }

  function generateMonthlyMessage() {
    const { summary, totalFleetVisits, monthName, year } = data;
    const totalKm = summary.reduce((sum, v) => sum + v.kmRecorridos, 0);
    const totalGastos = summary.reduce((sum, v) => sum + v.totalGastos, 0);

    let msg = `📅 *REPORTE MENSUAL DE FLOTA*\n`;
    msg += `🗓️ *${monthName.toUpperCase()} ${year}*\n`;
    msg += `${DIVIDER}\n\n`;

    msg += `📊 *MÉTRICAS CONSOLIDADAS*\n`;
    msg += `• KM Recorridos: *${totalKm.toLocaleString()} KM*\n`;
    msg += `• Visitas totales: *${totalFleetVisits}*\n`;
    msg += `• Inversión Op: *$${totalGastos.toLocaleString()}*\n\n`;

    msg += `🚛 *DETALLE POR UNIDAD:*\n`;
    summary.forEach(v => {
      msg += `• *${v.patente}:* ${v.kmRecorridos.toLocaleString()} km | $${v.totalGastos.toLocaleString()}\n`;
      msg += `  _${v.visitasSucursales} visitas | Chofer: ${v.ultimoConductor}_\n`;
    });

    msg += `\n${DIVIDER}\n`;
    msg += `_Gestión Estratégica FlotApp b4.0_`;
    return encodeURIComponent(msg);
  }

  const handleShare = () => {
    let message = "";
    if (type === "daily") message = generateDailyMessage();
    else if (type === "fleet_consolidated") message = generateFleetConsolidatedMessage();
    else if (type === "driver_shift") message = generateDriverShiftMessage();
    else if (type === "weekly") message = generateWeeklyMessage();
    else if (type === "monthly") message = generateMonthlyMessage();
    
    // Detección mejorada para PC/Móvil
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const baseUrl = isMobile ? "https://wa.me/" : "https://web.whatsapp.com/send";
    const url = `${baseUrl}?text=${message}`;
    
    window.open(url, "_blank");
  };

  return (
    <button 
      onClick={handleShare}
      className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg group ${
        type === "fleet_consolidated" ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:rotate-12">
        <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7Z"/>
      </svg>
      {type === "fleet_consolidated" ? "Consolidado Flota" : "Compartir WhatsApp"}
    </button>
  );
}
