import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reportes = () => {
  const [datos, setDatos] = useState([]);
  const [precioMercado, setPrecioMercado] = useState(0);
  const [config, setConfig] = useState({ umbral_temperatura: -18 });

  const KILOS_POR_LOTE = 10000; 

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const resConf = await fetch('http://localhost:3001/api/configuracion');
        if (resConf.ok) setConfig(await resConf.json());

    
        const resEventos = await fetch('http://localhost:3001/api/eventos');
        if (resEventos.ok) setDatos(await resEventos.json());

        const resPrecio = await fetch('http://localhost:3001/api/mercado/precio-camaron');
        if (resPrecio.ok) {
          const dataPrecio = await resPrecio.json();
          setPrecioMercado(parseFloat(dataPrecio.precio) || 0);
        }
      } catch (error) {
        console.error("Error cargando BI:", error);
      }
    };
    fetchData();
  }, []);

  const totalEventos = datos.length;
  const alertas = datos.filter(d => parseFloat(d.temperatura) > parseFloat(config.umbral_temperatura));
  const porcentajeAlertas = totalEventos > 0 ? ((alertas.length / totalEventos) * 100).toFixed(1) : 0;
  const riesgoFinanciero = (alertas.length > 0 ? KILOS_POR_LOTE * precioMercado : 0).toLocaleString('en-US');

  const incidentesPorUbicacion = alertas.reduce((acc, curr) => {
    const found = acc.find(item => item.ubicacion === curr.ubicacion);
    if (found) found.alertas += 1;
    else acc.push({ ubicacion: curr.ubicacion, alertas: 1 });
    return acc;
  }, []);

  const exportarCSV = () => {
    const encabezados = "Lote,Ubicacion,Temperatura,Estado\n";
    const filas = datos.map(d => `${d.lote_id},${d.ubicacion},${d.temperatura},${d.temperatura > config.umbral_temperatura ? 'ALERTA' : 'OPTIMO'}`).join("\n");
    const blob = new Blob([encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "reporte_bi_camaron.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 w-full font-sans">
      <header className="mb-8 border-b border-slate-200 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Inteligencia de Negocios (BI)</h1>
          <p className="text-slate-500 mt-1">Cruce de telemetría y datos de mercado de todos los lotes</p>
        </div>
        <button onClick={exportarCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition flex items-center gap-2">
          Descargar Reporte CSV
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <span className="text-slate-500 text-xs font-bold uppercase">Eventos Totales</span>
          <div className="text-3xl font-black text-slate-800 mt-2">{totalEventos}</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <span className="text-slate-500 text-xs font-bold uppercase">Tasa de Incidencias</span>
          <div className="text-3xl font-black text-amber-600 mt-2">{porcentajeAlertas}%</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <span className="text-slate-500 text-xs font-bold uppercase">Precio Mercado (FRED)</span>
          <div className="text-3xl font-black text-sky-600 mt-2">${precioMercado.toFixed(2)}</div>
        </div>
        <div className="bg-red-50 p-5 rounded-xl shadow-sm border border-red-200">
          <span className="text-red-600 text-xs font-bold uppercase">Riesgo Financiero Estimado</span>
          <div className="text-3xl font-black text-red-700 mt-2">${riesgoFinanciero}</div>
          <span className="text-[10px] text-red-500">Valor de pérdida si los lotes se descartan</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Puntos de Control Críticos (Concentración de Alertas)</h2>
        <div className="h-72 w-full">
          {incidentesPorUbicacion.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentesPorUbicacion} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="ubicacion" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} allowDecimals={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="alertas" fill="#ef4444" radius={[4, 4, 0, 0]} name="N° de Alertas Térmicas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 font-medium">No se registran alertas térmicas que analizar.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reportes;