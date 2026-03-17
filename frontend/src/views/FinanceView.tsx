import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Select, Modal, Alert, Badge, LoadingState, StatCard } from '../components/ui';
import { PlusIcon, TrashIcon, EditIcon, TrendUpIcon, TrendDownIcon, FinanceIcon } from '../components/icons';
import { transactionsApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../constants';

const emptyForm = { type: 'INCOME', category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0], paymentMethod: '' };

const FinanceView: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState({ start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });
  const [typeFilter, setTypeFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        transactionsApi.list({ startDate: period.start, endDate: period.end, ...(typeFilter && { type: typeFilter }) }),
        transactionsApi.summary({ startDate: period.start, endDate: period.end })
      ]);
      setTransactions(t);
      setSummary(s);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [period.start, period.end, typeFilter]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setError(''); setModal(true); };
  const openEdit = (t: any) => {
    setEditing(t);
    setForm({ type: t.type, category: t.category, amount: String(t.amount), description: t.description || '', date: t.date.split('T')[0], paymentMethod: t.paymentMethod || '' });
    setError(''); setModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const data = { ...form, amount: Number(form.amount) };
      if (editing) await transactionsApi.update(editing.id, data);
      else await transactionsApi.create(data);
      await load(); setModal(false);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta transação?')) return;
    try { await transactionsApi.delete(id); await load(); }
    catch (err: any) { alert(err.message); }
  };

  const categoryOpts = form.type === 'INCOME'
    ? INCOME_CATEGORIES.map(c => ({ value: c, label: c }))
    : EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }));

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Receitas" value={formatCurrency(summary?.income || 0)} icon={TrendUpIcon} color="bg-emerald-600" />
        <StatCard title="Despesas" value={formatCurrency(summary?.expenses || 0)} icon={TrendDownIcon} color="bg-red-500" />
        <StatCard title="Saldo" value={formatCurrency(summary?.balance || 0)} icon={FinanceIcon}
          color={(summary?.balance || 0) >= 0 ? 'bg-blue-600' : 'bg-orange-600'} />
      </div>

      {/* Category breakdown */}
      {summary?.byCategory && summary.byCategory.length > 0 && (
        <Card title="Por Categoria">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {summary.byCategory.map((cat: any) => (
              <div key={cat.category} className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-600 mb-1">{cat.category}</p>
                {cat.income > 0 && <p className="text-xs text-emerald-600">↑ {formatCurrency(cat.income)}</p>}
                {cat.expense > 0 && <p className="text-xs text-red-500">↓ {formatCurrency(cat.expense)}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex gap-3 flex-wrap">
            <input type="date" value={period.start} onChange={e => setPeriod(p => ({ ...p, start: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none" />
            <span className="self-center text-slate-400">até</span>
            <input type="date" value={period.end} onChange={e => setPeriod(p => ({ ...p, end: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none" />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none">
              <option value="">Todos</option>
              <option value="INCOME">Receitas</option>
              <option value="EXPENSE">Despesas</option>
            </select>
          </div>
          <Button icon={PlusIcon} onClick={openNew}>Nova Transação</Button>
        </div>
      </Card>

      {/* Transactions list */}
      {loading ? <LoadingState /> : transactions.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <FinanceIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">Nenhuma transação no período.</p>
          </div>
        </Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Data', 'Tipo', 'Categoria', 'Descrição', 'Pagamento', 'Valor', 'Ações'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(t.date)}</td>
                    <td className="px-4 py-3">
                      <Badge color={t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                        {t.type === 'INCOME' ? '↑ Receita' : '↓ Despesa'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{t.category}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{t.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{t.paymentMethod || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm ${t.type === 'INCOME' ? 'text-emerald-700' : 'text-red-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><EditIcon className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleDelete(t.id)}><TrashIcon className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Editar Transação' : 'Nova Transação'}
        footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" form="financeForm" isLoading={saving}>Salvar</Button></>}>
        {error && <Alert type="error" message={error} className="mb-4" />}
        <form id="financeForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            {['INCOME', 'EXPENSE'].map(t => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t, category: '' }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition ${form.type === t ? (t === 'INCOME' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-slate-200 text-slate-500'}`}>
                {t === 'INCOME' ? '↑ Receita' : '↓ Despesa'}
              </button>
            ))}
          </div>
          <Select name="category" label="Categoria" value={form.category} onChange={handleChange} required
            options={categoryOpts} placeholder="Selecione..." />
          <Input name="amount" label="Valor (R$)" type="number" step="0.01" min="0" value={form.amount} onChange={handleChange} required />
          <Select name="paymentMethod" label="Forma de Pagamento" value={form.paymentMethod} onChange={handleChange}
            options={PAYMENT_METHODS.map(p => ({ value: p, label: p }))} placeholder="Selecione..." />
          <Input name="date" label="Data" type="date" value={form.date} onChange={handleChange} required />
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">Descrição</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinanceView;
