import { Signal } from 'lucide-react';

export default function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-green-500">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
      </span>
      <Signal className="h-3.5 w-3.5" />
      EN VIVO
    </span>
  );
}