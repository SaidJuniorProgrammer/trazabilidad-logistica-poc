import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Truck, ThermometerSnowflake, Clock, Map, ClipboardList, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Transporte() {
  const [lotes, setLotes] = useState([]);
  const [serieTemporal, setSerieTemporal] = useState([]);
  const [copiado, setCopiado] = useState('');

  useEffect(() => {
    // Simulación de datos para la PoC
    const mockSerie = Array.from({ length: 15 }).map((_, i) => {
      const temp = -17 + Math.sin(i) * 2;
      return {
        hora: `1${i}:00`,
        temp_camara: temp,
        temp_ext: 28 + Math.cos(i) * 3,
        alerta: temp > -18
      };
    });
    setSerieTemporal(mockSerie);

    setLotes([
      { id: 'ECU-FINCA-001', temp_ini: -20, temp_fin: -17.5, duracion: '3h 15m', estado: 'ALERTA_TEMP', decision: 'Inspección Ext.', hash: 'a8b3...2b5' },
      { id: 'ECU-FINCA-002', temp_ini: 2, temp_fin: 3.5, duracion: '2h 40m', estado: 'DENTRO_RANGO', decision: 'Aprobado', hash: 'c7d3...1b3' },
      { id: 'ECU-FINCA-003', temp_ini: -18, temp_fin: -12.0, duracion: '4h 50m', estado: 'FUERA_RANGO', decision: 'RECHAZADO', hash: 'f9a2...e0f' },
      { id: 'ECU-FINCA-004', temp_ini: -22, temp_fin: -19.5, duracion: '1h 30m', estado: 'DENTRO_RANGO', decision: 'Aprobado', hash: 'b4c9...7e5' },
    ]);
  }, []);

  const copiarHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiado(hash);
    setTimeout(() => setCopiado(''), 2000);
  };

  const getStatusBadge = (estado) => {
    if (estado === 'DENTRO_RANGO') return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">DENTRO RANGO</span>;
    if (estado === 'ALERTA_TEMP') return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">ALERTA TÉRMICA</span>;
    return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">FUERA DE RANGO</span>;
  };

  return (
    <div className="p-8 w-full min-h-screen bg-slate-50">
      <header className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Eslabón 1: Transporte
          </h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
            <Truck className="w-5 h-5" /> Control Inmutable de la Cadena de Frío Terrestre
          </p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option>Lote: ECU-FINCA-001</option>
            <option>Lote: ECU-FINCA-002</option>
          </select>
          <select className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option>Congelado (≤-18°C)</option>
            <option>Fresco (0°C - 4°C)</option>
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-xl"><Clock className="w-8 h-8 text-blue-500"/></div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase">T. Promedio Traslado</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">2h 45m</h3>
          </div>
        </motion.div>
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-cyan-50 rounded-xl"><Map className="w-8 h-8 text-cyan-500"/></div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase">Ruta Mayor Riesgo</p>
            <h3 className="text-xl font-black text-slate-800 mt-1">Santa Elena - GYE</h3>
          </div>
        </motion.div>
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="lg:col-span-2 bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2"><ThermometerSnowflake className="w-5 h-5 text-cyan-400"/> Correlación Clima vs Cámara</h3>
          <p className="text-slate-300 text-sm">El 85% de las desviaciones térmicas ocurren cuando la Temp. Exterior (Open-Meteo) supera los 32°C en la ruta.</p>
        </motion.div>
      </div>

      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><ThermometerSnowflake className="text-blue-500 w-6 h-6"/> Serie Temporal de Temperatura</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer>
            <LineChart data={serieTemporal}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
              <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{fill: '#64748b'}}/>
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={[-25, -5]}/>
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#f59e0b'}} domain={[20, 35]}/>
              <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}/>
              <Legend/>
              <ReferenceArea yAxisId="left" y1={-18} y2={-5} fill="#fecaca" fillOpacity={0.2} />
              <Line yAxisId="left" type="monotone" dataKey="temp_camara" name="T. Cámara (°C)" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2}} activeDot={{r: 6}} />
              <Line yAxisId="right" type="monotone" dataKey="temp_ext" name="T. Exterior OpenMeteo (°C)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <ClipboardList className="text-indigo-500 w-6 h-6" />
          <h2 className="text-xl font-bold text-slate-800">Tabla de Eventos de Transporte (Bloques Inmutables)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-extrabold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Lote ID</th>
                <th className="px-6 py-4">Temp Inicial</th>
                <th className="px-6 py-4">Temp Llegada</th>
                <th className="px-6 py-4">Duración</th>
                <th className="px-6 py-4">Estado Recepción</th>
                <th className="px-6 py-4">Hash Blockchain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lotes.map((lote, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-800">{lote.id}</td>
                  <td className="px-6 py-4">{lote.temp_ini}°C</td>
                  <td className="px-6 py-4 font-bold">{lote.temp_fin}°C</td>
                  <td className="px-6 py-4">{lote.duracion}</td>
                  <td className="px-6 py-4">{getStatusBadge(lote.estado)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{lote.hash}</span>
                      <button onClick={() => copiarHash(lote.hash)} className="text-slate-400 hover:text-indigo-600 transition">
                        {copiado === lote.hash ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
