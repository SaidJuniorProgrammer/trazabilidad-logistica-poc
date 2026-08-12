import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Database, DollarSign, Droplets, FlaskConical, Percent } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import ChartCard from '../components/common/ChartCard.jsx';
import FormDosificacion from '../components/dosificacion/FormDosificacion.jsx';
import DosificacionTable from '../components/dosificacion/DosificacionTable.jsx';
import ConcentracionTurnoChart from '../components/charts/ConcentracionTurnoChart.jsx';
import ValidacionNormativaChart from '../components/charts/ValidacionNormativaChart.jsx';
import RankingOperariosChart from '../components/charts/RankingOperariosChart.jsx';
import DesviacionLabChart from '../components/charts/DesviacionLabChart.jsx';
import RiesgoFinancieroChart from '../components/charts/RiesgoFinancieroChart.jsx';
import useDosificacion from '../hooks/useDosificacion.js';
import { calcDosisTeorica, calcRiesgoFinanciero, calcSO2Residual } from '../utils/calculations.js';
import { COLORS } from '../utils/colors.js';

function RiskCard({ icon: Icon, title, value, hint, color }) {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5" style={{ backgroundColor: `${color}1a`, color }}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
          <p className="text-2xl font-black text-slate-100">{value}</p>
          <p className="text-[11px] text-slate-500">{hint}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dosificacion() {
  const navigate = useNavigate();
  const { dosificaciones, turnos, validacion, desviacion, ranking, riesgo } = useDosificacion();
  const [valores, setValores] = useState({ concentracion: 105, peso: 500, normativa: 'China/GACC' });

  const onValuesChange = useCallback((v) => setValores(v), []);

  const riesgoLote = calcRiesgoFinanciero(valores.peso);
  const so2 = calcSO2Residual(valores.concentracion);
  const dosis = calcDosisTeorica(valores.peso);
  const limiteNormativa = valores.normativa.includes('UE') ? 150 : 100;
  const conforme = Number(valores.concentracion) <= limiteNormativa;

  return (
    <div className="space-y-6">
      <Header
        title="Eslabón 2 — Dosificación"
        subtitle="Metabisulfito de sodio, normativa SO₂ residual y desempeño de operarios"
        right={
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400">
            <FlaskConical className="h-4 w-4" />
            China ≤100 · UE ≤150 · FDA ≤100 ppm
          </span>
        }
      />

      {/* Formulario + cards de riesgo */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="animate-fade-in-up rounded-2xl border border-slate-800 bg-slate-900 p-5 xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-100">Registrar nueva dosificación</h3>
          </div>
          <FormDosificacion onValuesChange={onValuesChange} onRegistrado={() => {}} />
        </div>

        <div className="grid content-start gap-4 xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <RiskCard
              icon={DollarSign}
              title="Riesgo financiero lote"
              value={`$${riesgoLote.toLocaleString()}`}
              hint={`${valores.peso} kg × $8.50/kg (CNA 2025)`}
              color={COLORS.red}
            />
            <RiskCard
              icon={Droplets}
              title="SO₂ residual"
              value={`${so2.toFixed(0)} ppm`}
              hint="concentración × factor 1.0"
              color={conforme ? COLORS.green : COLORS.amber}
            />
            <RiskCard
              icon={Percent}
              title="Dosis teórica"
              value={`${Math.round(dosis).toLocaleString('en-US')} ml`}
              hint="2.36 ml/kg × peso"
              color={COLORS.blue}
            />
          </div>
          <RiskCard
            icon={CheckCircle2}
            title="Estado normativo"
            value={conforme ? 'Conforme' : 'Excedido'}
            hint={`vs límite ${limiteNormativa} ppm (${valores.normativa})`}
            color={conforme ? COLORS.green : COLORS.red}
          />
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard title="Concentración SO₂ residual por turno" subtitle="Promedio ppm por turno vs líneas normativas (≤100 y ≤150)">
          <ConcentracionTurnoChart data={turnos} />
        </ChartCard>
        <ChartCard title="Estado de validación por normativa" subtitle="Distribución aprobado / alerta / crítico">
          <ValidacionNormativaChart data={validacion} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard
          title="Ranking operarios — tasa de alerta"
          subtitle="TOP 5 con mayor tasa de alertas de dosificación"
          badge={<span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-bold text-red-400">&gt;15% = riesgo alto</span>}
        >
          <RankingOperariosChart data={ranking} />
        </ChartCard>
        <ChartCard title="Desviación laboratorio vs registro" subtitle="Cada punto es un lote; rojo si desviación &gt;10%">
          <DesviacionLabChart data={desviacion} />
        </ChartCard>
      </div>

      <ChartCard title="Riesgo financiero acumulado" subtitle="Pérdida monetaria acumulada por rechazos durante el mes (USD)">
        <RiesgoFinancieroChart data={riesgo} />
      </ChartCard>

      {/* Registros */}
      <section className="animate-fade-in-up">
        <h3 className="mb-3 text-sm font-bold text-slate-100">Registros de dosificación</h3>
        <DosificacionTable dosificaciones={dosificaciones} onVerCadena={(lote) => navigate(`/auditoria?lote=${encodeURIComponent(lote)}`)} />
      </section>
    </div>
  );
}