import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireManagerOrAdmin, requireAdmin } from '../middleware/auth';
import bcrypt from 'bcryptjs';

export const employeeRoutes = Router();
employeeRoutes.use(authenticate);

// GET /api/employees - Gerente+ pode ver todos
employeeRoutes.get('/', requireManagerOrAdmin, async (req, res) => {
  try {
    const { status, role, department } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (role) where.role = role;
    if (department) where.department = department;

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, status: true, department: true,
        hireDate: true, salary: true, createdAt: true, updatedAt: true,
        _count: { select: { production: true, timeRecords: true } }
      }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionários' });
  }
});

// GET /api/employees/me - Próprio perfil
employeeRoutes.get('/me', async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.user!.employeeId },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, status: true, department: true, hireDate: true, createdAt: true
      }
    });
    if (!employee) return res.status(404).json({ error: 'Não encontrado' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

employeeRoutes.get('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, status: true, department: true,
        hireDate: true, salary: true, createdAt: true, updatedAt: true,
        production: { include: { order: { include: { customer: true } } } },
        timeRecords: { orderBy: { timestamp: 'desc' }, take: 30 }
      }
    });
    if (!employee) return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionário' });
  }
});

employeeRoutes.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, role, status, department, hireDate, salary, password } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Nome e email são obrigatórios' });

    const passwordHash = await bcrypt.hash(password || 'senha123', 10);

    const employee = await prisma.employee.create({
      data: {
        name, email, phone,
        role: role || 'STAFF',
        status: status || 'ACTIVE',
        department,
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        salary,
        passwordHash
      },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, status: true, department: true, hireDate: true, salary: true, createdAt: true
      }
    });
    res.status(201).json(employee);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Email já cadastrado' });
    res.status(500).json({ error: 'Erro ao criar funcionário' });
  }
});

employeeRoutes.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, role, status, department, salary, password } = req.body;
    const data: any = { name, email, phone, role, status, department, salary };
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, status: true, department: true, hireDate: true, salary: true, updatedAt: true
      }
    });
    res.json(employee);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Funcionário não encontrado' });
    if (error.code === 'P2002') return res.status(409).json({ error: 'Email já cadastrado' });
    res.status(500).json({ error: 'Erro ao atualizar funcionário' });
  }
});

employeeRoutes.delete('/:id', requireAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user!.employeeId) {
      return res.status(400).json({ error: 'Não é possível excluir o próprio usuário' });
    }
    await prisma.employee.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.status(500).json({ error: 'Erro ao excluir funcionário' });
  }
});
