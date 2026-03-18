# Análise e Alterações - Lavanderia Estilo v2.0

## 📊 Resumo Executivo

Este documento descreve a análise realizada no projeto **Lavanderia Estilo v2.0** e as alterações implementadas para incluir **ordens de serviço ativas** na tela de detalhes do cliente no dashboard.

---

## 🔍 Análise da Estrutura Existente

### Arquitetura do Projeto

O projeto segue uma arquitetura **monorepo** com separação clara entre frontend e backend:

```
lavanderia-estilo_v2/
├── backend/          # Node.js + Express + Prisma ORM
├── frontend/         # React + TypeScript + Tailwind CSS
└── docker-compose.yaml
```

### Stack Tecnológico

| Componente | Tecnologia | Versão |
|---|---|---|
| **Backend** | Node.js + Express | 18+ |
| **ORM** | Prisma | Última |
| **Banco de Dados** | PostgreSQL | 16 |
| **Frontend** | React | 18 |
| **Build Tool** | Vite | Última |
| **Styling** | Tailwind CSS | CDN |
| **Autenticação** | JWT | Bearer Token |

### Modelo de Dados

O banco de dados possui as seguintes entidades principais:

#### **Customer** (Clientes)
- `id`: UUID (chave primária)
- `name`: String (nome do cliente)
- `email`: String (único)
- `phone`: String
- `address`: String (opcional)
- `notes`: String (observações)
- `preferences`: JSON (preferências do cliente)
- `createdAt`, `updatedAt`: Timestamps
- **Relacionamento**: Um cliente pode ter múltiplas ordens (`orders`)

#### **Order** (Ordens de Serviço)
- `id`: UUID (chave primária)
- `orderNumber`: String (número único da ordem)
- `customerId`: String (FK para Customer)
- `status`: Enum (PENDING, CLASSIFICATION, WASHING, DRYING, IRONING, INSPECTION, PACKAGING, READY_FOR_DELIVERY, DELIVERED, CANCELLED)
- `priority`: Enum (LOW, MEDIUM, HIGH, URGENT)
- `totalAmount`: Float (valor total)
- `description`: String (descrição)
- `dueDate`: DateTime (data de vencimento)
- `createdAt`, `updatedAt`: Timestamps
- **Relacionamentos**: 
  - Pertence a um Cliente (`customer`)
  - Contém múltiplos itens (`items`)
  - Possui registros de produção (`production`)

#### **OrderItem** (Itens da Ordem)
- Detalhes dos itens dentro de uma ordem
- Inclui informações sobre tipo de tecido, cor, nível de sujidade, etc.

#### **Production** (Produção)
- Rastreia o progresso de produção de cada ordem
- Vinculado a um funcionário responsável
- Possui status próprio (PENDING, IN_PROGRESS, QUALITY_CHECK, COMPLETED, ON_HOLD)

### API Backend

#### Endpoints de Clientes

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/customers` | Lista todos os clientes (com busca) |
| GET | `/api/customers/:id` | Obtém detalhes de um cliente (inclui últimas 10 ordens) |
| POST | `/api/customers` | Cria novo cliente |
| PUT | `/api/customers/:id` | Atualiza cliente |
| DELETE | `/api/customers/:id` | Deleta cliente |

**Importante**: O endpoint `GET /api/customers/:id` já retorna as ordens do cliente, incluindo itens e detalhes de produção.

### Frontend - Componentes e Contextos

#### **CustomersView.tsx** (Tela de Clientes)
- Exibe lista de clientes em grid responsivo
- Permite buscar, criar, editar e deletar clientes
- Modal para criar/editar cliente

#### **AppContext.tsx** (Contexto Global)
- Gerencia estado global da aplicação
- Armazena lista de clientes e funções de refresh
- Disponibiliza dados para toda a aplicação

#### **Componentes UI**
- `Card`: Container com estilo padronizado
- `Button`: Botão com variantes (primary, outline, ghost, danger)
- `Badge`: Etiqueta de status
- `Modal`: Diálogo modal
- `Input`, `Textarea`: Campos de formulário
- `LoadingState`, `EmptyState`: Estados vazios e de carregamento

---

## ✨ Alterações Implementadas

### 1. Atualização de CustomersView.tsx

#### **Objetivo**
Adicionar uma tela de detalhes do cliente que mostra:
- Informações completas de cadastro
- **Ordens de serviço ativas** (não entregues/canceladas)
- Histórico de pedidos recentes

#### **Mudanças Principais**

##### **a) Novo Estado para Detalhes do Cliente**
```typescript
const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
const [loadingDetails, setLoadingDetails] = useState(false);
const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
```

##### **b) Função para Carregar Detalhes**
```typescript
const handleSelectCustomer = async (customer: Customer) => {
  setSelectedCustomer(customer);
  setLoadingDetails(true);
  try {
    const details = await customersApi.get(customer.id);
    setCustomerOrders(details.orders || []);
  } catch (err) {
    console.error('Erro ao carregar detalhes do cliente:', err);
  } finally {
    setLoadingDetails(false);
  }
};
```

Esta função:
- Define o cliente selecionado
- Faz uma chamada à API para obter detalhes completos
- Armazena as ordens do cliente
- Trata erros e estado de carregamento

##### **c) Filtro de Ordens Ativas vs. Concluídas**
```typescript
const activeOrders = customerOrders.filter(o => !FINAL_STATUSES.includes(o.status));
const pastOrders = customerOrders.filter(o => FINAL_STATUSES.includes(o.status));
```

Usa a constante `FINAL_STATUSES` do arquivo `constants.ts`:
```typescript
export const FINAL_STATUSES = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];
```

##### **d) Interface de Detalhes do Cliente**

A tela de detalhes exibe em um layout de 3 colunas (responsivo):

**Coluna 1 (Informações de Cadastro)**
- Nome do cliente
- E-mail com ícone
- Telefone com ícone
- Endereço com ícone
- Observações (se houver)
- Data de cadastro
- Botão para editar

**Coluna 2-3 (Ordens de Serviço)**
- **Seção: Ordens Ativas**
  - Lista de pedidos em andamento
  - Para cada pedido:
    - Número da ordem (#XXXXX)
    - Data de criação
    - Valor total em moeda
    - Status com cor e ícone
  - Estado vazio se não houver pedidos ativos

- **Seção: Histórico Recente**
  - Últimos 5 pedidos concluídos/cancelados
  - Formato mais compacto (estilo dashed)
  - Número, data, valor e status

##### **e) Navegação de Volta**
- Botão "Voltar" com ícone `ArrowLeftIcon` para retornar à lista de clientes
- Mantém o estado da busca anterior

#### **Ícone Adicionado**

Novo ícone `ArrowLeftIcon` adicionado em `frontend/src/components/icons/index.tsx`:
```typescript
export const ArrowLeftIcon = (p: any) => <I {...p}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></I>;
```

### 2. Interatividade da Lista de Clientes

#### **Antes**
- Clientes exibidos em cards estáticos
- Apenas botões de editar e deletar disponíveis

#### **Depois**
- Cards agora são **clicáveis**
- Ao clicar em um cliente, abre a tela de detalhes
- Mantém a funcionalidade de editar/deletar (com `event.stopPropagation()`)
- Visual feedback com borda esquerda animada ao hover

```typescript
<Card 
  onClick={() => handleSelectCustomer(c)} 
  className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-brand-500"
>
```

---

## 🎯 Fluxo de Uso

### Cenário 1: Visualizar Detalhes de um Cliente

1. Usuário acessa a tela de Clientes
2. Clica em um card de cliente
3. Sistema carrega os detalhes via API
4. Tela exibe:
   - Informações de cadastro na esquerda
   - Ordens ativas no centro/direita
   - Histórico de pedidos abaixo

### Cenário 2: Editar Cliente a partir dos Detalhes

1. Usuário está na tela de detalhes
2. Clica no botão "Editar"
3. Modal abre com dados preenchidos
4. Após salvar, volta à tela de detalhes
5. Dados são atualizados

### Cenário 3: Voltar à Lista

1. Usuário clica no botão "Voltar"
2. Retorna à lista de clientes
3. Mantém a busca anterior (se houver)

---

## 🔄 Fluxo de Dados

```
CustomersView (Lista)
    ↓ (click em cliente)
    ↓
handleSelectCustomer()
    ↓
customersApi.get(id) → Backend: GET /api/customers/:id
    ↓
Backend retorna: Customer + orders[]
    ↓
setCustomerOrders(orders)
    ↓
Renderiza tela de detalhes com:
  - Informações do cliente
  - Ordens ativas (filtered)
  - Histórico recente (filtered)
```

---

## 📝 Imports Utilizados

### CustomersView.tsx
```typescript
import { STATUS_LABEL, STATUS_BG, STATUS_COLOR, FINAL_STATUSES } from '../constants';
import { formatDate, formatCurrency } from '../utils/helpers';
import { ArrowLeftIcon, CalendarIcon, PackageIcon, InfoIcon } from '../components/icons';
```

### Novos Ícones Utilizados
- `ArrowLeftIcon`: Botão voltar
- `CalendarIcon`: Data da ordem
- `PackageIcon`: Ícone de pedido
- `InfoIcon`: Título de informações

---

## 🧪 Testes Recomendados

### Testes Unitários
1. **Filtro de Ordens Ativas**
   - Verificar se apenas ordens com status != DELIVERED/CANCELLED aparecem
   
2. **Carregamento de Detalhes**
   - Simular erro na API
   - Verificar estado de loading
   - Validar dados retornados

### Testes de Integração
1. **Fluxo Completo**
   - Clicar em cliente → Carregar detalhes → Voltar → Verificar estado
   
2. **Edição a partir de Detalhes**
   - Abrir detalhes → Editar → Salvar → Verificar atualização

3. **Responsividade**
   - Desktop (3 colunas)
   - Tablet (2 colunas)
   - Mobile (1 coluna)

### Testes de Performance
1. Verificar tempo de carregamento com muitas ordens
2. Implementar paginação se necessário

---

## 🚀 Próximas Melhorias Sugeridas

### 1. **Paginação de Ordens**
Se um cliente tiver muitas ordens, adicionar paginação:
```typescript
const [page, setPage] = useState(1);
const ordersPerPage = 10;
const paginatedOrders = activeOrders.slice((page - 1) * ordersPerPage, page * ordersPerPage);
```

### 2. **Filtros Avançados**
- Filtrar ordens por status
- Filtrar por data (últimos 30 dias, etc.)
- Filtrar por valor

### 3. **Ações Rápidas**
- Botão para criar nova ordem para o cliente
- Botão para visualizar detalhes da ordem
- Botão para imprimir recibo

### 4. **Gráficos**
- Gráfico de ordens por status
- Gráfico de valor gasto ao longo do tempo
- Estatísticas de cliente (total gasto, número de ordens, etc.)

### 5. **Exportação**
- Exportar histórico de pedidos em PDF/CSV
- Gerar relatório de cliente

### 6. **Notificações**
- Alertar quando uma ordem do cliente está pronta
- Notificar atraso em entrega

---

## 📦 Arquivos Modificados

| Arquivo | Tipo | Alteração |
|---|---|---|
| `frontend/src/views/CustomersView.tsx` | Modificado | +153 linhas, -9 linhas |
| `frontend/src/components/icons/index.tsx` | Modificado | +1 ícone (ArrowLeftIcon) |

---

## 🔧 Como Executar Localmente

### Pré-requisitos
```bash
Node.js 18+
Docker e Docker Compose
```

### 1. Banco de Dados
```bash
cd lavanderia-estilo_v2
docker-compose up -d
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL se necessário (padrão funciona com docker-compose)

npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Backend disponível em: `http://localhost:3001`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend disponível em: `http://localhost:5173`

### 4. Login
Use as credenciais padrão:
- **Email**: admin@lavanderia.com
- **Senha**: senha123

---

## 📊 Estatísticas de Mudança

- **Linhas adicionadas**: 153
- **Linhas removidas**: 9
- **Arquivos modificados**: 2
- **Commits**: 1

---

## ✅ Checklist de Implementação

- [x] Análise da estrutura existente
- [x] Identificação de pontos de alteração
- [x] Implementação da tela de detalhes
- [x] Filtro de ordens ativas
- [x] Adição de novo ícone
- [x] Testes de navegação
- [x] Commit e push para GitHub
- [x] Documentação completa

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se o backend está rodando em `http://localhost:3001`
2. Verifique se o banco de dados está acessível
3. Limpe o cache do navegador (Ctrl+Shift+Delete)
4. Verifique os logs do console (F12)

---

**Última atualização**: 17 de Março de 2026
**Versão**: 2.0.1
