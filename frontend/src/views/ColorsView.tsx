import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, PaletteIcon } from '../components/icons';
import { colorsApi } from '../services/api';
import type { Color } from '../types';

const COLOR_CATEGORIES = [
  'Básicas',
  'Neutros',
  'Cores Claras',
  'Cores Escuras',
  'Vibrantes',
  'Azuis',
  'Verdes',
  'Outras',
  'Estampados',
  'Metálicos',
];

const DEFAULT_COLORS = [
  { name: 'Branco', category: 'Básicas', hexCode: '#FFFFFF' },
  { name: 'Preto', category: 'Básicas', hexCode: '#000000' },
  { name: 'Cinza', category: 'Básicas', hexCode: '#808080' },
  { name: 'Cinza Mescla', category: 'Básicas', hexCode: '#A9A9A9' },
  { name: 'Bege', category: 'Neutros', hexCode: '#F5F5DC' },
  { name: 'Camel', category: 'Neutros', hexCode: '#C19A6B' },
  { name: 'Creme', category: 'Neutros', hexCode: '#FFFDD0' },
  { name: 'Off-White', category: 'Neutros', hexCode: '#FAF9F6' },
  { name: 'Nude', category: 'Neutros', hexCode: '#E3BC9A' },
  { name: 'Rosa Claro', category: 'Cores Claras', hexCode: '#FFB6C1' },
  { name: 'Azul Claro', category: 'Cores Claras', hexCode: '#ADD8E6' },
  { name: 'Verde Claro', category: 'Cores Claras', hexCode: '#90EE90' },
  { name: 'Amarelo Claro', category: 'Cores Claras', hexCode: '#FFFFE0' },
  { name: 'Marrom', category: 'Cores Escuras', hexCode: '#8B4513' },
  { name: 'Azul Marinho', category: 'Cores Escuras', hexCode: '#000080' },
  { name: 'Verde Escuro', category: 'Cores Escuras', hexCode: '#006400' },
  { name: 'Vermelho Escuro', category: 'Cores Escuras', hexCode: '#8B0000' },
  { name: 'Vermelho', category: 'Vibrantes', hexCode: '#FF0000' },
  { name: 'Laranja', category: 'Vibrantes', hexCode: '#FFA500' },
  { name: 'Amarelo', category: 'Vibrantes', hexCode: '#FFFF00' },
  { name: 'Rosa', category: 'Vibrantes', hexCode: '#FFC0CB' },
  { name: 'Magenta', category: 'Vibrantes', hexCode: '#FF00FF' },
  { name: 'Azul', category: 'Azuis', hexCode: '#0000FF' },
  { name: 'Azul Royal', category: 'Azuis', hexCode: '#4169E1' },
  { name: 'Azul Turquesa', category: 'Azuis', hexCode: '#40E0D0' },
  { name: 'Verde', category: 'Verdes', hexCode: '#008000' },
  { name: 'Verde Militar', category: 'Verdes', hexCode: '#4F5D50' },
  { name: 'Verde Menta', category: 'Verdes', hexCode: '#98FB98' },
  { name: 'Roxo', category: 'Outras', hexCode: '#800080' },
  { name: 'Lilás', category: 'Outras', hexCode: '#C8A2C8' },
  { name: 'Violeta', category: 'Outras', hexCode: '#EE82EE' },
  { name: 'Bordô', category: 'Outras', hexCode: '#800020' },
  { name: 'Vinho', category: 'Outras', hexCode: '#722F37' },
  { name: 'Terracota', category: 'Outras', hexCode: '#E2725B' },
  { name: 'Colorido', category: 'Estampados', hexCode: null },
  { name: 'Estampado', category: 'Estampados', hexCode: null },
  { name: 'Listrado', category: 'Estampados', hexCode: null },
  { name: 'Xadrez', category: 'Estampados', hexCode: null },
  { name: 'Floral', category: 'Estampados', hexCode: null },
  { name: 'Dourado', category: 'Metálicos', hexCode: '#FFD700' },
  { name: 'Prateado', category: 'Metálicos', hexCode: '#C0C0C0' },
];

const ColorsView: React.FC = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Color | null>(null);
  const [form, setForm] = useState({ name: '', category: '', hexCode: '', active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadColors = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (categoryFilter) params.category = categoryFilter;
      const data = await colorsApi.list(params);
      setColors(data);
    } catch (err: any) {
      console.error('Erro ao carregar cores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadColors(); }, [categoryFilter]);

  const filtered = colors.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.category?.toLowerCase().includes(search.toLowerCase()))
  );

  // Group by category
  const colorsByCategory = filtered.reduce((acc, color) => {
    const cat = color.category || 'Outras';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(color);
    return acc;
  }, {} as Record<string, Color[]>);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', category: '', hexCode: '', active: true });
    setError('');
    setModal(true);
  };

  const openEdit = (color: Color) => {
    setEditing(color);
    setForm({
      name: color.name,
      category: color.category || '',
      hexCode: color.hexCode || '',
      active: color.active
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
        hexCode: form.hexCode || null,
        active: form.active
      };
      if (editing) {
        await colorsApi.update(editing.id, data);
      } else {
        await colorsApi.create(data);
      }
      await loadColors();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (color: Color) => {
    if (!confirm(`Excluir a cor "${color.name}"?`)) return;
    setDeleting(color.id);
    try {
      await colorsApi.delete(color.id);
      await loadColors();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (color: Color) => {
    try {
      await colorsApi.update(color.id, { ...color, active: !color.active });
      await loadColors();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSeedDefaultColors = async () => {
    if (!confirm('Deseja carregar as cores padrão? Isso adicionará cores comuns ao sistema.')) return;
    setSaving(true);
    try {
      for (const color of DEFAULT_COLORS) {
        try {
          await colorsApi.create({
            name: color.name,
            category: color.category,
            hexCode: color.hexCode,
            active: true
          });
        } catch (e) {
          // Ignorar se já existir
        }
      }
      await loadColors();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
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
                type="text" placeholder="Buscar cores..." value={search}
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
              {COLOR_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="text-xs text-slate-500 bg-brand-50 px-2 py-1 rounded-lg">
              {filtered.length} {filtered.length === 1 ? 'cor' : 'cores'}
            </span>
          </div>
          <div className="flex gap-2">
            {colors.length === 0 && (
              <Button variant="outline" onClick={handleSeedDefaultColors} isLoading={saving}>
                Carregar Padrão
              </Button>
            )}
            <Button icon={PlusIcon} onClick={openNew}>Nova Cor</Button>
          </div>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={PaletteIcon} message="Nenhuma cor encontrada."
            action={<Button icon={PlusIcon} onClick={openNew}>Cadastrar Cor</Button>} />
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(colorsByCategory).map(([category, categoryColors]) => (
            <Card key={category}>
              <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                <PaletteIcon className="h-4 w-4" />
                {category} ({categoryColors.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {categoryColors.sort((a, b) => a.name.localeCompare(b.name)).map(color => (
                  <div
                    key={color.id}
                    className={`p-3 rounded-xl border transition-all ${
                      color.active
                        ? 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm'
                        : 'border-slate-100 bg-slate-50 opacity-60'
                    }`}
                  >
                    {/* Color preview */}
                    <div
                      className="w-full h-8 rounded-lg mb-2 border border-slate-200"
                      style={{ backgroundColor: color.hexCode || '#transparent', background: color.hexCode ? undefined : 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 25%) 50% / 10px 10px' }}
                    />
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-slate-800 text-sm truncate">{color.name}</p>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(color)} title="Editar">
                          <EditIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(color)}
                          className="text-red-400 hover:text-red-600"
                          isLoading={deleting === color.id}
                          title="Excluir"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        color={color.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}
                        className="text-xs"
                      >
                        {color.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    <button
                      onClick={() => handleToggleActive(color)}
                      className="w-full mt-2 text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      {color.active ? 'Desativar' : 'Ativar'}
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
        title={editing ? 'Editar Cor' : 'Nova Cor'}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" form="colorForm" isLoading={saving}>Salvar</Button>
          </>
        }
      >
        {error && <Alert type="error" message={error} className="mb-4" />}
        <form id="colorForm" onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            label="Nome da Cor"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
            placeholder="Ex: Azul Royal, Rosa Claro..."
          />
          <Select
            label="Categoria"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            options={COLOR_CATEGORIES.map(c => ({ value: c, label: c }))}
            placeholder="Selecione uma categoria"
          />
          <Input
            name="hexCode"
            label="Código Hex (opcional)"
            value={form.hexCode}
            onChange={e => setForm(f => ({ ...f, hexCode: e.target.value }))}
            placeholder="Ex: #FF0000"
          />
          {form.hexCode && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">Prévia:</span>
              <div
                className="w-12 h-8 rounded border border-slate-200"
                style={{ backgroundColor: form.hexCode }}
              />
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">Cor ativa</span>
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default ColorsView;