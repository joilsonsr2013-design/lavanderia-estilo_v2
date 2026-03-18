import React, { useState } from 'react';
import { Card, Button, Input, Select, Textarea, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, PackageIcon, AlertIcon } from '../components/icons';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { productsApi } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import type { Product } from '../types';

const emptyForm = { name: '', description: '', sku: '', price: '0', stock: '0', minStock: '0', category: '', unit: 'pç' };

const CATEGORIES = ['Lavagem', 'Lavagem Especial', 'Passadoria', 'Insumos', 'Embalagem', 'Outros'];
const UNITS = ['pç', 'un', 'kg', 'L', 'm', 'cx', 'pc'];

const InventoryView: React.FC = () => {
  const { inventory, loadingInventory, refreshInventory } = useAppContext();
  const { canManage } = useAuth();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [stockModal, setStockModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [stockTarget, setStockTarget] = useState<Product | null>(null);
  const [stockQty, setStockQty] = useState('');
  const [stockOp, setStockOp] = useState<'add' | 'subtract' | 'set'>('add');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filtered = inventory.filter(p => {
    const matchS = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchC = !catFilter || p.category === catFilter;
    return matchS && matchC;
  });

  const lowStockItems = inventory.filter(p => p.isLowStock);
  const categories = [...new Set(inventory.map(p => p.category).filter(Boolean))];

  const openNew = () => { setEditing(null); setForm(emptyForm); setError(''); setModal(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', sku: p.sku, price: String(p.price), stock: String(p.stock), minStock: String(p.minStock), category: p.category || '', unit: p.unit || 'pç' });
    setError(''); setModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const data = { ...form, price: Number(form.price), stock: Number(form.stock), minStock: Number(form.minStock) };
      if (editing) await productsApi.update(editing.id, data);
      else await productsApi.create(data);
      await refreshInventory(); setModal(false);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleStockAdjust = async () => {
    if (!stockTarget || !stockQty) return;
    setSaving(true);
    try {
      await productsApi.updateStock(stockTarget.id, Number(stockQty), stockOp);
      await refreshInventory(); setStockModal(false);
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este item do estoque?')) return;
    try { await productsApi.delete(id); await refreshInventory(); }
    catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {lowStockItems.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-sm text-amber-700">
          <AlertIcon className="h-4 w-4 shrink-0" />
          <strong>{lowStockItems.length}</strong> item(ns) abaixo do estoque mínimo:
          <span className="font-medium">{lowStockItems.slice(0, 3).map(i => i.name).join(', ')}{lowStockItems.length > 3 ? '...' : ''}</span>
        </div>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex gap-3 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Buscar produto, SKU..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none">
              <option value="">Todas categorias</option>
              {categories.map(c => <option key={c} value={c!}>{c}</option>)}
            </select>
          </div>
          {canManage && <Button icon={PlusIcon} onClick={openNew}>Novo Item</Button>}
        </div>
      </Card>

      {loadingInventory ? <LoadingState /> : filtered.length === 0 ? (
        <Card><EmptyState icon={PackageIcon} message="Nenhum item no estoque." action={canManage ? <Button icon={PlusIcon} onClick={openNew}>Adicionar Item</Button> : undefined} /></Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Nome', 'SKU', 'Categoria', 'Preço', 'Estoque', 'Mín.', 'Status', canManage ? 'Ações' : ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(item => (
                  <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${item.isLowStock ? 'bg-red-50/50' : ''}`}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                      {item.description && <p className="text-xs text-slate-400 truncate max-w-xs">{item.description}</p>}
                    </td>
                    <td className="px-4 py-3"><span className="font-mono text-xs text-slate-500">{item.sku}</span></td>
                    <td className="px-4 py-3">{item.category && <Badge color="bg-slate-100 text-slate-600">{item.category}</Badge>}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm ${item.isLowStock ? 'text-red-600' : 'text-slate-700'}`}>
                        {item.stock} {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.minStock} {item.unit}</td>
                    <td className="px-4 py-3">
                      {item.isLowStock
                        ? <Badge color="bg-red-100 text-red-700">⚠ Baixo</Badge>
                        : <Badge color="bg-green-100 text-green-700">OK</Badge>}
                    </td>
                    {canManage && (
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => { setStockTarget(item); setStockQty(''); setStockOp('add'); setStockModal(true); }}>
                            Estoque
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><EditIcon className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleDelete(item.id)}><TrashIcon className="h-3 w-3" /></Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Product Modal */}
      {canManage && (
        <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Editar Item' : 'Novo Item'} size="lg"
          footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" form="productForm" isLoading={saving}>Salvar</Button></>}>
          {error && <Alert type="error" message={error} className="mb-4" />}
          <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input name="name" label="Nome" value={form.name} onChange={handleChange} required className="col-span-2" containerClassName="col-span-2" />
              <Input name="sku" label="SKU / Código" value={form.sku} onChange={handleChange} required placeholder="LAV-CAM-001" />
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Categoria</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                  <option value="">Selecione...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Input name="price" label="Preço (R$)" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Unidade</label>
                <select name="unit" value={form.unit} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <Input name="stock" label="Estoque Atual" type="number" min="0" value={form.stock} onChange={handleChange} />
              <Input name="minStock" label="Estoque Mínimo" type="number" min="0" value={form.minStock} onChange={handleChange} />
              <div className="space-y-1 col-span-2">
                <label className="block text-sm font-semibold text-slate-700">Descrição</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Stock Adjustment Modal */}
      {canManage && (
        <Modal isOpen={stockModal} onClose={() => setStockModal(false)} title="Ajustar Estoque"
          footer={<><Button variant="outline" onClick={() => setStockModal(false)}>Cancelar</Button><Button onClick={handleStockAdjust} isLoading={saving}>Confirmar</Button></>}>
          {stockTarget && (
            <>
              <p className="text-sm text-slate-600 mb-4">Item: <strong>{stockTarget.name}</strong> — Atual: <strong>{stockTarget.stock} {stockTarget.unit}</strong></p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  {(['add', 'subtract', 'set'] as const).map(op => (
                    <button key={op} onClick={() => setStockOp(op)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition ${stockOp === op ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      {op === 'add' ? '+ Adicionar' : op === 'subtract' ? '- Remover' : '= Definir'}
                    </button>
                  ))}
                </div>
                <Input label="Quantidade" type="number" min="0" value={stockQty} onChange={e => setStockQty(e.target.value)} placeholder="0" required />
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
};

export default InventoryView;
