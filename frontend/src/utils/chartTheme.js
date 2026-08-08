import { COLORS } from './colors.js';

export const chartTooltipStyle = {
  backgroundColor: '#0f172a',
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  color: COLORS.text,
  fontSize: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
};

export const axisTick = { fill: '#94a3b8', fontSize: 11 };
export const gridStroke = '#1e293b';
export const gridProps = {
  stroke: gridStroke,
  strokeDasharray: '4 4',
  vertical: false,
};

export function formatAlertasTooltip(entry) {
  return [`${entry.value} alertas`, entry.name];
}