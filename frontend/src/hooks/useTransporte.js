import { useEffect, useMemo, useState } from 'react';
import { api, onDataChange } from '../services/api.js';
import useDebounce from './useDebounce.js';

export default function useTransporte() {
  const [transportes, setTransportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const data = await api.getTransporte();
      setTransportes(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos asíncrona (mock)
    load();
    const unsubscribe = onDataChange(load);
    return unsubscribe;
  }, []);

  return { transportes, loading, error, reload: load };
}

export function useTransporteFiltrado(filtros) {
  const { transportes, loading, reload } = useTransporte();
  const debouncedBusqueda = useDebounce(filtros.busqueda ?? '', 300);

  const filtrados = useMemo(() => {
    let rows = [...transportes];

    if (debouncedBusqueda.trim()) {
      const q = debouncedBusqueda.trim().toLowerCase();
      rows = rows.filter((t) => String(t.lote_id).toLowerCase().includes(q));
    }
    if (filtros.tipo) {
      rows = rows.filter((t) => t.tipo_producto === filtros.tipo);
    }
    if (filtros.ruta) {
      rows = rows.filter((t) => t.ruta === filtros.ruta);
    }
    if (filtros.fechaIni || filtros.fechaFin) {
      rows = rows.filter((t) => {
        const fecha = String(t.timestamp_lectura).slice(0, 10);
        if (filtros.fechaIni && fecha < filtros.fechaIni) return false;
        if (filtros.fechaFin && fecha > filtros.fechaFin) return false;
        return true;
      });
    }

    return rows.sort((a, b) => (a.timestamp_lectura < b.timestamp_lectura ? 1 : -1));
  }, [transportes, debouncedBusqueda, filtros.tipo, filtros.ruta, filtros.fechaIni, filtros.fechaFin]);

  return { transportes: filtrados, todos: transportes, loading, reload };
}