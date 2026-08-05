import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [formData, setFormData] = useState({ loteId: '1', temperatura: '', ubicacion: '' });
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [historial, setHistorial] = useState([]);
  
  const [climaExterior, setClimaExterior] = useState(null);
  const [precioMercado, setPrecioMercado] = useState("Cargando...");

  const tempPromedio = historial.length > 0 ? (historial.reduce((acc, curr) => acc + curr.temperatura, 0) / historial.length).toFixed(1) : 0;
  const tempMaxima = historial.length > 0 ? Math.max(...historial.map(h => h.temperatura)).toFixed(1) : 0;
  const cadenaRota = historial.some(h => h.temperatura > -18);

  const cargarDatosExternos = async () => {
    try {
      const resClima = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-2.23&longitude=-80.91&current_weather=true');
      const dataClima = await resClima.json();
      setClimaExterior(dataClima.current_weather.temperature);
    } catch (err) { console.error("Error Clima:", err); }

    try {
      const resScraping = await fetch('http://localhost:3001/api/mercado/precio-camaron');
      const dataScraping = await resScraping.json();
      let periodoTexto = '';
      if (dataScraping.periodo) {
        const fecha = new Date(dataScraping.periodo + 'T00:00:00');
        periodoTexto = ` (${fecha.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })})`;
      }
      setPrecioMercado(`$${dataScraping.precio} ${dataScraping.moneda}${periodoTexto}`);
    } catch (err) { setPrecioMercado("Error de Scraping"); }
  };

  const cargarHistorial = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/eventos/${formData.loteId}`);
      if (response.ok) {
        const data = await response.json();
        const datosFormateados = data.map(item => ({
          ...item,
          hora: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temperatura: parseFloat(item.temperatura)
        }));
        setHistorial(datosFormateados);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    cargarHistorial();
    cargarDatosExternos();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResultado(null);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/evento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loteId: parseInt(formData.loteId),
          temperatura: parseFloat(formData.temperatura),
          ubicacion: formData.ubicacion
        })
      });

      if (!response.ok) throw new Error('Error en el servidor');

      const data = await response.json();
      setResultado(data);
      cargarHistorial();
      setFormData({ ...formData, temperatura: '', ubicacion: '' });
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="p-8 w-full">
      <header className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Panel Principal</h1>
          <p className="text-slate-500 mt-1">Supervisión de Trazabilidad Inteligente</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clima Local (API)</span>
            <span className="text-lg font-bold text-sky-600">{climaExterior !== null ? `${climaExterior}°C` : '...'}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mercado (Scraping)</span>
            <span className="text-lg font-bold text-emerald-600">{precioMercado}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Registrar Sensor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">ID del Lote</label>
                <input type="number" name="loteId" value={formData.loteId} onChange={handleChange} required 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div> */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Temp. Contenedor (°C)</label>
                <input type="number" step="0.1" name="temperatura" value={formData.temperatura} onChange={handleChange} required 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Punto de Control</label>
                <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} required placeholder="Ej. Empacadora"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-md transition duration-200 shadow-md text-sm">
                Sellar Registro Seguro
              </button>
            </form>
          </div>

          {resultado && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-sm">
              <h3 className="text-emerald-800 font-bold text-sm mb-1">Integridad Validada</h3>
              <p className="text-xs text-emerald-600 mb-2">Hash almacenado en bloque logístico.</p>
              <code className="block bg-emerald-100 text-emerald-900 p-2 rounded text-[10px] break-all font-mono border border-emerald-300">
                {resultado.hashGenerado}
              </code>
            </div>
          )}
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Promedio Térmico</span>
              <div className="text-3xl font-black text-slate-800 mt-2">{tempPromedio}°C</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Pico Máximo</span>
              <div className="text-3xl font-black text-slate-800 mt-2">{tempMaxima}°C</div>
            </div>
            <div className={`p-5 rounded-xl shadow-sm border ${cadenaRota ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <span className={`text-xs font-bold uppercase tracking-wide ${cadenaRota ? 'text-red-600' : 'text-emerald-600'}`}>Estado de Carga</span>
              <div className={`text-2xl font-black mt-2 ${cadenaRota ? 'text-red-700' : 'text-emerald-700'}`}>
                {cadenaRota ? 'ALERTA TÉRMICA' : 'RANGO ÓPTIMO'}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Fluctuación Térmica en Tiempo Real (Lote #{formData.loteId})</h2>
            <div className="h-72 w-full">
              {historial.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historial} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="hora" stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{fontSize: 12}} domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <ReferenceLine y={-18} stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'Límite Cadena Frío (-18°C)', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="temperatura" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 font-medium">Registra eventos logísticos para el modelo analítico.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;