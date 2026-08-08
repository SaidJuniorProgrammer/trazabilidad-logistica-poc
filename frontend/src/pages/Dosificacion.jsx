import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell, Line } from 'recharts';
import { FlaskConical, AlertTriangle, ShieldCheck, Database, Send, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dosificacion() {
  const [formData, setFormData] = useState({ lote_id: 'ECU-FINCA-001', concentracion_ppm: 120, volumen_ml: 500, peso_lote_kg: 1000, operario_id: 'OP-005', normativa_destino: 'China/GACC' });
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [alertaPredictiva, setAlertaPredictiva] = useState(true);

  // Mock data for charts
  const dataEstado = [
    { mercado: 'China', APROBADO: 120, ALERTA: 15, CRITICO: 8 },
    { mercado: 'UE', APROBADO: 150, ALERTA: 5, CRITICO: 1 },
    { mercado: 'FDA', APROBADO: 90, ALERTA: 12, CRITICO: 3 },
  ];

  const dataScatter = Array.from({ length: 20 }).map(() => ({
    x: Math.floor(Math.random() * 50) + 80, // Medida
    y: Math.floor(Math.random() * 50) + 80, // Lab
    z: 10
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setRegistroExitoso(true);
    setTimeout(() => setRegistroExitoso(false), 3000);
  };

  return (
    <div className="p-8 w-full min-h-screen bg-slate-50">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-indigo-600">
          Eslabón 2: Dosificación
        </h1>
        <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
          <FlaskConical className="w-5 h-5" /> Control de Aditivos Químicos y Cumplimiento Normativo
        </p>
      </header>

      <AnimatePresence>
        {alertaPredictiva && (
          <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="mb-8 p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full"><AlertTriangle className="w-8 h-8" /></div>
              <div>
                <h3 className="font-bold text-lg">Alerta Predictiva Generada</h3>
                <p className="text-sm text-white/90">Lote ECU-FINCA-001 excede límite China (100ppm) pero está dentro de UE (150ppm). Se sugiere redirección de mercado.</p>
              </div>
            </div>
            <div className="text-right hidden md:block pr-4">
              <p className="text-xs uppercase font-bold text-white/70">Riesgo Mitigado Estimado</p>
              <p className="text-2xl font-black flex items-center justify-end gap-1"><DollarSign className="w-5 h-5"/> 8,500.00</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Formulario */}
        <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 xl:col-span-1">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Database className="text-fuchsia-500 w-6 h-6"/> Registro PoC Simulado</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-xs font-bold text-slate-500 uppercase">Lote ID</label><input type="text" value={formData.lote_id} onChange={e=>setFormData({...formData, lote_id:e.target.value})} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:border-fuchsia-500 transition-all" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-slate-500 uppercase">Concentración (ppm)</label><input type="number" value={formData.concentracion_ppm} onChange={e=>setFormData({...formData, concentracion_ppm:e.target.value})} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:border-fuchsia-500 transition-all" /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Volumen (ml)</label><input type="number" value={formData.volumen_ml} onChange={e=>setFormData({...formData, volumen_ml:e.target.value})} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:border-fuchsia-500 transition-all" /></div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Normativa Destino</label>
              <select value={formData.normativa_destino} onChange={e=>setFormData({...formData, normativa_destino:e.target.value})} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:border-fuchsia-500 transition-all cursor-pointer">
                <option>China/GACC (≤100ppm)</option>
                <option>UE (≤150ppm)</option>
                <option>FDA/EE.UU. (≤100ppm)</option>
              </select>
            </div>
            <button type="submit" className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${registroExitoso ? 'bg-emerald-500' : 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500'}`}>
              {registroExitoso ? <><ShieldCheck className="w-5 h-5"/> ¡Inmutabilizado en Blockchain!</> : <><Send className="w-5 h-5"/> Registrar en Blockchain</>}
            </button>
          </form>
        </motion.div>

        <div className="xl:col-span-2 grid grid-rows-2 gap-8">
          {/* Grafico Estado Validacion */}
          <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 h-full">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><ShieldCheck className="text-emerald-500 w-5 h-5"/> Distribución de Validación por Mercado</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataEstado} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="mercado" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 600}} width={60} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Bar dataKey="APROBADO" stackId="a" fill="#10b981" radius={[4, 0, 0, 4]} barSize={20} />
                  <Bar dataKey="ALERTA" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="CRITICO" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Grafico Desviacion Lab */}
          <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay: 0.1}} className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 h-full">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><FlaskConical className="text-blue-500 w-5 h-5"/> Desviación Registro Operario vs. Laboratorio</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" dataKey="x" name="Registro Planta (ppm)" tick={{fill: '#64748b'}} domain={[80, 140]} />
                  <YAxis type="number" dataKey="y" name="Laboratorio (ppm)" tick={{fill: '#64748b'}} domain={[80, 140]} />
                  <ZAxis type="number" dataKey="z" range={[50, 50]} />
                  <RechartsTooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Scatter data={dataScatter} fill="#8b5cf6" shape="circle">
                    {dataScatter.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Math.abs(entry.x - entry.y) > 10 ? '#ef4444' : '#8b5cf6'} />
                    ))}
                  </Scatter>
                  {/* Línea de tendencia ideal (x=y) */}
                  <Line dataKey="y" data={[{x:80,y:80}, {x:140,y:140}]} stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
