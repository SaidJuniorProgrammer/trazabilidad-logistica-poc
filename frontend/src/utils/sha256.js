async function digestMessage(message) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function sha256Hex(payload) {
  const normalized =
    typeof payload === 'string'
      ? payload
      : JSON.stringify(payload, (key, value) => (value === undefined ? null : value));
  if (!crypto?.subtle) return null;
  return digestMessage(normalized);
}

export function buildChainPayload({ index, timestamp, tipoEvento, data, hash_previo }) {
  return JSON.stringify({ index, timestamp, tipoEvento, data, hash_previo });
}