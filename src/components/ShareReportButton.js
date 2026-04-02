"use client";

export default function ShareReportButton({ title, data, type = "daily" }) {
  
  function generateDailyMessage() {
    const { stats, date } = data;
    let msg = `📊 *REPORTE DIARIO FLOTAPP - ${date}*\n\n`;
    msg += `🚛 *Unidades Activas:* ${stats.uniqueVehicles}\n`;
    msg += `📍 *Visitas Totales:* ${stats.totalVisits}\n`;
    msg += `🛣️ *KM Recorridos:* ${stats.totalKm.toLocaleString()} KM\n\n`;
    
    msg += `*DESGLOSE POR SUCURSAL:*\n`;
    Object.entries(stats.branchBreakdown).forEach(([name, count]) => {
      msg += `• ${name}: ${count} visitas\n`;
    });
    
    msg += `\n_Generado automáticamente por FlotApp Premium_`;
    return encodeURIComponent(msg);
  }

  function generateMonthlyMessage() {
    const { summary, totalFleetVisits, monthName, year } = data;
    const totalKm = summary.reduce((sum, v) => sum + v.kmRecorridos, 0);
    const totalGastos = summary.reduce((sum, v) => sum + v.totalGastos, 0);

    let msg = `📈 *RESUMEN MENSUAL FLOTAPP - ${monthName.toUpperCase()} ${year}*\n\n`;
    msg += `🛣️ *KM Totales Flota:* ${totalKm.toLocaleString()} KM\n`;
    msg += `📍 *Visitas Totales:* ${totalFleetVisits.toLocaleString()}\n`;
    msg += `💰 *Gasto Consolidado:* $ ${totalGastos.toLocaleString()}\n\n`;
    
    msg += `*RENDIMIENTO POR UNIDAD:*\n`;
    summary.forEach(v => {
      msg += `• *${v.patente}:* ${v.kmRecorridos.toLocaleString()} KM | ${v.visitasSucursales} Vis.\n`;
    });
    
    msg += `\n_Generado automáticamente por FlotApp Premium_`;
    return encodeURIComponent(msg);
  }

  const handleShare = () => {
    const message = type === "daily" ? generateDailyMessage() : generateMonthlyMessage();
    const url = `https://wa.me/?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <button 
      onClick={handleShare}
      className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-emerald-500/20 group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:rotate-12">
        <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7Z"/>
      </svg>
      Enviar Reporte
    </button>
  );
}
