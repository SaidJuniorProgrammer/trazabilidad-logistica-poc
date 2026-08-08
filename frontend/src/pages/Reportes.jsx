import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { PieChart, Pie } from 'recharts';
import { FileBarChart, Filter, Download, ArrowTrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Reportes = () => {
  const [mercado, setMercado] = useState('China (GACC)');

  // Mock Data: Porcentaje de Lotes por Mercado
  const dataCumplimiento = [
    { name: 'Ene', Aprobados: 85, Alertas: 10, Criticos: 5 },
    { name: 'Feb', Aprobados: 90, Alertas: 8, Criticos: 2 },
    { name: 'Mar', Aprobados: 75, Alertas: 15, Criticos: 10 },
    { name: 'Abr', Aprobados: 95, Alertas: 5, Criticos: 0 },
    { name: 'May', Aprobados: 88, Alertas: 10, Criticos: 2 },
  ];

  // Mock Data: Ranking de Operarios
  const dataOperarios = [
    { name: 'Juan P.', desviacion: 12 },
    { name: 'Carlos R.', desviacion: 8 },
    { name: 'Ana M.', desviacion: 4 },
    { name: 'Luis V.', desviacion: 2 },
    { name: 'Pedro C.', desviacion: 1 },
  ];

  // Mock Data: Riesgo Financiero por Mercado (Pie Chart)
  const dataRiesgo = [
    { name: 'China', value: 45000, fill: '#ef4444' },
    { name: 'UE', value: 12000, fill: '#f59e0b' },
    { name: 'FDA', value: 8000, fill: '#3b82f6' },
  ];

  const exportarReporte = () => {
    // Simula una exportación para el video
    alert("Generando PDF Analítico (Simulación para grabación)...");
  };

  return (
    <div className="p-8 w-full min-h-screen bg-slate-50 font-sans">
      <header className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">
            Inteligencia de Negocios (DW)
          </h1>
          <p className="text-slate-500 font-medium mt-2 tracking-wide flex items-center gap-2">
            <FileBarChart className="w-4 h-4" />
            Análisis Dimensional y Reportes Gerenciales
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 ring-indigo-500">
            <div className="pl-4 pr-2 py-3 bg-slate-50 border-r border-slate-200 flex items-center text-slate-500">
              <Filter className="w-4 h-4" />
            </div>
            <select 
              value={mercado} 
              onChange={(e) => setMercado(e.target.value)}
              className="w-48 px-4 py-3 font-semibold text-slate-700 outline-none bg-white cursor-pointer"
            >
              <option>China (GACC)</option>
              <option>Unión Europea (UE)</option>
              <option>EE.UU. (FDA)</option>
            </select>
          </div>
          
          <button 
            onClick={exportarReporte}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Download className="w-5 h-5" /> Exportar
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfica 1: Barras Apiladas */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl border border-slate-100"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <BarChart className="text-indigo-600 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cumplimiento Normativo de SO₂</h2>
              <p className="text-xs text-slate-500">Histórico de lotes exportados a {mercado}</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCumplimiento} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                  cursor={{fill: '#f8fafc'}}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Aprobados" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Alertas" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Criticos" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gráfica 2: Pie Chart Riesgo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-rose-50 rounded-lg">
              <ArrowTrendingUp className="text-rose-600 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Riesgo Financiero</h2>
              <p className="text-xs text-slate-500">Pérdida por mercado (USD)</p>
            </div>
          </div>
          <div className="h-64 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataRiesgo}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {dataRiesgo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-800">$65K</span>
              <span className="text-xs text-slate-500 font-medium">Total Riesgo</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> China</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> UE</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> FDA</div>
          </div>
        </motion.div>

        {/* Gráfica 3: Ranking Operarios */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-xl border border-slate-100"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Filter className="text-amber-600 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Ranking Operacional de Dosificación</h2>
              <p className="text-xs text-slate-500">Tasa de desviación respecto al límite normativo (%) por operario</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={dataOperarios} margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 600}} width={80} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value}%`, 'Tasa de Desviación']}
                />
                <Bar dataKey="desviacion" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={24}>
                  {dataOperarios.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Reportes;