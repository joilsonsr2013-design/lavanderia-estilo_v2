import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, UsersIcon, PhoneIcon, MailIcon, MapPinIcon, InfoIcon, ArrowLeftIcon, CalendarIcon, PackageIcon } from '../components/icons';
import { useAppContext } from '../contexts/AppContext';
import { customersApi } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import { STATUS_LABEL, STATUS_BG, STATUS_COLOR, FINAL_STATUSES } from '../constants';
import type { Customer, Order } from '../types';

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
  
  // Detalhes do cliente selecionado
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const openNew = () => { setEditing(null); setForm(empty); setError(''); setModal(true); };
  const openEdit = (e: React.MouseEvent, c: Customer) => {
    e.stopPropagation();
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone || '', address: c.address || '', notes: c.notes || '' });
    setError(''); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setLoadingDetails(true);
    try {
      const details = await customersApi.get(customer.id);
      setCustomerOrders(details.orders || []);
    } catch (err) {
      console.error('Erro ao carregar detalhes do cliente:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Excluir este cliente? Todos os pedidos associados também serão excluídos.')) return;
    setDeleting(id);
    try { await customersApi.delete(id); await refreshCustomers(); }
    catch (err: any) { alert(err.message); }
    finally { setDeleting(null); }
  };

  // Se um cliente estiver selecionado, mostra a tela de detalhes
  if (selectedCustomer) {
    const activeOrders = customerOrders.filter(o => !FINAL_STATUSES.includes(o.status));
    const pastOrders = customerOrders.filter(o => FINAL_STATUSES.includes(o.status));

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedCustomer(null)} icon={ArrowLeftIcon}>Voltar</Button>
          <h2 className="text-xl font-bold text-slate-800">Detalhes do Cliente</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações de Cadastro */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Informações de Cadastro" icon={InfoIcon}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nome</label>
                  <p className="text-slate-800 font-medium">{selectedCustomer.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><MailIcon className="h-4 w-4" /></div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">E-mail</label>
                    <p className="text-slate-800 text-sm">{selectedCustomer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><PhoneIcon className="h-4 w-4" /></div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Telefone</label>
                    <p className="text-slate-800 text-sm">{selectedCustomer.phone}</p>
                  </div>
                </div>
                {selectedCustomer.address && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><MapPinIcon className="h-4 w-4" /></div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Endereço</label>
                      <p className="text-slate-800 text-sm">{selectedCustomer.address}</p>
                    </div>
                  </div>
                )}
                {selectedCustomer.notes && (
                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Observações</label>
                    <p className="text-slate-600 text-sm italic">"{selectedCustomer.notes}"</p>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-100">
                   <p className="text-slate-400 text-xs">Cadastrado em {formatDate(selectedCustomer.createdAt || '')}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" icon={EditIcon} onClick={(e) => openEdit(e, selectedCustomer)}>Editar</Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Ordens de Serviço */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Ordens de Serviço Ativas" subtitle={`${activeOrders.length} pedido(s) em andamento`}>
              {loadingDetails ? (
                <div className="py-12 flex justify-center"><LoadingState message="Carregando pedidos..." /></div>
              ) : activeOrders.length === 0 ? (
                <EmptyState icon={PackageIcon} message="Nenhuma ordem de serviço ativa no momento." />
              ) : (
                <div className="space-y-3">
                  {activeOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${STATUS_BG[order.status]} ${STATUS_COLOR[order.status]}`}>
                          <PackageIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">#{order.orderNumber}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CalendarIcon className="h-3 w-3" />
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-semibold text-slate-400 uppercase">Valor</p>
                          <p className="text-sm font-bold text-slate-700">{formatCurrency(order.totalAmount)}</p>
                        </div>
                        <Badge color={`${STATUS_BG[order.status]} ${STATUS_COLOR[order.status]}`}>
                          {STATUS_LABEL[order.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {pastOrders.length > 0 && (
              <Card title="Histórico Recente" subtitle="Últimos pedidos concluídos">
                <div className="space-y-3">
                  {pastOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 opacity-75">
                      <div className="flex items-center gap-3">
                        <p className="font-medium text-slate-700 text-sm">#{order.orderNumber}</p>
                        <span className="text-xs text-slate-400">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-medium text-slate-600">{formatCurrency(order.totalAmount)}</p>
                        <Badge>{STATUS_LABEL[order.status]}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            <Card key={c.id} className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-brand-500" onClick={() => handleSelectCustomer(c)}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm">{c.name}</h3>
                  {c._count && (
                    <Badge color="bg-brand-100 text-brand-700" className="mt-1">{c._count.orders} pedido(s)</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={(e) => openEdit(e, c)} title="Editar"><EditIcon className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={(e) => handleDelete(e, c.id)} className="text-red-500" isLoading={deleting === c.id} title="Excluir"><TrashIcon className="h-4 w-4" /></Button>
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
