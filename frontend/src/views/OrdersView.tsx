import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Textarea, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, OrdersIcon, ChevronRightIcon, AlertIcon, CalendarIcon, FilterIcon, TagIcon } from '../components/icons';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi } from '../services/api';
import { formatDate, formatCurrency, isOverdue, daysUntil } from '../utils/helpers';
import { STATUS_LABEL, STATUS_BG, STATUS_COLOR, PRIORITY_LABEL, PRIORITY_COLOR, NEXT_STATUS, NEXT_STATUS_LABEL, WORKFLOW_STAGES, FINAL_STATUSES, ITEM_COLORS, DIRT_LEVELS } from '../constants';
import { OrderStatus, OrderPriority, type Order } from '../types';

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

const FABRICS = ['Algodão', 'Seda', 'Linho', 'Sintético', 'Lã', 'Couro', 'Veludo', 'Pluma de Ganso', 'Outro'];
const SERVICES = ['Lavar e Passar', 'Apenas Passar', 'Limpeza a Seco', 'Tratamento de Manchas'];

const OrdersView: React.FC = () => {
  const { orders, customers, inventory, brands, refreshOrders } = useAppContext();
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
    brandId: string;
    color: string; 
    fabric: string;
    dirtLevel: string; 
    damageNotes: string;
    notes: string;
  }[]>([
    { productId: '', quantity: 1, unitPrice: 0, serviceType: 'Lavar e Passar', brandId: '', color: '', fabric: '', dirtLevel: 'Leve', damageNotes: '', notes: '' }
  ]);

  const servicesList = inventory.filter(p => p.category?.name !== 'Insumos' && p.category?.name !== 'Embalagem');

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.customer?.name?.toLowerCase().includes(search.toLowerCase());
    let matchStatus = true;
    if (statusFilter === 'active') matchStatus = ACTIVE_ORDER_STATUSES.includes(o.status);
    else if (statusFilter) matchStatus = o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  const addItem = () => setItems(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0, serviceType: 'Lavar e Passar', brandId: '', color: '', fabric: '', dirtLevel: 'Leve', damageNotes: '', notes: '' }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: any) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      
      if (field === 'productId' || field === 'serviceType') {
        const prodId = field === 'productId' ? value : next[idx].productId;
        const srvType = field === 'serviceType' ? value : next[idx].serviceType;
        const prod = inventory.find(p => p.id === prodId);
        
        if (prod) {
          if (srvType === 'Apenas Passar' && prod.ironOnlyPrice) next[idx].unitPrice = prod.ironOnlyPrice;
          else if (srvType === 'Limpeza a Seco' && prod.dryCleanPrice) next[idx].unitPrice = prod.dryCleanPrice;
          else next[idx].unitPrice = prod.washAndIronPrice || prod.price;
        }
      }
      return next;
    });
  };

  const openNew = () => {
    setCustomerId(''); setPriority(OrderPriority.MEDIUM); setDescription(''); setDueDate('');
    setItems([{ productId: '', quantity: 1, unitPrice: 0, serviceType: 'Lavar e Passar', brandId: '', color: '', fabric: '', dirtLevel: 'Leve', damageNotes: '', notes: '' }]);
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
          brandId: i.brandId || undefined,
          color: i.color, 
          fabric: i.fabric,
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
              <option value="active">Em Andamento</option>
              <option value="">Todos os status</option>
              {WORKFLOW_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <Button icon={PlusIcon} onClick={openNew}>Novo Rol de Roupas</Button>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={OrdersIcon} message="Nenhum rol de roupas encontrado." action={<Button icon={PlusIcon} onClick={openNew}>Criar Rol</Button>} /></Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Rol Nº', 'Cliente', 'Status', 'Prazo', 'Total', 'Ações'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <button onClick={() => { setSelectedOrder(order); setDetailModal(true); }}
                        className="font-mono text-xs font-bold text-brand-600 hover:underline">
                        #{order.orderNumber?.slice(-8).toUpperCase()}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{order.customer?.name}</td>
                    <td className="px-4 py-3">
                      <Badge color={`${STATUS_BG[order.status]} ${STATUS_COLOR[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${isOverdue(order.dueDate) ? 'text-red-600' : 'text-slate-600'}`}>
                        {formatDate(order.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {NEXT_STATUS[order.status] && (
                          <Button size="sm" variant="primary" isLoading={advancingId === order.id}
                            onClick={() => handleAdvanceStatus(order)} title={NEXT_STATUS_LABEL[order.status]}>
                            <ChevronRightIcon className="h-3 w-3" />
                            <span className="hidden sm:inline text-xs">{NEXT_STATUS_LABEL[order.status]?.split(' ')[0]}</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* NEW ORDER MODAL */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Check-in: Novo Rol de Roupas" size="xl"
        footer={<div className="flex justify-between items-center w-full">
          <div className="text-lg font-bold text-slate-800">Total: {formatCurrency(total)}</div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} isLoading={saving}>Gerar Rol</Button>
          </div>
        </div>}>
        {error && <Alert type="error" message={error} className="mb-4" />}
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label="Cliente" required value={customerId} onChange={e => setCustomerId(e.target.value)}
              options={customers.map(c => ({ value: c.id, label: c.name }))} placeholder="Selecione o cliente" />
            <Select label="Prioridade" value={priority} onChange={e => setPriority(e.target.value as OrderPriority)} 
              options={Object.values(OrderPriority).map(v => ({ value: v, label: PRIORITY_LABEL[v] }))} />
            <Input label="Previsão de Entrega" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><TagIcon className="h-4 w-4" /> Detalhamento das Peças</h4>
              <Button type="button" size="sm" variant="outline" onClick={addItem} icon={PlusIcon}>Adicionar Peça</Button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group animate-slide-in">
                  <button type="button" onClick={() => removeItem(idx)} className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md hover:bg-red-50 transition-colors">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <Select label="Peça / Serviço" required value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}
                        options={servicesList.map(p => ({ value: p.id, label: p.name }))} placeholder="Selecione a peça" />
                    </div>
                    <Input label="Qtd" type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))} />
                    <Input label="Preço Unit. (R$)" type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value))} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Select label="Serviço" value={item.serviceType} onChange={e => updateItem(idx, 'serviceType', e.target.value)}
                      options={SERVICES.map(s => ({ value: s, label: s }))} />
                    <Select label="Marca" value={item.brandId} onChange={e => updateItem(idx, 'brandId', e.target.value)}
                      options={brands.map(b => ({ value: b.id, label: b.name }))} placeholder="Selecione a marca" />
                    <Select label="Cor" value={item.color} onChange={e => updateItem(idx, 'color', e.target.value)}
                      options={ITEM_COLORS.map(c => ({ value: c, label: c }))} />
                    <Select label="Tecido" value={item.fabric} onChange={e => updateItem(idx, 'fabric', e.target.value)}
                      options={FABRICS.map(f => ({ value: f, label: f }))} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <Select label="Nível de Sujeira" value={item.dirtLevel} onChange={e => updateItem(idx, 'dirtLevel', e.target.value)}
                      options={DIRT_LEVELS.map(d => ({ value: d, label: d }))} />
                    <Input label="Avarias / Manchas (Check-in)" placeholder="Ex: Mancha de vinho na manga esquerda" value={item.damageNotes} onChange={e => updateItem(idx, 'damageNotes', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">Observações Gerais do Rol</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Instruções especiais para este pedido..." />
          </div>
        </form>
      </Modal>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title={`Rol #${selectedOrder.orderNumber?.slice(-8).toUpperCase()}`} size="xl">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedOrder.customer?.name}</h3>
                <p className="text-sm text-slate-500">{selectedOrder.customer?.phone} • {selectedOrder.customer?.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge color={`${STATUS_BG[selectedOrder.status]} ${STATUS_COLOR[selectedOrder.status]}`}>{STATUS_LABEL[selectedOrder.status]}</Badge>
                  <Badge color={PRIORITY_COLOR[selectedOrder.priority || 'MEDIUM']}>{PRIORITY_LABEL[selectedOrder.priority || 'MEDIUM']}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total do Rol</p>
                <p className="text-2xl font-black text-brand-600">{formatCurrency(selectedOrder.totalAmount)}</p>
                <p className="text-xs text-slate-500 mt-1">Previsão: {formatDate(selectedOrder.dueDate)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Peças no Rol</h4>
              <div className="grid grid-cols-1 gap-3">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center bg-brand-100 text-brand-700 rounded-full text-xs font-bold">{item.quantity}x</span>
                        <h5 className="font-bold text-slate-800">{item.product?.name}</h5>
                        <Badge variant="outline" className="text-[10px]">{item.serviceType}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                        {item.brand && <span><strong className="text-slate-700">Marca:</strong> {item.brand.name}</span>}
                        {item.color && <span><strong className="text-slate-700">Cor:</strong> {item.color}</span>}
                        {item.fabric && <span><strong className="text-slate-700">Tecido:</strong> {item.fabric}</span>}
                        {item.dirtLevel && <span><strong className="text-slate-700">Sujeira:</strong> {item.dirtLevel}</span>}
                      </div>
                      {item.damageNotes && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 border border-red-100">
                          <strong>Avarias:</strong> {item.damageNotes}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 md:mt-0 md:text-right">
                      <p className="text-sm font-bold text-slate-700">{formatCurrency(item.totalPrice)}</p>
                      <p className="text-[10px] text-slate-400">{formatCurrency(item.unitPrice)} / un</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.description && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <h4 className="text-xs font-bold text-amber-800 uppercase mb-1">Observações do Rol</h4>
                <p className="text-sm text-amber-900">{selectedOrder.description}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersView;
