import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import KPICard from '../components/common/KPICard.jsx';
import AlertBanner from '../components/common/AlertBanner.jsx';
import ChartCard from '../components/common/ChartCard.jsx';
import TransporteFilters from '../components/transporte/TransporteFilters.jsx';
import TransporteTable from '../components/transporte/TransporteTable.jsx';
import TemperaturaSerieChart from '../components/charts/TemperaturaSerieChart.jsx';
import AlertasPorRutaChart from '../components/charts/AlertasPorRutaChart.jsx';
import ClimaCorrelacionChart from '../components/charts/ClimaCorrelacionChart.jsx';
import TiempoTrasladoChart from '../components/charts/TiempoTrasladoChart.jsx';
import { useTransporteFiltrado } from '../hooks/useTransporte.js';
import useAnimatedNumber from '../hooks/useAnimatedNumber.js';
import { api } from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';
import { COLORS } from '../utils/colors.js';

function exportarCSV(rows) {
  const headers = ['lote_id', 'tipo_producto', 'ruta', 'temperatura_inicial_c', 'temperatura_llegada_c', 'duracion_horas', 'estado_recepcion', 'decision_inspector', 'hash'];
  const line = (r) => headers.map((h) => `"${r[h] ?? ''}"`).join(',');
  const csv = [headers.join(','), ...rows.map(line)].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transporte_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Transporte() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({ busqueda: '', tipo: '', ruta: '', fechaIni: '', fechaFin: '' });
  const { transportes, todos } = useTransporteFiltrado(filtros);
  const [loteSeleccionado, setLoteSeleccionado] = useState('ECU-FINCA-007-2026-08-08');
  const [kpisT, setKpisT] = useState(null);
  const [tiempos, setTiempos] = useState([]);
  const [clima, setClima] = useState(null);
  const [climaCargando, setClimaCargando] = useState(false);

  useEffect(() => {
    api.getKpisTransporte().then(setKpisT);
    api.getTiemposTraslado().then(setTiempos);
  }, []);

  const loteActual = useMemo(() => todos.find((t) => t.lote_id === loteSeleccionado) || todos[0] || { lote_id: '', serie: [], tipo_producto: 'Fresco' }, [todos, loteSeleccionado]);

  useEffect(() => {
    let activo = true;
    if (loteActual?.gps_lat == null) return undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- iniciamos estado de carga para la consulta climática
    setClimaCargando(true);
    api
      .getClima(loteActual.gps_lat, loteActual.gps_lon)
      .then((c) => {
        if (activo) setClima(c);
      })
      .catch(() => {
        if (activo) setClima(null);
      })
      .finally(() => {
        if (activo) setClimaCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [loteActual.gps_lat, loteActual.gps_lon]);

  const alertasPorRuta = useMemo(() => {
    const mapa = {};
    todos.forEach((t) => {
      mapa[t.ruta] = (mapa[t.ruta] || 0) + (t.alertas_count || 0);
    });
    return Object.entries(mapa).map(([ruta, alertas]) => ({ ruta, alertas }));
  }, [todos]);

  const rutaMasRiesgo = useMemo(() => (alertasPorRuta.length ? [...alertasPorRuta].sort((a, b) => b.alertas - a.alertas)[0] : null), [alertasPorRuta]);

  const tempProm = useAnimatedNumber(kpisT?.temp_promedio ?? 0, 900, 1);
  const tiempoProm = useAnimatedNumber(kpisT?.tiempo_promedio_traslado ?? 0, 900, 1);

  return (
    <div className="space-y-6">
      <Header
        title="Eslabón 1 — Transporte Terrestre"
        subtitle="Telemetría térmica, GPS y cadena de frío del camarón (Litopenaeus vannamei)"
      />

      <TransporteFilters
        filtros={filtros}
        onChange={setFiltros}
        onExportar={() => exportarCSV(transportes)}
      />

      {rutaMasRiesgo && rutaMasRiesgo.alertas > 0 && (
        <AlertBanner
          type="alerta"
          message={`Ruta ${rutaMasRiesgo.ruta} presenta ${rutaMasRiesgo.alertas} eventos fuera de rango en las últimas horas. Temp. ambiente ${clima?.fuente === 'Open-Meteo' ? `Open-Meteo EN VIVO: ${clima.temperatura}°C` : 'Open-Meteo: 31°C'}.`}
          suggestion="Revisar unidad refrigerada y registrar mantenimiento preventivo antes del próximo despacho."
        />
      )}

      {/* KPIs transporte */}
      <section className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Temp. promedio viaje" value={`${tempProm.toFixed(1)}°C`} trend="+0.2" trendUp={false} color={COLORS.blue} progress={tempProm * 20} />
        <KPICard title="Tiempo promedio traslado" value={`${tiempoProm.toFixed(1)}h`} trend="-18 min" trendUp color={COLORS.green} progress={Math.min((tiempoProm / 4) * 100, 100)} />
        <KPICard title="Alertas térmicas (hoy)" value={kpisT?.alertas_termicas_hoy ?? 0} trend="+1" trendUp={false} color={COLORS.amber} progress={60} />
        <KPICard title="Lotes rechazados (mes)" value={kpisT?.lotes_rechazados_mes ?? 0} trend={formatCurrency(kpisT?.perdida_estimada ?? 0)} trendUp={false} color={COLORS.red} progress={54} />
      </section>

      {/* Serie temporal + correlación clima */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard
          title="Serie temporal de temperatura"
          subtitle="Lecturas cada ~30 min durante el traslado"
          badge={
            <select
              value={loteSeleccionado}
              onChange={(e) => setLoteSeleccionado(e.target.value)}
              aria-label="Seleccionar lote"
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-[11px] text-sky-400 focus:border-sky-500 focus:outline-none"
            >
              {todos.map((t) => (
                <option key={t.lote_id} value={t.lote_id}>
                  {t.lote_id}
                </option>
              ))}
            </select>
          }
        >
          <TemperaturaSerieChart serie={loteActual.serie} tipoProducto={loteActual.tipo_producto} loteId={loteActual.lote_id} />
        </ChartCard>

        <ChartCard title="Correlación clima vs temperatura cámara" subtitle="Open-Meteo (ambiente) vs telemetría de cámara">
          <ClimaCorrelacionChart serie={loteActual.serie} loteId={loteActual.lote_id} clima={clima} cargando={climaCargando} />
        </ChartCard>
      </div>

      {/* Alertas por ruta + tiempos de traslado */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard
          title="Alertas por ruta"
          subtitle="Volumen de eventos fuera de rango acumulados por ruta"
          badge={<span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-bold text-red-400">&gt;10 = riesgo alto</span>}
        >
          <AlertasPorRutaChart data={alertasPorRuta} />
        </ChartCard>

        <ChartCard title="Tiempo promedio de traslado por ruta" subtitle="Comparativa con línea de tiempo máximo permitido (4h)">
          <TiempoTrasladoChart data={tiempos} />
        </ChartCard>
      </div>

      {/* Registros de transporte */}
      <section className="animate-fade-in-up">
        <h3 className="mb-3 text-sm font-bold text-slate-100">Registros de eventos de transporte</h3>
        <TransporteTable
          transportes={transportes}
          onVerificar={(lote) => navigate(`/auditoria?lote=${encodeURIComponent(lote)}`)}
        />
      </section>
    </div>
  );
}