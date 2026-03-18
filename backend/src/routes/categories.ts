import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

export const categoryRoutes = Router();
categoryRoutes.use(authenticate);

// GET /api/categories - Listar todas as categorias
categoryRoutes.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const where: any = {};
    if (search) where.name = { contains: search as string, mode: 'insensitive' };

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } }
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// GET /api/categories/:id - Obter categoria específica
categoryRoutes.get('/:id', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { products: true }
    });
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categoria' });
  }
});

// POST /api/categories - Criar nova categoria
categoryRoutes.post('/', requireManagerOrAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório' });

    const category = await prisma.category.create({
      data: { name, description }
    });
    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Categoria já cadastrada' });
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

// PUT /api/categories/:id - Atualizar categoria
categoryRoutes.put('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, description }
    });
    res.json(category);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Categoria não encontrada' });
    if (error.code === 'P2002') return res.status(409).json({ error: 'Categoria já cadastrada' });
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

// DELETE /api/categories/:id - Excluir categoria
categoryRoutes.delete('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Categoria não encontrada' });
    res.status(500).json({ error: 'Erro ao excluir categoria' });
  }
});
