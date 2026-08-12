import { useEffect, useState } from 'react';
import { api, onDataChange } from '../services/api.js';

export default function useDosificacion() {
  const [dosificaciones, setDosificaciones] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [validacion, setValidacion] = useState([]);
  const [desviacion, setDesviacion] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [riesgo, setRiesgo] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [dos, turn, valid, desv, rank, riesgoData] = await Promise.all([
        api.getDosificacion(),
        api.getTurnos(),
        api.getValidacionNormativa(),
        api.getDesviacionLab(),
        api.getOperariosRanking(),
        api.getRiesgoFinancieroMensual(),
      ]);
      setDosificaciones(dos);
      setTurnos(turn);
      setValidacion(valid);
      setDesviacion(desv);
      setRanking(rank);
      setRiesgo(riesgoData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsubscribe = onDataChange(load);
    return unsubscribe;
  }, []);

  return { dosificaciones, turnos, validacion, desviacion, ranking, riesgo, loading, reload: load };
}