import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Accounts } from './pages/Accounts';
import { Transactions } from './pages/Transactions';
import { CardInvoices } from './pages/CardInvoices';
import { ImportInvoice } from './pages/ImportInvoice';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="contas" element={<Accounts />} />
        <Route path="lancamentos" element={<Transactions />} />
        <Route path="faturas" element={<CardInvoices />} />
        <Route path="importar-fatura" element={<ImportInvoice />} />
      </Route>
    </Routes>
  );
}

export default App;
