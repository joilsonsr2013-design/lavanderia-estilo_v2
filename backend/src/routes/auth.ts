import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth';

export const authRoutes = Router();

// POST /api/auth/login
authRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const employee = await prisma.employee.findUnique({ where: { email } });
    if (!employee || employee.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo' });
    }

    // Para demo: aceita senha padrão se não tiver hash
    const passwordHash = employee.passwordHash || await bcrypt.hash('senha123', 10);
    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '8h';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = jwt.sign(
      { employeeId: employee.id, role: employee.role, name: employee.name },
      jwtSecret,
      { expiresIn: jwtExpiresIn as any }
    );

    res.json({
      token,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// POST /api/auth/change-password
authRoutes.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const employeeId = req.user!.employeeId;

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return res.status(404).json({ error: 'Funcionário não encontrado' });

    const passwordHash = employee.passwordHash || await bcrypt.hash('senha123', 10);
    const valid = await bcrypt.compare(currentPassword, passwordHash);
    if (!valid) return res.status(401).json({ error: 'Senha atual incorreta' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.employee.update({ where: { id: employeeId }, data: { passwordHash: newHash } });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});

// GET /api/auth/me
authRoutes.get('/me', authenticate, async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.user!.employeeId },
      select: { id: true, name: true, email: true, role: true, department: true, phone: true, status: true, hireDate: true }
    });
    if (!employee) return res.status(404).json({ error: 'Não encontrado' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno' });
  }
});
