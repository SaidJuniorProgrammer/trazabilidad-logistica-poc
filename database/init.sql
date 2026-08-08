-- PostgreSQL 15 - 3FN OLTP + Esquema Estrella DW + Vistas Agregadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. OLTP: Tablas Transaccionales Críticas
-- ==========================================
CREATE TABLE IF NOT EXISTS lotes_camaron (
    id SERIAL PRIMARY KEY,
    lote_id_natural VARCHAR(50) UNIQUE NOT NULL,
    tipo_producto VARCHAR(20) NOT NULL,
    peso_lote_kg NUMERIC(10,2) NOT NULL,
    origen VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos_transporte (
    evento_transporte_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lote_id INT REFERENCES lotes_camaron(id) ON DELETE CASCADE,
    temperatura_camara_c NUMERIC(4,2),
    gps_lat NUMERIC(10,8),
    gps_lon NUMERIC(11,8),
    velocidad_kmh NUMERIC(5,2),
    humedad_relativa_pct NUMERIC(5,2),
    alerta_termica BOOLEAN DEFAULT FALSE,
    estado_recepcion VARCHAR(30),
    decision_inspector VARCHAR(20),
    timestamp_lectura TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    bloque_hash VARCHAR(64) UNIQUE
);

CREATE TABLE IF NOT EXISTS registros_dosificacion (
    dosificacion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lote_id INT REFERENCES lotes_camaron(id) ON DELETE CASCADE,
    concentracion_ppm_medida NUMERIC(8,2) NOT NULL,
    volumen_aplicado_ml NUMERIC(8,2),
    operario_id VARCHAR(30),
    normativa_destino VARCHAR(50),
    estado_validacion VARCHAR(20),
    resultado_lab_verificacion_ppm NUMERIC(8,2),
    riesgo_financiero_usd NUMERIC(12,2) DEFAULT 0,
    decision_final_lote VARCHAR(20),
    timestamp_registro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    bloque_hash VARCHAR(64) UNIQUE
);

CREATE TABLE IF NOT EXISTS tabla_blockchain (
    bloque_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    index SERIAL,
    tipo_evento VARCHAR(20),
    hash_integridad VARCHAR(64) UNIQUE NOT NULL,
    hash_previo VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. Data Warehouse (DW): Dimensiones
-- ==========================================
CREATE TABLE IF NOT EXISTS dim_tiempo (
    sk_tiempo SERIAL PRIMARY KEY,
    fecha DATE UNIQUE NOT NULL,
    anio INT,
    trimestre INT,
    mes INT,
    semana INT,
    dia_semana INT,
    turno VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS dim_lote (
    sk_lote SERIAL PRIMARY KEY,
    lote_id_natural VARCHAR(50) UNIQUE,
    tipo_producto VARCHAR(20),
    finca_origen VARCHAR(100),
    piscina_id VARCHAR(50),
    peso_inicial_kg NUMERIC(10,2)
);

CREATE TABLE IF NOT EXISTS dim_operario (
    sk_operario SERIAL PRIMARY KEY,
    operario_id_natural VARCHAR(30) UNIQUE,
    nombre VARCHAR(100),
    turno_asignado VARCHAR(20),
    certificacion_bpm BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS dim_normativa (
    sk_normativa SERIAL PRIMARY KEY,
    mercado_destino VARCHAR(50) UNIQUE,
    limite_ppm NUMERIC(6,2),
    organismo_regulador VARCHAR(50),
    vigencia_desde DATE
);

CREATE TABLE IF NOT EXISTS dim_ruta (
    sk_ruta SERIAL PRIMARY KEY,
    provincia_origen VARCHAR(50),
    provincia_destino VARCHAR(50),
    distancia_km_estandar NUMERIC(6,2)
);

CREATE TABLE IF NOT EXISTS dim_vehiculo (
    sk_vehiculo SERIAL PRIMARY KEY,
    placa VARCHAR(20) UNIQUE,
    modelo_refrigeracion VARCHAR(50),
    capacidad_kg NUMERIC(10,2)
);

-- ==========================================
-- 3. Data Warehouse (DW): Hechos
-- ==========================================
CREATE TABLE IF NOT EXISTS hecho_transporte (
    sk_transporte BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    fk_tiempo INT REFERENCES dim_tiempo(sk_tiempo),
    fk_lote INT REFERENCES dim_lote(sk_lote),
    fk_vehiculo INT REFERENCES dim_vehiculo(sk_vehiculo),
    fk_ruta INT REFERENCES dim_ruta(sk_ruta),
    temperatura_c NUMERIC(4,2),
    gps_lat NUMERIC(10,8),
    gps_lon NUMERIC(11,8),
    alerta_termica BOOLEAN,
    bloque_hash VARCHAR(64),
    timestamp_lectura TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS hecho_dosificacion (
    sk_dosificacion BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    fk_tiempo INT REFERENCES dim_tiempo(sk_tiempo),
    fk_lote INT REFERENCES dim_lote(sk_lote),
    fk_operario INT REFERENCES dim_operario(sk_operario),
    fk_normativa INT REFERENCES dim_normativa(sk_normativa),
    concentracion_ppm NUMERIC(8,2),
    estado_validacion VARCHAR(20),
    riesgo_financiero_usd NUMERIC(12,2),
    decision_final_lote VARCHAR(20),
    resultado_lab_verificacion_ppm NUMERIC(8,2),
    bloque_hash VARCHAR(64)
);

-- ==========================================
-- 4. Vistas Agregadas para BI y Auditoría
-- ==========================================
CREATE OR REPLACE VIEW vista_kpi_transporte AS 
SELECT 
    dl.lote_id_natural, 
    dl.tipo_producto, 
    dt.fecha, 
    COUNT(*) AS total_lecturas_iot, 
    ROUND(AVG(ht.temperatura_c), 2) AS temp_promedio_viaje, 
    ROUND(MAX(ht.temperatura_c), 2) AS temp_maxima_viaje, 
    ROUND(MIN(ht.temperatura_c), 2) AS temp_minima_viaje, 
    SUM(CASE WHEN ht.alerta_termica THEN 1 ELSE 0 END) AS count_alertas_termicas, 
    ROUND(EXTRACT(EPOCH FROM (MAX(ht.timestamp_lectura) - MIN(ht.timestamp_lectura)))/3600, 2) AS duracion_horas, 
    MAX(ht.bloque_hash) AS ultimo_bloque_hash
FROM hecho_transporte ht 
JOIN dim_tiempo dt ON ht.fk_tiempo = dt.sk_tiempo 
JOIN dim_lote dl ON ht.fk_lote = dl.sk_lote 
GROUP BY dl.lote_id_natural, dl.tipo_producto, dt.fecha;

CREATE OR REPLACE VIEW vista_kpi_dosificacion AS 
SELECT 
    dl.lote_id_natural, 
    dn.mercado_destino, 
    do.operario_id_natural, 
    dt.fecha, 
    hd.concentracion_ppm, 
    hd.concentracion_ppm * 0.67 AS so2_residual_ppm, -- 0.67 es el factor de conversión típico
    hd.estado_validacion, 
    hd.decision_final_lote, 
    hd.resultado_lab_verificacion_ppm, 
    ROUND(ABS(hd.concentracion_ppm - hd.resultado_lab_verificacion_ppm) / NULLIF(hd.concentracion_ppm, 0) * 100, 2) AS desviacion_lab_pct, 
    hd.riesgo_financiero_usd, 
    hd.bloque_hash
FROM hecho_dosificacion hd 
JOIN dim_tiempo dt ON hd.fk_tiempo = dt.sk_tiempo 
JOIN dim_lote dl ON hd.fk_lote = dl.sk_lote 
JOIN dim_normativa dn ON hd.fk_normativa = dn.sk_normativa 
LEFT JOIN dim_operario do ON hd.fk_operario = do.sk_operario;

CREATE OR REPLACE VIEW vista_auditoria_integridad AS 
SELECT 
    bc.bloque_id, 
    bc.index, 
    bc.tipo_evento, 
    bc.hash_integridad, 
    bc.hash_previo, 
    bc.timestamp AS timestamp_inmutabilizacion, 
    COALESCE(et.lote_id, rd.lote_id) AS lote_id, 
    CASE 
        WHEN bc.tipo_evento = 'transporte' THEN et.temperatura_camara_c::TEXT 
        WHEN bc.tipo_evento = 'dosificacion' THEN rd.concentracion_ppm_medida::TEXT 
    END AS dato_critico 
FROM tabla_blockchain bc 
LEFT JOIN eventos_transporte et ON bc.hash_integridad = et.bloque_hash 
LEFT JOIN registros_dosificacion rd ON bc.hash_integridad = rd.bloque_hash 
ORDER BY bc.index;