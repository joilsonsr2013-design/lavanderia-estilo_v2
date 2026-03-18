import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando Seed Profissional - Lavanderia Estilo v2 (SQLite)');

  // 1. Limpeza total do banco
  console.log('  -> Limpando banco de dados...');
  await prisma.timeRecord.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.production.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.settings.deleteMany();

  const passwordHash = await bcrypt.hash('senha123', 10);

  // 2. Funcionários
  console.log('  -> Criando equipe...');
  const employees = await Promise.all([
    prisma.employee.create({
      data: { name: 'Admin Estilo', email: 'admin@lavanderia.com', role: 'ADMIN', status: 'ACTIVE', department: 'Diretoria', salary: 12000, passwordHash }
    }),
    prisma.employee.create({
      data: { name: 'Roberta Gerente', email: 'gerente@lavanderia.com', role: 'MANAGER', status: 'ACTIVE', department: 'Operacional', salary: 6500, passwordHash }
    }),
    prisma.employee.create({
      data: { name: 'Carlos Lavador', email: 'carlos@lavanderia.com', role: 'STAFF', status: 'ACTIVE', department: 'Lavagem', salary: 2800, passwordHash }
    }),
    prisma.employee.create({
      data: { name: 'Sônia Passadora', email: 'sonia@lavanderia.com', role: 'STAFF', status: 'ACTIVE', department: 'Passadoria', salary: 3000, passwordHash }
    })
  ]);

  // 3. Marcas Profissionais
  console.log('  -> Cadastrando marcas de luxo, premium e populares...');
  const brandsData = [
    { name: 'Gucci', description: 'Grife italiana de luxo' },
    { name: 'Prada', description: 'Luxo italiano' },
    { name: 'Louis Vuitton', description: 'Maison francesa de luxo' },
    { name: 'Hermès', description: 'Luxo francês' },
    { name: 'Chanel', description: 'Alta costura francesa' },
    { name: 'Dior', description: 'Luxo e sofisticação francesa' },
    { name: 'Dudalina', description: 'Executivo brasileiro de alto padrão' },
    { name: 'Brooksfield', description: 'Moda masculina premium' },
    { name: 'Ricardo Almeida', description: 'Alfaiataria brasileira de luxo' },
    { name: 'Animale', description: 'Moda feminina premium brasileira' },
    { name: 'Osklen', description: 'Lifestyle e sustentabilidade brasileira' },
    { name: 'Reserva', description: 'Moda casual premium brasileira' },
    { name: 'Zara', description: 'Fast fashion espanhol' },
    { name: 'Levi\'s', description: 'Referência mundial em jeans' },
    { name: 'Hering', description: 'O básico do Brasil' },
    { name: 'Renner', description: 'Grande varejista brasileira' },
    { name: 'Trousseau', description: 'Cama, mesa e banho de luxo' },
    { name: 'Buddemeyer', description: 'Enxovais premium' },
    { name: 'Altenburg', description: 'Têxteis para casa' }
  ];

  const brands = await Promise.all(
    brandsData.map(b => prisma.brand.create({ data: b }))
  );

  // 4. Categorias de Peças
  console.log('  -> Criando categorias de peças...');
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Vestuário Masculino', description: 'Camisas, calças, ternos e acessórios masculinos' } }),
    prisma.category.create({ data: { name: 'Vestuário Feminino', description: 'Vestidos, blusas, saias e acessórios femininos' } }),
    prisma.category.create({ data: { name: 'Cama e Banho', description: 'Lençóis, edredons, toalhas e acessórios' } }),
    prisma.category.create({ data: { name: 'Mesa e Decoração', description: 'Toalhas de mesa, cortinas e itens decorativos' } }),
    prisma.category.create({ data: { name: 'Especialidades', description: 'Tapetes, pelúcias, couros e itens especiais' } })
  ]);

  // 5. Catálogo de Peças Profissional
  console.log('  -> Criando catálogo de peças...');
  const catalog = [
    { name: 'Camisa Social', cat: 0, p: 15, w: 15, i: 9, d: 25, sku: 'VM-CAM-SOC' },
    { name: 'Terno (Paletó + Calça)', cat: 0, p: 65, w: null, i: 35, d: 65, sku: 'VM-TER-COM' },
    { name: 'Calça Social', cat: 0, p: 18, w: 18, i: 10, d: 28, sku: 'VM-CAL-SOC' },
    { name: 'Vestido Curto', cat: 1, p: 35, w: 35, i: 20, d: 55, sku: 'VF-VES-CUR' },
    { name: 'Edredom Casal King', cat: 2, p: 65, w: 65, i: null, d: null, sku: 'CB-EDR-KIN' },
    { name: 'Toalha de Mesa Redonda', cat: 3, p: 35, w: 35, i: 20, d: null, sku: 'MD-TOA-RED' },
    { name: 'Tapete Persa (m²)', cat: 4, p: 85, w: 85, i: null, d: null, sku: 'ES-TAP-PER' }
  ];

  const products = [];
  for (const item of catalog) {
    const p = await prisma.product.create({
      data: {
        name: item.name,
        sku: item.sku,
        categoryId: categories[item.cat].id,
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

  // 6. Clientes
  console.log('  -> Criando base de clientes...');
  const customers = await Promise.all([
    prisma.customer.create({
      data: { name: 'Dr. Ricardo Almeida', email: 'ricardo@advocacia.com.br', phone: '(11) 98888-1111', address: 'Av. Paulista, 1000' }
    }),
    prisma.customer.create({
      data: { name: 'Dra. Beatriz Fontana', email: 'beatriz.f@medicina.com', phone: '(11) 97777-2222', address: 'Rua Oscar Freire, 500' }
    })
  ]);

  // 7. Configurações
  console.log('  -> Finalizando configurações...');
  await prisma.settings.createMany({
    data: [
      { key: 'company_name', value: 'Lavanderia Estilo Premium' },
      { key: 'company_slogan', value: 'Cuidado impecável para quem exige o melhor.' }
    ]
  });

  console.log('\n✅ Sistema Restaurado com Sucesso!');
}

main()
  .catch((e) => { console.error('❌ Erro no Seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
