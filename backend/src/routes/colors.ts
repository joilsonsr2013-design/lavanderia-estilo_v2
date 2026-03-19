import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

export const colorRoutes = Router();
colorRoutes.use(authenticate);

// GET /api/colors - List all colors
colorRoutes.get('/', async (req, res) => {
  try {
    const { active, search } = req.query;
    const where: any = {};

    if (active === 'true') where.active = true;
    if (active === 'false') where.active = false;
    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    const colors = await prisma.color.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });
    res.json(colors);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cores' });
  }
});

// GET /api/colors/categories - Get all categories
colorRoutes.get('/categories', async (req, res) => {
  try {
    const cats = await prisma.color.findMany({
      select: { category: true },
      distinct: ['category']
    });
    res.json(cats.map(c => c.category).filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// GET /api/colors/:id - Get color by ID
colorRoutes.get('/:id', async (req, res) => {
  try {
    const color = await prisma.color.findUnique({
      where: { id: req.params.id }
    });
    if (!color) return res.status(404).json({ error: 'Cor não encontrada' });
    res.json(color);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cor' });
  }
});

// POST /api/colors - Create color (manager+)
colorRoutes.post('/', requireManagerOrAdmin, async (req, res) => {
  try {
    const { name, category, hexCode, active } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome da cor é obrigatório' });
    }

    const existing = await prisma.color.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Cor já cadastrada' });
    }

    const color = await prisma.color.create({
      data: {
        name,
        category: category || null,
        hexCode: hexCode || null,
        active: active ?? true
      }
    });
    res.status(201).json(color);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Cor já cadastrada' });
    }
    res.status(500).json({ error: 'Erro ao criar cor' });
  }
});

// PUT /api/colors/:id - Update color (manager+)
colorRoutes.put('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    const { name, category, hexCode, active } = req.body;

    const color = await prisma.color.update({
      where: { id: req.params.id },
      data: {
        name,
        category: category || null,
        hexCode: hexCode || null,
        active: active ?? true
      }
    });
    res.json(color);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Nome já cadastrado para outra cor' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cor não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao atualizar cor' });
  }
});

// DELETE /api/colors/:id - Delete color (manager+)
colorRoutes.delete('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    await prisma.color.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cor não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao excluir cor' });
  }
});