import React, { useState } from 'react';
import { Card, Button, Input, Select, Textarea, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, PackageIcon } from '../components/icons';
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
  const [deleting, setDeleting] = useState<string | null>(null);

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
      if (!form.name.trim()) {
        setError('Nome da peça é obrigatório');
        setSaving(false);
        return;
      }
      if (!form.sku.trim()) {
        setError('Código (SKU) é obrigatório');
        setSaving(false);
        return;
      }
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

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await productsApi.delete(id);
      await refreshInventory();
      setDeleting(null);
    } catch (err: any) { 
      setError(err.message); 
    }
  };

  if (loadingInventory || loadingCategories) return <LoadingState />;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex gap-3 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Buscar peça..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas as categorias</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {canManage && <Button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"><PlusIcon className="h-4 w-4" /> Nova Peça</Button>}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
        <div className="flex items-start gap-4">
          <div className="text-3xl">👕</div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 mb-1">Catálogo de Peças</h3>
            <p className="text-sm text-slate-600">
              Cadastre as peças de roupa que sua lavanderia trabalha. Cada peça pode ter preços diferentes para cada tipo de serviço (Lavar e Passar, Apenas Passar, Limpeza a Seco).
            </p>
          </div>
          <Badge className="bg-green-600 text-white whitespace-nowrap">{filtered.length} peça(s)</Badge>
        </div>
      </Card>

      {/* Error Alert */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={PackageIcon} message="Nenhuma peça cadastrada no catálogo." action={canManage ? <Button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"><PlusIcon className="h-4 w-4" /> Adicionar Peça</Button> : undefined} />
        </Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
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
                    <td className="px-4 py-3"><span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{item.sku}</span></td>
                    <td className="px-4 py-3"><Badge className="bg-slate-100 text-slate-600">{item.category?.name || 'Sem Categoria'}</Badge></td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{formatCurrency(item.washAndIronPrice || item.price)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{item.ironOnlyPrice ? formatCurrency(item.ironOnlyPrice) : '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{item.dryCleanPrice ? formatCurrency(item.dryCleanPrice) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.unit}</td>
                    {canManage && (
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => openEdit(item)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                          >
                            <EditIcon className="h-3 w-3" /> Editar
                          </Button>
                          <Button 
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs flex items-center gap-1 disabled:opacity-50"
                          >
                            <TrashIcon className="h-3 w-3" /> {deleting === item.id ? 'Excluindo...' : 'Excluir'}
                          </Button>
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
        <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Editar Peça' : 'Cadastrar Nova Peça'} size="lg">
          {error && <Alert type="error" message={error} className="mb-4" />}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input name="name" label="Nome da Peça *" value={form.name} onChange={handleChange} required className="col-span-2" placeholder="Ex: Camisa Social, Edredom Casal" />
              <Input name="sku" label="Código (SKU) *" value={form.sku} onChange={handleChange} required placeholder="VEST-CAM-001" />
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Categoria *</label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange} required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Selecione uma categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div className="col-span-2 grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Input name="washAndIronPrice" label="Lavar + Passar (R$)" type="number" step="0.01" min="0" value={form.washAndIronPrice} onChange={handleChange} required />
                <Input name="ironOnlyPrice" label="Apenas Passar (R$)" type="number" step="0.01" min="0" value={form.ironOnlyPrice} onChange={handleChange} />
                <Input name="dryCleanPrice" label="Limpeza a Seco (R$)" type="number" step="0.01" min="0" value={form.dryCleanPrice} onChange={handleChange} />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Unidade de Medida</label>
                <select name="unit" value={form.unit} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <Input name="price" label="Preço Base (Geral)" type="number" step="0.01" value={form.price} onChange={handleChange} required />
              
              <div className="space-y-1 col-span-2">
                <label className="block text-sm font-semibold text-slate-700">Descrição / Instruções Técnicas</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                onClick={() => setModal(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Peça'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InventoryView;
