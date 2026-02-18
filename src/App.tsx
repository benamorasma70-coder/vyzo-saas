import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Customers } from './pages/Customers/Customers';
import { Products } from './pages/Products/Products';
import { Invoices } from './pages/Invoices/Invoices';
import { InvoiceForm } from './pages/Invoices/InvoiceForm';
import { InvoiceDetail } from './pages/Invoices/InvoiceDetail';
import { Quotes } from './pages/Quotes/Quotes';
import { QuoteForm } from './pages/Quotes/QuoteForm';
import { QuoteDetail } from './pages/Quotes/QuoteDetail';
import { Deliveries } from './pages/Deliveries/Deliveries';
import { DeliveryForm } from './pages/Deliveries/DeliveryForm';
import { DeliveryDetail } from './pages/Deliveries/DeliveryDetail';
import { SubscriptionPlans } from './pages/Subscription/SubscriptionPlans';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user?.is_admin ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Routes protégées avec Layout */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/new" element={<InvoiceForm />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="quotes/new" element={<QuoteForm />} />
          <Route path="quotes/:id" element={<QuoteDetail />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="deliveries/new" element={<DeliveryForm />} />
          <Route path="deliveries/:id" element={<DeliveryDetail />} />
          <Route path="subscription" element={<SubscriptionPlans />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

