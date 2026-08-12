import { useEffect, useMemo, useState } from 'react';
import { api, onDataChange } from '../services/api.js';

export default function useAlertas() {
  const [alertas, setAlertas] = useState([]);
  const [evolucion, setEvolucion] = useState([]);
  const [normativa, setNormativa] = useState([]);
  const [criticos, setCriticos] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [alertasData, evolucionData, normativaData, criticosData, kpisData] = await Promise.all([
        api.getAlertasActivas(),
        api.getAlertasEvolucion(),
        api.getNormativaDistribucion(),
        api.getEventosCriticos(),
        api.getKpisResumen(),
      ]);
      setAlertas(alertasData);
      setEvolucion(evolucionData);
      setNormativa(normativaData);
      setCriticos(criticosData);
      setKpis(kpisData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsubscribe = onDataChange(load);
    return unsubscribe;
  }, []);

  const alertaCritica = useMemo(
    () => alertas.filter((a) => a.severidad !== 'ok').sort((a) => (a.severidad === 'critico' ? -1 : 1))[0] || null,
    [alertas],
  );

  const totalAlertasHoy = useMemo(() => {
    if (!evolucion.length) return 0;
    const hoy = evolucion[evolucion.length - 1];
    return (hoy.termicas || 0) + (hoy.dosificacion || 0);
  }, [evolucion]);

  return {
    alertas,
    alertaCritica,
    evolucion,
    normativa,
    criticos,
    kpis,
    totalAlertasHoy,
    loading,
    reload: load,
  };
}