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
export function calculateSequentialRoute(stopsNames, driverName) {
  if (!Array.isArray(stopsNames) || stopsNames.length === 0) return 0;

  // Determinar punto de partida según el conductor
  const startKey = DRIVER_START_MAP[driverName] || "TESO_SAN_TELMO";
  const startPoint = START_POINTS[startKey];
  
  let total = 0;
  let current = { lat: startPoint.lat, lng: startPoint.lng };

  // 1. Tramo: De Base a primera parada, y entre paradas sucesivas
  stopsNames.forEach(name => {
    const stopCoord = BRANCH_COORDINATES[name];
    if (stopCoord) {
      total += calculateDistance(current.lat, current.lng, stopCoord.lat, stopCoord.lng);
      current = stopCoord;
    }
  });

  // 2. Tramo: Regreso a Base desde la última parada
  total += calculateDistance(current.lat, current.lng, startPoint.lat, startPoint.lng);

  return total;
}
