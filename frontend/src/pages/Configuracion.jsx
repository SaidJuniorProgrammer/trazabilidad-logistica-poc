import { useState, useEffect } from 'react';

const Configuracion = () => {
  const [config, setConfig] = useState({ umbralTemperatura: -18, frecuenciaScraping: 6 });
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/configuracion')
      .then(res => res.json())
      .then(data => {
        setConfig({
          umbralTemperatura: data.umbral_temperatura,
          frecuenciaScraping: data.frecuencia_scraping
        });
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => setConfig({ ...config, [e.target.name]: e.target.value });

  const guardarCambios = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3001/api/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 w-full max-w-3xl font-sans">
      <header className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-800">Configuración del Sistema</h1>
        <p className="text-slate-500 mt-1">Parámetros globales de la plataforma</p>
      </header>

      <form onSubmit={guardarCambios} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Umbral de Alerta Térmica (°C)</label>
          <p className="text-xs text-slate-500 mb-3">Las temperaturas registradas por encima de este valor dispararán advertencias en el Dashboard y Reportes.</p>
          <input 
            type="number" step="0.1" name="umbralTemperatura" 
            value={config.umbralTemperatura} onChange={handleChange}
            className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block text-sm font-bold text-slate-700 mb-2">Frecuencia de Caché para Extracción (Horas)</label>
          <p className="text-xs text-slate-500 mb-3">Tiempo de espera antes de volver a consumir la API externa de mercado para prevenir bloqueos por exceso de peticiones.</p>
          <input 
            type="number" name="frecuenciaScraping" 
            value={config.frecuenciaScraping} onChange={handleChange}
            className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>

        <div className="pt-6 flex items-center gap-4">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-md shadow-md transition">
            Guardar Configuración
          </button>
          {guardado && <span className="text-emerald-600 font-bold text-sm">¡Cambios guardados con éxito!</span>}
        </div>
      </form>
    </div>
  );
};

export default Configuracion;