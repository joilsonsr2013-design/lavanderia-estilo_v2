import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Alert, LoadingState } from '../components/ui';
import { settingsApi, authApi } from '../services/api';
import { SaveIcon, KeyIcon } from '../components/icons';

const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    settingsApi.get().then(s => { setSettings(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      await settingsApi.update(settings);
      setSuccess('Configurações salvas com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault(); setPwError(''); setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('As senhas não conferem.'); return; }
    if (pwForm.newPassword.length < 6) { setPwError('A nova senha deve ter pelo menos 6 caracteres.'); return; }
    setPwSaving(true);
    try {
      await authApi.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwSuccess('Senha alterada com sucesso!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (err: any) { setPwError(err.message); }
    finally { setPwSaving(false); }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      {/* Company Settings */}
      <Card title="Informações da Empresa">
        {error && <Alert type="error" message={error} className="mb-4" />}
        {success && <Alert type="success" message={success} className="mb-4" />}
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nome da Empresa" value={settings.company_name || ''} onChange={e => handleChange('company_name', e.target.value)} placeholder="Lavanderia Eficiente" />
          <Input label="Telefone" value={settings.company_phone || ''} onChange={e => handleChange('company_phone', e.target.value)} placeholder="(64) 3322-0000" />
          <Input label="Endereço" value={settings.company_address || ''} onChange={e => handleChange('company_address', e.target.value)} placeholder="Rua X, nº 100 - Cidade" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Horário de Abertura" type="time" value={settings.working_hours_start || '08:00'} onChange={e => handleChange('working_hours_start', e.target.value)} />
            <Input label="Horário de Fechamento" type="time" value={settings.working_hours_end || '18:00'} onChange={e => handleChange('working_hours_end', e.target.value)} />
          </div>
          <Input label="Prazo padrão (dias)" type="number" min={1} value={settings.default_deadline_days || '3'} onChange={e => handleChange('default_deadline_days', e.target.value)} />

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <input type="checkbox" id="notify" checked={settings.notify_on_order_status_change === 'true'}
              onChange={e => handleChange('notify_on_order_status_change', e.target.checked ? 'true' : 'false')}
              className="h-4 w-4 rounded text-brand-600 focus:ring-brand-400" />
            <label htmlFor="notify" className="text-sm font-medium text-slate-700">
              Notificar ao alterar status dos pedidos
            </label>
          </div>

          <Button type="submit" icon={SaveIcon} isLoading={saving} className="w-full">
            Salvar Configurações
          </Button>
        </form>
      </Card>

      {/* Change Password */}
      <Card title="Alterar Senha" subtitle="Altere a senha da sua conta">
        {pwError && <Alert type="error" message={pwError} className="mb-4" />}
        {pwSuccess && <Alert type="success" message={pwSuccess} className="mb-4" />}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input label="Senha Atual" type="password" value={pwForm.currentPassword}
            onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
          <Input label="Nova Senha" type="password" value={pwForm.newPassword}
            onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required placeholder="Mínimo 6 caracteres" />
          <Input label="Confirmar Nova Senha" type="password" value={pwForm.confirmPassword}
            onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
          <Button type="submit" icon={KeyIcon} variant="secondary" isLoading={pwSaving} className="w-full">
            Alterar Senha
          </Button>
        </form>
      </Card>

      {/* System info */}
      <Card title="Informações do Sistema">
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-medium">Versão</span><span>2.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-medium">Moeda</span><span>{settings.currency || 'BRL'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-medium">Fuso Horário</span><span>{settings.timezone || 'America/Sao_Paulo'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">API</span>
            <span className="text-green-600 font-semibold">✓ Conectada</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsView;
