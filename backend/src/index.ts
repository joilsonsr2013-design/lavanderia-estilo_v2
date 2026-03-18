import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { authRoutes } from './routes/auth';
import { customerRoutes } from './routes/customers';
import { orderRoutes } from './routes/orders';
import { productRoutes } from './routes/products';
import { clothingItemRoutes } from './routes/clothingItems';
import { brandRoutes } from './routes/brands';
import { productionRoutes } from './routes/production';
import { employeeRoutes } from './routes/employees';
import { timeRecordRoutes } from './routes/timeRecords';
import { transactionRoutes } from './routes/transactions';
import { settingsRoutes } from './routes/settings';
import { dashboardRoutes } from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (public)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/clothing-items', clothingItemRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/time-records', timeRecordRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno no servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/login`);
  console.log('\n📋 Usuários padrão (após seed):');
  console.log('  admin@lavanderia.com / senha123 (Admin)');
  console.log('  gerente@lavanderia.com / senha123 (Gerente)');
  console.log('  ana@lavanderia.com / senha123 (Funcionário)');
});
