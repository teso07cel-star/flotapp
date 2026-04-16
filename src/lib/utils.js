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
