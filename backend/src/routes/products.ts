import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

export const productRoutes = Router();
productRoutes.use(authenticate);

productRoutes.get('/', async (req, res) => {
  try {
    const { category, lowStock, search } = req.query;
    const where: any = {};
    if (category) where.category = category;
    if (lowStock === 'true') where.stock = { lte: prisma.product.fields.minStock };
    if (search) where.name = { contains: search as string, mode: 'insensitive' };

    const products = await prisma.product.findMany({ where, orderBy: [{ category: 'asc' }, { name: 'asc' }] });

    // Mark low stock
    const result = products.map(p => ({ ...p, isLowStock: p.stock <= p.minStock }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

productRoutes.get('/categories', async (req, res) => {
  try {
    const cats = await prisma.product.findMany({ select: { category: true }, distinct: ['category'] });
    res.json(cats.map(c => c.category).filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

productRoutes.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

productRoutes.post('/', requireManagerOrAdmin, async (req, res) => {
  try {
    const { name, description, sku, price, stock, minStock, category, unit } = req.body;
    if (!name || !sku || price === undefined) return res.status(400).json({ error: 'Nome, SKU e preço são obrigatórios' });

    const product = await prisma.product.create({
      data: { name, description, sku, price, stock: stock || 0, minStock: minStock || 0, category, unit }
    });
    res.status(201).json(product);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'SKU já cadastrado' });
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

productRoutes.put('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    const { name, description, sku, price, stock, minStock, category, unit } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { name, description, sku, price, stock, minStock, category, unit }
    });
    res.json(product);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Produto não encontrado' });
    if (error.code === 'P2002') return res.status(409).json({ error: 'SKU já cadastrado' });
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// PATCH /api/products/:id/stock - Ajustar estoque
productRoutes.patch('/:id/stock', async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' | 'subtract' | 'set'
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    let newStock = product.stock;
    if (operation === 'add') newStock += quantity;
    else if (operation === 'subtract') newStock = Math.max(0, newStock - quantity);
    else if (operation === 'set') newStock = quantity;

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { stock: newStock }
    });
    res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Produto não encontrado' });
    res.status(500).json({ error: 'Erro ao atualizar estoque' });
  }
});

productRoutes.delete('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Produto não encontrado' });
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});
