import { PrismaClient, OrderStatus, OrderPriority, ProductionStatus, EmployeeRole, EmployeeStatus, TimeRecordType, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

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

  // Criar funcionários
  const employees = await Promise.all([
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
    }),
    prisma.employee.create({
      data: {
        name: 'Lucas Passador',
        email: 'lucas@lavanderia.com',
        phone: '(64) 99900-0004',
        role: EmployeeRole.STAFF,
        status: EmployeeStatus.ACTIVE,
        department: 'Passadoria',
        salary: 2600.00,
        passwordHash
      }
    }),
    prisma.employee.create({
      data: {
        name: 'Maria Atendente',
        email: 'maria@lavanderia.com',
        phone: '(64) 99900-0005',
        role: EmployeeRole.STAFF,
        status: EmployeeStatus.ACTIVE,
        department: 'Atendimento',
        salary: 2400.00,
        passwordHash
      }
    })
  ]);

  // Criar produtos/serviços
  const products = await Promise.all([
    prisma.product.create({
      data: { name: 'Lavagem Camisa', sku: 'LAV-CAMISA-001', price: 8.00, stock: 999, minStock: 0, category: 'Lavagem', unit: 'pç', description: 'Lavagem e passadoria de camisa' }
    }),
    prisma.product.create({
      data: { name: 'Lavagem Calça', sku: 'LAV-CALCA-002', price: 12.00, stock: 999, minStock: 0, category: 'Lavagem', unit: 'pç', description: 'Lavagem e passadoria de calça' }
    }),
    prisma.product.create({
      data: { name: 'Lavagem Vestido', sku: 'LAV-VESTIDO-003', price: 18.00, stock: 999, minStock: 0, category: 'Lavagem', unit: 'pç', description: 'Lavagem e passadoria de vestido' }
    }),
    prisma.product.create({
      data: { name: 'Lavagem Terno', sku: 'LAV-TERNO-004', price: 45.00, stock: 999, minStock: 0, category: 'Lavagem Especial', unit: 'pç', description: 'Lavagem a seco de terno' }
    }),
    prisma.product.create({
      data: { name: 'Lavagem Edredom', sku: 'LAV-EDREDOM-005', price: 35.00, stock: 999, minStock: 0, category: 'Lavagem', unit: 'pç', description: 'Lavagem de edredom casal' }
    }),
    prisma.product.create({
      data: { name: 'Passadoria Camisa', sku: 'PAS-CAMISA-006', price: 5.00, stock: 999, minStock: 0, category: 'Passadoria', unit: 'pç', description: 'Somente passadoria de camisa' }
    }),
    prisma.product.create({
      data: { name: 'Detergente Concentrado 5L', sku: 'INS-DET-007', price: 45.00, stock: 20, minStock: 5, category: 'Insumos', unit: 'un', description: 'Detergente para lavagem industrial' }
    }),
    prisma.product.create({
      data: { name: 'Amaciante 5L', sku: 'INS-AMA-008', price: 35.00, stock: 3, minStock: 5, category: 'Insumos', unit: 'un', description: 'Amaciante concentrado' }
    }),
    prisma.product.create({
      data: { name: 'Alvejante 1L', sku: 'INS-ALV-009', price: 12.00, stock: 8, minStock: 10, category: 'Insumos', unit: 'un', description: 'Alvejante sem cloro' }
    }),
    prisma.product.create({
      data: { name: 'Embalagem Plástica', sku: 'EMB-PLA-010', price: 0.50, stock: 500, minStock: 100, category: 'Embalagem', unit: 'un', description: 'Saco plástico para embalagem' }
    }),
  ]);

  // Criar clientes
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(64) 99876-5432',
        address: 'Rua das Flores, 123 - Goiânia, GO',
        preferences: { fragranceAversion: false, notes: 'Prefere embalagem em cabide' }
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '(64) 99765-4321',
        address: 'Av. Goiás, 456 - Goiânia, GO',
        preferences: { fragranceAversion: true, notes: 'Alérgica a perfume' }
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Carlos Oliveira',
        email: 'carlos.oliveira@email.com',
        phone: '(64) 99654-3210',
        address: 'Rua 44, 789 - Goiânia, GO'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Hotel Central Goiânia',
        email: 'lavanderia@hotelcentral.com.br',
        phone: '(64) 3322-1100',
        address: 'Av. República do Líbano, 1000 - Goiânia, GO',
        notes: 'Cliente corporativo - faturamento quinzenal'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Clínica São Lucas',
        email: 'adm@clinicasaolucas.com.br',
        phone: '(64) 3311-5500',
        address: 'Rua 90, 200 - Goiânia, GO',
        notes: 'Roupas hospitalares - tratamento especial'
      }
    })
  ]);

  // Criar pedidos
  const order1 = await prisma.order.create({
    data: {
      customerId: customers[0].id,
      status: OrderStatus.WASHING,
      priority: OrderPriority.HIGH,
      totalAmount: 80.00,
      description: 'Pedido urgente para evento',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { productId: products[0].id, quantity: 5, unitPrice: 8.00, totalPrice: 40.00, fabricType: 'Algodão', color: 'Branco', dirtLevel: 'Médio' },
          { productId: products[1].id, quantity: 2, unitPrice: 12.00, totalPrice: 24.00, fabricType: 'Sintético', color: 'Escuro', dirtLevel: 'Leve' },
          { productId: products[5].id, quantity: 2, unitPrice: 5.00, totalPrice: 10.00, fabricType: 'Algodão', color: 'Claro', dirtLevel: 'Leve' },
          { productId: products[4].id, quantity: 1, unitPrice: 35.00, totalPrice: 35.00, fabricType: 'Lã', color: 'Colorido', dirtLevel: 'Pesado' }
        ]
      }
    }
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: customers[1].id,
      status: OrderStatus.PENDING,
      priority: OrderPriority.MEDIUM,
      totalAmount: 63.00,
      description: 'Roupas da semana',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { productId: products[0].id, quantity: 3, unitPrice: 8.00, totalPrice: 24.00 },
          { productId: products[1].id, quantity: 3, unitPrice: 12.00, totalPrice: 36.00 },
          { productId: products[2].id, quantity: 1, unitPrice: 18.00, totalPrice: 18.00 }
        ]
      }
    }
  });

  const order3 = await prisma.order.create({
    data: {
      customerId: customers[3].id,
      status: OrderStatus.READY_FOR_DELIVERY,
      priority: OrderPriority.HIGH,
      totalAmount: 350.00,
      description: 'Lote quinzenal hotel',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { productId: products[0].id, quantity: 20, unitPrice: 8.00, totalPrice: 160.00 },
          { productId: products[4].id, quantity: 5, unitPrice: 35.00, totalPrice: 175.00 }
        ]
      }
    }
  });

  const order4 = await prisma.order.create({
    data: {
      customerId: customers[2].id,
      status: OrderStatus.DELIVERED,
      priority: OrderPriority.LOW,
      totalAmount: 45.00,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { productId: products[3].id, quantity: 1, unitPrice: 45.00, totalPrice: 45.00 }
        ]
      }
    }
  });

  // Criar produções
  await prisma.production.create({
    data: {
      orderId: order1.id,
      status: ProductionStatus.IN_PROGRESS,
      assignedTo: employees[2].id,
      startDate: new Date(),
      stage: 'WASHING',
      notes: 'Lavagem em andamento - alta prioridade'
    }
  });

  await prisma.production.create({
    data: {
      orderId: order2.id,
      status: ProductionStatus.PENDING,
      notes: 'Aguardando início'
    }
  });

  await prisma.production.create({
    data: {
      orderId: order3.id,
      status: ProductionStatus.COMPLETED,
      assignedTo: employees[3].id,
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      stage: 'PACKAGING',
      notes: 'Concluído, aguardando retirada'
    }
  });

  // Registros de ponto
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await Promise.all([
    prisma.timeRecord.create({ data: { employeeId: employees[2].id, type: TimeRecordType.CLOCK_IN, timestamp: new Date(new Date().setHours(7, 55, 0, 0)), notes: 'Entrada' } }),
    prisma.timeRecord.create({ data: { employeeId: employees[3].id, type: TimeRecordType.CLOCK_IN, timestamp: new Date(new Date().setHours(8, 5, 0, 0)), notes: 'Entrada' } }),
    prisma.timeRecord.create({ data: { employeeId: employees[4].id, type: TimeRecordType.CLOCK_IN, timestamp: new Date(new Date().setHours(8, 0, 0, 0)), notes: 'Entrada' } }),
    prisma.timeRecord.create({ data: { employeeId: employees[2].id, type: TimeRecordType.CLOCK_OUT, timestamp: new Date(new Date(yesterday).setHours(17, 0, 0, 0)), notes: 'Saída' } }),
    prisma.timeRecord.create({ data: { employeeId: employees[3].id, type: TimeRecordType.CLOCK_OUT, timestamp: new Date(new Date(yesterday).setHours(17, 15, 0, 0)), notes: 'Saída' } }),
  ]);

  // Transações financeiras
  await Promise.all([
    prisma.transaction.create({ data: { type: TransactionType.INCOME, category: 'Serviços', amount: 80.00, description: `Pedido ${order1.orderNumber}`, paymentMethod: 'PIX' } }),
    prisma.transaction.create({ data: { type: TransactionType.INCOME, category: 'Serviços', amount: 350.00, description: `Pedido Hotel Central ${order3.orderNumber}`, paymentMethod: 'Faturamento' } }),
    prisma.transaction.create({ data: { type: TransactionType.INCOME, category: 'Serviços', amount: 45.00, description: `Pedido ${order4.orderNumber}`, paymentMethod: 'Cartão' } }),
    prisma.transaction.create({ data: { type: TransactionType.EXPENSE, category: 'Insumos', amount: 280.00, description: 'Compra de produtos de limpeza', paymentMethod: 'Boleto' } }),
    prisma.transaction.create({ data: { type: TransactionType.EXPENSE, category: 'Utilidades', amount: 850.00, description: 'Conta de energia elétrica', paymentMethod: 'Débito automático' } }),
    prisma.transaction.create({ data: { type: TransactionType.EXPENSE, category: 'Salários', amount: 21300.00, description: 'Folha de pagamento', paymentMethod: 'Transferência' } }),
    prisma.transaction.create({ data: { type: TransactionType.INCOME, category: 'Serviços', amount: 63.00, description: `Pedido ${order2.orderNumber} - aguardando`, paymentMethod: 'Dinheiro' } }),
  ]);

  // Configurações
  await Promise.all([
    prisma.settings.create({ data: { key: 'company_name', value: 'Lavanderia Eficiente' } }),
    prisma.settings.create({ data: { key: 'company_phone', value: '(64) 3322-0000' } }),
    prisma.settings.create({ data: { key: 'company_address', value: 'Rua das Lavandas, 100 - Goiânia, GO' } }),
    prisma.settings.create({ data: { key: 'currency', value: 'BRL' } }),
    prisma.settings.create({ data: { key: 'timezone', value: 'America/Sao_Paulo' } }),
    prisma.settings.create({ data: { key: 'working_hours_start', value: '08:00' } }),
    prisma.settings.create({ data: { key: 'working_hours_end', value: '18:00' } }),
    prisma.settings.create({ data: { key: 'notify_on_order_status_change', value: 'true' } }),
    prisma.settings.create({ data: { key: 'default_deadline_days', value: '3' } }),
  ]);

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('  Admin:   admin@lavanderia.com / senha123');
  console.log('  Gerente: gerente@lavanderia.com / senha123');
  console.log('  Staff:   ana@lavanderia.com / senha123');
}

main()
  .catch((e) => { console.error('❌ Erro ao executar seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
