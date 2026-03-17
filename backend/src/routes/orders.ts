import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

export const orderRoutes = Router();
orderRoutes.use(authenticate);

orderRoutes.get('/', async (req, res) => {
  try {
    const { status, customerId, priority, search } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string, mode: 'insensitive' } },
        { customer: { name: { contains: search as string, mode: 'insensitive' } } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        customer: true,
        items: { include: { product: true } },
        production: { include: { employee: { select: { id: true, name: true, role: true } } } }
      }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

orderRoutes.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: { include: { product: true } },
        production: { include: { employee: true } }
      }
    });
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

orderRoutes.post('/', async (req, res) => {
  try {
    const { customerId, priority, totalAmount, description, dueDate, items } = req.body;
    if (!customerId || !totalAmount || !items?.length) {
      return res.status(400).json({ error: 'Cliente, valor total e itens são obrigatórios' });
    }

    const order = await prisma.order.create({
      data: {
        customerId,
        status: 'PENDING',
        priority: priority || 'MEDIUM',
        totalAmount,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            description: item.description,
            fabricType: item.fabricType,
            color: item.color,
            dirtLevel: item.dirtLevel,
            damageNotes: item.damageNotes
          }))
        }
      },
      include: { customer: true, items: { include: { product: true } } }
    });

    // Auto-create production entry
    await prisma.production.create({
      data: { orderId: order.id, status: 'PENDING', stage: 'PENDING' }
    });

    res.status(201).json(order);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// PATCH /api/orders/:id/status - Avançar status (qualquer funcionário)
orderRoutes.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { customer: true, items: { include: { product: true } }, production: true }
    });

    // Update production stage if status changes
    if (order.production.length > 0) {
      await prisma.production.updateMany({
        where: { orderId: req.params.id },
        data: {
          stage: status,
          status: status === 'DELIVERED' || status === 'CANCELLED' ? 'COMPLETED' : 'IN_PROGRESS',
          notes: notes || undefined
        }
      });
    }

    res.json(order);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Pedido não encontrado' });
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// PUT /api/orders/:id - Full update (manager+)
orderRoutes.put('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    const { status, priority, totalAmount, description, dueDate } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status,
        priority,
        totalAmount,
        description,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: { customer: true, items: { include: { product: true } } }
    });
    res.json(order);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Pedido não encontrado' });
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
});

orderRoutes.delete('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Pedido não encontrado' });
    res.status(500).json({ error: 'Erro ao excluir pedido' });
  }
});
