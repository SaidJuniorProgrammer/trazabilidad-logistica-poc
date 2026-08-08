import BlockchainBlock from '../common/BlockchainBlock.jsx';

export default function BlockchainTimeline({ bloques = [] }) {
  if (!bloques.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-sm text-slate-500">
        Ingresa un lote y ejecuta la verificación para visualizar la cadena de bloques.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {bloques.map((b) => (
        <BlockchainBlock
          key={b.index}
          index={b.index}
          tipoEvento={b.tipoEvento}
          timestamp={b.timestamp}
          data={b.data}
          hash={b.hash_integridad}
          prevHash={b.hash_previo}
          valid={b.valid !== false}
        />
      ))}
    </div>
  );
}