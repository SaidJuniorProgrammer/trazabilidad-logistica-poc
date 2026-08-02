-- Tabla principal para registrar el origen y destino de los lotes de camarón
CREATE TABLE IF NOT EXISTS lotes_camaron (
    id SERIAL PRIMARY KEY,
    codigo_lote VARCHAR(50) UNIQUE NOT NULL,
    origen VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para el historial de eventos logísticos (Trazabilidad y control de temperatura)
CREATE TABLE IF NOT EXISTS eventos_logisticos (
    id SERIAL PRIMARY KEY,
    lote_id INTEGER NOT NULL REFERENCES lotes_camaron(id) ON DELETE CASCADE,
    temperatura NUMERIC(5,2) NOT NULL,
    ubicacion VARCHAR(150) NOT NULL,
    hash_integridad VARCHAR(255) NOT NULL,
    hash_previo VARCHAR(256) DEFAULT '0000000000000000000000000000000000000000000000000000000000000000',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar un lote de prueba para poder hacer tests rápidamente
INSERT INTO lotes_camaron (codigo_lote, origen, destino) 
VALUES ('LOTE-CAM-001', 'Finca La Libertad', 'Empacadora Guayaquil');

-- Nueva tabla de configuración dinámica
CREATE TABLE IF NOT EXISTS configuracion (
  id SERIAL PRIMARY KEY,
  umbral_temperatura NUMERIC NOT NULL DEFAULT -18.0,
  frecuencia_scraping INT NOT NULL DEFAULT 6
);

-- Insertar los valores por defecto iniciales
INSERT INTO configuracion (umbral_temperatura, frecuencia_scraping) VALUES (-18.0, 6);