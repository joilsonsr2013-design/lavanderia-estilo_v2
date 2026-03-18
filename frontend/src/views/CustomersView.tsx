import React, { useState } from 'react';
import { Card, Button, Input, Textarea, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, UsersIcon, PhoneIcon, MailIcon, MapPinIcon, EyeIcon, ClipboardListIcon } from '../components/icons';
import { useAppContext } from '../contexts/AppContext';
import { customersApi } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import { STATUS_LABEL, STATUS_BG, STATUS_COLOR, PRIORITY_LABEL, PRIORITY_COLOR } from '../constants';
import { OrderStatus, type Customer, type Order } from '../types';

const empty = { name: '', email: '', phone: '', address: '', notes: '' };

// Status que representam ordens ativas (não finalizadas)
const ACTIVE_STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.CLASSIFICATION,
  OrderStatus.WASHING,
  OrderStatus.DRYING,
  OrderStatus.IRONING,
  OrderStatus.INSPECTION,
  OrderStatus.PACKAGING,
  OrderStatus.READY_FOR_DELIVERY,
];

const CustomersView: React.FC = () => {
  const { customers, loadingCustomers, refreshCustomers } = useAppContext();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  // Estado para detalhes do cliente
  const [detailModal, setDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer & { orders?: Order[] } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const openNew = () => { setEditing(null); setForm(empty); setError(''); setModal(true); };
  const openEdit = (c: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone || '', address: c.address || '', notes: c.notes || '' });
    setError(''); setModal(true);
  };

  const openDetails = async (c: Customer) => {
    setLoadingDetails(true);
    setSelectedCustomer(c as Customer & { orders?: Order[] });
    setDetailModal(true);
    try {
      const details = await customersApi.get(c.id);
      setSelectedCustomer(details);
    } catch (err: any) {
      console.error('Erro ao carregar detalhes:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => { setModal(false); setEditing(null); };
  const closeDetailModal = () => { setDetailModal(false); setSelectedCustomer(null); };

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Excluir este cliente? Todos os pedidos associados também serão excluídos.')) return;
    setDeleting(id);
    try { await customersApi.delete(id); await refreshCustomers(); }
    catch (err: any) { alert(err.message); }
    finally { setDeleting(null); }
  };

  // Filtra ordens ativas
  const activeOrders = selectedCustomer?.orders?.filter(o => ACTIVE_STATUSES.includes(o.status)) || [];

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
            <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetails(c)}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm">{c.name}</h3>
                  {c._count && (
                    <Badge color="bg-brand-100 text-brand-700" className="mt-1">{c._count.orders} pedido(s)</Badge>
                  )}
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={(e) => openEdit(c, e)} title="Editar"><EditIcon className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={(e) => handleDelete(c.id, e)} className="text-red-500" isLoading={deleting === c.id} title="Excluir"><TrashIcon className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2"><MailIcon className="h-3 w-3" />{c.email}</div>
                <div className="flex items-center gap-2"><PhoneIcon className="h-3 w-3" />{c.phone}</div>
                {c.address && <div className="flex items-center gap-2"><MapPinIcon className="h-3 w-3" /><span className="truncate">{c.address}</span></div>}
                {c.createdAt && <p className="text-slate-400 text-xs pt-1 border-t border-slate-100">Cliente desde {formatDate(c.createdAt)}</p>}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-brand-600 flex items-center gap-1">
                  <EyeIcon className="h-3 w-3" /> Ver detalhes
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Edição/Criação */}
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

      {/* Modal de Detalhes do Cliente */}
      <Modal isOpen={detailModal} onClose={closeDetailModal} title={selectedCustomer?.name || 'Detalhes do Cliente'} size="lg">
        {loadingDetails ? (
          <LoadingState message="Carregando detalhes..." />
        ) : selectedCustomer ? (
          <div className="space-y-6">
            {/* Informações do Cliente */}
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <UsersIcon className="h-4 w-4" /> Informações de Cadastro
              </h4>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MailIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">E-mail:</span>
                  <span className="text-slate-800">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <PhoneIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Telefone:</span>
                  <span className="text-slate-800">{selectedCustomer.phone || 'Não informado'}</span>
                </div>
                {selectedCustomer.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPinIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">Endereço:</span>
                    <span className="text-slate-800">{selectedCustomer.address}</span>
                  </div>
                )}
                {selectedCustomer.notes && (
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <span className="text-sm text-slate-600">Observações: </span>
                    <span className="text-sm text-slate-800">{selectedCustomer.notes}</span>
                  </div>
                )}
                {selectedCustomer.createdAt && (
                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-200">
                    Cliente desde {formatDate(selectedCustomer.createdAt)}
                  </div>
                )}
              </div>
            </div>

            {/* Ordens de Serviço Ativas */}
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <ClipboardListIcon className="h-4 w-4" /> Ordens de Serviço Ativas ({activeOrders.length})
              </h4>
              {activeOrders.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-4 text-center text-sm text-slate-500">
                  Nenhuma ordem de serviço ativa no momento.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeOrders.map(order => (
                    <div key={order.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold text-slate-800 text-sm">#{order.orderNumber}</span>
                          {order.priority && (
                            <Badge color={PRIORITY_COLOR[order.priority as keyof typeof PRIORITY_COLOR]} className="ml-2">
                              {PRIORITY_LABEL[order.priority as keyof typeof PRIORITY_LABEL]}
                            </Badge>
                          )}
                        </div>
                        <Badge color={STATUS_BG[order.status] + ' ' + STATUS_COLOR[order.status]}>
                          {STATUS_LABEL[order.status]}
                        </Badge>
                      </div>
                      {order.description && (
                        <p className="text-xs text-slate-500 mb-2">{order.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>Valor: <strong className="text-slate-700">{formatCurrency(order.totalAmount)}</strong></span>
                        {order.dueDate && (
                          <span>Entrega: <strong className="text-slate-700">{formatDate(order.dueDate)}</strong></span>
                        )}
                        <span>Criado: <strong className="text-slate-700">{formatDate(order.createdAt)}</strong></span>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-xs text-slate-500 mb-1">Itens:</p>
                          <div className="flex flex-wrap gap-2">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-slate-200">
                                {item.product?.name || 'Produto'} x{item.quantity}
                              </span>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-xs text-slate-400">+{order.items.length - 3} mais</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Histórico de Pedidos */}
            {selectedCustomer.orders && selectedCustomer.orders.length > activeOrders.length && (
              <div>
                <h4 className="text-sm font-semibold text-slate-600 mb-3">
                  Histórico de Pedidos ({selectedCustomer.orders.length - activeOrders.length} finalizados)
                </h4>
                <div className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
                  {selectedCustomer.orders.filter(o => !ACTIVE_STATUSES.includes(o.status)).slice(0, 5).map(order => (
                    <div key={order.id} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                      <span>#{order.orderNumber}</span>
                      <span className="text-slate-400">{formatDate(order.createdAt)}</span>
                      <Badge color={STATUS_BG[order.status] + ' ' + STATUS_COLOR[order.status]} className="text-xs">
                        {STATUS_LABEL[order.status]}
                      </Badge>
                    </div>
                  ))}
                  {selectedCustomer.orders.length > 5 && (
                    <p className="text-center text-slate-400 mt-2">
                      E mais {selectedCustomer.orders.length - 5} pedidos...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={closeDetailModal}>Fechar</Button>
              <Button onClick={() => {
                closeDetailModal();
                openEdit(selectedCustomer, { stopPropagation: () => {} } as React.MouseEvent);
              }}>
                <EditIcon className="h-4 w-4 mr-1" /> Editar Cliente
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default CustomersView;
