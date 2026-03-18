import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

export const brandRoutes = Router();
brandRoutes.use(authenticate);

// GET /api/brands - Listar todas as marcas
brandRoutes.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const where: any = {};
    if (search) where.name = { contains: search as string, mode: 'insensitive' };

    const brands = await prisma.brand.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { orderItems: true } } }
    });

    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar marcas' });
  }
});

// GET /api/brands/:id - Obter marca específica
brandRoutes.get('/:id', async (req, res) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: req.params.id },
      include: { orderItems: true }
    });
    if (!brand) return res.status(404).json({ error: 'Marca não encontrada' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar marca' });
  }
});

// POST /api/brands - Criar nova marca
brandRoutes.post('/', requireManagerOrAdmin, async (req, res) => {
  try {
    const { name, description, logoUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da marca é obrigatório' });

    const brand = await prisma.brand.create({
      data: { name, description, logoUrl }
    });
    res.status(201).json(brand);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Marca já cadastrada' });
    res.status(500).json({ error: 'Erro ao criar marca' });
  }
});

// PUT /api/brands/:id - Atualizar marca
brandRoutes.put('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    const { name, description, logoUrl } = req.body;
    const brand = await prisma.brand.update({
      where: { id: req.params.id },
      data: { name, description, logoUrl }
    });
    res.json(brand);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Marca não encontrada' });
    if (error.code === 'P2002') return res.status(409).json({ error: 'Marca já cadastrada' });
    res.status(500).json({ error: 'Erro ao atualizar marca' });
  }
});

// DELETE /api/brands/:id - Excluir marca
brandRoutes.delete('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    await prisma.brand.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Marca não encontrada' });
    res.status(500).json({ error: 'Erro ao excluir marca' });
  }
});
