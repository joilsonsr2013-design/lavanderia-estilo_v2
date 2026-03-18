// ============ AUTH ============
export interface AuthEmployee {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  department?: string;
}

// ============ CUSTOMER ============
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
  preferences?: { fragranceAversion?: boolean; notes?: string };
  createdAt?: string;
  updatedAt?: string;
  _count?: { orders: number };
}

// ============ BRAND ============
export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: { orderItems: number };
}

// ============ CATEGORY ============
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: { products: number };
}

// ============ PRODUCT / INVENTORY ============
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  washAndIronPrice?: number;
  ironOnlyPrice?: number;
  dryCleanPrice?: number;
  stock: number;
  minStock: number;
  categoryId?: string;
  category?: Category;
  unit?: string;
  isLowStock?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============ ORDER ============
export enum OrderStatus {
  PENDING        = 'PENDING',
  CLASSIFICATION = 'CLASSIFICATION',
  WASHING        = 'WASHING',
  DRYING         = 'DRYING',
  IRONING        = 'IRONING',
  INSPECTION     = 'INSPECTION',
  PACKAGING      = 'PACKAGING',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  DELIVERED      = 'DELIVERED',
  CANCELLED      = 'CANCELLED',
}

export enum OrderPriority {
  LOW    = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH   = 'HIGH',
  URGENT = 'URGENT',
}

export enum FabricType {
  COTTON    = 'Algodão',
  SYNTHETIC = 'Sintético',
  WOOL      = 'Lã',
  SILK      = 'Seda',
  LINEN     = 'Linho',
  DELICATE  = 'Delicado',
}

export enum ItemColor {
  WHITE    = 'Branco',
  LIGHT    = 'Claro',
  DARK     = 'Escuro',
  COLORFUL = 'Colorido',
}

export enum DirtLevel {
  LIGHT  = 'Leve',
  MEDIUM = 'Médio',
  HEAVY  = 'Pesado',
}

export interface OrderItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  serviceType?: string;
  brandId?: string;
  brand?: Brand;
  color?: string;
  fabric?: string;
  dirtLevel?: string;
  damageNotes?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  status: OrderStatus;
  priority?: OrderPriority;
  totalAmount: number;
  description?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  production?: Production[];
}

// ============ PRODUCTION ============
export enum ProductionStatus {
  PENDING       = 'PENDING',
  IN_PROGRESS   = 'IN_PROGRESS',
  QUALITY_CHECK = 'QUALITY_CHECK',
  COMPLETED     = 'COMPLETED',
  ON_HOLD       = 'ON_HOLD',
}

export interface Production {
  id: string;
  orderId: string;
  order?: Order;
  status: ProductionStatus;
  assignedTo?: string;
  employee?: Employee;
  startDate?: string;
  endDate?: string;
  notes?: string;
  stage?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============ EMPLOYEE ============
export enum EmployeeRole {
  ADMIN   = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF   = 'STAFF',
}

export enum EmployeeStatus {
  ACTIVE   = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  department?: string;
  hireDate?: string;
  salary?: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: { production: number; timeRecords: number };
}

// ============ TIME RECORDS ============
export enum TimeRecordType {
  CLOCK_IN  = 'CLOCK_IN',
  CLOCK_OUT = 'CLOCK_OUT',
}

export interface TimeRecord {
  id: string;
  employeeId: string;
  employee?: { id: string; name: string; role?: string; department?: string };
  type: TimeRecordType;
  timestamp: string;
  notes?: string;
}

// ============ FINANCIAL ============
export interface FinancialTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description?: string;
  date: string;
  paymentMethod?: string;
  orderId?: string;
}

export interface FinancialSummary {
  income: number;
  expenses: number;
  balance: number;
  byCategory: { category: string; income: number; expense: number }[];
}

// ============ DASHBOARD ============
export interface DashboardStats {
  totals: {
    customers: number;
    orders: number;
    products: number;
    employees: number;
    revenue30Days: number;
  };
  orders: {
    pending: number;
    inProduction: number;
    completed: number;
    byStatus: { status: string; count: number; label: string }[];
  };
  inventory: { lowStock: number; products: Product[] };
  production: { active: number };
  recentOrders: Order[];
}

// ============ SETTINGS ============
export type Settings = Record<string, string>;

// ============ NAVIGATION ============
export interface NavigationItem {
  name: string;
  path: string;
  icon: React.ElementType;
  roles?: ('ADMIN' | 'MANAGER' | 'STAFF')[];
  badge?: number;
}

// ============ WORKFLOW ============
export interface WorkflowStage {
  id: OrderStatus;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}
