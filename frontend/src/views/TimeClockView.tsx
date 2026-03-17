import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, LoadingState, StatCard, Select } from '../components/ui';
import { timeRecordsApi, employeesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime, formatTime, formatDate } from '../utils/helpers';
import { ClockIcon, RefreshIcon, UsersIcon } from '../components/icons';

const TimeClockView: React.FC = () => {
  const { user, canManage } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [latestRecord, setLatestRecord] = useState<any>(null);
  const [summary, setSummary] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [notes, setNotes] = useState('');
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterDate) { params.startDate = filterDate; params.endDate = filterDate; }
      if (selectedEmployee && canManage) params.employeeId = selectedEmployee;

      const [r, lat] = await Promise.all([
        timeRecordsApi.list(params),
        timeRecordsApi.latest(user!.id).catch(() => null)
      ]);
      setRecords(r);
      setLatestRecord(lat);

      if (canManage) {
        const [s, e] = await Promise.all([
          timeRecordsApi.summary({ startDate: filterDate, endDate: filterDate }),
          employeesApi.list({ status: 'ACTIVE' })
        ]);
        setSummary(s);
        setEmployees(e);
      }
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterDate, selectedEmployee]);

  const isClockedIn = latestRecord?.type === 'CLOCK_IN';

  const handleClock = async (type: 'CLOCK_IN' | 'CLOCK_OUT') => {
    setClocking(true);
    try {
      await timeRecordsApi.create({ type, notes, employeeId: user!.id });
      setNotes('');
      await load();
    } catch (err: any) { alert(err.message); }
    finally { setClocking(false); }
  };

  const myRecordsToday = records.filter(r => r.employeeId === user!.id);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Clock widget */}
      <Card>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Clock display */}
          <div className="text-center">
            <div className="text-5xl font-bold text-slate-800 tabular-nums">
              {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <p className="text-sm text-slate-500 mt-1">{formatDate(now, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Status & buttons */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className={`text-sm font-bold ${isClockedIn ? 'text-green-700' : 'text-slate-500'}`}>
                {isClockedIn ? `Em serviço desde ${formatTime(latestRecord?.timestamp)}` : 'Fora do serviço'}
              </span>
            </div>
            <input
              type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Observação (opcional)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <div className="flex gap-3">
              <Button
                variant="primary" size="md" disabled={isClockedIn} isLoading={clocking}
                onClick={() => handleClock('CLOCK_IN')} className="flex-1"
              >
                🟢 Registrar Entrada
              </Button>
              <Button
                variant="danger" size="md" disabled={!isClockedIn} isLoading={clocking}
                onClick={() => handleClock('CLOCK_OUT')} className="flex-1"
              >
                🔴 Registrar Saída
              </Button>
            </div>
          </div>

          {/* Today's records for current user */}
          {myRecordsToday.length > 0 && (
            <div className="md:w-48">
              <p className="text-xs font-bold text-slate-600 mb-2">Meus registros hoje:</p>
              <div className="space-y-1">
                {myRecordsToday.slice(0, 6).map((r: any) => (
                  <div key={r.id} className="flex items-center gap-2 text-xs">
                    <Badge color={r.type === 'CLOCK_IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {r.type === 'CLOCK_IN' ? '↑ Entrada' : '↓ Saída'}
                    </Badge>
                    <span className="text-slate-600 font-mono">{formatTime(r.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Manager: Team Summary */}
      {canManage && (
        <>
          <Card title="Resumo da Equipe">
            <div className="flex gap-3 mb-4 flex-wrap">
              <Input_date value={filterDate} onChange={filterDate => setFilterDate(filterDate)} />
              <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none">
                <option value="">Todos funcionários</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <Button variant="outline" size="sm" icon={RefreshIcon} onClick={load}>Atualizar</Button>
            </div>

            {loading ? <LoadingState /> : (
              <>
                {summary.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <StatCard title="Presentes" value={summary.filter(s => s.recordCount > 0).length} icon={UsersIcon} color="bg-green-600" />
                    <StatCard title="Total Horas" value={`${summary.reduce((s, e) => s + (e.totalHours || 0), 0).toFixed(1)}h`} icon={ClockIcon} color="bg-blue-600" />
                  </div>
                )}
                {summary.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {['Funcionário', 'Dept.', 'Horas', 'Registros', 'Status'].map(h => (
                            <th key={h} className="px-3 py-2 text-left text-xs font-bold text-slate-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {summary.map(emp => (
                          <tr key={emp.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-semibold text-slate-700">{emp.name}</td>
                            <td className="px-3 py-2 text-slate-500">{emp.department || '-'}</td>
                            <td className="px-3 py-2 font-mono">{emp.totalHours?.toFixed(1) || '0.0'}h</td>
                            <td className="px-3 py-2">{emp.recordCount || 0}</td>
                            <td className="px-3 py-2">
                              <Badge color={emp.recordCount > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>
                                {emp.recordCount > 0 ? 'Presente' : 'Ausente'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Full records log */}
          <Card title="Registro de Ponto" subtitle={`Data: ${formatDate(filterDate)}`}>
            {loading ? <LoadingState /> : records.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Nenhum registro para esta data.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Funcionário', 'Tipo', 'Horário', 'Observação'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-bold text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {records.map((r: any) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-semibold text-slate-700">{r.employee?.name || '-'}</td>
                        <td className="px-3 py-2">
                          <Badge color={r.type === 'CLOCK_IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {r.type === 'CLOCK_IN' ? '↑ Entrada' : '↓ Saída'}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 font-mono">{formatTime(r.timestamp)}</td>
                        <td className="px-3 py-2 text-slate-500">{r.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

// Simple date input helper
const Input_date: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <input type="date" value={value} onChange={e => onChange(e.target.value)}
    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
);

export default TimeClockView;
