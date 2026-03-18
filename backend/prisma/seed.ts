import { PrismaClient, OrderStatus, OrderPriority, ProductionStatus, EmployeeRole, EmployeeStatus, TimeRecordType, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados unificado...');

  // Limpeza (opcional, mas recomendado para novo banco)
  await prisma.timeRecord.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.production.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.settings.deleteMany();

  const passwordHash = await bcrypt.hash('senha123', 10);

  // 1. Criar funcionários
  console.log('  -> Criando funcionários...');
  await Promise.all([
    prisma.employee.create({
      data: {
        name: 'Admin Sistema',
        email: 'admin@lavanderia.com',
        phone: '(64) 99900-0001',
        role: EmployeeRole.ADMIN,
        status: EmployeeStatus.ACTIVE,
        department: 'Administração',
        salary: 8000.00,
        passwordHash
      }
    }),
    prisma.employee.create({
      data: {
        name: 'Pedro Gerente',
        email: 'gerente@lavanderia.com',
        phone: '(64) 99900-0002',
        role: EmployeeRole.MANAGER,
        status: EmployeeStatus.ACTIVE,
        department: 'Produção',
        salary: 5500.00,
        passwordHash
      }
    }),
    prisma.employee.create({
      data: {
        name: 'Ana Lavandeira',
        email: 'ana@lavanderia.com',
        phone: '(64) 99900-0003',
        role: EmployeeRole.STAFF,
        status: EmployeeStatus.ACTIVE,
        department: 'Lavagem',
        salary: 2800.00,
        passwordHash
      }
    })
  ]);

  // 2. Criar peças e serviços (Baseado na pesquisa de mercado)
  console.log('  -> Criando peças e serviços...');
  const items = [
    { name: 'Camisa Social', category: 'Vestuário', washAndIronPrice: 14.0, ironOnlyPrice: 8.0, sku: 'VEST-CAM-SOC' },
    { name: 'Camiseta', category: 'Vestuário', washAndIronPrice: 10.0, ironOnlyPrice: 5.0, sku: 'VEST-CAM-SIM' },
    { name: 'Calça Jeans', category: 'Vestuário', washAndIronPrice: 17.0, ironOnlyPrice: 9.0, sku: 'VEST-CAL-JEA' },
    { name: 'Bermuda', category: 'Vestuário', washAndIronPrice: 12.0, ironOnlyPrice: 6.0, sku: 'VEST-BER' },
    { name: 'Blazer Simples', category: 'Vestuário', washAndIronPrice: 35.0, ironOnlyPrice: 20.0, sku: 'VEST-BLA-SIM' },
    { name: 'Edredom Casal Queen', category: 'Cama e Banho', washAndIronPrice: 48.0, ironOnlyPrice: 0.0, sku: 'CAMA-EDR-QUE' },
    { name: 'Lençol Casal', category: 'Cama e Banho', washAndIronPrice: 20.0, ironOnlyPrice: 12.0, sku: 'CAMA-LEN-CAS' },
    { name: 'Toalha de Banho', category: 'Cama e Banho', washAndIronPrice: 8.0, ironOnlyPrice: 0.0, sku: 'BANH-TOA-BAN' },
  ];

  for (const item of items) {
    await prisma.product.create({
      data: {
        name: item.name,
        sku: item.sku,
        category: item.category,
        price: item.washAndIronPrice,
        washAndIronPrice: item.washAndIronPrice,
        ironOnlyPrice: item.ironOnlyPrice,
        description: `Serviço de ${item.name}`,
        stock: 999,
        unit: 'pç'
      }
    });
  }

  // 3. Configurações básicas
  console.log('  -> Criando configurações...');
  await prisma.settings.createMany({
    data: [
      { key: 'company_name', value: 'Lavanderia Estilo' },
      { key: 'currency', value: 'BRL' },
      { key: 'timezone', value: 'America/Sao_Paulo' }
    ]
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('  Admin:   admin@lavanderia.com / senha123');
  console.log('  Gerente: gerente@lavanderia.com / senha123');
  console.log('  Staff:   ana@lavanderia.com / senha123');
}

main()
  .catch((e) => { console.error('❌ Erro ao executar seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
