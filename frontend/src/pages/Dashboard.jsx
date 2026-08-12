import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import LiveIndicator from '../components/common/LiveIndicator.jsx';
import KPICard from '../components/common/KPICard.jsx';
import AlertBanner from '../components/common/AlertBanner.jsx';
import HashDisplay from '../components/common/HashDisplay.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import ChartCard from '../components/common/ChartCard.jsx';
import DataTable from '../components/common/DataTable.jsx';
import AlertasEvolutionChart from '../components/charts/AlertasEvolutionChart.jsx';
import NormativaDonutChart from '../components/charts/NormativaDonutChart.jsx';
import useAlertas from '../hooks/useAlertas.js';
import useAnimatedNumber from '../hooks/useAnimatedNumber.js';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';
import { formatAhoraEcuador, formatCurrency, formatFechaHoraEC } from '../utils/formatters.js';
import { COLORS } from '../utils/colors.js';

export default function Dashboard() {
  const { showToast } = useApp();
  const { alertaCritica, evolucion, normativa, criticos, kpis, totalAlertasHoy } = useAlertas();
  const [demoCargando, setDemoCargando] = useState(false);
  const [soloCriticos, setSoloCriticos] = useState(false);

  const cumplimientoAnim = useAnimatedNumber(kpis?.cumplimiento_termico ?? 0, 1000, 1);
  const dosificacionAnim = useAnimatedNumber(kpis?.dosificacion_aprobada ?? 0, 1000, 1);
  const riesgoAnim = useAnimatedNumber(kpis?.riesgo_acumulado ?? 0, 1000, 0);

  const generarDemo = async () => {
    setDemoCargando(true);
    try {
      const res = await api.generarDatosDemo();
      showToast(`Se generaron ${res.lotes} lotes de transporte y ${res.dosificaciones} dosificaciones de demostración.`, 'success');
    } catch {
      showToast('Error al generar datos demo.', 'error');
    } finally {
      setDemoCargando(false);
    }
  };

  const filas = soloCriticos ? criticos.filter((c) => c.estado === 'critico') : criticos;

  const columnas = [
    {
      key: 'lote_id',
      label: 'Lote ID',
      render: (r) => <span className="font-mono text-xs text-sky-400">{r.lote_id}</span>,
    },
    {
      key: 'eslabon',
      label: 'Eslabón',
      render: (r) => (
        <span className={r.eslabon === 'Transporte' ? 'text-sky-300' : 'text-amber-300'}>{r.eslabon}</span>
      ),
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (r) => <span className="text-slate-400">{formatFechaHoraEC(r.timestamp)}</span>,
    },
    {
      key: 'problema',
      label: 'Problema',
      render: (r) => <span className="max-w-[220px] truncate text-slate-300">{r.problema}</span>,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (r) => <StatusBadge status={r.estado} />,
    },
    {
      key: 'hash',
      label: 'Hash blockchain',
      render: (r) => <HashDisplay hash={r.hash} />,
    },
    {
      key: 'riesgo',
      label: 'Riesgo USD',
      cellClassName: 'font-bold',
      render: (r) => (
        <span className={r.riesgo > 0 ? 'text-red-400' : 'text-green-500'}>
          {r.riesgo > 0 ? formatCurrency(r.riesgo) : '$0'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Resumen Ejecutivo — Trazabilidad Inteligente del Camarón"
        subtitle={`Sistema de trazabilidad blockchain con BI · Zona horaria Ecuador (GMT-5): ${formatAhoraEcuador()} GMT-5`}
        right={
          <>
            <LiveIndicator />
            <button
              type="button"
              onClick={generarDemo}
              disabled={demoCargando}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-200 transition-colors hover:border-sky-500 hover:text-sky-400 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${demoCargando ? 'animate-spin' : ''}`} />
              {demoCargando ? 'Generando…' : 'Generar Datos Demo'}
            </button>
          </>
        }
      />

      {alertaCritica && (
        <AlertBanner
          type={alertaCritica.severidad}
          message={alertaCritica.titulo}
          suggestion={alertaCritica.suggestion || alertaCritica.sugerencia}
        />
      )}

      {/* KPIs superiores */}
      <section className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Cumplimiento térmico"
          value={`${cumplimientoAnim.toFixed(1)}%`}
          trend="+1.8%"
          trendUp
          color={COLORS.green}
          progress={cumplimientoAnim}
        />
        <KPICard
          title="Dosificación aprobada"
          value={`${dosificacionAnim.toFixed(1)}%`}
          trend="+0.4%"
          trendUp
          color={COLORS.blue}
          progress={dosificacionAnim}
        />
        <KPICard
          title="Integridad blockchain"
          value="100%"
          trend="Estable"
          trendUp
          color={COLORS.amber}
          progress={100}
        />
        <KPICard
          title="Riesgo financiero acumulado"
          value={formatCurrency(Math.round(riesgoAnim))}
          trend="+$8.5k"
          trendUp={false}
          color={COLORS.red}
          progress={Math.min((riesgoAnim / 150000) * 100, 100)}
        />
      </section>

      {/* Gráficos fila superior */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard
          title="Evolución de alertas — últimos 14 días"
          subtitle="Serie térmica (azul) vs dosificación (ámbar), con línea de promedio"
          badge={
            <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-bold text-red-400">
              +{totalAlertasHoy} alertas hoy
            </span>
          }
        >
          <AlertasEvolutionChart data={evolucion} />
        </ChartCard>

        <ChartCard
          title="Distribución por normativa"
          subtitle="Lotes según mercado destino y límite SO₂ residual"
          badge={<span className="rounded-full bg-green-500/15 px-2.5 py-1 text-[11px] font-bold text-green-400">China ≤100ppm</span>}
        >
          <NormativaDonutChart data={normativa} aprobados={kpis?.dosificacion_aprobada ?? 87.5} />
        </ChartCard>
      </div>

      {/* Tabla de eventos críticos */}
      <section className="animate-fade-in-up">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Últimos eventos críticos</h3>
            <p className="text-xs text-slate-500">Eventos de ambos eslabones con hash SHA-256 enlazado</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={soloCriticos}
              onChange={(e) => setSoloCriticos(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
            />
            <span className={`font-bold ${soloCriticos ? 'text-red-400' : 'text-slate-400'}`}>Solo críticos</span>
          </label>
        </div>
        <DataTable columns={columnas} rows={filas} pageSize={5} />
      </section>
    </div>
  );
}