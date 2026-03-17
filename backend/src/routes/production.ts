import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const productionRoutes = Router();
productionRoutes.use(authenticate);

productionRoutes.get('/', async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (employeeId) where.assignedTo = employeeId;

    const productions = await prisma.production.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { include: { customer: true, items: { include: { product: true } } } },
        employee: { select: { id: true, name: true, role: true } }
      }
    });
    res.json(productions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produções' });
  }
});

productionRoutes.get('/:id', async (req, res) => {
  try {
    const production = await prisma.production.findUnique({
      where: { id: req.params.id },
      include: {
        order: { include: { customer: true, items: { include: { product: true } } } },
        employee: true
      }
    });
    if (!production) return res.status(404).json({ error: 'Produção não encontrada' });
    res.json(production);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produção' });
  }
});

productionRoutes.post('/', async (req, res) => {
  try {
    const { orderId, status, assignedTo, startDate, endDate, notes, stage } = req.body;
    if (!orderId) return res.status(400).json({ error: 'ID do pedido é obrigatório' });

    const production = await prisma.production.create({
      data: {
        orderId, status: status || 'PENDING', assignedTo, stage,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null, notes
      },
      include: { order: { include: { customer: true } }, employee: true }
    });
    res.status(201).json(production);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produção' });
  }
});

productionRoutes.put('/:id', async (req, res) => {
  try {
    const { status, assignedTo, startDate, endDate, notes, stage } = req.body;
    const data: any = { status, assignedTo: assignedTo || null, notes, stage };
    if (startDate) data.startDate = new Date(startDate);
    if (endDate) data.endDate = new Date(endDate);
    if (status === 'IN_PROGRESS' && !startDate) data.startDate = new Date();
    if (status === 'COMPLETED' && !endDate) data.endDate = new Date();

    const production = await prisma.production.update({
      where: { id: req.params.id },
      data,
      include: { order: { include: { customer: true } }, employee: true }
    });
    res.json(production);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Produção não encontrada' });
    res.status(500).json({ error: 'Erro ao atualizar produção' });
  }
});

productionRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.production.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Produção não encontrada' });
    res.status(500).json({ error: 'Erro ao excluir produção' });
  }
});
