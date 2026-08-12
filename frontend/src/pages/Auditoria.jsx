import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import ChartCard from '../components/common/ChartCard.jsx';
import DataTable from '../components/common/DataTable.jsx';
import HashVerifier from '../components/auditoria/HashVerifier.jsx';
import BlockchainTimeline from '../components/auditoria/BlockchainTimeline.jsx';
import AuditSummary from '../components/auditoria/AuditSummary.jsx';
import { useBlockchain } from '../hooks/useBlockchain.js';
import { api } from '../services/api.js';
import { formatFechaHoraEC, truncateHash } from '../utils/formatters.js';

export default function Auditoria() {
  const [searchParams] = useSearchParams();
  const loteInicial = searchParams.get('lote') || undefined;

  const { loteId, setLoteId, cadena, verificado, verificar, verificando, progreso, log, limpiar } = useBlockchain(loteInicial);
  const [sugerencias, setSugerencias] = useState([]);

  useEffect(() => {
    api.getLotes().then(setSugerencias);
  }, []);

  useEffect(() => {
    if (loteInicial) {
      verificar(loteInicial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bloques = verificado?.bloques || cadena;

  const columnasTransversal = [
    {
      key: 'index',
      label: 'Bloque',
      cellClassName: 'font-bold text-slate-200',
      render: (r) => r.index,
    },
    {
      key: 'tipoEvento',
      label: 'Tipo',
      render: (r) => <span className="capitalize text-slate-300">{r.tipoEvento}</span>,
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (r) => <span className="text-slate-400">{formatFechaHoraEC(r.timestamp)}</span>,
    },
    {
      key: 'dato',
      label: 'Dato crítico',
      render: (r) => {
        if (r.tipoEvento === 'transporte') return <span>Temp: {r.data.temp}°C</span>;
        if (r.tipoEvento === 'dosificacion') return <span>Conc: {r.data.ppm ?? r.data.indic} ppm</span>;
        if (r.tipoEvento === 'verificacion') return <span>Lab: {r.data.lab_ppm} ppm</span>;
        return <span className="text-slate-500">{r.data.descripcion}</span>;
      },
    },
    {
      key: 'hash',
      label: 'Hash',
      render: (r) => <code className="font-mono text-xs text-sky-400">{truncateHash(r.hash_integridad, 4, 4)}</code>,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (r) =>
        r.valid === false ? (
          <span className="font-bold text-red-400">✗ ALTERADO</span>
        ) : (
          <span className="font-bold text-green-500">✓ VÁLIDO</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Auditoría Blockchain"
        subtitle="Verificación criptográfica SHA-256 para auditorías GACC / FDA / UE — inmutabilidad en segundos"
        right={
          <span className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-500">
            <ShieldCheck className="h-4 w-4" />
            Recálculo desde bloque génesis
          </span>
        }
      />

      <HashVerifier
        loteId={loteId}
        setLoteId={setLoteId}
        sugerencias={sugerencias}
        onVerificar={(id) => verificar(id)}
        verificando={verificando}
        verificado={verificado}
        progreso={progreso}
        log={log}
        limpiar={limpiar}
      />

      {verificado && (
        <ChartCard title="Resumen de auditoría" subtitle={`Lote ${loteId}`}>
          <AuditSummary verificado={verificado} />
        </ChartCard>
      )}

      <ChartCard title={`Visualización de la cadena — ${bloques.length} bloques`} subtitle="Timeline vertical con hash_previo encadenado a cada bloque">
        <div className="max-h-[560px] overflow-y-auto pr-2">
          <BlockchainTimeline bloques={bloques} />
        </div>
      </ChartCard>

      {bloques.length > 0 && (
        <ChartCard title="Vista transversal por lote" subtitle="Integración de ambos eslabones por bloque">
          <DataTable columns={columnasTransversal} rows={bloques} pageSize={8} />
        </ChartCard>
      )}
    </div>
  );
}