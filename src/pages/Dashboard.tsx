import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { baserowApi } from '../lib/baserowApi';
import type { ProxyItem } from '../lib/baserowApi';
import { Shield, LogOut, Copy, Globe, Clock, User, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, signOut } = useAuth();
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
      setError('Unable to load proxy data. Please try again later.');
      console.error('Failed to fetch proxy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProxies();
    
    // Set up polling every 5 minutes
    const interval = setInterval(loadUserProxies, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.email]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const ProxyCard = ({ proxy }: { proxy: ProxyItem }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-white" />
            <h3 className="text-lg font-medium text-white">Proxy Details</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            proxy.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {proxy.status.toUpperCase()}
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
            Order: {proxy.order}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">IP Address</p>
                <p className="font-mono text-sm">{proxy.ip}</p>
              </div>
              <button 
                onClick={() => handleCopy(proxy.ip, `ip-${proxy.id}`)}
                className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Copy className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Port</p>
                <p className="font-mono text-sm">{proxy.port}</p>
              </div>
              <button 
                onClick={() => handleCopy(proxy.port.toString(), `port-${proxy.id}`)}
                className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Copy className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="font-mono text-sm">{proxy.username}</p>
              </div>
              <button 
                onClick={() => handleCopy(proxy.username, `username-${proxy.id}`)}
                className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Copy className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Password</p>
                <p className="font-mono text-sm">{proxy.password}</p>
              </div>
              <button 
                onClick={() => handleCopy(proxy.password, `password-${proxy.id}`)}
                className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Copy className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Expires: {format(new Date(proxy.expires_at), 'PPP')}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleCopy(`${proxy.ip}:${proxy.port}:${proxy.username}:${proxy.password}`, `full-${proxy.id}`)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span className="text-sm">Copy IP Format</span>
            </button>
            <button
              onClick={() => handleCopy(`${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`, `auth-${proxy.id}`)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span className="text-sm">Copy Auth Format</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Proxy Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadUserProxies}
                className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Refresh</span>
              </button>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-md">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{user?.email}</span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Your Proxies</h2>
          <p className="text-sm text-gray-500">
            Last updated: {format(lastUpdated, 'PP p')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : proxies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proxies.map((proxy) => (
              <ProxyCard key={proxy.id} proxy={proxy} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No proxies found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No proxy information was found for your account.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}