import React, { useState } from 'react';
import { Card, Button, Input, Textarea, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, UsersIcon, PhoneIcon, MailIcon, MapPinIcon } from '../components/icons';
import { useAppContext } from '../contexts/AppContext';
import { customersApi } from '../services/api';
import { formatDate } from '../utils/helpers';
import type { Customer } from '../types';

const empty = { name: '', email: '', phone: '', address: '', notes: '' };

const CustomersView: React.FC = () => {
  const { customers, loadingCustomers, refreshCustomers } = useAppContext();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const openNew = () => { setEditing(null); setForm(empty); setError(''); setModal(true); };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone || '', address: c.address || '', notes: c.notes || '' });
    setError(''); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) await customersApi.update(editing.id, form);
      else await customersApi.create(form);
      await refreshCustomers();
      closeModal();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este cliente? Todos os pedidos associados também serão excluídos.')) return;
    setDeleting(id);
    try { await customersApi.delete(id); await refreshCustomers(); }
    catch (err: any) { alert(err.message); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text" placeholder="Buscar clientes..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <Button icon={PlusIcon} onClick={openNew}>Novo Cliente</Button>
        </div>
      </Card>

      {loadingCustomers ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={UsersIcon} message="Nenhum cliente encontrado." action={<Button icon={PlusIcon} onClick={openNew}>Cadastrar Cliente</Button>} /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm">{c.name}</h3>
                  {c._count && (
                    <Badge color="bg-brand-100 text-brand-700" className="mt-1">{c._count.orders} pedido(s)</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(c)} title="Editar"><EditIcon className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-red-500" isLoading={deleting === c.id} title="Excluir"><TrashIcon className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2"><MailIcon className="h-3 w-3" />{c.email}</div>
                <div className="flex items-center gap-2"><PhoneIcon className="h-3 w-3" />{c.phone}</div>
                {c.address && <div className="flex items-center gap-2"><MapPinIcon className="h-3 w-3" /><span className="truncate">{c.address}</span></div>}
                {c.createdAt && <p className="text-slate-400 text-xs pt-1 border-t border-slate-100">Cliente desde {formatDate(c.createdAt)}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={closeModal} title={editing ? 'Editar Cliente' : 'Novo Cliente'}
        footer={<>
          <Button variant="outline" onClick={closeModal}>Cancelar</Button>
          <Button type="submit" form="customerForm" isLoading={saving}>Salvar</Button>
        </>}>
        {error && <Alert type="error" message={error} className="mb-4" />}
        <form id="customerForm" onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" label="Nome Completo" value={form.name} onChange={handleChange} required placeholder="João da Silva" />
          <Input name="email" label="E-mail" type="email" value={form.email} onChange={handleChange} required placeholder="joao@email.com" />
          <Input name="phone" label="Telefone" value={form.phone} onChange={handleChange} placeholder="(64) 99999-0000" />
          <Input name="address" label="Endereço" value={form.address} onChange={handleChange} placeholder="Rua X, nº 100 - Cidade" />
          <Textarea name="notes" label="Observações" value={form.notes} onChange={handleChange} placeholder="Preferências, alergias, etc." />
        </form>
      </Modal>
    </div>
  );
};

export default CustomersView;
