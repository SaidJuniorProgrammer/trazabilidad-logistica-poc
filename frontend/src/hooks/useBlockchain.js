import { useCallback, useState } from 'react';
import { api } from '../services/api.js';

export function useBlockchain(loteInicial) {
  const [loteId, setLoteId] = useState(loteInicial || 'ECU-PLANTA-003-2026-08-08');
  const [cadena, setCadena] = useState([]);
  const [verificado, setVerificado] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 });
  const [log, setLog] = useState([]);

  const cargarCadena = useCallback(async (id) => {
    const target = id || loteId;
    if (!target) return;
    setCadena([]);
    setVerificado(null);
    const bloques = await api.getCadena(target);
    setCadena(bloques);
  }, [loteId]);

  const verificar = useCallback(async (id) => {
    const target = id || loteId;
    if (!target) return;
    setVerificando(true);
    setLog([]);
    setVerificado(null);
    setProgreso({ actual: 0, total: 0 });

    const lines = [];
    const onProgreso = (p) => setProgreso(p);
    const onLine = (line) => {
      lines.push(line);
      setLog([...lines]);
    };

    const resultado = await api.validateChainProgresivo(target, { onProgreso, onLine });
    setCadena(resultado.bloques);
    setVerificado(resultado);
    setVerificando(false);
    return resultado;
  }, [loteId]);

  const limpiar = useCallback(() => {
    setCadena([]);
    setVerificado(null);
    setLog([]);
    setProgreso({ actual: 0, total: 0 });
  }, []);

  return {
    loteId,
    setLoteId,
    cadena,
    cargarCadena,
    verificado,
    verificar,
    verificando,
    progreso,
    log,
    limpiar,
  };
}