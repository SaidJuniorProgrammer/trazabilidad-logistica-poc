import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import Dashboard from './pages/Dashboard';
import Auditoria from './pages/Auditoria';
import Reportes from './pages/Reportes';      
import Configuracion from './pages/Configuracion'; 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex font-sans">
        <Sidebar />
        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/auditoria" element={<Auditoria />} />
            <Route path="/reportes" element={<Reportes />} />           
            <Route path="/configuracion" element={<Configuracion />} /> 
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;