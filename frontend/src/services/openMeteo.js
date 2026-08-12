const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const TIMEOUT_MS = 8000;
const TTL_MS = 10 * 60 * 1000;
const cache = new Map();
const estampas = new Map();

function keyDe(lat, lon) {
  return `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;
}

export function climaSimulado(lat, lon) {
  void lat;
  void lon;
  const ahora = new Date();
  const serie = Array.from({ length: 24 }).map((_, i) => {
    const t = new Date(ahora.getTime() - (23 - i) * 3600 * 1000);
    return {
      t: `${String(t.getHours()).padStart(2, '0')}:00`,
      temp: Number((30 + Math.sin(i / 2) * 2).toFixed(1)),
      hum: Math.round(75 + Math.sin(i / 3) * 6),
      simulado: true,
    };
  });
  return {
    fuente: 'simulado',
    actualizado: ahora.toISOString().slice(0, 16),
    temperatura: 30,
    humedad: 75,
    clima: 'Despejado (dato de respaldo)',
    serie,
  };
}

function parseWeatherCode(code) {
  if (code === 0) return 'Despejado';
  if (code >= 1 && code <= 3) return 'Parcialmente nublado';
  if (code >= 45 && code <= 48) return 'Niebla';
  if (code >= 51 && code <= 67) return 'Lluvia ligera';
  if (code >= 71 && code <= 77) return 'Nieve';
  if (code >= 80 && code <= 82) return 'Chubascos';
  if (code >= 95) return 'Tormenta eléctrica';
  return 'Nubosidad variable';
}

async function petico(lat, lon) {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: 'temperature_2m,relative_humidity_2m,weather_code',
      hourly: 'temperature_2m,relative_humidity_2m,weather_code',
      timezone: 'America/Guayaquil',
      forecast_days: '1',
    });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(`${ENDPOINT}?${params.toString()}`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);

    const json = await res.json();
    const cur = json?.current;
    const horas = json?.hourly?.time || [];
    const temps = json?.hourly?.temperature_2m || [];
    const hums = json?.hourly?.relative_humidity_2m || [];

    const serie = horas.map((tora, i) => ({
      t: String(tora || '').slice(11, 16),
      temp: temps[i] != null ? Number(temps[i]) : null,
      hum: hums[i] != null ? Number(hums[i]) : null,
    }));

    return {
      fuente: 'Open-Meteo',
      actualizado: cur?.time ? String(cur.time) : new Date().toISOString().slice(0, 16),
      temperatura: cur?.temperature_2m != null ? Number(cur.temperature_2m) : null,
      humedad: cur?.relative_humidity_2m != null ? Number(cur.relative_humidity_2m) : null,
      clima: parseWeatherCode(cur?.weather_code),
      serie,
    };
  } catch (err) {
    console.warn(`[open-meteo] fallback para ${lat},${lon}: ${err?.message || err}`);
    return climaSimulado(lat, lon);
  }
}

export async function fetchClimaReal(lat, lon) {
  if (Number.isNaN(Number(lat)) || Number.isNaN(Number(lon))) return climaSimulado(lat, lon);

  const key = keyDe(lat, lon);
  const estampilla = estampas.get(key);
  if (estampilla && Date.now() - estampilla < TTL_MS && cache.has(key)) {
    return cache.get(key);
  }

  estampas.set(key, Date.now());
  const promesa = petico(lat, lon);
  cache.set(key, promesa);
  const result = await promesa;
  cache.set(key, result);
  return result;
}