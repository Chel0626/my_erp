'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Calendar, 
  Scissors, 
  Users, 
  UserCircle,
  DollarSign,
  LogOut,
  Menu,
  X,
  Package,
  Percent,
  BarChart3,
  ShoppingCart,
  Receipt,
  Wallet,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Serviços', href: '/dashboard/services', icon: Scissors },
  { name: 'Clientes', href: '/dashboard/customers', icon: UserCircle },
  { name: 'Produtos', href: '/dashboard/products', icon: Package },
  { name: 'PDV', href: '/dashboard/pos', icon: ShoppingCart },
  { name: 'Vendas', href: '/dashboard/pos/sales', icon: Receipt },
  { name: 'Caixa', href: '/dashboard/pos/cash-register', icon: Wallet },
  { name: 'Metas', href: '/dashboard/goals', icon: Target },
  { name: 'Comissões', href: '/dashboard/commissions', icon: Percent },
  { name: 'Financeiro', href: '/dashboard/financial', icon: DollarSign },
  { name: 'Relatórios', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Equipe', href: '/dashboard/team', icon: Users },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, tenant, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Desktop/Mobile */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo e Menu Mobile */}
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="flex items-center gap-2">
                <Scissors className="h-6 w-6 text-primary" />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold">{tenant?.name}</h1>
                  <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
                </div>
              </div>
            </div>

            {/* Notifications and User Menu */}
            <div className="flex items-center gap-2">
              <NotificationCenter />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user?.role === 'admin' ? 'Administrador' : 
                         user?.role === 'barbeiro' ? 'Barbeiro' : 
                         user?.role === 'caixa' ? 'Caixa' : 'Atendente'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b">
          <nav className="px-4 py-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:pt-16">
          <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64 pt-0">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation Mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-colors ${
                  isActive
                    ? 'text-primary bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
