import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

export const dashboardRoutes = Router();
dashboardRoutes.use(authenticate);
dashboardRoutes.use(requireManagerOrAdmin);

dashboardRoutes.get('/stats', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalCustomers, totalOrders, totalProducts, totalEmployees,
      pendingOrders, inProductionOrders, completedOrders, cancelledOrders,
      activeProductions, recentOrders, lowStockProducts, revenue30Days] = await Promise.all([
      prisma.customer.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: { in: ['CLASSIFICATION', 'WASHING', 'DRYING', 'IRONING', 'INSPECTION', 'PACKAGING'] } } }),
      prisma.order.count({ where: { status: { in: ['DELIVERED', 'READY_FOR_DELIVERY'] } } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.production.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: { select: { name: true } } }
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        orderBy: { stock: 'asc' },
        take: 5
      }),
      prisma.transaction.aggregate({
        where: { type: 'INCOME', date: { gte: thirtyDaysAgo } },
        _sum: { amount: true }
      })
    ]);

    const byStatus = [
      { status: 'PENDING', count: pendingOrders, label: 'Recepção' },
      { status: 'IN_PRODUCTION', count: inProductionOrders, label: 'Em Produção' },
      { status: 'COMPLETED', count: completedOrders, label: 'Concluídos' },
      { status: 'CANCELLED', count: cancelledOrders, label: 'Cancelados' }
    ];

    res.json({
      totals: {
        customers: totalCustomers,
        orders: totalOrders,
        products: totalProducts,
        employees: totalEmployees,
        revenue30Days: revenue30Days._sum.amount || 0
      },
      orders: { pending: pendingOrders, inProduction: inProductionOrders, completed: completedOrders, byStatus },
      inventory: { lowStock: lowStockProducts.length, products: lowStockProducts },
      production: { active: activeProductions },
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

dashboardRoutes.get('/revenue', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await prisma.transaction.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: 'asc' }
    });

    const dailyData: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach(t => {
      const key = t.date.toISOString().split('T')[0];
      if (!dailyData[key]) dailyData[key] = { income: 0, expenses: 0 };
      if (t.type === 'INCOME') dailyData[key].income += t.amount;
      else dailyData[key].expenses += t.amount;
    });

    res.json(Object.entries(dailyData).map(([date, data]) => ({
      date, ...data, profit: data.income - data.expenses
    })));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados de receita' });
  }
});
