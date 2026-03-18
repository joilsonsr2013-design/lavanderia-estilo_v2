import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Textarea, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, OrdersIcon, ChevronRightIcon, AlertIcon, CalendarIcon, FilterIcon } from '../components/icons';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi, productsApi } from '../services/api';
import { formatDate, formatCurrency, isOverdue, daysUntil } from '../utils/helpers';
import { STATUS_LABEL, STATUS_BG, STATUS_COLOR, PRIORITY_LABEL, PRIORITY_COLOR, NEXT_STATUS, NEXT_STATUS_LABEL, WORKFLOW_STAGES, FINAL_STATUSES, FABRIC_TYPES, ITEM_COLORS, DIRT_LEVELS } from '../constants';
import { OrderStatus, OrderPriority, type Order, type Product } from '../types';

// Status que representam ordens ativas (em andamento)
const ACTIVE_ORDER_STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.CLASSIFICATION,
  OrderStatus.WASHING,
  OrderStatus.DRYING,
  OrderStatus.IRONING,
  OrderStatus.INSPECTION,
  OrderStatus.PACKAGING,
  OrderStatus.READY_FOR_DELIVERY,
];

const OrdersView: React.FC = () => {
  const { orders, customers, inventory, refreshOrders } = useAppContext();
  const { canManage } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // Por padrão, mostrar apenas ordens ativas
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [priority, setPriority] = useState<OrderPriority>(OrderPriority.MEDIUM);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number; unitPrice: number; fabricType: string; color: string; dirtLevel: string; damageNotes: string }[]>([
    { productId: '', quantity: 1, unitPrice: 0, fabricType: '', color: '', dirtLevel: 'Leve', damageNotes: '' }
  ]);

  // Services (non-insumos products)
  const services = inventory.filter(p => p.category !== 'Insumos' && p.category !== 'Embalagem');

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.customer?.name?.toLowerCase().includes(search.toLowerCase());

    // Filtro por status
    let matchStatus = true;
    if (statusFilter === 'active') {
      // Mostrar apenas ordens ativas (não entregues/canceladas)
      matchStatus = ACTIVE_ORDER_STATUSES.includes(o.status);
    } else if (statusFilter) {
      // Filtro por status específico
      matchStatus = o.status === statusFilter;
    }

    return matchSearch && matchStatus;
  });

  const total = items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  const addItem = () => setItems(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0, fabricType: '', color: '', dirtLevel: 'Leve', damageNotes: '' }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: any) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'productId') {
        const prod = inventory.find(p => p.id === value);
        if (prod) next[idx].unitPrice = prod.price;
      }
      return next;
    });
  };

  const openNew = () => {
    setCustomerId(''); setPriority(OrderPriority.MEDIUM); setDescription(''); setDueDate('');
    setItems([{ productId: '', quantity: 1, unitPrice: 0, fabricType: '', color: '', dirtLevel: 'Leve', damageNotes: '' }]);
    setError(''); setModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const validItems = items.filter(i => i.productId && i.quantity > 0);
      if (!customerId) throw new Error('Selecione um cliente');
      if (validItems.length === 0) throw new Error('Adicione pelo menos um serviço');
      await ordersApi.create({
        customerId, priority, description, dueDate: dueDate || undefined,
        totalAmount: total,
        items: validItems.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.quantity * i.unitPrice, fabricType: i.fabricType, color: i.color, dirtLevel: i.dirtLevel, damageNotes: i.damageNotes }))
      });
      await refreshOrders(); setModal(false);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleAdvanceStatus = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setAdvancingId(order.id);
    try { await ordersApi.updateStatus(order.id, next); await refreshOrders(); }
    catch (err: any) { alert(err.message); }
    finally { setAdvancingId(null); }
  };

  const handleCancel = async (order: Order) => {
    if (!confirm('Cancelar este pedido?')) return;
    try { await ordersApi.updateStatus(order.id, OrderStatus.CANCELLED); await refreshOrders(); }
    catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!canManage) return;
    if (!confirm('Excluir este pedido permanentemente?')) return;
    try { await ordersApi.delete(id); await refreshOrders(); }
    catch (err: any) { alert(err.message); }
  };

  const priorityOpts = Object.values(OrderPriority).map(v => ({ value: v, label: PRIORITY_LABEL[v] }));
  const statusOpts = [
    { value: 'active', label: 'Em Andamento' },
    { value: '', label: 'Todos os status' },
    ...WORKFLOW_STAGES.map(s => ({ value: s.id, label: s.label }))
  ];

  // Contagem de ordens ativas
  const activeOrdersCount = orders.filter(o => ACTIVE_ORDER_STATUSES.includes(o.status)).length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-1 flex-wrap items-center">
            <div className="relative flex-1 max-w-xs">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Buscar pedido, cliente..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
              {statusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {statusFilter === 'active' && (
              <span className="text-xs text-slate-500 bg-brand-50 px-2 py-1 rounded-lg">
                {activeOrdersCount} {activeOrdersCount === 1 ? 'ordem ativa' : 'ordens ativas'}
              </span>
            )}
          </div>
          <Button icon={PlusIcon} onClick={openNew}>Nova Ordem</Button>
        </div>
      </Card>

      {/* Orders table */}
      {filtered.length === 0 ? (
        <Card><EmptyState icon={OrdersIcon} message="Nenhuma ordem encontrada." action={<Button icon={PlusIcon} onClick={openNew}>Criar Ordem</Button>} /></Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Nº Pedido', 'Cliente', 'Status', 'Prioridade', 'Prazo', 'Valor', 'Ações'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(order => {
                  const overdue = isOverdue(order.dueDate) && !FINAL_STATUSES.includes(order.status);
                  const days = daysUntil(order.dueDate);
                  const nextStatus = NEXT_STATUS[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <button onClick={() => { setSelectedOrder(order); setDetailModal(true); }}
                          className="font-mono text-xs font-bold text-brand-600 hover:underline">
                          #{order.orderNumber?.slice(-8).toUpperCase()}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{order.customer?.name || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge color={`${STATUS_BG[order.status]} ${STATUS_COLOR[order.status]}`}>
                          {STATUS_LABEL[order.status] || order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {order.priority && <Badge color={PRIORITY_COLOR[order.priority]}>{PRIORITY_LABEL[order.priority]}</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        {order.dueDate ? (
                          <span className={`text-xs font-semibold flex items-center gap-1 ${overdue ? 'text-red-600' : days !== null && days <= 1 ? 'text-amber-600' : 'text-slate-600'}`}>
                            {overdue && <AlertIcon className="h-3 w-3" />}
                            {formatDate(order.dueDate)}
                          </span>
                        ) : <span className="text-xs text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          {nextStatus && (
                            <Button size="sm" variant="primary" isLoading={advancingId === order.id}
                              onClick={() => handleAdvanceStatus(order)} title={NEXT_STATUS_LABEL[order.status]}>
                              <ChevronRightIcon className="h-3 w-3" />
                              <span className="hidden sm:inline text-xs">{NEXT_STATUS_LABEL[order.status]?.split(' ')[0]}</span>
                            </Button>
                          )}
                          {!FINAL_STATUSES.includes(order.status) && (
                            <Button size="sm" variant="ghost" onClick={() => handleCancel(order)} className="text-red-400 hover:text-red-600" title="Cancelar">✕</Button>
                          )}
                          {canManage && (
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(order.id)} className="text-slate-400" title="Excluir"><TrashIcon className="h-3 w-3" /></Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* NEW ORDER MODAL */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Nova Ordem de Serviço" size="xl"
        footer={<>
          <Button variant="outline" onClick={() => setModal(false)}>Cancelar</Button>
          <Button type="submit" form="orderForm" isLoading={saving}>Criar Ordem — {formatCurrency(total)}</Button>
        </>}>
        {error && <Alert type="error" message={error} className="mb-4" />}
        <form id="orderForm" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Cliente" value={customerId} onChange={e => setCustomerId(e.target.value)} required
              options={customers.map(c => ({ value: c.id, label: c.name }))} placeholder="Selecione um cliente" containerClassName="col-span-2 sm:col-span-1" />
            <Select label="Prioridade" value={priority} onChange={e => setPriority(e.target.value as OrderPriority)}
              options={priorityOpts} containerClassName="col-span-2 sm:col-span-1" />
            <Input label="Prazo de Entrega" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} containerClassName="col-span-2 sm:col-span-1" />
            <Input label="Descrição" value={description} onChange={e => setDescription(e.target.value)} placeholder="Observações gerais..." containerClassName="col-span-2 sm:col-span-1" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-bold text-slate-700">Itens / Serviços</label>
              <Button type="button" variant="outline" size="sm" icon={PlusIcon} onClick={addItem}>Adicionar Item</Button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 sm:col-span-1">
                      <Select label="Serviço" value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)} required
                        options={services.map(p => ({ value: p.id, label: `${p.name} — ${formatCurrency(p.price)}` }))} placeholder="Selecione..." />
                    </div>
                    <Input label="Qtd" type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
                    <Input label="Preço Unit." type="number" step="0.01" min={0} value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Select label="Tipo de Tecido" value={item.fabricType} onChange={e => updateItem(idx, 'fabricType', e.target.value)}
                      options={FABRIC_TYPES.map(f => ({ value: f, label: f }))} placeholder="Tipo..." />
                    <Select label="Cor" value={item.color} onChange={e => updateItem(idx, 'color', e.target.value)}
                      options={ITEM_COLORS.map(c => ({ value: c, label: c }))} placeholder="Cor..." />
                    <Select label="Sujidade" value={item.dirtLevel} onChange={e => updateItem(idx, 'dirtLevel', e.target.value)}
                      options={DIRT_LEVELS.map(d => ({ value: d, label: d }))} placeholder="Nível..." />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold">Subtotal: {formatCurrency(item.quantity * item.unitPrice)}</span>
                    {items.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)} className="text-red-400"><TrashIcon className="h-3 w-3" /></Button>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-3 p-3 bg-brand-50 rounded-xl">
              <p className="font-bold text-brand-700">Total: {formatCurrency(total)}</p>
            </div>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title={`Pedido #${selectedOrder.orderNumber?.slice(-8).toUpperCase()}`} size="lg">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge color={`${STATUS_BG[selectedOrder.status]} ${STATUS_COLOR[selectedOrder.status]}`}>{STATUS_LABEL[selectedOrder.status]}</Badge>
              {selectedOrder.priority && <Badge color={PRIORITY_COLOR[selectedOrder.priority]}>{PRIORITY_LABEL[selectedOrder.priority]}</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-semibold text-slate-600">Cliente:</span> <span>{selectedOrder.customer?.name}</span></div>
              <div><span className="font-semibold text-slate-600">Total:</span> <span>{formatCurrency(selectedOrder.totalAmount)}</span></div>
              {selectedOrder.dueDate && <div><span className="font-semibold text-slate-600">Prazo:</span> <span>{formatDate(selectedOrder.dueDate)}</span></div>}
              {selectedOrder.description && <div className="col-span-2"><span className="font-semibold text-slate-600">Obs.:</span> <span>{selectedOrder.description}</span></div>}
            </div>
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <p className="font-bold text-slate-700 mb-2 text-sm">Itens:</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                      <div>
                        <p className="font-semibold text-slate-700">{item.product?.name || 'Serviço'} × {item.quantity}</p>
                        <p className="text-xs text-slate-500">{[item.fabricType, item.color, item.dirtLevel].filter(Boolean).join(' • ')}</p>
                      </div>
                      <span className="font-bold text-slate-700">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Workflow progress */}
            <div>
              <p className="font-bold text-slate-700 mb-2 text-sm">Progresso:</p>
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {WORKFLOW_STAGES.filter(s => s.id !== OrderStatus.CANCELLED).map((stage, i) => {
                  const stages = Object.values(OrderStatus).filter(s => s !== OrderStatus.CANCELLED);
                  const currentIdx = stages.indexOf(selectedOrder.status);
                  const stageIdx = stages.indexOf(stage.id);
                  const isDone = stageIdx < currentIdx;
                  const isCurrent = stageIdx === currentIdx;
                  return (
                    <React.Fragment key={stage.id}>
                      <div className={`shrink-0 flex flex-col items-center`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${isDone ? 'bg-green-500 text-white' : isCurrent ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span className={`text-xs mt-1 whitespace-nowrap ${isCurrent ? 'text-brand-600 font-bold' : 'text-slate-400'}`}>{stage.label}</span>
                      </div>
                      {i < WORKFLOW_STAGES.filter(s => s.id !== OrderStatus.CANCELLED).length - 1 && (
                        <div className={`flex-1 h-0.5 min-w-[8px] ${isDone ? 'bg-green-400' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersView;
