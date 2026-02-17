import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Login } from './pages/Auth/Login'
import { Register } from './pages/Auth/Register'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { Customers } from './pages/Customers/Customers'
import { Products } from './pages/Products/Products'
import { Invoices } from './pages/Invoices/Invoices'
import { InvoiceForm } from './pages/Invoices/InvoiceForm'
import { Quotes } from './pages/Quotes/Quotes'
import { Deliveries } from './pages/Deliveries/Deliveries'
import { SubscriptionPlans } from './pages/Subscription/SubscriptionPlans'

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/invoices" element={<PrivateRoute><Invoices /></PrivateRoute>} />
        <Route path="/invoices/new" element={<PrivateRoute><InvoiceForm /></PrivateRoute>} />
        <Route path="/quotes" element={<PrivateRoute><Quotes /></PrivateRoute>} />
        <Route path="/deliveries" element={<PrivateRoute><Deliveries /></PrivateRoute>} />
        <Route path="/subscription" element={<PrivateRoute><SubscriptionPlans /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
