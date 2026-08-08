import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { truncateHash } from '../../utils/formatters.js';

export default function HashDisplay({ hash, truncate = true, copyable = true, className = '' }) {
  const [copiado, setCopiado] = useState(false);
  const shown = truncate ? truncateHash(hash) : hash;

  const copiar = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hash);
    } catch {
      /* clipboard no disponible */
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs ${className}`}
      title={hash}
    >
      <span className="rounded-md bg-slate-800 px-2 py-1 text-sky-400">{shown}</span>
      {copyable && (
        <button
          type="button"
          aria-label={`Copiar hash ${hash}`}
          onClick={copiar}
          className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          {copiado ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      )}
    </span>
  );
}