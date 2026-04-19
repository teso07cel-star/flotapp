/**
 * Utilidades Geográficas para FlotApp
 * Implementa el cálculo de distancias para validación de kilometraje.
 */

import { START_POINTS, DRIVER_START_MAP, BRANCH_COORDINATES } from "./branchConfig";

/**
 * Calcula la distancia Haversine entre dos puntos (km)
 * Incluye un factor de corrección de ruta (1.3) para compensar calles y giros urbanos
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

  // Factor de corrección de calle: Distancia lineal a Distancia por ruta (aprox 30% en AMBA)
  return distance * 1.3; 
}

/**
 * Calcula la ruta secuencial basada en el conductor: Origen -> A -> B -> ... -> Retorno
 */
export function calculateSequentialRoute(stops, driverName) {
  if (!Array.isArray(stops) || stops.length === 0) return 0;

  // Determinar punto de partida según el conductor con guard robusto
  const startKey = DRIVER_START_MAP[driverName] || "TESO_SAN_TELMO";
  const startPoint = START_POINTS[startKey] || START_POINTS["TESO_SAN_TELMO"];
  
  let total = 0;
  let current = { lat: startPoint.lat, lng: startPoint.lng };

  stops.forEach(stop => {
    // Soportar tanto el nombre (string) como el objeto de sucursal (Prisma)
    const stopName = typeof stop === 'string' ? stop : stop.nombre;
    const stopCoord = BRANCH_COORDINATES[stopName];
    
    // Solo acumular y mover el punto actual si encontramos coordenadas válidas
    if (stopCoord && stopCoord.lat && stopCoord.lng) {
      total += calculateDistance(current.lat, current.lng, stopCoord.lat, stopCoord.lng);
      current = { lat: stopCoord.lat, lng: stopCoord.lng };
    }
  });

  // Retorno a base seguro
  if (current.lat && current.lng) {
    total += calculateDistance(current.lat, current.lng, startPoint.lat, startPoint.lng);
  }

  return total;
}
