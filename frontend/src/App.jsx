import { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AppProvider } from './context/AppContext.jsx';
import { SidebarContent, SidebarDrawer, BottomNav } from './components/common/Sidebar.jsx';
import ToastContainer from './components/common/Toast.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Transporte = lazy(() => import('./pages/Transporte.jsx'));
const Dosificacion = lazy(() => import('./pages/Dosificacion.jsx'));
const Auditoria = lazy(() => import('./pages/Auditoria.jsx'));

function Loader() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-sky-500" />
    </div>
  );
}

function MobileTopBar({ onOpenDrawer }) {
  return (
    <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur lg:hidden">
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={onOpenDrawer}
        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
      >
        <Menu className="h-5 w-5" />
      </button>
      <span className="text-sm font-black tracking-tight text-slate-100">🦐 ShrimpColdChain</span>
    </div>
  );
}

function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] border-r border-slate-800 bg-slate-950 lg:block">
        <SidebarContent />
      </aside>

      <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <MobileTopBar onOpenDrawer={() => setDrawerOpen(true)} />

      <div className="pb-20 lg:pb-0 lg:pl-[220px]">
        <main key={location.pathname} className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transporte" element={<Transporte />} />
              <Route path="/dosificacion" element={<Dosificacion />} />
              <Route path="/auditoria" element={<Auditoria />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      <BottomNav />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Layout />
      </Router>
    </AppProvider>
  );
}