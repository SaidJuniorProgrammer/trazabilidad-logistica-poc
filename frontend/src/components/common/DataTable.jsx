import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import clsx from 'clsx';

export default function DataTable({
  columns,
  rows = [],
  pageSize = 5,
  pagination = true,
  emptyMessage = 'Sin registros para los filtros seleccionados',
  className = '',
}) {
  const [page, setPage] = useState(0);
  const total = rows?.length || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages - 1);

  const pageRows = useMemo(() => {
    if (!pagination) return rows || [];
    const start = safePage * pageSize;
    return (rows || []).slice(start, start + pageSize);
  }, [rows, safePage, pageSize, pagination]);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-16 text-center">
        <Inbox className="h-10 w-10 text-slate-700" />
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
              {columns.map((col) => (
                <th key={col.key} className={clsx('px-4 py-3 font-bold', col.headerClassName)}>
                  {col.label || col.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {pageRows.map((row, i) => (
              <tr key={`${row.id || i}-${i}`} className="transition-colors hover:bg-slate-800/40">
                {columns.map((col) => (
                  <td key={col.key} className={clsx('px-4 py-3', col.cellClassName)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2.5">
          <p className="text-xs text-slate-500">
            Mostrando{' '}
            <strong className="text-slate-300">
              {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, total)}
            </strong>{' '}
            de <strong className="text-slate-300">{total}</strong>
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Página anterior"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-bold text-slate-400">
              {safePage + 1} / {totalPages}
            </span>
            <button
              type="button"
              aria-label="Página siguiente"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}