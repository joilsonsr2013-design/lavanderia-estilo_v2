import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

export const timeRecordRoutes = Router();
timeRecordRoutes.use(authenticate);

timeRecordRoutes.get('/', async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    const where: any = {};

    // Staff only sees own records
    if (req.user!.role === 'STAFF') {
      where.employeeId = req.user!.employeeId;
    } else if (employeeId) {
      where.employeeId = employeeId;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string + 'T23:59:59');
    }

    const records = await prisma.timeRecord.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: { employee: { select: { id: true, name: true, role: true, department: true } } }
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar registros de ponto' });
  }
});

// GET /api/time-records/employee/:id/latest
timeRecordRoutes.get('/employee/:id/latest', async (req, res) => {
  try {
    // Staff only sees own
    if (req.user!.role === 'STAFF' && req.params.id !== req.user!.employeeId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const record = await prisma.timeRecord.findFirst({
      where: { employeeId: req.params.id },
      orderBy: { timestamp: 'desc' },
      include: { employee: { select: { id: true, name: true } } }
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar último registro' });
  }
});

// GET /api/time-records/summary - Resumo de horas (gerente+)
timeRecordRoutes.get('/summary', requireManagerOrAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string + 'T23:59:59');
    }

    const records = await prisma.timeRecord.findMany({
      where,
      orderBy: [{ employeeId: 'asc' }, { timestamp: 'asc' }],
      include: { employee: { select: { id: true, name: true, department: true } } }
    });

    // Calculate hours per employee
    const employeeMap: Record<string, any> = {};
    records.forEach(r => {
      const eid = r.employeeId;
      if (!employeeMap[eid]) {
        employeeMap[eid] = { employee: r.employee, records: [], totalMinutes: 0 };
      }
      employeeMap[eid].records.push(r);
    });

    // Pair clock-in/out
    Object.values(employeeMap).forEach((emp: any) => {
      let lastIn: Date | null = null;
      emp.records.forEach((r: any) => {
        if (r.type === 'CLOCK_IN') lastIn = new Date(r.timestamp);
        else if (r.type === 'CLOCK_OUT' && lastIn) {
          emp.totalMinutes += (new Date(r.timestamp).getTime() - lastIn.getTime()) / 60000;
          lastIn = null;
        }
      });
    });

    res.json(Object.values(employeeMap).map((e: any) => ({
      ...e.employee,
      totalMinutes: Math.round(e.totalMinutes),
      totalHours: +(e.totalMinutes / 60).toFixed(2),
      recordCount: e.records.length
    })));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular resumo' });
  }
});

timeRecordRoutes.post('/', async (req, res) => {
  try {
    const { employeeId, type, notes } = req.body;

    // Staff can only clock themselves
    const targetId = req.user!.role === 'STAFF' ? req.user!.employeeId : (employeeId || req.user!.employeeId);

    if (!type || !['CLOCK_IN', 'CLOCK_OUT'].includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido. Use CLOCK_IN ou CLOCK_OUT' });
    }

    // Check last record to prevent double clock-in
    const last = await prisma.timeRecord.findFirst({
      where: { employeeId: targetId },
      orderBy: { timestamp: 'desc' }
    });

    if (last) {
      if (type === 'CLOCK_IN' && last.type === 'CLOCK_IN') {
        return res.status(400).json({ error: 'Já há uma entrada registrada. Registre a saída primeiro.' });
      }
      if (type === 'CLOCK_OUT' && last.type === 'CLOCK_OUT') {
        return res.status(400).json({ error: 'Não há entrada registrada. Registre a entrada primeiro.' });
      }
    }

    const record = await prisma.timeRecord.create({
      data: { employeeId: targetId, type, notes, timestamp: new Date() },
      include: { employee: { select: { id: true, name: true } } }
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar ponto' });
  }
});

timeRecordRoutes.delete('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    await prisma.timeRecord.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Registro não encontrado' });
    res.status(500).json({ error: 'Erro ao excluir registro' });
  }
});
