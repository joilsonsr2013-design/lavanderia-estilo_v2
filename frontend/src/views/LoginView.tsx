import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Alert } from '../components/ui';
import { WashIcon, MailIcon, KeyIcon } from '../components/icons';

const LoginView: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-400 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-brand-600 rounded-2xl p-4 mb-4 shadow-lg shadow-brand-900/50">
            <WashIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Lavanderia Eficiente</h1>
          <p className="text-slate-400 mt-1 text-sm">Sistema de Gestão • ERP</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Bem-vindo de volta!</h2>
          <p className="text-slate-500 text-sm mb-6">Faça login para acessar o sistema.</p>

          {error && <Alert type="error" message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              icon={MailIcon}
              required
              autoFocus
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={KeyIcon}
              required
            />
            <Button type="submit" className="w-full mt-6" size="lg" isLoading={isLoading}>
              Entrar
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-600 mb-2">🔑 Credenciais de demonstração:</p>
            <div className="space-y-1.5">
              {[
                { label: 'Admin', email: 'admin@lavanderia.com' },
                { label: 'Gerente', email: 'gerente@lavanderia.com' },
                { label: 'Funcionário', email: 'ana@lavanderia.com' },
              ].map(c => (
                <button
                  key={c.email}
                  type="button"
                  onClick={() => { setEmail(c.email); setPassword('senha123'); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition text-xs"
                >
                  <span className="font-semibold text-slate-700">{c.label}:</span>{' '}
                  <span className="text-slate-500">{c.email} / senha123</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © {new Date().getFullYear()} Lavanderia Eficiente • Todos os direitos reservados
        </p>
      </div>
    </div>
  );
};

export default LoginView;
