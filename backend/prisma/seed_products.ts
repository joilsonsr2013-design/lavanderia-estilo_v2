import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const items = [
  // Vestuário
  { name: 'Camisa Social', category: 'Vestuário', washAndIronPrice: 14.0, ironOnlyPrice: 8.0, sku: 'VEST-CAM-SOC' },
  { name: 'Camiseta', category: 'Vestuário', washAndIronPrice: 10.0, ironOnlyPrice: 5.0, sku: 'VEST-CAM-SIM' },
  { name: 'Camisa Polo', category: 'Vestuário', washAndIronPrice: 12.0, ironOnlyPrice: 6.0, sku: 'VEST-CAM-POL' },
  { name: 'Calça Jeans', category: 'Vestuário', washAndIronPrice: 17.0, ironOnlyPrice: 9.0, sku: 'VEST-CAL-JEA' },
  { name: 'Bermuda', category: 'Vestuário', washAndIronPrice: 12.0, ironOnlyPrice: 6.0, sku: 'VEST-BER' },
  { name: 'Blazer Simples', category: 'Vestuário', washAndIronPrice: 35.0, ironOnlyPrice: 20.0, sku: 'VEST-BLA-SIM' },
  { name: 'Vestido Curto', category: 'Vestuário', washAndIronPrice: 25.0, ironOnlyPrice: 15.0, sku: 'VEST-VES-CUR' },
  { name: 'Terno', category: 'Vestuário', washAndIronPrice: 50.0, ironOnlyPrice: 30.0, sku: 'VEST-TER' },
  
  // Cama e Banho
  { name: 'Edredom Solteiro', category: 'Cama e Banho', washAndIronPrice: 38.0, ironOnlyPrice: 0.0, sku: 'CAMA-EDR-SOL' },
  { name: 'Edredom Casal Queen', category: 'Cama e Banho', washAndIronPrice: 48.0, ironOnlyPrice: 0.0, sku: 'CAMA-EDR-QUE' },
  { name: 'Edredom Casal King', category: 'Cama e Banho', washAndIronPrice: 55.0, ironOnlyPrice: 0.0, sku: 'CAMA-EDR-KIN' },
  { name: 'Lençol Solteiro', category: 'Cama e Banho', washAndIronPrice: 15.0, ironOnlyPrice: 8.0, sku: 'CAMA-LEN-SOL' },
  { name: 'Lençol Casal', category: 'Cama e Banho', washAndIronPrice: 20.0, ironOnlyPrice: 12.0, sku: 'CAMA-LEN-CAS' },
  { name: 'Toalha de Banho', category: 'Cama e Banho', washAndIronPrice: 8.0, ironOnlyPrice: 0.0, sku: 'BANH-TOA-BAN' },
  { name: 'Toalha de Rosto', category: 'Cama e Banho', washAndIronPrice: 4.0, ironOnlyPrice: 0.0, sku: 'BANH-TOA-ROS' },
];

async function main() {
  console.log('Iniciando pré-cadastro de peças...');
  
  for (const item of items) {
    await prisma.product.upsert({
      where: { sku: item.sku },
      update: {},
      create: {
        name: item.name,
        sku: item.sku,
        category: item.category,
        price: item.washAndIronPrice, // Preço padrão
        washAndIronPrice: item.washAndIronPrice,
        ironOnlyPrice: item.ironOnlyPrice,
        description: `Serviço de ${item.name}`,
        stock: 9999,
        unit: 'un'
      },
    });
  }
  
  console.log('Pré-cadastro concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
