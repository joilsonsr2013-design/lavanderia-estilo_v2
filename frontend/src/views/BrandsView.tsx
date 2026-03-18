import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from '../components/icons';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import { brandsApi } from '../services/api';
import type { Brand } from '../types';

const emptyForm = { 
  name: '', 
  description: '', 
  logoUrl: '' 
};

const BrandsView: React.FC = () => {
  const { canManage } = useAuth();
  const { brands, loadingBrands, refreshBrands } = useAppContext();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const filtered = brands.filter(b => 
    !search || b.name.toLowerCase().includes(search.toLowerCase()) || 
    (b.description && b.description.toLowerCase().includes(search.toLowerCase()))
  );

  const openNew = () => { 
    setEditing(null); 
    setForm(emptyForm); 
    setError(''); 
    setModal(true); 
  };

  const openEdit = (brand: Brand) => {
    setEditing(brand);
    setForm({ 
      name: brand.name, 
      description: brand.description || '', 
      logoUrl: brand.logoUrl || '' 
    });
    setError(''); 
    setModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setSaving(true); 
    setError('');
    try {
      if (!form.name.trim()) {
        setError('Nome da marca é obrigatório');
        setSaving(false);
        return;
      }
      if (editing) {
        await brandsApi.update(editing.id, form);
      } else {
        await brandsApi.create(form);
      }
      await refreshBrands(); 
      setModal(false);
    } catch (err: any) { 
      setError(err.message); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setDeleteError('');
    try {
      await brandsApi.delete(id);
      await refreshBrands();
      setDeleting(null);
    } catch (err: any) {
      setDeleteError(err.message);
    }
  };

  if (loadingBrands) return <LoadingState message="Carregando marcas..." />;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex gap-3 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar marca..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {canManage && (
            <Button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              <PlusIcon className="h-4 w-4" /> Nova Marca
            </Button>
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🏷️</div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 mb-1">Catálogo de Marcas</h3>
            <p className="text-sm text-slate-600">
              Gerencie todas as marcas de roupas cadastradas no sistema. Essas marcas serão utilizadas ao criar Ordens de Serviço para identificar a procedência de cada peça.
            </p>
          </div>
          <Badge className="bg-blue-600 text-white whitespace-nowrap">{filtered.length} marcas</Badge>
        </div>
      </Card>

      {/* Error Alert */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {deleteError && <Alert type="error" message={deleteError} onClose={() => setDeleteError('')} />}

      {/* Brands Grid */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState 
            icon="📦" 
            title="Nenhuma marca cadastrada" 
            description="Comece criando uma nova marca para o seu catálogo." 
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(brand => (
            <Card key={brand.id} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col h-full">
                {/* Brand Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900">{brand.name}</h3>
                    {brand._count?.orderItems && (
                      <Badge variant="secondary" className="mt-1">
                        {brand._count.orderItems} peça(s)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                {brand.description && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{brand.description}</p>
                )}

                {/* Logo URL */}
                {brand.logoUrl && (
                  <div className="mb-3 p-2 bg-slate-50 rounded border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Logo:</p>
                    <a href={brand.logoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                      {brand.logoUrl}
                    </a>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-xs text-slate-400 mb-4 mt-auto">
                  {brand.createdAt && (
                    <p>Criado em: {new Date(brand.createdAt).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>

                {/* Actions */}
                {canManage && (
                  <div className="flex gap-2 pt-3 border-t border-slate-200">
                    <Button 
                      onClick={() => openEdit(brand)}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded"
                    >
                      <EditIcon className="h-4 w-4" /> Editar
                    </Button>
                    <Button 
                      onClick={() => handleDelete(brand.id)}
                      disabled={deleting === brand.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" /> 
                      {deleting === brand.id ? 'Excluindo...' : 'Excluir'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {modal && (
        <Modal 
          title={editing ? 'Editar Marca' : 'Nova Marca'}
          onClose={() => setModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert type="error" message={error} />}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome da Marca *
              </label>
              <Input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex: Dudalina, Gucci, Zara"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descrição
              </label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Ex: Marca italiana de luxo, Vestuário masculino premium, etc."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                URL do Logo
              </label>
              <Input
                type="url"
                name="logoUrl"
                value={form.logoUrl}
                onChange={handleChange}
                placeholder="https://exemplo.com/logo.png"
              />
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
                {saving ? 'Salvando...' : 'Salvar Marca'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BrandsView;
