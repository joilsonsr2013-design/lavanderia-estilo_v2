import React, { useState } from 'react';
import { Card, Button, Input, Select, Modal, Alert, EmptyState, LoadingState, Badge } from '../components/ui';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, EmployeesIcon } from '../components/icons';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { employeesApi } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import { ROLE_LABEL, EMPLOYEE_STATUS_LABEL } from '../constants';
import type { Employee } from '../types';
import { EmployeeRole, EmployeeStatus } from '../types';

const emptyForm = { name: '', email: '', phone: '', role: 'STAFF', status: 'ACTIVE', department: '', salary: '', password: '' };
const DEPTS = ['Atendimento', 'Lavagem', 'Secagem', 'Passadoria', 'Embalagem', 'Logística', 'Administração', 'Produção'];

const ROLE_COLOR: Record<string, string> = {
  ADMIN:   'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  STAFF:   'bg-slate-100 text-slate-600',
};
const STATUS_COLOR: Record<string, string> = {
  ACTIVE:   'bg-green-100 text-green-700',
  INACTIVE: 'bg-red-100 text-red-700',
  ON_LEAVE: 'bg-amber-100 text-amber-700',
};

const EmployeesView: React.FC = () => {
  const { employees, loadingEmployees, refreshEmployees } = useAppContext();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filtered = employees.filter(e => {
    const matchS = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchR = !roleFilter || e.role === roleFilter;
    return matchS && matchR;
  });

  const openNew = () => { setEditing(null); setForm(emptyForm); setError(''); setModal(true); };
  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({ name: e.name, email: e.email, phone: e.phone || '', role: e.role, status: e.status, department: e.department || '', salary: String(e.salary || ''), password: '' });
    setError(''); setModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const data: any = { ...form, salary: form.salary ? Number(form.salary) : undefined };
      if (!form.password) delete data.password;
      if (editing) await employeesApi.update(editing.id, data);
      else await employeesApi.create(data);
      await refreshEmployees(); setModal(false);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este funcionário?')) return;
    try { await employeesApi.delete(id); await refreshEmployees(); }
    catch (err: any) { alert(err.message); }
  };

  const roleOpts = Object.values(EmployeeRole).map(r => ({ value: r, label: ROLE_LABEL[r] }));
  const statusOpts = Object.values(EmployeeStatus).map(s => ({ value: s, label: EMPLOYEE_STATUS_LABEL[s] }));

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Buscar funcionário..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none">
              <option value="">Todos os cargos</option>
              {roleOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {isAdmin && <Button icon={PlusIcon} onClick={openNew}>Novo Funcionário</Button>}
        </div>
      </Card>

      {loadingEmployees ? <LoadingState /> : filtered.length === 0 ? (
        <Card><EmptyState icon={EmployeesIcon} message="Nenhum funcionário encontrado." action={isAdmin ? <Button icon={PlusIcon} onClick={openNew}>Adicionar Funcionário</Button> : undefined} /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(emp => (
            <Card key={emp.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-800">{emp.name}</h3>
                  <p className="text-xs text-slate-500">{emp.department || 'Sem departamento'}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(emp)}><EditIcon className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleDelete(emp.id)}><TrashIcon className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge color={ROLE_COLOR[emp.role]}>{ROLE_LABEL[emp.role]}</Badge>
                <Badge color={STATUS_COLOR[emp.status]}>{EMPLOYEE_STATUS_LABEL[emp.status]}</Badge>
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <p>📧 {emp.email}</p>
                {emp.phone && <p>📱 {emp.phone}</p>}
                {emp.hireDate && <p>📅 Desde {formatDate(emp.hireDate)}</p>}
                {emp.salary && isAdmin && <p className="font-semibold text-slate-700">💰 {formatCurrency(emp.salary)}/mês</p>}
                {emp._count && <p className="text-slate-400">{emp._count.production} produção(ões) • {emp._count.timeRecords} reg. de ponto</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {isAdmin && (
        <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Editar Funcionário' : 'Novo Funcionário'} size="lg"
          footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" form="empForm" isLoading={saving}>Salvar</Button></>}>
          {error && <Alert type="error" message={error} className="mb-4" />}
          <form id="empForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input name="name" label="Nome Completo" value={form.name} onChange={handleChange} required containerClassName="col-span-2" />
              <Input name="email" label="E-mail" type="email" value={form.email} onChange={handleChange} required />
              <Input name="phone" label="Telefone" value={form.phone} onChange={handleChange} />
              <Select name="role" label="Cargo" value={form.role} onChange={handleChange} options={roleOpts} />
              <Select name="status" label="Status" value={form.status} onChange={handleChange} options={statusOpts} />
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Departamento</label>
                <select name="department" value={form.department} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                  <option value="">Selecione...</option>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <Input name="salary" label="Salário (R$)" type="number" step="0.01" value={form.salary} onChange={handleChange} placeholder="0,00" />
              <Input name="password" label={editing ? 'Nova Senha (deixe em branco para manter)' : 'Senha inicial'} type="password" value={form.password} onChange={handleChange} placeholder="senha123" containerClassName="col-span-2" required={!editing} />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EmployeesView;
