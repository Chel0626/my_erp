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
  Target,
  Building2
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
import { useState, useEffect } from 'react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { PaywallModal } from '@/components/subscription/PaywallModal';

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
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<'trial_expired' | 'client_limit' | 'service_limit'>('trial_expired');
  const [paywallMessage, setPaywallMessage] = useState('');

  // Listener para erros de pagamento (402)
  useEffect(() => {
    const handlePaymentRequired = (event: CustomEvent<{reason: string, message: string}>) => {
      const allowedReasons = ['trial_expired', 'client_limit', 'service_limit'] as const;
      const reason = allowedReasons.includes(event.detail.reason as any)
        ? event.detail.reason as typeof allowedReasons[number]
        : 'trial_expired';
      setPaywallReason(reason);
      setPaywallMessage(event.detail.message);
      setPaywallOpen(true);
    };

    window.addEventListener('payment-required', handlePaymentRequired);
    return () => window.removeEventListener('payment-required', handlePaymentRequired);
  }, []);

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
      {/* Header Desktop/Mobile - Compacto para mobile */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-3 sm:px-4 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo e Menu Mobile */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-md -ml-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <div className="hidden sm:block">
                  <h1 className="text-sm sm:text-lg font-semibold truncate max-w-[150px] sm:max-w-none">
                    {tenant?.name || 'Sistema'}
                  </h1>
                  <p className="text-xs text-muted-foreground hidden md:block">Sistema de Gestão</p>
                </div>
              </div>
            </div>

            {/* Notifications and User Menu - Compacto mobile */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="hidden sm:block">
                <NotificationCenter />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarFallback className="text-xs sm:text-sm">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user?.role === 'admin' ? 'Administrador' : 
                         user?.role === 'barbeiro' ? 'Barbeiro' : 
                         user?.role === 'caixa' ? 'Caixa' : 'Atendente'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Notificações no menu mobile */}
                  <div className="sm:hidden">
                    <DropdownMenuItem asChild>
                      <div className="w-full">
                        <NotificationCenter />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings/company" className="flex items-center cursor-pointer">
                      <Building2 className="mr-2 h-4 w-4" />
                      Configurações da Empresa
                    </Link>
                  </DropdownMenuItem>
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

      {/* Trial Banner - Mostra apenas se estiver em TRIAL */}
      <TrialBanner />

      {/* Mobile Menu - Fullscreen overlay com scroll */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <nav className="h-full overflow-y-auto pb-20 pt-4 px-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
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

        {/* Main Content - Padding bottom para bottom nav mobile */}
        <main className="flex-1 lg:pl-64 pb-20 lg:pb-0">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation Mobile - Apenas itens principais */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive
                    ? 'text-primary bg-blue-50'
                    : 'text-gray-600 active:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                <span className={`text-[10px] sm:text-xs font-medium truncate max-w-[60px] ${
                  isActive ? 'text-primary' : 'text-gray-600'
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Paywall Modal - Aparece automaticamente em erros 402 */}
      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        reason={paywallReason}
        message={paywallMessage}
      />
    </div>
  );
}
