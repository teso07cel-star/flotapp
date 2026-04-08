/**
 * Implementa el cálculo de distancias para validación de kilometraje preventivo.
 */

// Coordenadas del Depósito/Base (Punto de Partida Fijo)
// Por defecto se usa un punto central en Buenos Aires (Ej: Mataderos / Villa Lugano)
export const BASE_LOCATION = {
  lat: -34.6617, 
  lng: -58.5036,
  nombre: "DEPÓSITO CENTRAL"
};

/**
 * Calcula la distancia Haversine entre dos puntos (km)
 * Incluye un factor de corrección de ruta (1.25) para compensar calles y giros
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  // Factor de corrección táctico (Tráfico + Giros): 1.25x
  return parseFloat((distance * 1.25).toFixed(2));
}

/**
 * Calcula la ruta circular completa: Base -> S1 -> S2... -> Base
 */
export function calculateFullRoute(stops) {
  if (!stops || stops.length === 0) return 0;
  
  let total = 0;
  let current = BASE_LOCATION;

  // De Base a parada 1, de parada 1 a parada 2...
  stops.forEach(stop => {
    if (stop.lat && stop.lng) {
      total += calculateDistance(current.lat, current.lng, stop.lat, stop.lng);
      current = stop;
    }
  });

  // SIEMPRE Regreso a Base desde la última parada
  total += calculateDistance(current.lat, current.lng, BASE_LOCATION.lat, BASE_LOCATION.lng);

  return parseFloat(total.toFixed(1));
}

/**
 * Calcula el tramo puntual: Anterior -> Nueva(s) -> Base
 * Útil para validación inmediata en bitácora.
 */
export function calculateSegment(lastLocation, newStops) {
  let start = lastLocation || BASE_LOCATION;
  let d = 0;
  let current = start;
  
  newStops.forEach(s => {
    if (s.lat && s.lng) {
      d += calculateDistance(current.lat, current.lng, s.lat, s.lng);
      current = s;
    }
  });
  
  // Regreso preventivo a base
  d += calculateDistance(current.lat, current.lng, BASE_LOCATION.lat, BASE_LOCATION.lng);
  
  return parseFloat(d.toFixed(1));
}
