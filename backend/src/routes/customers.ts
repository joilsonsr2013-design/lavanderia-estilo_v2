import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const customerRoutes = Router();
customerRoutes.use(authenticate);

customerRoutes.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } }
      ];
    }
    const customers = await prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { orders: true } } }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

customerRoutes.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { items: { include: { product: true } } }
        },
        _count: { select: { orders: true } }
      }
    });
    if (!customer) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

customerRoutes.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, notes, preferences } = req.body;
    if (!name || !email || !phone) return res.status(400).json({ error: 'Nome, email e telefone são obrigatórios' });

    const customer = await prisma.customer.create({
      data: { name, email, phone, address, notes, preferences: preferences || undefined }
    });
    res.status(201).json(customer);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Email já cadastrado' });
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

customerRoutes.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address, notes, preferences } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, email, phone, address, notes, preferences: preferences || undefined }
    });
    res.json(customer);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Cliente não encontrado' });
    if (error.code === 'P2002') return res.status(409).json({ error: 'Email já cadastrado' });
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

customerRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Cliente não encontrado' });
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
});
