import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

export const clothingItemRoutes = Router();
clothingItemRoutes.use(authenticate);

// GET /api/clothing-items - Listar todas as peças
clothingItemRoutes.get('/', async (req, res) => {
  try {
    const { category, active, search } = req.query;
    const where: any = {};
    if (category) where.category = category;
    if (active !== undefined) where.active = active === 'true';
    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    const items = await prisma.clothingItem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar peças' });
  }
});

// GET /api/clothing-items/categories - Listar categorias
clothingItemRoutes.get('/categories', async (req, res) => {
  try {
    const cats = await prisma.clothingItem.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { active: true }
    });
    res.json(cats.map(c => c.category));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// GET /api/clothing-items/:id - Buscar peça por ID
clothingItemRoutes.get('/:id', async (req, res) => {
  try {
    const item = await prisma.clothingItem.findUnique({
      where: { id: req.params.id }
    });
    if (!item) return res.status(404).json({ error: 'Peça não encontrada' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar peça' });
  }
});

// POST /api/clothing-items - Criar nova peça
clothingItemRoutes.post('/', requireManagerOrAdmin, async (req, res) => {
  try {
    const { name, category, subcategory, priceWashIron, priceIronOnly, estimatedTime, notes } = req.body;

    if (!name || !category || priceWashIron === undefined || priceIronOnly === undefined) {
      return res.status(400).json({ error: 'Nome, categoria e preços são obrigatórios' });
    }

    const item = await prisma.clothingItem.create({
      data: {
        name,
        category,
        subcategory,
        priceWashIron: Number(priceWashIron),
        priceIronOnly: Number(priceIronOnly),
        estimatedTime: estimatedTime ? Number(estimatedTime) : null,
        notes
      }
    });
    res.status(201).json(item);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar peça' });
  }
});

// PUT /api/clothing-items/:id - Atualizar peça
clothingItemRoutes.put('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    const { name, category, subcategory, priceWashIron, priceIronOnly, estimatedTime, notes, active } = req.body;

    const item = await prisma.clothingItem.update({
      where: { id: req.params.id },
      data: {
        name,
        category,
        subcategory,
        priceWashIron: priceWashIron !== undefined ? Number(priceWashIron) : undefined,
        priceIronOnly: priceIronOnly !== undefined ? Number(priceIronOnly) : undefined,
        estimatedTime: estimatedTime !== undefined ? (estimatedTime ? Number(estimatedTime) : null) : undefined,
        notes,
        active
      }
    });
    res.json(item);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Peça não encontrada' });
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar peça' });
  }
});

// DELETE /api/clothing-items/:id - Excluir peça
clothingItemRoutes.delete('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    await prisma.clothingItem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Peça não encontrada' });
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir peça' });
  }
});