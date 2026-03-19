import { PrismaClient, OrderStatus, OrderPriority, ProductionStatus, EmployeeRole, EmployeeStatus, TimeRecordType, TransactionType, ServiceType } from '@prisma/client';
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
  await prisma.clothingItem.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.color.deleteMany();
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

  // Criar marcas de roupas populares
  const brands = await Promise.all([
    // Marcas Brasileiras Populares
    prisma.brand.create({ data: { name: 'Farm', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Renner', category: 'Popular', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'C&A', category: 'Popular', country: 'Internacional' } }),
    prisma.brand.create({ data: { name: 'Riachuelo', category: 'Popular', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Marisa', category: 'Popular', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Hering', category: 'Casual', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Colcci', category: 'Casual', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Reserva', category: 'Masculino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Track&Field', category: 'Esportivo', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Cia Marítima', category: 'Praia', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Lenny Niemeyer', category: 'Praia', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Osklen', category: 'Premium', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Melissa', category: 'Acessórios', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Arezzo', category: 'Acessórios', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Amapô', category: 'Streetwear', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Lez à Lez', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Dudalina', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Dendezeiro', category: 'Casual', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Lupo', category: 'Casual', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Zorba', category: 'Casual', country: 'Brasil' } }),

    // Marcas Internacionais Populares no Brasil
    prisma.brand.create({ data: { name: 'Zara', category: 'Internacional', country: 'Espanha' } }),
    prisma.brand.create({ data: { name: 'H&M', category: 'Internacional', country: 'Suécia' } }),
    prisma.brand.create({ data: { name: 'Nike', category: 'Esportivo', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Adidas', category: 'Esportivo', country: 'Alemanha' } }),
    prisma.brand.create({ data: { name: 'Lacoste', category: 'Premium', country: 'França' } }),
    prisma.brand.create({ data: { name: 'Ralph Lauren', category: 'Premium', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Tommy Hilfiger', category: 'Premium', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Calvin Klein', category: 'Premium', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Levi\'s', category: 'Casual', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Gap', category: 'Casual', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Uniqlo', category: 'Casual', country: 'Japão' } }),
    prisma.brand.create({ data: { name: 'Forever 21', category: 'Popular', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Mango', category: 'Internacional', country: 'Espanha' } }),
    prisma.brand.create({ data: { name: 'Gucci', category: 'Luxo', country: 'Itália' } }),
    prisma.brand.create({ data: { name: 'Prada', category: 'Luxo', country: 'Itália' } }),
    prisma.brand.create({ data: { name: 'Armani', category: 'Luxo', country: 'Itália' } }),
    prisma.brand.create({ data: { name: 'Versace', category: 'Luxo', country: 'Itália' } }),
    prisma.brand.create({ data: { name: 'Chanel', category: 'Luxo', country: 'França' } }),
    prisma.brand.create({ data: { name: 'Louis Vuitton', category: 'Luxo', country: 'França' } }),
    prisma.brand.create({ data: { name: 'Dior', category: 'Luxo', country: 'França' } }),
    prisma.brand.create({ data: { name: 'Hermès', category: 'Luxo', country: 'França' } }),

    // Marcas Esportivas
    prisma.brand.create({ data: { name: 'Puma', category: 'Esportivo', country: 'Alemanha' } }),
    prisma.brand.create({ data: { name: 'Under Armour', category: 'Esportivo', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'New Balance', category: 'Esportivo', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Asics', category: 'Esportivo', country: 'Japão' } }),
    prisma.brand.create({ data: { name: 'Mizuno', category: 'Esportivo', country: 'Japão' } }),
    prisma.brand.create({ data: { name: 'Olympikus', category: 'Esportivo', country: 'Brasil' } }),

    // Marcas de Moda Íntima
    prisma.brand.create({ data: { name: 'Calvin Klein Underwear', category: 'Moda Íntima', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Hope', category: 'Moda Íntima', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Valisère', category: 'Moda Íntima', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'DeMillus', category: 'Moda Íntima', country: 'Brasil' } }),

    // Marcas Premium/Designer
    prisma.brand.create({ data: { name: 'Tufi Duek', category: 'Premium', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Forum', category: 'Premium', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Vittorino', category: 'Premium', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Richards', category: 'Premium', country: 'Brasil' } }),

    // Marcas Masculinas Premium
    prisma.brand.create({ data: { name: 'Aramis', category: 'Masculino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Highstil', category: 'Masculino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Hugo Boss', category: 'Luxo', country: 'Alemanha' } }),
    prisma.brand.create({ data: { name: 'Brooksfield', category: 'Masculino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'John John', category: 'Masculino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Paco', category: 'Masculino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Gilson Martin', category: 'Masculino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Boxer', category: 'Masculino', country: 'Brasil' } }),

    // Marcas de Jeans
    prisma.brand.create({ data: { name: 'Ellus', category: 'Casual', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Diesel', category: 'Premium', country: 'Itália' } }),
    prisma.brand.create({ data: { name: 'Lee', category: 'Casual', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Wrangler', category: 'Casual', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Blue Man', category: 'Praia', country: 'Brasil' } }),

    // Marcas Femininas Premium
    prisma.brand.create({ data: { name: 'Morena Rosa', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Malwee', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Cantão', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Mormaii', category: 'Esportivo', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Carmen Steffens', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Claudia Rabello', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Animale', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Le Lis Blanc', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Vitorino Campos', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Patricia Bonaldi', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Martha Medeiros', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Cris Barros', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Mixed', category: 'Feminino', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Salinas', category: 'Praia', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Água de Coco', category: 'Praia', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Triya', category: 'Praia', country: 'Brasil' } }),

    // Marcas Infantis
    prisma.brand.create({ data: { name: 'Hering Kids', category: 'Infantil', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Malwee Kids', category: 'Infantil', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Brandili', category: 'Infantil', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Kyly', category: 'Infantil', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Tip Top', category: 'Infantil', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Marisol', category: 'Infantil', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Lilica Ripilica', category: 'Infantil', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Pituchinhus', category: 'Infantil', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Petit Cherie', category: 'Infantil', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Animê', category: 'Infantil', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Reserva Mini', category: 'Infantil', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Brooksfield Junior', category: 'Infantil', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Carter\'s', category: 'Infantil', country: 'EUA' } }),

    // Marcas Esportivas Adicionais
    prisma.brand.create({ data: { name: 'Fila', category: 'Esportivo', country: 'Itália' } }),
    prisma.brand.create({ data: { name: 'Kappa', category: 'Esportivo', country: 'Itália' } }),
    prisma.brand.create({ data: { name: 'Diadora', category: 'Esportivo', country: 'Itália' } }),
    prisma.brand.create({ data: { name: 'Reebok', category: 'Esportivo', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Converse', category: 'Esportivo', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Vans', category: 'Esportivo', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Saucony', category: 'Esportivo', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Skechers', category: 'Esportivo', country: 'EUA' } }),

    // Marcas de Luxo Adicionais
    prisma.brand.create({ data: { name: 'Dolce & Gabbana', category: 'Luxo', country: 'Itália' } }),
    prisma.brand.create({ data: { name: 'Burberry', category: 'Luxo', country: 'Reino Unido' } }),
    prisma.brand.create({ data: { name: 'Balenciaga', category: 'Luxo', country: 'França' } }),
    prisma.brand.create({ data: { name: 'Bottega Veneta', category: 'Luxo', country: 'Itália' } }),
    prisma.brand.create({ data: { name: 'Yves Saint Laurent', category: 'Luxo', country: 'França' } }),
    prisma.brand.create({ data: { name: 'Givenchy', category: 'Luxo', country: 'França' } }),
    prisma.brand.create({ data: { name: 'Fendi', category: 'Luxo', country: 'Itália' } }),
    prisma.brand.create({ data: { name: 'Balmain', category: 'Luxo', country: 'França' } }),
    prisma.brand.create({ data: { name: 'Valentino', category: 'Luxo', country: 'Itália' } }),
    prisma.brand.create({ data: { name: 'Off-White', category: 'Luxo', country: 'Itália' } }),

    // Marcas Brasileiras Adicionais
    prisma.brand.create({ data: { name: 'Pernambucanas', category: 'Popular', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Intimissimi', category: 'Moda Íntima', country: 'Itália' } }),
    prisma.brand.create({ data: { name: 'Piet', category: 'Streetwear', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Cotton Project', category: 'Streetwear', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Blaze Supply', category: 'Streetwear', country: 'Brasil' } }),

    // Marcas Internacionais Fast Fashion
    prisma.brand.create({ data: { name: 'Bershka', category: 'Internacional', country: 'Espanha' } }),
    prisma.brand.create({ data: { name: 'Pull & Bear', category: 'Internacional', country: 'Espanha' } }),
    prisma.brand.create({ data: { name: 'Stradivarius', category: 'Internacional', country: 'Espanha' } }),
    prisma.brand.create({ data: { name: 'Massimo Dutti', category: 'Premium', country: 'Espanha' } }),
    prisma.brand.create({ data: { name: 'Oysho', category: 'Moda Íntima', country: 'Espanha' } }),
    prisma.brand.create({ data: { name: 'Shein', category: 'Popular', country: 'China' } }),
    prisma.brand.create({ data: { name: 'Urbanic', category: 'Popular', country: 'China' } }),
    prisma.brand.create({ data: { name: 'Romwe', category: 'Popular', country: 'China' } }),
    prisma.brand.create({ data: { name: 'Guess', category: 'Premium', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Michael Kors', category: 'Luxo', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Abercrombie', category: 'Premium', country: 'EUA' } }),
    prisma.brand.create({ data: { name: 'Hollister', category: 'Premium', country: 'EUA' } }),

    // Marcas de Moda Praia Adicionais
    prisma.brand.create({ data: { name: 'Rosa Chá', category: 'Praia', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'ViX Paula Hermanny', category: 'Praia', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Rio de Sol', category: 'Praia', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Banco de Areia', category: 'Praia', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Pitanga', category: 'Praia', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Lua Morena', category: 'Praia', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Acqua Salina', category: 'Praia', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Azulô', category: 'Praia', country: 'Brasil' } }),

    // Marcas Esportivas Brasileiras Adicionais
    prisma.brand.create({ data: { name: 'Oxer', category: 'Esportivo', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Penalty', category: 'Esportivo', country: 'Brasil' } }),
    prisma.brand.create({ data: { name: 'Topper', category: 'Esportivo', country: 'Brasil' } }),

    // Outras
    prisma.brand.create({ data: { name: 'Outra', category: 'Outros', country: 'Outros' } }),
    prisma.brand.create({ data: { name: 'Sem Marca', category: 'Outros', country: 'Não informado' } }),
  ]);

  // Criar cores
  const colors = await Promise.all([
    // Cores Básicas
    prisma.color.create({ data: { name: 'Branco', category: 'Básicas', hexCode: '#FFFFFF' } }),
    prisma.color.create({ data: { name: 'Preto', category: 'Básicas', hexCode: '#000000' } }),
    prisma.color.create({ data: { name: 'Cinza', category: 'Básicas', hexCode: '#808080' } }),
    prisma.color.create({ data: { name: 'Cinza Mescla', category: 'Básicas', hexCode: '#A9A9A9' } }),
    // Neutros
    prisma.color.create({ data: { name: 'Bege', category: 'Neutros', hexCode: '#F5F5DC' } }),
    prisma.color.create({ data: { name: 'Camel', category: 'Neutros', hexCode: '#C19A6B' } }),
    prisma.color.create({ data: { name: 'Creme', category: 'Neutros', hexCode: '#FFFDD0' } }),
    prisma.color.create({ data: { name: 'Off-White', category: 'Neutros', hexCode: '#FAF9F6' } }),
    prisma.color.create({ data: { name: 'Nude', category: 'Neutros', hexCode: '#E3BC9A' } }),
    prisma.color.create({ data: { name: 'Champagne', category: 'Neutros', hexCode: '#F7E7CE' } }),
    prisma.color.create({ data: { name: 'Caramelo', category: 'Neutros', hexCode: '#C68E17' } }),
    // Cores Claras
    prisma.color.create({ data: { name: 'Rosa Claro', category: 'Cores Claras', hexCode: '#FFB6C1' } }),
    prisma.color.create({ data: { name: 'Azul Claro', category: 'Cores Claras', hexCode: '#ADD8E6' } }),
    prisma.color.create({ data: { name: 'Verde Claro', category: 'Cores Claras', hexCode: '#90EE90' } }),
    prisma.color.create({ data: { name: 'Amarelo Claro', category: 'Cores Claras', hexCode: '#FFFFE0' } }),
    prisma.color.create({ data: { name: 'Laranja Claro', category: 'Cores Claras', hexCode: '#FFD5B5' } }),
    // Cores Escuras
    prisma.color.create({ data: { name: 'Marrom', category: 'Cores Escuras', hexCode: '#8B4513' } }),
    prisma.color.create({ data: { name: 'Azul Marinho', category: 'Cores Escuras', hexCode: '#000080' } }),
    prisma.color.create({ data: { name: 'Verde Escuro', category: 'Cores Escuras', hexCode: '#006400' } }),
    prisma.color.create({ data: { name: 'Vermelho Escuro', category: 'Cores Escuras', hexCode: '#8B0000' } }),
    prisma.color.create({ data: { name: 'Roxo Escuro', category: 'Cores Escuras', hexCode: '#4B0082' } }),
    prisma.color.create({ data: { name: 'Borgonha', category: 'Cores Escuras', hexCode: '#800020' } }),
    // Vibrantes
    prisma.color.create({ data: { name: 'Vermelho', category: 'Vibrantes', hexCode: '#FF0000' } }),
    prisma.color.create({ data: { name: 'Laranja', category: 'Vibrantes', hexCode: '#FFA500' } }),
    prisma.color.create({ data: { name: 'Amarelo', category: 'Vibrantes', hexCode: '#FFFF00' } }),
    prisma.color.create({ data: { name: 'Rosa', category: 'Vibrantes', hexCode: '#FFC0CB' } }),
    prisma.color.create({ data: { name: 'Magenta', category: 'Vibrantes', hexCode: '#FF00FF' } }),
    prisma.color.create({ data: { name: 'Rosa Pink', category: 'Vibrantes', hexCode: '#FF1493' } }),
    prisma.color.create({ data: { name: 'Coral', category: 'Vibrantes', hexCode: '#FF7F50' } }),
    prisma.color.create({ data: { name: 'Salmon', category: 'Vibrantes', hexCode: '#FA8072' } }),
    // Azuis
    prisma.color.create({ data: { name: 'Azul', category: 'Azuis', hexCode: '#0000FF' } }),
    prisma.color.create({ data: { name: 'Azul Royal', category: 'Azuis', hexCode: '#4169E1' } }),
    prisma.color.create({ data: { name: 'Azul Turquesa', category: 'Azuis', hexCode: '#40E0D0' } }),
    prisma.color.create({ data: { name: 'Azul Petróleo', category: 'Azuis', hexCode: '#005F6A' } }),
    // Verdes
    prisma.color.create({ data: { name: 'Verde', category: 'Verdes', hexCode: '#008000' } }),
    prisma.color.create({ data: { name: 'Verde Militar', category: 'Verdes', hexCode: '#4F5D50' } }),
    prisma.color.create({ data: { name: 'Verde Menta', category: 'Verdes', hexCode: '#98FB98' } }),
    prisma.color.create({ data: { name: 'Verde Floresta', category: 'Verdes', hexCode: '#228B22' } }),
    prisma.color.create({ data: { name: 'Verde Limão', category: 'Verdes', hexCode: '#32CD32' } }),
    prisma.color.create({ data: { name: 'Verde Oliva', category: 'Verdes', hexCode: '#808000' } }),
    // Outras
    prisma.color.create({ data: { name: 'Roxo', category: 'Outras', hexCode: '#800080' } }),
    prisma.color.create({ data: { name: 'Lilás', category: 'Outras', hexCode: '#C8A2C8' } }),
    prisma.color.create({ data: { name: 'Violeta', category: 'Outras', hexCode: '#EE82EE' } }),
    prisma.color.create({ data: { name: 'Bordô', category: 'Outras', hexCode: '#800020' } }),
    prisma.color.create({ data: { name: 'Vinho', category: 'Outras', hexCode: '#722F37' } }),
    prisma.color.create({ data: { name: 'Terracota', category: 'Outras', hexCode: '#E2725B' } }),
    prisma.color.create({ data: { name: 'Bronze', category: 'Outras', hexCode: '#CD7F32' } }),
    prisma.color.create({ data: { name: 'Cobre', category: 'Outras', hexCode: '#B87333' } }),
    // Estampados
    prisma.color.create({ data: { name: 'Colorido', category: 'Estampados', hexCode: null } }),
    prisma.color.create({ data: { name: 'Estampado', category: 'Estampados', hexCode: null } }),
    prisma.color.create({ data: { name: 'Listrado', category: 'Estampados', hexCode: null } }),
    prisma.color.create({ data: { name: 'Xadrez', category: 'Estampados', hexCode: null } }),
    prisma.color.create({ data: { name: 'Floral', category: 'Estampados', hexCode: null } }),
    prisma.color.create({ data: { name: 'Geométrico', category: 'Estampados', hexCode: null } }),
    // Metálicos
    prisma.color.create({ data: { name: 'Dourado', category: 'Metálicos', hexCode: '#FFD700' } }),
    prisma.color.create({ data: { name: 'Prateado', category: 'Metálicos', hexCode: '#C0C0C0' } }),
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

  // Criar peças de roupa (para lavanderia)
  const clothingItems = await Promise.all([
    // Vestuário Masculino
    prisma.clothingItem.create({ data: { name: 'Camisa Social', category: 'Vestuário', subcategory: 'Masculino', priceWashIron: 15.00, priceIronOnly: 8.00, estimatedTime: 30 } }),
    prisma.clothingItem.create({ data: { name: 'Camisa Casual', category: 'Vestuário', subcategory: 'Masculino', priceWashIron: 12.00, priceIronOnly: 6.00, estimatedTime: 25 } }),
    prisma.clothingItem.create({ data: { name: 'Camisa Polo', category: 'Vestuário', subcategory: 'Masculino', priceWashIron: 12.00, priceIronOnly: 6.00, estimatedTime: 20 } }),
    prisma.clothingItem.create({ data: { name: 'Calça Social', category: 'Vestuário', subcategory: 'Masculino', priceWashIron: 18.00, priceIronOnly: 10.00, estimatedTime: 35 } }),
    prisma.clothingItem.create({ data: { name: 'Calça Jeans', category: 'Vestuário', subcategory: 'Masculino', priceWashIron: 15.00, priceIronOnly: 8.00, estimatedTime: 30 } }),
    prisma.clothingItem.create({ data: { name: 'Terno Completo', category: 'Vestuário', subcategory: 'Masculino', priceWashIron: 60.00, priceIronOnly: 35.00, estimatedTime: 60 } }),
    prisma.clothingItem.create({ data: { name: 'Paletó', category: 'Vestuário', subcategory: 'Masculino', priceWashIron: 35.00, priceIronOnly: 20.00, estimatedTime: 45 } }),
    prisma.clothingItem.create({ data: { name: 'Blazer Masculino', category: 'Vestuário', subcategory: 'Masculino', priceWashIron: 30.00, priceIronOnly: 18.00, estimatedTime: 40 } }),
    prisma.clothingItem.create({ data: { name: 'Gravata', category: 'Vestuário', subcategory: 'Masculino', priceWashIron: 10.00, priceIronOnly: 6.00, estimatedTime: 15 } }),
    prisma.clothingItem.create({ data: { name: 'Cueca (cada)', category: 'Vestuário', subcategory: 'Masculino', priceWashIron: 5.00, priceIronOnly: 0, estimatedTime: 10 } }),
    prisma.clothingItem.create({ data: { name: 'Meias (par)', category: 'Vestuário', subcategory: 'Masculino', priceWashIron: 3.00, priceIronOnly: 0, estimatedTime: 5 } }),

    // Vestuário Feminino
    prisma.clothingItem.create({ data: { name: 'Blusa Social', category: 'Vestuário', subcategory: 'Feminino', priceWashIron: 15.00, priceIronOnly: 8.00, estimatedTime: 30 } }),
    prisma.clothingItem.create({ data: { name: 'Blusa Casual', category: 'Vestuário', subcategory: 'Feminino', priceWashIron: 12.00, priceIronOnly: 6.00, estimatedTime: 25 } }),
    prisma.clothingItem.create({ data: { name: 'Vestido Simples', category: 'Vestuário', subcategory: 'Feminino', priceWashIron: 25.00, priceIronOnly: 15.00, estimatedTime: 40 } }),
    prisma.clothingItem.create({ data: { name: 'Vestido de Festa', category: 'Vestuário', subcategory: 'Feminino', priceWashIron: 50.00, priceIronOnly: 30.00, estimatedTime: 60 } }),
    prisma.clothingItem.create({ data: { name: 'Saia', category: 'Vestuário', subcategory: 'Feminino', priceWashIron: 15.00, priceIronOnly: 10.00, estimatedTime: 25 } }),
    prisma.clothingItem.create({ data: { name: 'Calça Social Feminina', category: 'Vestuário', subcategory: 'Feminino', priceWashIron: 18.00, priceIronOnly: 10.00, estimatedTime: 35 } }),
    prisma.clothingItem.create({ data: { name: 'Blazer Feminino', category: 'Vestuário', subcategory: 'Feminino', priceWashIron: 30.00, priceIronOnly: 18.00, estimatedTime: 40 } }),
    prisma.clothingItem.create({ data: { name: 'Shorts', category: 'Vestuário', subcategory: 'Feminino', priceWashIron: 12.00, priceIronOnly: 6.00, estimatedTime: 20 } }),

    // Vestuário Infantil
    prisma.clothingItem.create({ data: { name: 'Camisa Infantil', category: 'Vestuário', subcategory: 'Infantil', priceWashIron: 10.00, priceIronOnly: 5.00, estimatedTime: 20 } }),
    prisma.clothingItem.create({ data: { name: 'Calça Infantil', category: 'Vestuário', subcategory: 'Infantil', priceWashIron: 12.00, priceIronOnly: 6.00, estimatedTime: 25 } }),
    prisma.clothingItem.create({ data: { name: 'Vestido Infantil', category: 'Vestuário', subcategory: 'Infantil', priceWashIron: 18.00, priceIronOnly: 10.00, estimatedTime: 30 } }),

    // Cama
    prisma.clothingItem.create({ data: { name: 'Lençol Solteiro', category: 'Cama', priceWashIron: 18.00, priceIronOnly: 10.00, estimatedTime: 25 } }),
    prisma.clothingItem.create({ data: { name: 'Lençol Casal', category: 'Cama', priceWashIron: 22.00, priceIronOnly: 12.00, estimatedTime: 30 } }),
    prisma.clothingItem.create({ data: { name: 'Lençol King/Queen', category: 'Cama', priceWashIron: 28.00, priceIronOnly: 15.00, estimatedTime: 35 } }),
    prisma.clothingItem.create({ data: { name: 'Fronha', category: 'Cama', priceWashIron: 6.00, priceIronOnly: 4.00, estimatedTime: 10 } }),
    prisma.clothingItem.create({ data: { name: 'Edredom Solteiro', category: 'Cama', priceWashIron: 35.00, priceIronOnly: 0, estimatedTime: 45 } }),
    prisma.clothingItem.create({ data: { name: 'Edredom Casal', category: 'Cama', priceWashIron: 45.00, priceIronOnly: 0, estimatedTime: 55 } }),
    prisma.clothingItem.create({ data: { name: 'Edredom King/Queen', category: 'Cama', priceWashIron: 55.00, priceIronOnly: 0, estimatedTime: 65 } }),
    prisma.clothingItem.create({ data: { name: 'Cobertor', category: 'Cama', priceWashIron: 30.00, priceIronOnly: 0, estimatedTime: 50 } }),
    prisma.clothingItem.create({ data: { name: 'Colcha', category: 'Cama', priceWashIron: 25.00, priceIronOnly: 15.00, estimatedTime: 40 } }),
    prisma.clothingItem.create({ data: { name: 'Capa de Travesseiro', category: 'Cama', priceWashIron: 8.00, priceIronOnly: 5.00, estimatedTime: 15 } }),

    // Mesa
    prisma.clothingItem.create({ data: { name: 'Toalha de Mesa Pequena', category: 'Mesa', priceWashIron: 20.00, priceIronOnly: 12.00, estimatedTime: 30 } }),
    prisma.clothingItem.create({ data: { name: 'Toalha de Mesa Média', category: 'Mesa', priceWashIron: 28.00, priceIronOnly: 15.00, estimatedTime: 35 } }),
    prisma.clothingItem.create({ data: { name: 'Toalha de Mesa Grande', category: 'Mesa', priceWashIron: 38.00, priceIronOnly: 20.00, estimatedTime: 45 } }),
    prisma.clothingItem.create({ data: { name: 'Guardanapo (cada)', category: 'Mesa', priceWashIron: 4.00, priceIronOnly: 2.00, estimatedTime: 10 } }),
    prisma.clothingItem.create({ data: { name: 'Caminho de Mesa', category: 'Mesa', priceWashIron: 15.00, priceIronOnly: 8.00, estimatedTime: 20 } }),
    prisma.clothingItem.create({ data: { name: 'Americano', category: 'Mesa', priceWashIron: 12.00, priceIronOnly: 6.00, estimatedTime: 15 } }),

    // Banho
    prisma.clothingItem.create({ data: { name: 'Toalha de Banho', category: 'Banho', priceWashIron: 12.00, priceIronOnly: 0, estimatedTime: 25 } }),
    prisma.clothingItem.create({ data: { name: 'Toalha de Rosto', category: 'Banho', priceWashIron: 6.00, priceIronOnly: 0, estimatedTime: 10 } }),
    prisma.clothingItem.create({ data: { name: 'Toalha de Piso', category: 'Banho', priceWashIron: 10.00, priceIronOnly: 0, estimatedTime: 20 } }),
    prisma.clothingItem.create({ data: { name: 'Roupão', category: 'Banho', priceWashIron: 25.00, priceIronOnly: 0, estimatedTime: 35 } }),

    // Especiais
    prisma.clothingItem.create({ data: { name: 'Cortina Simples', category: 'Especiais', subcategory: 'Cortinas', priceWashIron: 35.00, priceIronOnly: 0, estimatedTime: 45 } }),
    prisma.clothingItem.create({ data: { name: 'Cortina com Forro', category: 'Especiais', subcategory: 'Cortinas', priceWashIron: 50.00, priceIronOnly: 0, estimatedTime: 60 } }),
    prisma.clothingItem.create({ data: { name: 'Tapete Pequeno', category: 'Especiais', subcategory: 'Tapetes', priceWashIron: 25.00, priceIronOnly: 0, estimatedTime: 30 } }),
    prisma.clothingItem.create({ data: { name: 'Tapete Médio', category: 'Especiais', subcategory: 'Tapetes', priceWashIron: 40.00, priceIronOnly: 0, estimatedTime: 40 } }),
    prisma.clothingItem.create({ data: { name: 'Tapete Grande', category: 'Especiais', subcategory: 'Tapetes', priceWashIron: 60.00, priceIronOnly: 0, estimatedTime: 55 } }),
    prisma.clothingItem.create({ data: { name: 'Travesseiro', category: 'Especiais', subcategory: 'Travesseiros', priceWashIron: 20.00, priceIronOnly: 0, estimatedTime: 30 } }),
    prisma.clothingItem.create({ data: { name: 'Bicho de Pelúcia', category: 'Especiais', subcategory: 'Outros', priceWashIron: 20.00, priceIronOnly: 0, estimatedTime: 25 } }),
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
