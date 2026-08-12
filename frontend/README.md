# ShrimpColdChain — Frontend (PoC)

Panel de trazabilidad blockchain + BI para la cadena de valor del camarón ecuatoriano (GACC / FDA / UE).
React 19 + Vite 8 + Tailwind CSS v4 + Recharts, con **mock de API** funcional (hasta conectar `backend`).

## Ejecución

```bash
npm install
npm run dev          # http://localhost:5173
```

Con API real (backend en el puerto 3001):

```bash
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:3001
npm run dev
```

## Scripts

| Comando            | Descripción                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Dev server con HMR                           |
| `npm run build`    | Build de producción                          |
| `npm run preview`  | Sirve el build de producción                 |
| `npm run lint`     | ESLint (solo warnings de librerías externas) |

## Vistas

- **Dashboard (`/`)** — KPIs en vivo, alerta crítica destacada, distribución normativa, tabla de últimas alertas con toggle "Solo críticos" y botón **Cargar datos demo**.
- **Transporte (`/transporte`)** — Mapa de puntos GPS, filtros (lote, tipo, ruta, fecha), KPIs, correlación clima-temperatura, tiempos de traslado, export CSV y navegación a auditoría.
- **Dosificación (`/dosificacion`)** — Formulario con validación en vivo (SO₂ residual, dosis teórica, riesgo financiero, conformidad normativa), gráficos de turnos/normativas/operarios/desviación laboratorio/riesgo acumulado.
- **Auditoría (`/auditoria`)** — Verificación SHA-256 de la cadena desde el bloque génesis (progreso + log), resumen de auditoría, timeline vertical y vista transversal por lote. Se puede llegar desde cualquier fila con `?lote=...`.

## Arquitectura

```
src/
├── main.jsx                 # Bootstrap
├── App.jsx                  # Router + layout + lazy loading
├── context/AppContext.jsx   # Toasts globales
├── services/api.js          # Capa de servicios (mock con delay, SHA-256 real, onDataChange)
├── data/seedData.js         # Datos semilla (rutas reales de Ecuador)
├── hooks/                   # useTransporte, useDosificacion, useBlockchain, useAlertas, ...
├── components/
│   ├── common/              # Sidebar, Header, DataTable, KPICard, StatusBadge, HashDisplay, ...
│   ├── charts/              # 11 gráficos Recharts
│   ├── transporte/          # Filtros y tabla
│   ├── dosificacion/        # Formulario (RHF + Zod) y tabla
│   └── auditoria/           # HashVerifier, AuditSummary, BlockchainTimeline
└── pages/                   # Dashboard, Transporte, Dosificacion, Auditoria
```

## API Mock

Sin backend, `services/api.js` devuelve datos semilla con `delay()` aleatorio. Al registar una
dosificación/transporte o cargar datos demo, emite eventos vía `onDataChange` que refrescan todas las
vistas automáticamente. Los hashes son **SHA-256 reales** (Web Crypto). La cadena del lote
`ECU-FINCA-007-2026-08-08` contiene un bloque alterado a propósito para demostrar detección de manipulación.

## Variables de entorno

| Variable                | Default                    | Descripción                 |
| ----------------------- | -------------------------- | --------------------------- |
| `VITE_API_BASE_URL`     | `http://localhost:3001`    | Base URL de la API backend  |
