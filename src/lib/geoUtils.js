/**
 * Utilidades Geográficas para FlotApp
 * Implementa el cálculo de distancias para validación de kilometraje.
 */

// Coordenadas del Depósito/Base (Punto de Partida Fijo)
// Por defecto se usa un punto central en Buenos Aires (ej. cercanías de depósito)
// El usuario puede ajustar esto en la configuración
export const BASE_LOCATION = {
  lat: -34.6037, 
  lng: -58.3816,
  nombre: "Depósito Central"
};

/**
 * Calcula la distancia Haversine entre dos puntos (km)
 * Incluye un factor de corrección de ruta (1.2) para compensar calles y giros
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

  // Factor de corrección de calle: Distancia lineal a Distancia por ruta (aprox 20%)
  return distance * 1.25; 
}

/**
 * Calcula la ruta secuencial: Base -> A -> B -> ... -> Base
 */
export function calculateSequentialRoute(stops) {
  let total = 0;
  let current = BASE_LOCATION;

  // De Base a parada 1, de parada 1 a parada 2...
  stops.forEach(stop => {
    if (stop.lat && stop.lng) {
      total += calculateDistance(current.lat, current.lng, stop.lat, stop.lng);
      current = stop;
    }
  });

  // Regreso a Base desde la última parada
  total += calculateDistance(current.lat, current.lng, BASE_LOCATION.lat, BASE_LOCATION.lng);

  return total;
}
