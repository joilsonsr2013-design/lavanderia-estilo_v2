import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

export const settingsRoutes = Router();
settingsRoutes.use(authenticate);

settingsRoutes.get('/', async (req, res) => {
  try {
    const settings = await prisma.settings.findMany({ orderBy: { key: 'asc' } });
    const obj: Record<string, string> = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

settingsRoutes.put('/', requireAdmin, async (req, res) => {
  try {
    const updates = req.body as Record<string, string>;
    const ops = Object.entries(updates).map(([key, value]) =>
      prisma.settings.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    );
    await Promise.all(ops);

    const settings = await prisma.settings.findMany({ orderBy: { key: 'asc' } });
    const obj: Record<string, string> = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});
