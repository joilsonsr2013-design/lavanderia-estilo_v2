import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, TagIcon, GlobeIcon } from '../components/icons';
import { brandsApi } from '../services/api';
import type { Brand } from '../types';

const BRAND_CATEGORIES = [
  'Popular',
  'Casual',
  'Premium',
  'Luxo',
  'Esportivo',
  'Feminino',
  'Masculino',
  'Praia',
  'Moda Íntima',
  'Streetwear',
  'Internacional',
  'Acessórios',
  'Outros',
];

const BRAND_COUNTRIES = [
  'Brasil',
  'EUA',
  'França',
  'Itália',
  'Espanha',
  'Alemanha',
  'Japão',
  'Suécia',
  'Outros',
];

const BrandsView: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: '', category: '', country: '', active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (categoryFilter) params.category = categoryFilter;
      const data = await brandsApi.list(params);
      setBrands(data);
    } catch (err: any) {
      console.error('Erro ao carregar marcas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBrands(); }, [categoryFilter]);

  const filtered = brands.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.category?.toLowerCase().includes(search.toLowerCase())) ||
    (b.country?.toLowerCase().includes(search.toLowerCase()))
  );

  // Group by category
  const brandsByCategory = filtered.reduce((acc, brand) => {
    const cat = brand.category || 'Outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(brand);
    return acc;
  }, {} as Record<string, Brand[]>);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', category: '', country: '', active: true });
    setError('');
    setModal(true);
  };

  const openEdit = (brand: Brand) => {
    setEditing(brand);
    setForm({
      name: brand.name,
      category: brand.category || '',
      country: brand.country || '',
      active: brand.active
    });
    setError('');
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = {
        name: form.name,
        category: form.category || null,
        country: form.country || null,
        active: form.active
      };
      if (editing) {
        await brandsApi.update(editing.id, data);
      } else {
        await brandsApi.create(data);
      }
      await loadBrands();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Excluir a marca "${brand.name}"?`)) return;
    setDeleting(brand.id);
    try {
      await brandsApi.delete(brand.id);
      await loadBrands();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (brand: Brand) => {
    try {
      await brandsApi.update(brand.id, { ...brand, active: !brand.active });
      await loadBrands();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex gap-3 flex-1 flex-wrap items-center">
            <div className="relative flex-1 max-w-xs">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text" placeholder="Buscar marcas..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="">Todas categorias</option>
              {BRAND_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="text-xs text-slate-500 bg-brand-50 px-2 py-1 rounded-lg">
              {filtered.length} {filtered.length === 1 ? 'marca' : 'marcas'}
            </span>
          </div>
          <Button icon={PlusIcon} onClick={openNew}>Nova Marca</Button>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={TagIcon} message="Nenhuma marca encontrada."
            action={<Button icon={PlusIcon} onClick={openNew}>Cadastrar Marca</Button>} />
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(brandsByCategory).map(([category, categoryBrands]) => (
            <Card key={category}>
              <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                {category} ({categoryBrands.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {categoryBrands.sort((a, b) => a.name.localeCompare(b.name)).map(brand => (
                  <div
                    key={brand.id}
                    className={`p-3 rounded-xl border transition-all ${
                      brand.active
                        ? 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm'
                        : 'border-slate-100 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 text-sm truncate">{brand.name}</h4>
                        {brand.country && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <GlobeIcon className="h-3 w-3" />
                            {brand.country}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(brand)} title="Editar">
                          <EditIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(brand)}
                          className="text-red-400 hover:text-red-600"
                          isLoading={deleting === brand.id}
                          title="Excluir"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        color={brand.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}
                        className="text-xs"
                      >
                        {brand.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                      {brand._count && brand._count.orderItems > 0 && (
                        <span className="text-xs text-slate-400">
                          {brand._count.orderItems} uso{brand._count.orderItems > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleActive(brand)}
                      className="w-full mt-2 text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      {brand.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modal}
        onClose={closeModal}
        title={editing ? 'Editar Marca' : 'Nova Marca'}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" form="brandForm" isLoading={saving}>Salvar</Button>
          </>
        }
      >
        {error && <Alert type="error" message={error} className="mb-4" />}
        <form id="brandForm" onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            label="Nome da Marca"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
            placeholder="Ex: Farm, Renner, Nike..."
          />
          <Select
            label="Categoria"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            options={BRAND_CATEGORIES.map(c => ({ value: c, label: c }))}
            placeholder="Selecione uma categoria"
          />
          <Select
            label="País de Origem"
            value={form.country}
            onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
            options={BRAND_COUNTRIES.map(c => ({ value: c, label: c }))}
            placeholder="Selecione um país"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">Marca ativa</span>
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default BrandsView;