// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Customers } from './pages/Customers/Customers';
import { Products } from './pages/Products/Products';
import { Invoices } from './pages/Invoices/Invoices';
import { InvoiceForm } from './pages/Invoices/InvoiceForm';
import { Quotes } from './pages/Quotes/Quotes';
import { Deliveries } from './pages/Deliveries/Deliveries';
import { SubscriptionPlans } from './pages/Subscription/SubscriptionPlans';
import { Layout } from './components/Layout';
import { QuoteForm } from './pages/Quotes/QuoteForm';
import { DeliveryForm } from './pages/Deliveries/DeliveryForm';
import { InvoiceDetail } from './pages/Invoices/InvoiceDetail';
import { QuoteDetail } from './pages/Quotes/QuoteDetail';
import { DeliveryDetail } from './pages/Deliveries/DeliveryDetail';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/new" element={<InvoiceForm />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="subscription" element={<SubscriptionPlans />} />
          <Route path="quotes/new" element={<QuoteForm />} />
          <Route path="deliveries/new" element={<DeliveryForm />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="quotes/:id" element={<QuoteDetail />} />
          <Route path="deliveries/:id" element={<DeliveryDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;


