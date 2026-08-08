import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, ComposedChart 
} from 'recharts';
import { Activity, AlertTriangle, ShieldCheck, DollarSign, ThermometerSnowflake, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Dashboard() {
  const [dataTransporte, setDataTransporte] = useState([]);
  const [dataDosificacion, setDataDosificacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    lotesAprobados: 0,
    riesgoFinanciero: 0,
    alertasActivas: 0,
    totalEventos: 0
  });

  useEffect(() => {
    // Simulando llamadas a la API (o llamando a la real)
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulando datos para la demostración premium
        const mockDosificacion = [
          { name: 'Lote 1', ppm: 80, limite: 100, estado: 'APROBADO' },
          { name: 'Lote 2', ppm: 110, limite: 100, estado: 'ALERTA' },
          { name: 'Lote 3', ppm: 95, limite: 100, estado: 'APROBADO' },
          { name: 'Lote 4', ppm: 155, limite: 150, estado: 'CRITICO' },
          { name: 'Lote 5', ppm: 140, limite: 150, estado: 'APROBADO' },
        ];
        
        const mockTransporte = Array.from({ length: 10 }).map((_, i) => ({
          time: `1${i}:00`,
          temp: -17 + (Math.random() * 2),
          ext: 25 + (Math.random() * 5)
        }));

        setDataDosificacion(mockDosificacion);
        setDataTransporte(mockTransporte);
        
        setKpis({
          lotesAprobados: 78,
          riesgoFinanciero: 15450,
          alertasActivas: 3,
          totalEventos: 142
        });
        
      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const CardKPI = ({ title, value, icon: Icon, colorClass, subtitle }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className={clsx(
        "relative overflow-hidden p-6 rounded-2xl shadow-xl backdrop-blur-md bg-white/80 border border-white/20",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-10",
        colorClass
      )}
    >
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-4xl font-extrabold text-gray-900 mt-2">{value}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={clsx("p-4 rounded-xl shadow-inner", colorClass.replace('before:', 'bg-').split(' ')[1])}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) return (
    <div className="flex h-full w-full items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
          Inteligencia de Negocios
        </h1>
        <p className="text-gray-500 font-medium mt-2 tracking-wide">
          ShrimpColdChain | Monitoreo en Tiempo Real
        </p>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <CardKPI 
          title="Lotes Aprobados" 
          value={`${kpis.lotesAprobados}%`} 
          icon={ShieldCheck} 
          colorClass="before:from-green-400 before:to-emerald-600 bg-emerald-500" 
          subtitle="Cumplimiento Normativo (China/UE/FDA)"
        />
        <CardKPI 
          title="Riesgo Financiero" 
          value={`$${kpis.riesgoFinanciero.toLocaleString()}`} 
          icon={DollarSign} 
          colorClass="before:from-rose-400 before:to-red-600 bg-rose-500"
          subtitle="Pérdida estimada por rechazos"
        />
        <CardKPI 
          title="Alertas Activas" 
          value={kpis.alertasActivas} 
          icon={AlertTriangle} 
          colorClass="before:from-amber-400 before:to-orange-500 bg-amber-500"
          subtitle="Térmicas y Dosificación"
        />
        <CardKPI 
          title="Eventos Inmutables" 
          value={kpis.totalEventos} 
          icon={Activity} 
          colorClass="before:from-blue-400 before:to-indigo-600 bg-indigo-500"
          subtitle="Registrados en Blockchain SHA-256"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Chart 1 */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center space-x-3 mb-6">
            <ThermometerSnowflake className="text-cyan-500 w-6 h-6" />
            <h2 className="text-xl font-bold text-gray-800">Telemetría Térmica (Lote en Tránsito)</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dataTransporte}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                />
                <Legend />
                <Area type="monotone" dataKey="temp" name="Temp. Cámara (°C)" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                <Line type="monotone" dataKey="ext" name="Temp. Exterior (Open-Meteo)" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 2 */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="text-indigo-500 w-6 h-6" />
            <h2 className="text-xl font-bold text-gray-800">Dosificación Metabisulfito vs Normativa</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataDosificacion} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey="ppm" name="Medición (ppm)" radius={[6, 6, 0, 0]}>
                  {dataDosificacion.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.estado === 'CRITICO' ? '#ef4444' : entry.estado === 'ALERTA' ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
                <Line type="stepAfter" dataKey="limite" name="Límite Normativo" stroke="#6366f1" strokeWidth={3} dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}