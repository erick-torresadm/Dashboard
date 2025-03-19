import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { baserowApi } from '../lib/baserowApi';
import type { ProxyItem } from '../lib/baserowApi';
import { LogOut, Copy, Globe, Clock, User, RefreshCw, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FastProxyLogo } from '../components/FastProxyLogo';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [proxies, setProxies] = useState<ProxyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadUserProxies = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      setError(null);
      const userProxies = await baserowApi.getUserProxies(user.email);
      setProxies(userProxies);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Não foi possível carregar os dados do proxy. Tente novamente mais tarde.');
      console.error('Failed to fetch proxy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProxies();
    const interval = setInterval(loadUserProxies, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.email]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const ProxyCard = ({ proxy }: { proxy: ProxyItem }) => (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg animate-fade-in">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-white" />
            <h3 className="text-lg font-medium text-white">Detalhes do Proxy</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            proxy.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          }`}>
            {proxy.status === 'active' ? 'ATIVO' : 'EXPIRADO'}
          </span>
        </div>
        {proxy.name && (
          <div className="mt-2 flex items-center space-x-2 text-white text-sm">
            <User className="h-4 w-4" />
            <span>{proxy.name}</span>
          </div>
        )}
        {proxy.order && (
          <div className="mt-1 text-blue-100 text-sm">
            Pedido: {proxy.order}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg transition-colors">
              <div>
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Endereço IP</p>
                <p className="font-mono text-sm dark:text-dark-text-primary">{proxy.ip}</p>
              </div>
              <button 
                onClick={() => handleCopy(proxy.ip, `ip-${proxy.id}`)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-dark-border rounded-md transition-colors"
              >
                <Copy className="h-4 w-4 text-gray-500 dark:text-dark-text-secondary" />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg transition-colors">
              <div>
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Porta</p>
                <p className="font-mono text-sm dark:text-dark-text-primary">{proxy.port}</p>
              </div>
              <button 
                onClick={() => handleCopy(proxy.port.toString(), `port-${proxy.id}`)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-dark-border rounded-md transition-colors"
              >
                <Copy className="h-4 w-4 text-gray-500 dark:text-dark-text-secondary" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg transition-colors">
              <div>
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Usuário</p>
                <p className="font-mono text-sm dark:text-dark-text-primary">{proxy.username}</p>
              </div>
              <button 
                onClick={() => handleCopy(proxy.username, `username-${proxy.id}`)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-dark-border rounded-md transition-colors"
              >
                <Copy className="h-4 w-4 text-gray-500 dark:text-dark-text-secondary" />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg transition-colors">
              <div>
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Senha</p>
                <p className="font-mono text-sm dark:text-dark-text-primary">{proxy.password}</p>
              </div>
              <button 
                onClick={() => handleCopy(proxy.password, `password-${proxy.id}`)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-dark-border rounded-md transition-colors"
              >
                <Copy className="h-4 w-4 text-gray-500 dark:text-dark-text-secondary" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-dark-text-secondary">
            <Clock className="h-4 w-4" />
            <span>Expira em: {format(new Date(proxy.expires_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleCopy(`${proxy.ip}:${proxy.port}:${proxy.username}:${proxy.password}`, `full-${proxy.id}`)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span className="text-sm">Copiar Formato IP</span>
            </button>
            <button
              onClick={() => handleCopy(`${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`, `auth-${proxy.id}`)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span className="text-sm">Copiar Formato Auth</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-black transition-colors duration-200">
      <nav className="bg-gray-800 dark:bg-gray-900 shadow-sm border-b border-gray-700 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FastProxyLogo className="h-8" />
              <h1 className="ml-2 text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                Painel de Proxy
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={loadUserProxies}
                className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border rounded-md transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Atualizar</span>
              </button>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 dark:bg-dark-bg rounded-md">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Seus Proxies</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Última atualização: {format(lastUpdated, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md animate-fade-in">
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : proxies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proxies.map((proxy) => (
              <ProxyCard key={proxy.id} proxy={proxy} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Globe className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum proxy encontrado</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Não foram encontradas informações de proxy para sua conta.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}