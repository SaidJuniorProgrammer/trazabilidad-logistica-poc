const axios = require('axios');

const generarSemillas = async () => {
  console.log("Iniciando siembra de datos logísticos...");
  
  const eventos = [
    // --- LOTE 1: Trazabilidad Perfecta (Cadena de Frío Intacta) ---
    { loteId: 1, temperatura: -18.5, ubicacion: "Finca La Libertad (Origen)" },
    { loteId: 1, temperatura: -18.2, ubicacion: "Ruta del Spondylus - Km 12" },
    { loteId: 1, temperatura: -18.8, ubicacion: "Punto de Control - Santa Elena" },
    { loteId: 1, temperatura: -18.0, ubicacion: "Empacadora Guayaquil (Destino)" },
    
    // --- LOTE 2: Incidente Logístico (Rompe Cadena de Frío) ---
    { loteId: 2, temperatura: -18.4, ubicacion: "Finca Salinas (Origen)" },
    { loteId: 2, temperatura: -12.0, ubicacion: "Carretera - Falla en Compresor" }, // <-- Alerta Térmica
    { loteId: 2, temperatura: -17.5, ubicacion: "Reparación Rápida" },
    { loteId: 2, temperatura: -18.1, ubicacion: "Empacadora Guayaquil (Destino)" }
  ];

  for (const evento of eventos) {
    try {
      await axios.post('http://localhost:3001/api/evento', evento);
      console.log(` Registrado: Lote ${evento.loteId} | Temp: ${evento.temperatura}°C | Ubicación: ${evento.ubicacion}`);
      
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error(" Error insertando:", error.message);
    }
  }
  
  console.log("¡Datos semilla encadenados correctamente en la Blockchain!");
};

generarSemillas();