import React, { useState } from 'react';
import { Card, Button, Input, Select, Textarea, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, ShirtIcon } from '../components/icons';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { clothingItemsApi } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import type { ClothingItem } from '../types';

const emptyForm = {
  name: '',
  category: '',
  subcategory: '',
  priceWashIron: '0',
  priceIronOnly: '0',
  estimatedTime: '',
  notes: '',
  active: true
};

const CLOTHING_CATEGORIES = ['Vestuário', 'Cama', 'Mesa', 'Banho', 'Especiais'];
const CLOTHING_SUBCATEGORIES: Record<string, string[]> = {
  'Vestuário': ['Masculino', 'Feminino', 'Infantil', 'Unisex'],
  'Cama': ['Solteiro', 'Casal', 'King/Queen'],
  'Mesa': [],
  'Banho': [],
  'Especiais': ['Cortinas', 'Tapetes', 'Travesseiros', 'Outros']
};

const ClothingItemsView: React.FC = () => {
  const { clothingItems, loadingClothingItems, refreshClothingItems } = useAppContext();
  const { canManage } = useAuth();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ClothingItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filtered = clothingItems.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || item.category === catFilter;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(clothingItems.map(item => item.category).filter(Boolean))];

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModal(true);
  };

  const openEdit = (item: ClothingItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      subcategory: item.subcategory || '',
      priceWashIron: String(item.priceWashIron),
      priceIronOnly: String(item.priceIronOnly),
      estimatedTime: item.estimatedTime ? String(item.estimatedTime) : '',
      notes: item.notes || '',
      active: item.active
    });
    setError('');
    setModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = {
        name: form.name,
        category: form.category,
        subcategory: form.subcategory || null,
        priceWashIron: Number(form.priceWashIron),
        priceIronOnly: Number(form.priceIronOnly),
        estimatedTime: form.estimatedTime ? Number(form.estimatedTime) : null,
        notes: form.notes || null,
        active: form.active
      };

      if (editing) {
        await clothingItemsApi.update(editing.id, data);
      } else {
        await clothingItemsApi.create(data);
      }
      await refreshClothingItems();
      setModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canManage) return;
    if (!confirm('Excluir esta peça?')) return;
    try {
      await clothingItemsApi.delete(id);
      await refreshClothingItems();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex gap-3 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar peça..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">Todas categorias</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {canManage && <Button icon={PlusIcon} onClick={openNew}>Nova Peça</Button>}
        </div>
      </Card>

      {loadingClothingItems ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShirtIcon}
            message="Nenhuma peça cadastrada."
            action={canManage ? <Button icon={PlusIcon} onClick={openNew}>Adicionar Peça</Button> : undefined}
          />
        </Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Nome', 'Categoria', 'Lavar/Passar', 'Passar', 'Status', canManage ? 'Ações' : ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(item => (
                  <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${!item.active ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                      {item.subcategory && <p className="text-xs text-slate-400">{item.subcategory}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color="bg-slate-100 text-slate-600">{item.category}</Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{formatCurrency(item.priceWashIron)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{formatCurrency(item.priceIronOnly)}</td>
                    <td className="px-4 py-3">
                      {item.active
                        ? <Badge color="bg-green-100 text-green-700">Ativo</Badge>
                        : <Badge color="bg-gray-100 text-gray-700">Inativo</Badge>}
                    </td>
                    {canManage && (
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
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

      {/* Modal de Criação/Edição */}
      {canManage && (
        <Modal
          isOpen={modal}
          onClose={() => setModal(false)}
          title={editing ? 'Editar Peça' : 'Nova Peça'}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit" form="clothingItemForm" isLoading={saving}>Salvar</Button>
            </>
          }
        >
          {error && <Alert type="error" message={error} className="mb-4" />}
          <form id="clothingItemForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="name"
                label="Nome da Peça"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Ex: Camisa Social"
                containerClassName="col-span-2"
              />
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Categoria</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="">Selecione...</option>
                  {CLOTHING_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Subcategoria</label>
                <select
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  disabled={!form.category || !CLOTHING_SUBCATEGORIES[form.category]?.length}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-50"
                >
                  <option value="">Nenhuma</option>
                  {(CLOTHING_SUBCATEGORIES[form.category] || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input
                name="priceWashIron"
                label="Preço Lavar/Passar (R$)"
                type="number"
                step="0.01"
                min="0"
                value={form.priceWashIron}
                onChange={handleChange}
                required
              />
              <Input
                name="priceIronOnly"
                label="Preço Passar (R$)"
                type="number"
                step="0.01"
                min="0"
                value={form.priceIronOnly}
                onChange={handleChange}
                required
              />
              <Input
                name="estimatedTime"
                label="Tempo Estimado (min)"
                type="number"
                min="0"
                value={form.estimatedTime}
                onChange={handleChange}
                placeholder="Opcional"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                />
                <label htmlFor="active" className="text-sm font-medium text-slate-700">Peça ativa</label>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="block text-sm font-semibold text-slate-700">Observações</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="Instruções especiais..."
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ClothingItemsView;