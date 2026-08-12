export const NORMATIVAS = {
  'China/GACC': { label: 'China/GACC', limite_ppm: 100, color: '#22c55e' },
  'UE': { label: 'UE', limite_ppm: 150, color: '#f59e0b' },
  'FDA/EE.UU.': { label: 'FDA/EE.UU.', limite_ppm: 100, color: '#ef4444' },
};

export const RANGO_FRESCO = { min: 0, max: 4 };
export const LIMITE_CONGELADO = -18;

export function getNormativa(normativa) {
  return NORMATIVAS[normativa] || NORMATIVAS['China/GACC'];
}

export function getLimitePPM(normativa) {
  return getNormativa(normativa).limite_ppm;
}

export function estadoDesdeValor(value, limite) {
  if (value <= limite) return 'APROBADO';
  if (value <= limite * 1.5) return 'ALERTA';
  return 'CRÍTICO';
}

export function estadoDesdeConcentracion(ppm, normativa) {
  return estadoDesdeValor(ppm, getLimitePPM(normativa));
}

export function validarConcentracion(ppm, normativa) {
  const limite = getLimitePPM(normativa);
  const value = Number(ppm) || 0;
  const ueLimite = NORMATIVAS.UE.limite_ppm;
  if (value <= limite) {
    return { valido: true, estado: 'APROBADO', message: `Conforme al límite ${normativa} (≤${limite} ppm).` };
  }
  if (value <= ueLimite) {
    return {
      valido: false,
      estado: 'ALERTA',
      message: `Excede límite ${normativa} (${limite} ppm) pero válido para UE (≤${ueLimite} ppm). Redirigir a mercado UE.`,
    };
  }
  return {
    valido: false,
    estado: 'CRÍTICO',
    message: `CRÍTICO: ${value} ppm excede incluso el límite UE (${ueLimite} ppm).`,
  };
}

export function validarTemperatura(temp, tipoProducto) {
  const value = temp == null ? 0 : Number(temp);
  if (tipoProducto === 'Congelado') {
    if (value <= LIMITE_CONGELADO) return { valido: true, estado: 'DENTRO_RANGO' };
    if (value <= -1 * Math.abs(LIMITE_CONGELADO) + 6) return { valido: false, estado: 'ALERTA_TEMP' };
    return { valido: false, estado: 'FUERA_RANGO' };
  }
  if (tipoProducto === 'Fresco') {
    if (value >= RANGO_FRESCO.min && value <= RANGO_FRESCO.max) return { valido: true, estado: 'DENTRO_RANGO' };
    if (value > RANGO_FRESCO.max && value <= RANGO_FRESCO.max + 2) return { valido: false, estado: 'ALERTA_TEMP' };
    return { valido: false, estado: 'FUERA_RANGO' };
  }
  return { valido: false, estado: 'FUERA_RANGO' };
}

export function getColorDesdeEstado(estado) {
  if (['APROBADO', 'DENTRO_RANGO', 'OK', 'VÁLIDO'].includes(estado)) return '#22c55e';
  if (['ALERTA', 'ALERTA_TEMP'].includes(estado)) return '#f59e0b';
  if (estado === 'CRÍTICO') return '#ef4444';
  if (estado === 'FUERA_RANGO') return '#ef4444';
  if (estado === 'ALTERADO') return '#ef4444';
  if (estado === 'VERIFICACION') return '#f59e0b';
  return '#f59e0b';
}