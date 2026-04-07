/**
 * Utilidades para manejar el horario de Argentina (America/Argentina/Buenos_Aires)
 * de forma consistente en toda la aplicación, tanto en servidor como en cliente.
 */

/**
 * Retorna un objeto Date que representa el momento actual en Argentina.
 * Útil para comparaciones de fechas en el servidor (Vercel) sin desfases UTC.
 */
export function getArgentinaDate() {
  const now = new Date();
  // Forzamos la conversión a la zona horaria de Buenos Aires
  const argentinaTime = now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" });
  return new Date(argentinaTime);
}

/**
 * Retorna la fecha actual en formato YYYY-MM-DD según el calendario de Argentina.
 * Previene que a las 21:00 ART el sistema salte al día siguiente (00:00 UTC).
 */
export function getArgentinaTodayISO() {
  const argDate = getArgentinaDate();
  const year = argDate.getFullYear();
  const month = String(argDate.getMonth() + 1).padStart(2, '0');
  const day = String(argDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha para mostrar solo la hora HH:mm en Argentina.
 */
export function formatArgentinaTime(date) {
  if (!date) return "--:--";
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString("es-AR", { 
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit", 
    minute: "2-digit", 
    hour12: false 
  });
}

/**
 * Formatea una fecha completa para Argentina.
 */
export function formatArgentinaFull(date) {
  if (!date) return "";
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}
