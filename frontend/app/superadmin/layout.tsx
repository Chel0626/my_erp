'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  AlertTriangle, 
  BarChart3,
  LogOut,
  Settings,
  Menu,
  X
} from 'lucide-react';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Esconde sidebar apenas na página do dashboard NOC
  const hideNavigation = pathname === '/superadmin';

  useEffect(() => {
    // Aguarda carregar antes de redirecionar
    if (loading) return;
    
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'superadmin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Mostra loading enquanto carrega o usuário
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não tem usuário ou não é superadmin, mostra loading (vai redirecionar)
  if (!user || user.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
    { name: 'Tenants', href: '/superadmin/tenants', icon: Building2 },
    { name: 'Assinaturas', href: '/superadmin/subscriptions', icon: CreditCard },
    { name: 'Pagamentos', href: '/superadmin/payments', icon: CreditCard },
    { name: 'Erros do Sistema', href: '/superadmin/errors', icon: AlertTriangle },
    { name: 'Estatísticas', href: '/superadmin/usage', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Header - Esconde no NOC Dashboard */}
      {!hideNavigation && (
        <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b flex items-center px-4 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="font-bold text-base">Super Admin</h1>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {!hideNavigation && sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Esconde no NOC Dashboard */}
      {!hideNavigation && (
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 border-r bg-card
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between gap-2 p-4 lg:p-6 border-b">
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 lg:h-8 lg:w-8 text-primary flex-shrink-0" />
                <div>
                  <h1 className="font-bold text-base lg:text-lg">Super Admin</h1>
                  <p className="text-xs text-muted-foreground hidden lg:block">Gestão de Tenants</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-accent rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="p-3 lg:p-4 border-t">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Super Administrador</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-3 lg:px-4 py-2 text-sm rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                Sair
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content - Sem padding quando sidebar escondida */}
      <main className={`flex-1 overflow-auto ${hideNavigation ? '' : 'pt-14 lg:pt-0'}`}>
        {children}
      </main>
    </div>
  );
}
