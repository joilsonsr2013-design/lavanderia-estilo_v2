# 🫧 Lavanderia Eficiente — Sistema ERP v2.0

Sistema ERP completo para lavanderia e passadoria com backend Node.js/Express/Prisma e frontend React/TypeScript.

## 📋 Funcionalidades

### Por Perfil de Acesso

| Módulo | Admin | Gerente | Funcionário |
|---|---|---|---|
| Dashboard com estatísticas | ✓ | ✓ | ✗ |
| Clientes (CRUD) | ✓ | ✓ | Visualizar |
| Ordens de Serviço | ✓ | ✓ | ✓ |
| Avançar status de ordens | ✓ | ✓ | ✓ |
| Produção (kanban/lista) | ✓ | ✓ | Visualizar |
| Estoque | ✓ | ✓ | Visualizar |
| Financeiro | ✓ | ✓ | ✗ |
| Funcionários | ✓ | Visualizar | ✗ |
| Folha de Ponto | ✓ | Equipe | Própria |
| Configurações | ✓ | ✗ | ✗ |

### Fluxo de Pedido (Workflow)
Recepção → Classificação → Lavagem → Secagem → Passadoria → Inspeção → Embalagem → Pronto p/ Entrega → Entregue

---

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose (para o banco)

### 1. Banco de Dados
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL no .env se necessário

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

---

## 🔑 Credenciais Padrão (após seed)

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@lavanderia.com | senha123 |
| Gerente | gerente@lavanderia.com | senha123 |
| Funcionário | ana@lavanderia.com | senha123 |

**⚠️ Altere as senhas em produção!**

---

## 📁 Estrutura do Projeto

```
lavanderia/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Schema do banco de dados
│   │   └── seed.ts            # Dados iniciais
│   ├── src/
│   │   ├── lib/prisma.ts      # Cliente Prisma
│   │   ├── middleware/auth.ts  # JWT + Role guard
│   │   └── routes/            # Endpoints da API
│   │       ├── auth.ts        # Login, me, change-password
│   │       ├── customers.ts
│   │       ├── orders.ts      # + PATCH status
│   │       ├── products.ts    # + PATCH stock
│   │       ├── production.ts
│   │       ├── employees.ts
│   │       ├── timeRecords.ts # + summary
│   │       ├── transactions.ts # + summary
│   │       ├── settings.ts
│   │       └── dashboard.ts
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── icons/index.tsx
│   │   │   ├── ui.tsx         # Button, Card, Input, Modal, Badge...
│   │   │   ├── Sidebar.tsx    # Nav condicional por role
│   │   │   └── Layout.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx # JWT auth state
│   │   │   └── AppContext.tsx  # Dados globais
│   │   ├── services/api.ts     # Todas as chamadas à API
│   │   ├── views/             # Todas as telas
│   │   │   ├── LoginView.tsx
│   │   │   ├── DashboardView.tsx
│   │   │   ├── CustomersView.tsx
│   │   │   ├── OrdersView.tsx  # Criação + workflow
│   │   │   ├── ProductionView.tsx # Kanban + lista
│   │   │   ├── InventoryView.tsx
│   │   │   ├── FinanceView.tsx
│   │   │   ├── EmployeesView.tsx
│   │   │   ├── TimeClockView.tsx
│   │   │   ├── SettingsView.tsx
│   │   │   └── DocumentationView.tsx
│   │   ├── types.ts
│   │   ├── constants.ts       # Labels, cores, workflow
│   │   └── App.tsx            # Router + route guards
│   └── .env
└── docker-compose.yaml
```

---

## 🔐 Segurança

- Autenticação via JWT (Bearer token, 8h de validade)
- Senhas com bcrypt (salt 10)
- Middleware de autorização por role em todas as rotas sensíveis
- CORS configurado para desenvolvimento local

## 🛠 Tecnologias

**Backend:** Node.js, Express, Prisma ORM, PostgreSQL, JWT, bcryptjs, TypeScript

**Frontend:** React 18, React Router v6, TypeScript, Tailwind CSS (CDN), Vite
