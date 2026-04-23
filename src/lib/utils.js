/**
 * Devuelve la fecha actual (o la fecha dada) en formato "YYYY-MM-DD"
 * con la zona horaria de Argentina (America/Argentina/Buenos_Aires, UTC-3).
 */
export function getArDate(inputDate) {
  const d = inputDate instanceof Date ? inputDate : (inputDate ? new Date(inputDate) : new Date());
  
  try {
    const options = {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const parts = new Intl.DateTimeFormat("es-AR", options).formatToParts(d);
    const year  = parts.find(p => p.type === "year").value;
    const month = parts.find(p => p.type === "month").value;
    const day   = parts.find(p => p.type === "day").value;
    return `${year}-${month}-${day}`;
  } catch (e) {
    // Fallback simple si Intl falla en el entorno de build
    return d.toISOString().split('T')[0];
  }
}

/**
 * PROTOCOLO DE PUREZA v6.0.0
 * Fuerza la conversin de cualquier estructura de datos a JSON puro.
 * Ubicacin: utils.js (Sincrnico, compatible con Server Actions imports)
 */
export function purify(data) {
  try {
    const clean = JSON.parse(JSON.stringify(data));
    
    // Protocolo de Privacidad Seor X: Purga de Mariano
    const purge = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key in obj) {
        if (typeof obj[key] === 'string' && key.toLowerCase().includes('nombre')) {
          if (obj[key].startsWith('Mariano')) obj[key] = 'Mariano';
        } else if (typeof obj[key] === 'object') {
          purge(obj[key]);
        }
      }
    };
    purge(clean);
    
    return clean;
  } catch (e) {
    console.error("Fallo crtico de purificacin:", e);
    return null;
  }
}
