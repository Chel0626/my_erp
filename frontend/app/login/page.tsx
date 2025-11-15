'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Scissors } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Erro ao fazer login');
      console.error('❌ Erro capturado no handleSubmit:', err);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (tokens: { access: string; refresh: string }, userData: unknown) => {
    const data = userData as { is_new_user?: boolean };
    
    if (data.is_new_user) {
      // Novo usuário: redireciona para configuração do estabelecimento
      router.push('/dashboard/settings/company');
    } else {
      // Usuário existente: vai direto para dashboard
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Scissors className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou continue com
                    </span>
                  </div>
                </div>

                <GoogleSignInButton 
                  onSuccess={handleGoogleSuccess}
                  disabled={loading}
                />
              </>
            )}

            <div className="text-sm text-center text-muted-foreground">
              Ainda não tem uma conta?{' '}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Criar conta
              </Link>
            </div>

            <div className="pt-4 border-t text-xs text-center text-muted-foreground">
              <p className="mb-2">Credenciais de teste:</p>
              <p>Email: joao@barbearia.com</p>
              <p>Senha: senha123</p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
