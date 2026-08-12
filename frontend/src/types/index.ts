export interface EventoTransporte {
  evento_transporte_id: string;
  lote_id: string;
  tipo_producto: 'Fresco' | 'Congelado';
  temperatura_camara_c: number;
  gps_lat: number;
  gps_lon: number;
  timestamp_lectura: string;
  estado_recepcion: string;
  decision_inspector: string;
  bloque_hash: string;
}

export interface RegistroDosificacion {
  dosificacion_id: string;
  lote_id: string;
  concentracion_ppm: number;
  volumen_ml: number;
  peso_lote_kg: number;
  operario_id: string;
  normativa_destino: 'China/GACC' | 'UE' | 'FDA/EE.UU.';
  estado_validacion: 'APROBADO' | 'ALERTA' | 'CRÍTICO';
  riesgo_financiero_usd: number;
  bloque_hash: string;
  timestamp_registro: string;
}

export interface BloqueBlockchain {
  index: number;
  timestamp: string;
  tipoEvento: 'transporte' | 'dosificacion';
  data: Record<string, any>;
  hash_previo: string;
  hash_integridad: string;
}

export interface KPIResumen {
  tasa_cumplimiento_termico: number;
  tasa_dosificacion_aprobada: number;
  indice_integridad_blockchain: number;
  riesgo_financiero_acumulado: number;
}
