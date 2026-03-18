import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Textarea, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, OrdersIcon, ChevronRightIcon, AlertIcon, CalendarIcon, FilterIcon, TagIcon } from '../components/icons';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi } from '../services/api';
import { formatDate, formatCurrency, isOverdue, daysUntil } from '../utils/helpers';
import { STATUS_LABEL, STATUS_BG, STATUS_COLOR, PRIORITY_LABEL, PRIORITY_COLOR, NEXT_STATUS, NEXT_STATUS_LABEL, WORKFLOW_STAGES, FINAL_STATUSES, ITEM_COLORS, DIRT_LEVELS } from '../constants';
import { OrderStatus, OrderPriority, type Order } from '../types';

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
  const [statusFilter, setStatusFilter] = useState('active');
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
  const [items, setItems] = useState<{ 
    productId: string; 
    quantity: number; 
    unitPrice: number; 
    serviceType: string;
    brand: string;
    color: string; 
    dirtLevel: string; 
    damageNotes: string;
    notes: string;
  }[]>([
    { productId: '', quantity: 1, unitPrice: 0, serviceType: 'Lavar e Passar', brand: '', color: '', dirtLevel: 'Leve', damageNotes: '', notes: '' }
  ]);

  // Services (non-insumos products)
  const services = inventory.filter(p => p.category !== 'Insumos' && p.category !== 'Embalagem');

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.customer?.name?.toLowerCase().includes(search.toLowerCase());
    let matchStatus = true;
    if (statusFilter === 'active') matchStatus = ACTIVE_ORDER_STATUSES.includes(o.status);
    else if (statusFilter) matchStatus = o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  const addItem = () => setItems(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0, serviceType: 'Lavar e Passar', brand: '', color: '', dirtLevel: 'Leve', damageNotes: '', notes: '' }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: any) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      
      // Se mudar o produto ou o tipo de serviço, atualiza o preço unitário
      if (field === 'productId' || field === 'serviceType') {
        const prodId = field === 'productId' ? value : next[idx].productId;
        const srvType = field === 'serviceType' ? value : next[idx].serviceType;
        const prod = inventory.find(p => p.id === prodId);
        
        if (prod) {
          if (srvType === 'Apenas Passar' && prod.ironOnlyPrice) {
            next[idx].unitPrice = prod.ironOnlyPrice;
          } else {
            next[idx].unitPrice = prod.washAndIronPrice || prod.price;
          }
        }
      }
      return next;
    });
  };

  const openNew = () => {
    setCustomerId(''); setPriority(OrderPriority.MEDIUM); setDescription(''); setDueDate('');
    setItems([{ productId: '', quantity: 1, unitPrice: 0, serviceType: 'Lavar e Passar', brand: '', color: '', dirtLevel: 'Leve', damageNotes: '', notes: '' }]);
    setError(''); setModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const validItems = items.filter(i => i.productId && i.quantity > 0);
      if (!customerId) throw new Error('Selecione um cliente');
      if (validItems.length === 0) throw new Error('Adicione pelo menos uma peça');
      
      await ordersApi.create({
        customerId, priority, description, dueDate: dueDate || undefined,
        totalAmount: total,
        items: validItems.map(i => ({ 
          productId: i.productId, 
          quantity: i.quantity, 
          unitPrice: i.unitPrice, 
          totalPrice: i.quantity * i.unitPrice, 
          serviceType: i.serviceType,
          brand: i.brand,
          color: i.color, 
          dirtLevel: i.dirtLevel, 
          damageNotes: i.damageNotes,
          notes: i.notes
        }))
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

  const activeOrdersCount = orders.filter(o => ACTIVE_ORDER_STATUSES.includes(o.status)).length;

  return (
    <div className="space-y-4 animate-fade-in">
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
        footer={<div className="flex justify-between items-center w-full">
          <div className="text-lg font-bold text-slate-800">Total: {formatCurrency(total)}</div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} isLoading={saving}>Criar Pedido</Button>
          </div>
        </div>}>
        {error && <Alert type="error" message={error} className="mb-4" />}
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label="Cliente" required value={customerId} onChange={e => setCustomerId(e.target.value)}
              options={customers.map(c => ({ value: c.id, label: c.name }))} placeholder="Selecione o cliente" />
            <Select label="Prioridade" value={priority} onChange={e => setPriority(e.target.value as OrderPriority)} options={priorityOpts} />
            <Input label="Prazo de Entrega" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><TagIcon className="h-4 w-4" /> Peças e Serviços</h4>
              <Button type="button" size="sm" variant="outline" onClick={addItem} icon={PlusIcon}>Adicionar Peça</Button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3 relative group">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-colors">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-4">
                      <Select label="Peça" required value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}
                        options={services.map(s => ({ value: s.id, label: `${s.name} (${s.category})` }))} placeholder="Selecione a peça" />
                    </div>
                    <div className="md:col-span-3">
                      <Select label="Serviço" value={item.serviceType} onChange={e => updateItem(idx, 'serviceType', e.target.value)}
                        options={[{ value: 'Lavar e Passar', label: 'Lavar e Passar' }, { value: 'Apenas Passar', label: 'Apenas Passar' }]} />
                    </div>
                    <div className="md:col-span-2">
                      <Input label="Qtd" type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="md:col-span-3">
                      <Input label="Preço Unit." type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input label="Cor" value={item.color} onChange={e => updateItem(idx, 'color', e.target.value)} placeholder="Ex: Azul, Branco" />
                    <Input label="Marca" value={item.brand} onChange={e => updateItem(idx, 'brand', e.target.value)} placeholder="Ex: Zara, Hering" />
                    <Select label="Sujidade" value={item.dirtLevel} onChange={e => updateItem(idx, 'dirtLevel', e.target.value)}
                      options={DIRT_LEVELS.map(l => ({ value: l, label: l }))} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input label="Avarias/Manchas" value={item.damageNotes} onChange={e => updateItem(idx, 'damageNotes', e.target.value)} placeholder="Ex: Mancha de café, botão faltando" />
                    <Input label="Observações" value={item.notes} onChange={e => updateItem(idx, 'notes', e.target.value)} placeholder="Ex: Não usar amaciante" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Textarea label="Observações Gerais do Pedido" value={description} onChange={e => setDescription(e.target.value)} placeholder="Instruções adicionais para a lavanderia..." />
        </form>
      </Modal>

      {/* ORDER DETAILS MODAL */}
      <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title={`Detalhes do Pedido #${selectedOrder?.orderNumber?.slice(-8).toUpperCase()}`} size="lg">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{selectedOrder.customer?.name}</h3>
                <p className="text-sm text-slate-500">{selectedOrder.customer?.phone} | {selectedOrder.customer?.email}</p>
              </div>
              <Badge color={`${STATUS_BG[selectedOrder.status]} ${STATUS_COLOR[selectedOrder.status]}`}>
                {STATUS_LABEL[selectedOrder.status]}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Data</p>
                <p className="text-sm font-semibold">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Prazo</p>
                <p className="text-sm font-semibold">{formatDate(selectedOrder.dueDate)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Prioridade</p>
                <p className="text-sm font-semibold">{PRIORITY_LABEL[selectedOrder.priority || 'MEDIUM']}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Total</p>
                <p className="text-sm font-bold text-brand-600">{formatCurrency(selectedOrder.totalAmount)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-700">Itens do Pedido</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex justify-between font-bold text-sm">
                      <span>{item.quantity}x {item.product?.name}</span>
                      <span>{formatCurrency(item.totalPrice)}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span><strong>Serviço:</strong> {item.serviceType || 'Lavar e Passar'}</span>
                      {item.color && <span><strong>Cor:</strong> {item.color}</span>}
                      {item.brand && <span><strong>Marca:</strong> {item.brand}</span>}
                      {item.dirtLevel && <span><strong>Sujidade:</strong> {item.dirtLevel}</span>}
                    </div>
                    {(item.damageNotes || item.notes) && (
                      <div className="text-xs mt-2 p-2 bg-white rounded border border-slate-100">
                        {item.damageNotes && <p><strong>Avarias:</strong> {item.damageNotes}</p>}
                        {item.notes && <p><strong>Obs:</strong> {item.notes}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.description && (
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-700">Observações Gerais</h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{selectedOrder.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersView;
