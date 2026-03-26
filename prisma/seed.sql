-- Seed Sucursales
INSERT OR IGNORE INTO Sucursal (id, nombre, direccion) VALUES (1, 'Centro', 'Av. Principal 123');
INSERT OR IGNORE INTO Sucursal (id, nombre, direccion) VALUES (2, 'Norte', 'Ruta 9 Km 50');
INSERT OR IGNORE INTO Sucursal (id, nombre, direccion) VALUES (3, 'Sur', 'Av. San Martín 456');

-- Seed Test Vehicle
INSERT OR IGNORE INTO Vehiculo (patente, vtvVencimiento, seguroVencimiento, proximoServiceKm, activo) 
VALUES ('AB123CD', '2026-12-31 00:00:00', '2026-11-30 00:00:00', 50000, 1);
