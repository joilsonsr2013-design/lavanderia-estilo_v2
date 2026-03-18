import React, { useState } from 'react';
import { Card, Button, Input, Select, Textarea, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, PackageIcon, AlertIcon } from '../components/icons';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { productsApi } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import type { Product } from '../types';

const emptyForm = { 
  name: '', 
  description: '', 
  sku: '', 
  price: '0', 
  washAndIronPrice: '0', 
  ironOnlyPrice: '0', 
  dryCleanPrice: '0',
  stock: '9999', 
  minStock: '0', 
  categoryId: '', 
  unit: 'pç' 
};

const UNITS = ['pç', 'un', 'kg', 'm2', 'L', 'pc'];

const InventoryView: React.FC = () => {
  const { inventory, categories, loadingInventory, loadingCategories, refreshInventory } = useAppContext();
  const { canManage } = useAuth();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filtered = inventory.filter(p => {
    const matchS = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchC = !catFilter || p.categoryId === catFilter;
    return matchS && matchC;
  });

  const openNew = () => { 
    setEditing(null); 
    setForm({
      ...emptyForm,
      categoryId: categories.length > 0 ? categories[0].id : ''
    }); 
    setError(''); 
    setModal(true); 
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ 
      name: p.name, 
      description: p.description || '', 
      sku: p.sku, 
      price: String(p.price), 
      washAndIronPrice: String(p.washAndIronPrice || 0),
      ironOnlyPrice: String(p.ironOnlyPrice || 0),
      dryCleanPrice: String(p.dryCleanPrice || 0),
      stock: String(p.stock), 
      minStock: String(p.minStock), 
      categoryId: p.categoryId || '', 
      unit: p.unit || 'pç' 
    });
    setError(''); setModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const data = { 
        ...form, 
        price: Number(form.price), 
        washAndIronPrice: Number(form.washAndIronPrice),
        ironOnlyPrice: Number(form.ironOnlyPrice),
        dryCleanPrice: Number(form.dryCleanPrice),
        stock: Number(form.stock), 
        minStock: Number(form.minStock) 
      };
      if (editing) await productsApi.update(editing.id, data);
      else await productsApi.create(data);
      await refreshInventory(); setModal(false);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (loadingInventory || loadingCategories) return <LoadingState />;

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex gap-3 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Buscar peça no catálogo..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none">
              <option value="">Todas as categorias</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {canManage && <Button icon={PlusIcon} onClick={openNew}>Cadastrar Peça</Button>}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={PackageIcon} message="Nenhuma peça cadastrada no catálogo." action={canManage ? <Button icon={PlusIcon} onClick={openNew}>Adicionar Peça</Button> : undefined} /></Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Peça', 'SKU', 'Categoria', 'Lavar+Passar', 'Apenas Passar', 'Seco', 'Unid.', canManage ? 'Ações' : ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                      {item.description && <p className="text-xs text-slate-400 truncate max-w-xs">{item.description}</p>}
                    </td>
                    <td className="px-4 py-3"><span className="font-mono text-xs text-slate-500">{item.sku}</span></td>
                    <td className="px-4 py-3"><Badge color="bg-slate-100 text-slate-600">{item.category?.name || 'Sem Categoria'}</Badge></td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{formatCurrency(item.washAndIronPrice || item.price)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{item.ironOnlyPrice ? formatCurrency(item.ironOnlyPrice) : '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{item.dryCleanPrice ? formatCurrency(item.dryCleanPrice) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.unit}</td>
                    {canManage && (
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><EditIcon className="h-3 w-3" /></Button>
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

      {/* Piece Modal */}
      {canManage && (
        <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Editar Peça' : 'Cadastrar Nova Peça'} size="lg"
          footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" form="productForm" isLoading={saving}>Salvar Peça</Button></>}>
          {error && <Alert type="error" message={error} className="mb-4" />}
          <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input name="name" label="Nome da Peça" value={form.name} onChange={handleChange} required className="col-span-2" containerClassName="col-span-2" placeholder="Ex: Camisa Social, Edredom Casal" />
              <Input name="sku" label="Código (SKU)" value={form.sku} onChange={handleChange} required placeholder="VEST-CAM-001" />
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Categoria</label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange} required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                  <option value="">Selecione uma categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div className="col-span-2 grid grid-cols-3 gap-4 p-4 bg-brand-50/50 rounded-xl border border-brand-100">
                <Input name="washAndIronPrice" label="Lavar + Passar (R$)" type="number" step="0.01" min="0" value={form.washAndIronPrice} onChange={handleChange} required />
                <Input name="ironOnlyPrice" label="Apenas Passar (R$)" type="number" step="0.01" min="0" value={form.ironOnlyPrice} onChange={handleChange} />
                <Input name="dryCleanPrice" label="Limpeza a Seco (R$)" type="number" step="0.01" min="0" value={form.dryCleanPrice} onChange={handleChange} />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Unidade de Medida</label>
                <select name="unit" value={form.unit} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <Input name="price" label="Preço Base (Geral)" type="number" step="0.01" value={form.price} onChange={handleChange} required />
              
              <div className="space-y-1 col-span-2">
                <label className="block text-sm font-semibold text-slate-700">Descrição / Instruções Técnicas</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InventoryView;
