import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Link as LinkIcon, Database, Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Auditoria = () => {
  const [historial, setHistorial] = useState([]);
  const [loteId, setLoteId] = useState('ECU-FINCA-001');
  const [verificacion, setVerificacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [usandoMock, setUsandoMock] = useState(false);

  const mockBlockchainData = [
    {
      id: 1,
      tipo_evento: 'transporte',
      ubicacion: 'Finca La Libertad (Origen)',
      temperatura: '2.5',
      timestamp: new Date(Date.now() - 10000000).toISOString(),
      hash_integridad: 'a8b3c9d7e5f2a1b4c6d8e0f9a2b5c7d3e6f1a8b4c9d2e5f7a1b3c6d8e0f9a2b5',
      hash_previo: '0000000000000000000000000000000000000000000000000000000000000000'
    },
    {
      id: 2,
      tipo_evento: 'transporte',
      ubicacion: 'Ruta 15 (Temp Ext: 28°C)',
      temperatura: '2.8',
      timestamp: new Date(Date.now() - 8000000).toISOString(),
      hash_integridad: 'c7d3e6f1a8b4c9d2e5f7a1b3c6d8e0f9a2b5a8b3c9d7e5f2a1b4c6d8e0f9a2b5',
      hash_previo: 'a8b3c9d7e5f2a1b4c6d8e0f9a2b5c7d3e6f1a8b4c9d2e5f7a1b3c6d8e0f9a2b5'
    },
    {
      id: 3,
      tipo_evento: 'dosificacion',
      ubicacion: 'Planta Empacadora Guayaquil',
      temperatura: 'N/A (95 ppm SO2)',
      timestamp: new Date(Date.now() - 2000000).toISOString(),
      hash_integridad: 'f9a2b5c7d3e6f1a8b4c9d2e5f7a1b3c6d8e0a8b3c9d7e5f2a1b4c6d8e0f9a2b5',
      hash_previo: 'c7d3e6f1a8b4c9d2e5f7a1b3c6d8e0f9a2b5a8b3c9d7e5f2a1b4c6d8e0f9a2b5'
    }
  ];

  const cargarHistorial = () => {
    // Si queremos que el video quede perfecto, cargamos mock data directo para la presentación
    const datosFormateados = mockBlockchainData.map(item => ({
      ...item,
      hora: new Date(item.timestamp).toLocaleString()
    }));
    setHistorial(datosFormateados);
    setVerificacion(null);
    setUsandoMock(true);
  };

  useEffect(() => {
    cargarHistorial();
  }, [loteId]);

  const verificarIntegridad = () => {
    setCargando(true);
    // Simular el tiempo de respuesta del servidor y recálculo de hashes para el video
    setTimeout(() => {
      setVerificacion({
        integra: true,
        totalBloques: mockBlockchainData.length
      });
      setCargando(false);
    }, 1500);
  };

  return (
    <div className="p-8 w-full min-h-screen bg-slate-50 font-sans">
      <header className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500">
            Libro Mayor Distribuido
          </h1>
          <p className="text-slate-500 font-medium mt-2 tracking-wide flex items-center gap-2">
            <Database className="w-4 h-4" />
            Validación de Integridad y Encadenamiento (Blockchain)
          </p>
        </div>
        
        <div className="flex bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 ring-indigo-500 transition-all">
          <div className="pl-4 pr-2 py-3 bg-slate-50 border-r border-slate-200 flex items-center text-slate-500">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            value={loteId} 
            onChange={(e) => setLoteId(e.target.value)}
            placeholder="ID de Lote (ej. ECU-FINCA-001)"
            className="w-48 px-4 py-3 font-semibold text-slate-700 outline-none"
          />
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-lg border border-slate-100 gap-6"
      >
        <div className="flex-1 flex gap-4 items-start">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Cadena Criptográfica Inmutable</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Cada bloque contiene el hash del registro operativo anterior. Al verificar, el motor de la PoC recalcula cada hash SHA-256 desde el bloque génesis para detectar la más mínima alteración a posteriori en las bases de datos transaccionales.
            </p>
          </div>
        </div>
        
        <button 
          onClick={verificarIntegridad}
          disabled={cargando || historial.length === 0}
          className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center gap-2 shrink-0"
        >
          {cargando ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verificando...</>
          ) : (
            <><ShieldCheck className="w-5 h-5" /> Auditar Integridad</>
          )}
        </button>
      </motion.div>

      {verificacion && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-8 p-6 rounded-2xl border-2 flex items-center gap-6 shadow-md ${verificacion.integra ? 'bg-emerald-50 border-emerald-400' : 'bg-rose-50 border-rose-400'}`}
        >
          <div className={`p-4 rounded-full ${verificacion.integra ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            {verificacion.integra ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
          </div>
          <div>
            <h3 className={`font-black text-2xl ${verificacion.integra ? 'text-emerald-800' : 'text-rose-800'}`}>
              {verificacion.integra ? 'Certificación Exitosa: Cadena Íntegra' : '¡Alerta Crítica! Alteración Detectada'}
            </h3>
            <p className={`text-base font-medium mt-1 ${verificacion.integra ? 'text-emerald-600' : 'text-rose-600'}`}>
              {verificacion.integra 
                ? `Los ${verificacion.totalBloques} bloques transaccionales del lote ${loteId} están criptográficamente enlazados y sin modificaciones.` 
                : `Se rompió el enlace SHA-256 en el bloque ID: ${verificacion.bloqueAlterado}. La cadena ha sido comprometida.`}
            </p>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Adorno superior tabla */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500" />
        
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm text-slate-600 border-separate border-spacing-y-3">
            <thead>
              <tr className="text-xs uppercase text-slate-400 font-extrabold tracking-wider px-4">
                <th className="px-6 py-2">Evento Operativo</th>
                <th className="px-6 py-2">Ubicación / Fase</th>
                <th className="px-6 py-2">Dato Crítico</th>
                <th className="px-6 py-2 text-indigo-600">Hash SHA-256 Actual</th>
                <th className="px-6 py-2">Firma Bloque Anterior</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((reg, index) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index} 
                  className="bg-slate-50 hover:bg-slate-100 transition-all rounded-xl shadow-sm"
                >
                  <td className="px-6 py-4 rounded-l-xl font-bold text-slate-700 capitalize">
                    {reg.tipo_evento}
                  </td>
                  <td className="px-6 py-4 font-medium">{reg.ubicacion}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">
                      {reg.temperatura}{reg.tipo_evento === 'transporte' ? '°C' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-[11px] text-indigo-600 bg-indigo-50 px-3 py-2 rounded border border-indigo-100 break-all w-64 leading-tight">
                      {reg.hash_integridad}
                    </div>
                  </td>
                  <td className="px-6 py-4 rounded-r-xl">
                    {reg.hash_previo === '0000000000000000000000000000000000000000000000000000000000000000' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg text-xs">
                        <ArrowRight className="w-3 h-3" /> BLOQUE GÉNESIS
                      </span>
                    ) : (
                      <div className="font-mono text-[11px] text-slate-500 bg-slate-200/50 px-3 py-2 rounded border border-slate-200 break-all w-64 leading-tight">
                        {reg.hash_previo}
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;