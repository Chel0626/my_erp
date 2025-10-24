'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  AlertTriangle, 
  BarChart3,
  LogOut,
  Settings
} from 'lucide-react';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-6 border-b">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-bold text-lg">Super Admin</h1>
              <p className="text-xs text-muted-foreground">Gestão de Tenants</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">Super Administrador</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
