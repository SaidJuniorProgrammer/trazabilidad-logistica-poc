import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, Truck, FlaskConical, ShieldCheck, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Transporte from './pages/Transporte';
import Dosificacion from './pages/Dosificacion';
import Auditoria from './pages/Auditoria';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive(to) ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
      <Icon className={`w-5 h-5 ${isActive(to) ? 'text-indigo-200' : 'text-slate-400'}`} />
      {label}
    </Link>
  );

  return (
    <div className="w-64 bg-white h-screen fixed border-r border-slate-200 shadow-sm flex flex-col">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 tracking-tight">
          ShrimpColdChain
        </h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">PoC Trazabilidad</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavItem to="/" icon={Activity} label="Resumen Ejecutivo" />
        <NavItem to="/transporte" icon={Truck} label="Transporte Terrestre" />
        <NavItem to="/dosificacion" icon={FlaskConical} label="Planta Dosificación" />
        <NavItem to="/auditoria" icon={ShieldCheck} label="Auditoría Blockchain" />
      </nav>
      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 w-full">
          <Settings className="w-5 h-5 text-slate-400" /> Configuración
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex font-sans">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transporte" element={<Transporte />} />
            <Route path="/dosificacion" element={<Dosificacion />} />
            <Route path="/auditoria" element={<Auditoria />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;