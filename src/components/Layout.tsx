import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Package, FileText, FileSpreadsheet, Truck, CreditCard, LogOut, Menu, X } from 'lucide-react';

export function Layout() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: null },
    { to: '/customers', label: 'Clients', icon: Users },
    { to: '/products', label: 'Produits', icon: Package },
    { to: '/invoices', label: 'Factures', icon: FileText },
    { to: '/quotes', label: 'Devis', icon: FileSpreadsheet },
    { to: '/deliveries', label: 'Bons de livraison', icon: Truck },
    { to: '/subscription', label: 'Abonnement', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">VYZO</h1>
            </div>
            
            {/* Menu desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  {link.icon && <link.icon className="w-4 h-4 inline mr-1" />}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Bouton menu mobile */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Profil utilisateur */}
            <div className="hidden md:flex items-center">
              <span className="text-sm text-gray-700 mr-4">{user?.companyName}</span>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Menu mobile déroulant */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-2">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                  >
                    {link.icon && <link.icon className="w-4 h-4 inline mr-2" />}
                    {link.label}
                  </Link>
                ))}
                <div className="border-t pt-2 mt-2">
                  <span className="block text-sm text-gray-700 px-3 py-2">{user?.companyName}</span>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full text-left text-red-600 hover:text-red-800 px-3 py-2 text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
