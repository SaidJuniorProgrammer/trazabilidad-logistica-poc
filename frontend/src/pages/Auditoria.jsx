import { useState, useEffect } from 'react';

const Auditoria = () => {
  const [historial, setHistorial] = useState([]);
  const [loteId, setLoteId] = useState('1');
  const [verificacion, setVerificacion] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargarHistorial = () => {
    fetch(`http://localhost:3001/api/eventos/${loteId}`)
      .then(res => res.json())
      .then(data => {
        const datosFormateados = data.map(item => ({
          ...item,
          hora: new Date(item.timestamp).toLocaleString()
        }));
        setHistorial(datosFormateados);
        setVerificacion(null);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    cargarHistorial();
  }, [loteId]);

  const verificarIntegridad = async () => {
    setCargando(true);
    try {
      const res = await fetch(`http://localhost:3001/api/blockchain/verificar/${loteId}`);
      const data = await res.json();
      setTimeout(() => {
        setVerificacion(data);
        setCargando(false);
      }, 800);
    } catch (error) {
      console.error(error);
      setCargando(false);
    }
  };

  return (
    <div className="p-8 w-full font-sans">
      <header className="mb-8 border-b border-slate-200 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Libro Mayor Distribuido</h1>
          <p className="text-slate-500 mt-1">Validación de Integridad y Encadenamiento (Blockchain)</p>
        </div>
        <div className="flex gap-4 items-center">
          <label className="text-sm font-bold text-slate-600 uppercase">Filtrar Lote:</label>
          <input 
            type="number" 
            value={loteId} 
            onChange={(e) => setLoteId(e.target.value)}
            className="w-20 px-3 py-2 border rounded-md font-bold text-center"
          />
        </div>
      </header>

      <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm text-slate-600">
          Los bloques contienen el hash del registro anterior. Al verificar, el sistema valida la conexión de toda la cadena.
        </p>
        <button 
          onClick={verificarIntegridad}
          disabled={cargando || historial.length === 0}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-md transition shadow-md disabled:bg-slate-400"
        >
          {cargando ? 'Validando Enlaces...' : 'Verificar Integridad de Cadena'}
        </button>
      </div>

      {verificacion && (
        <div className={`mb-6 p-5 rounded-xl border flex items-center gap-4 shadow-sm ${verificacion.integra ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
          <div className={`text-4xl ${verificacion.integra ? 'text-emerald-500' : 'text-red-500'}`}>
            {verificacion.integra ? '✓' : '✗'}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${verificacion.integra ? 'text-emerald-800' : 'text-red-800'}`}>
              {verificacion.integra ? 'Cadena Íntegra Validada' : '¡Alerta! Alteración Detectada'}
            </h3>
            <p className={`text-sm font-medium ${verificacion.integra ? 'text-emerald-600' : 'text-red-600'}`}>
              {verificacion.integra 
                ? `Los ${verificacion.totalBloques} bloques están correctamente enlazados.` 
                : `Se rompió el enlace en el bloque ID: ${verificacion.bloqueAlterado}. La cadena ha sido comprometida.`}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Ubicación</th>
                <th className="px-4 py-3">Temp.</th>
                <th className="px-4 py-3">Hash Criptográfico Actual</th>
                <th className="px-4 py-3">Referencia Bloque Anterior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historial.map((reg, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">{reg.ubicacion}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">{reg.temperatura}°C</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-blue-600 break-all">{reg.hash_integridad}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400 break-all">
                    {/* FIX: Mostrar un texto amigable si es el primer bloque de la cadena */}
                    {reg.hash_previo === '0000000000000000000000000000000000000000000000000000000000000000' 
                      ? <span className="text-emerald-600 font-bold">BLOQUE GÉNESIS (000...000)</span> 
                      : reg.hash_previo}
                  </td>
                </tr>
              ))}
              {historial.length === 0 && (
                <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400">No hay registros para este lote.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;