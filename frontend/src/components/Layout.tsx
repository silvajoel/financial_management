import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/contas', label: 'Contas' },
  { to: '/lancamentos', label: 'Lançamentos' },
  { to: '/faturas', label: 'Faturas de Cartão' },
  { to: '/importar-fatura', label: 'Importar Fatura' },
];

export function Layout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Gestão Financeira</h1>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            {item.label}
          </NavLink>
        ))}
        <div className="logout-btn">
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            {user?.nome}
          </p>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%' }}>
            Sair
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
