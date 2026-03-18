import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

export const brandRoutes = Router();
brandRoutes.use(authenticate);

// GET /api/brands - List all brands
brandRoutes.get('/', async (req, res) => {
  try {
    const { active, search } = req.query;
    const where: any = {};

    if (active === 'true') where.active = true;
    if (active === 'false') where.active = false;
    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    const brands = await prisma.brand.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { orderItems: true } }
      }
    });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar marcas' });
  }
});

// GET /api/brands/:id - Get brand by ID
brandRoutes.get('/:id', async (req, res) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { orderItems: true } }
      }
    });
    if (!brand) return res.status(404).json({ error: 'Marca não encontrada' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar marca' });
  }
});

// POST /api/brands - Create brand (manager+)
brandRoutes.post('/', requireManagerOrAdmin, async (req, res) => {
  try {
    const { name, category, country, active } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome da marca é obrigatório' });
    }

    const existing = await prisma.brand.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Marca já cadastrada' });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        category: category || null,
        country: country || null,
        active: active ?? true
      }
    });
    res.status(201).json(brand);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Marca já cadastrada' });
    }
    res.status(500).json({ error: 'Erro ao criar marca' });
  }
});

// PUT /api/brands/:id - Update brand (manager+)
brandRoutes.put('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    const { name, category, country, active } = req.body;

    const brand = await prisma.brand.update({
      where: { id: req.params.id },
      data: {
        name,
        category: category || null,
        country: country || null,
        active: active ?? true
      }
    });
    res.json(brand);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Nome já cadastrado para outra marca' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Marca não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao atualizar marca' });
  }
});

// DELETE /api/brands/:id - Delete brand (manager+)
brandRoutes.delete('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { orderItems: true } } }
    });

    if (!brand) {
      return res.status(404).json({ error: 'Marca não encontrada' });
    }

    if (brand._count.orderItems > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir marca com ordens de serviço associadas'
      });
    }

    await prisma.brand.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Marca não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao excluir marca' });
  }
});