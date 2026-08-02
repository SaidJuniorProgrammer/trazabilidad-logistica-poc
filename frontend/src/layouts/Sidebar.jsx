import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Panel de Control', path: '/' },
    { name: 'Auditoría Blockchain', path: '/auditoria' },
    { name: 'Reportes BI', path: '/reportes' },
    { name: 'Configuración', path: '/configuracion' }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-2xl z-10">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-blue-400">Logística<span className="text-white">UPSE</span></h2>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Módulo de Trazabilidad</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        v2.0.0 - Arquitectura Modular
      </div>
    </aside>
  );
};

export default Sidebar;