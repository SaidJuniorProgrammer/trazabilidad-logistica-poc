#  Módulo de Trazabilidad Logística Inteligente (PoC)

Prueba de Concepto (PoC) desarrollada para la validación de integridad de datos en la cadena de frío del camarón. Integra arquitectura de microservicios contenerizada con Docker, validación criptográfica (Blockchain-style) y paneles de Inteligencia de Negocios (BI) alimentados por datos de mercado en tiempo real.

##  Arquitectura y Tecnologías
*   **Frontend:** React.js, Vite, Recharts, Tailwind CSS.
*   **Backend:** Node.js, Express, Crypto (SHA-256).
*   **Base de Datos:** PostgreSQL.
*   **Infraestructura:** Docker & Docker Compose.
*   **Integraciones Externas:** FRED API (Reserva Federal) para precios de mercado, Open-Meteo API para clima local.

---

##  Estructura del Proyecto

```text
├── backend/
│   ├── src/
│   │   └── server.js        # API REST y lógica de encadenamiento criptográfico
│   ├── database/
│   │   └── init.sql         # Script semilla de PostgreSQL
│   ├── Dockerfile           # Imagen Docker del servidor
│   ├── seed.js              # Script para inyectar lotes de prueba
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, Auditoría, Reportes, Configuración
│   │   └── App.jsx
│   ├── Dockerfile           # Imagen Docker de la UI
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml       # Orquestador de servicios (DB, Front, Back)
└── .gitignore
```
##  Requisitos Previos
Instalar Docker Desktop.

Instalar Node.js (solo para ejecutar el script semilla localmente).

Obtener API Key de FRED: El módulo de Inteligencia de Negocios requiere una clave para extraer el precio internacional del camarón del FMI.

## Pasos para obtener la API Key de FRED:
Dirígete al portal para desarrolladores de la Reserva Federal: https://fred.stlouisfed.org/docs/api/api_key.html.

Crea una cuenta gratuita y accede a "API Keys".

Solicita una nueva clave detallando el uso (ej. "Proyecto académico de BI y Trazabilidad").

En la carpeta backend/, crea un archivo llamado .env y añade tu clave:
FRED_API_KEY=pega_tu_clave_aqui_sin_comillas

## Instalación y Despliegue (Docker)
El proyecto está completamente dockerizado. Para levantar el entorno de desarrollo con la base de datos vacía, ejecuta en la raíz del proyecto:

```bash
docker-compose up --build -d
```
Nota: La primera vez que se levanta el contenedor de PostgreSQL, puede tardar entre 10 a 15 segundos en ejecutar el archivo init.sql y crear las tablas.

Inyección de Datos (Seed)
Para poder visualizar los paneles de BI y probar la validación de integridad Blockchain, es necesario inyectar datos de prueba.

Abre una terminal dentro de la carpeta /backend.

Asegúrate de tener las dependencias instaladas: npm install.

Ejecuta el motor de siembra:
```bash
node seed.js
```
Este script generará dos lotes de camarón con temperaturas, ubicaciones y hashes criptográficos perfectamente enlazados. Un lote representará una cadena de frío íntegra, y el otro simulará un incidente térmico.

## Endpoints y Accesos
Aplicación Frontend (UI): http://localhost:5173

API Backend: http://localhost:3001

Documentación Swagger (OpenAPI): http://localhost:3001/api-docs

## Casos de Uso Principales:
Panel de Control: Permite registrar nuevos eventos logísticos, creando un hash SHA-256 en tiempo real.

Auditoría Blockchain: Recalcula desde el "Bloque Génesis" toda la cadena de referencias criptográficas para garantizar que ningún dato histórico de temperatura haya sido alterado.

Reportes BI: Cruza la tasa de incidentes térmicos de la telemetría interna con los precios del mercado extraídos de la API externa (FRED) para calcular riesgos financieros.

Desarrollado como proyecto académico de Ingeniería en Software - Universidad Estatal Península de Santa Elena (UPSE).
