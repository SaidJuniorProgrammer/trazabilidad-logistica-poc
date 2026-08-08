import { format, parseISO, subHours } from 'date-fns';

export const UTC_OFFSET_ECUADOR_HOURS = -5;

export function toEcuador(date) {
  return subHours(new Date(date), Math.abs(UTC_OFFSET_ECUADOR_HOURS));
}

export function parseFechaEcuador(iso) {
  try {
    return toEcuador(parseISO(iso));
  } catch {
    return toEcuador(iso);
  }
}

export function formatEcuador(date, pattern = 'yyyy-MM-dd HH:mm') {
  return format(toEcuador(date), pattern);
}

export function formatHora(iso) {
  return format(toEcuador(iso), 'HH:mm:ss');
}

export function formatHoraCorta(iso) {
  return format(toEcuador(iso), 'HH:mm');
}

export function formatFechaISO(iso) {
  return format(toEcuador(iso), 'yyyy-MM-dd');
}

export function formatAhoraEcuador() {
  return formatEcuador(new Date(), 'yyyy-MM-dd HH:mm');
}

export function formatFechaHoraEC(iso) {
  return formatEcuador(iso, 'yyyy-MM-dd HH:mm');
}

export function formatTimestampEC(iso) {
  return formatEcuador(iso, 'yyyy-MM-dd HH:mm:ss');
}

export function formatCurrency(value, decimals = 0) {
  const n = Number(value) || 0;
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatNumber(value, decimals = 1) {
  const n = Number(value) || 0;
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPct(value, decimals = 1) {
  return `${formatNumber(value, decimals)}%`;
}

export function truncateHash(hash, start = 4, end = 4) {
  if (!hash) return '';
  if (hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}