import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

export const transactionRoutes = Router();
transactionRoutes.use(authenticate);
transactionRoutes.use(requireManagerOrAdmin);

transactionRoutes.get('/', async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string + 'T23:59:59');
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

transactionRoutes.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string + 'T23:59:59');
    }

    const transactions = await prisma.transaction.findMany({ where });

    const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

    // Group by category
    const byCategory: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(t => {
      if (!byCategory[t.category]) byCategory[t.category] = { income: 0, expense: 0 };
      if (t.type === 'INCOME') byCategory[t.category].income += t.amount;
      else byCategory[t.category].expense += t.amount;
    });

    res.json({
      income,
      expenses,
      balance: income - expenses,
      byCategory: Object.entries(byCategory).map(([cat, val]) => ({ category: cat, ...val }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular resumo financeiro' });
  }
});

transactionRoutes.post('/', async (req, res) => {
  try {
    const { type, category, amount, description, date, paymentMethod, orderId } = req.body;
    if (!type || !category || !amount) return res.status(400).json({ error: 'Tipo, categoria e valor são obrigatórios' });

    const transaction = await prisma.transaction.create({
      data: {
        type, category, amount, description,
        date: date ? new Date(date) : new Date(),
        paymentMethod, orderId
      }
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

transactionRoutes.put('/:id', async (req, res) => {
  try {
    const { type, category, amount, description, date, paymentMethod } = req.body;
    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: { type, category, amount, description, date: date ? new Date(date) : undefined, paymentMethod }
    });
    res.json(transaction);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Transação não encontrada' });
    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
});

transactionRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Transação não encontrada' });
    res.status(500).json({ error: 'Erro ao excluir transação' });
  }
});
