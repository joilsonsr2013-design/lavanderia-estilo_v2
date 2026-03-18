import { PrismaClient, OrderStatus, OrderPriority, ProductionStatus, EmployeeRole, EmployeeStatus, TimeRecordType, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando Seed Profissional - Lavanderia Estilo v2');

  // 1. Limpeza total do banco
  console.log('  -> Limpando banco de dados...');
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

  // 2. Funcionários
  console.log('  -> Criando equipe...');
  const employees = await Promise.all([
    prisma.employee.create({
      data: { name: 'Admin Estilo', email: 'admin@lavanderia.com', role: EmployeeRole.ADMIN, status: EmployeeStatus.ACTIVE, department: 'Diretoria', salary: 12000, passwordHash }
    }),
    prisma.employee.create({
      data: { name: 'Roberta Gerente', email: 'gerente@lavanderia.com', role: EmployeeRole.MANAGER, status: EmployeeStatus.ACTIVE, department: 'Operacional', salary: 6500, passwordHash }
    }),
    prisma.employee.create({
      data: { name: 'Carlos Lavador', email: 'carlos@lavanderia.com', role: EmployeeRole.STAFF, status: EmployeeStatus.ACTIVE, department: 'Lavagem', salary: 2800, passwordHash }
    }),
    prisma.employee.create({
      data: { name: 'Sônia Passadora', email: 'sonia@lavanderia.com', role: EmployeeRole.STAFF, status: EmployeeStatus.ACTIVE, department: 'Passadoria', salary: 3000, passwordHash }
    })
  ]);

  // 3. Catálogo de Peças Profissional
  console.log('  -> Criando catálogo de peças e serviços...');
  const catalog = [
    // Vestuário Masculino
    { name: 'Camisa Social', cat: 'Vestuário Masculino', p: 15, w: 15, i: 9, d: 25, sku: 'VM-CAM-SOC' },
    { name: 'Terno (Paletó + Calça)', cat: 'Vestuário Masculino', p: 65, w: null, i: 35, d: 65, sku: 'VM-TER-COM' },
    { name: 'Calça Social', cat: 'Vestuário Masculino', p: 18, w: 18, i: 10, d: 28, sku: 'VM-CAL-SOC' },
    { name: 'Gravata Seda', cat: 'Vestuário Masculino', p: 12, w: null, i: null, d: 12, sku: 'VM-GRA-SED' },
    
    // Vestuário Feminino
    { name: 'Vestido Curto', cat: 'Vestuário Feminino', p: 35, w: 35, i: 20, d: 55, sku: 'VF-VES-CUR' },
    { name: 'Vestido de Festa (Seda/Renda)', cat: 'Vestuário Feminino', p: 120, w: null, i: 60, d: 120, sku: 'VF-VES-FES' },
    { name: 'Saia Midi', cat: 'Vestuário Feminino', p: 25, w: 25, i: 15, d: 35, sku: 'VF-SAI-MID' },
    { name: 'Blusa Seda', cat: 'Vestuário Feminino', p: 22, w: null, i: 12, d: 22, sku: 'VF-BLU-SED' },

    // Cama e Banho
    { name: 'Edredom Casal King', cat: 'Cama e Banho', p: 65, w: 65, i: null, d: null, sku: 'CB-EDR-KIN' },
    { name: 'Jogo de Lençol 400 fios', cat: 'Cama e Banho', p: 45, w: 45, i: 25, d: null, sku: 'CB-LEN-400' },
    { name: 'Toalha de Banho Gigante', cat: 'Cama e Banho', p: 12, w: 12, i: null, d: null, sku: 'CB-TOA-GIG' },
    
    // Especialidades
    { name: 'Tapete Persa (m²)', cat: 'Especialidades', p: 85, w: 85, i: null, d: null, sku: 'ES-TAP-PER' },
    { name: 'Cortina Blackout (folha)', cat: 'Especialidades', p: 45, w: 45, i: 25, d: null, sku: 'ES-COR-BLA' }
  ];

  const products = [];
  for (const item of catalog) {
    const p = await prisma.product.create({
      data: {
        name: item.name,
        sku: item.sku,
        category: item.cat,
        price: item.p,
        washAndIronPrice: item.w,
        ironOnlyPrice: item.i,
        dryCleanPrice: item.d,
        stock: 9999,
        unit: item.sku.includes('TAP') ? 'm2' : 'pç'
      }
    });
    products.push(p);
  }

  // 4. Clientes Fictícios de Alto Padrão
  console.log('  -> Criando base de clientes...');
  const customers = await Promise.all([
    prisma.customer.create({
      data: { name: 'Dr. Ricardo Almeida', email: 'ricardo@advocacia.com.br', phone: '(11) 98888-1111', address: 'Av. Paulista, 1000 - Apto 221', notes: 'Cliente VIP - Retirada e entrega sempre às segundas.' }
    }),
    prisma.customer.create({
      data: { name: 'Dra. Beatriz Fontana', email: 'beatriz.f@medicina.com', phone: '(11) 97777-2222', address: 'Rua Oscar Freire, 500', notes: 'Alérgica a amaciantes fortes. Usar linha neutra.' }
    }),
    prisma.customer.create({
      data: { name: 'Hotel Grand Hyatt', email: 'governanca@hyatt.com', phone: '(11) 3000-5000', address: 'Av. Nações Unidas, 13301', notes: 'Faturamento corporativo mensal.' }
    })
  ]);

  // 5. Ordens de Serviço Realistas
  console.log('  -> Gerando ordens de serviço históricas e ativas...');
  
  // OS 1: Ativa (Lavagem)
  const os1 = await prisma.order.create({
    data: {
      customerId: customers[0].id,
      status: OrderStatus.WASHING,
      priority: OrderPriority.HIGH,
      totalAmount: 155.00,
      description: 'Peças de trabalho para a semana.',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { productId: products[0].id, quantity: 5, unitPrice: 15, totalPrice: 75, serviceType: 'Lavar e Passar', brand: 'Dudalina', color: 'Branco', fabric: 'Algodão Egípcio', dirtLevel: 'Leve', damageNotes: 'Pequeno desgaste no colarinho da camisa 2.' },
          { productId: products[2].id, quantity: 2, unitPrice: 40, totalPrice: 80, serviceType: 'Limpeza a Seco', brand: 'Ricardo Almeida', color: 'Cinza Chumbo', fabric: 'Lã Fria', dirtLevel: 'Médio' }
        ]
      }
    }
  });

  // OS 2: Pronta para Entrega
  const os2 = await prisma.order.create({
    data: {
      customerId: customers[1].id,
      status: OrderStatus.READY_FOR_DELIVERY,
      priority: OrderPriority.MEDIUM,
      totalAmount: 185.00,
      description: 'Roupas de cama delicadas.',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { productId: products[8].id, quantity: 1, unitPrice: 65, totalPrice: 65, serviceType: 'Lavar e Passar', brand: 'Trousseau', color: 'Off-white', fabric: 'Pluma de Ganso', notes: 'Cuidado extra com a costura lateral.' },
          { productId: products[9].id, quantity: 2, unitPrice: 60, totalPrice: 120, serviceType: 'Lavar e Passar', brand: 'Buddemeyer', color: 'Branco', fabric: 'Algodão 400 fios' }
        ]
      }
    }
  });

  // 6. Configurações e Financeiro
  console.log('  -> Finalizando configurações...');
  await prisma.settings.createMany({
    data: [
      { key: 'company_name', value: 'Lavanderia Estilo Premium' },
      { key: 'company_slogan', value: 'Cuidado impecável para quem exige o melhor.' },
      { key: 'tax_id', value: '12.345.678/0001-90' }
    ]
  });

  await prisma.transaction.create({
    data: { type: TransactionType.INCOME, category: 'Serviços', amount: 12500.00, description: 'Faturamento mensal acumulado', paymentMethod: 'Vários' }
  });

  console.log('\n✅ Sistema Restaurado com Sucesso!');
  console.log('--------------------------------------------------');
  console.log('Acesso Admin: admin@lavanderia.com / senha123');
  console.log('Catálogo: 13 peças profissionais cadastradas.');
  console.log('Clientes: 3 perfis de alto padrão criados.');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => { console.error('❌ Erro no Seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
