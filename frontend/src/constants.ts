import { OrderStatus, OrderPriority, WorkflowStage } from './types';

export const APP_NAME = 'Lavanderia Eficiente';

export const WORKFLOW_STAGES: WorkflowStage[] = [
  { id: OrderStatus.PENDING,            label: 'Recepção',          description: 'Recebimento e cadastro das peças.',         color: 'text-gray-600',   bgColor: 'bg-gray-100' },
  { id: OrderStatus.CLASSIFICATION,     label: 'Classificação',     description: 'Separação por tipo, cor e sujidade.',       color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { id: OrderStatus.WASHING,            label: 'Lavagem',           description: 'Processo de lavagem.',                      color: 'text-blue-600',   bgColor: 'bg-blue-100' },
  { id: OrderStatus.DRYING,             label: 'Secagem',           description: 'Processo de secagem.',                      color: 'text-cyan-600',   bgColor: 'bg-cyan-100' },
  { id: OrderStatus.IRONING,            label: 'Passadoria',        description: 'Passadoria e finalização das peças.',        color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { id: OrderStatus.INSPECTION,         label: 'Inspeção',          description: 'Verificação final de qualidade.',           color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { id: OrderStatus.PACKAGING,          label: 'Embalagem',         description: 'Embalagem para entrega.',                   color: 'text-teal-600',   bgColor: 'bg-teal-100' },
  { id: OrderStatus.READY_FOR_DELIVERY, label: 'Pronto p/ Entrega', description: 'Aguardando retirada ou envio.',             color: 'text-green-600',  bgColor: 'bg-green-100' },
  { id: OrderStatus.DELIVERED,          label: 'Entregue',          description: 'Pedido entregue ao cliente.',               color: 'text-emerald-600',bgColor: 'bg-emerald-100' },
  { id: OrderStatus.CANCELLED,          label: 'Cancelado',         description: 'Pedido cancelado.',                        color: 'text-red-600',    bgColor: 'bg-red-100' },
];

export const STATUS_LABEL: Record<OrderStatus, string> = Object.fromEntries(
  WORKFLOW_STAGES.map(s => [s.id, s.label])
) as Record<OrderStatus, string>;

export const STATUS_COLOR: Record<OrderStatus, string> = Object.fromEntries(
  WORKFLOW_STAGES.map(s => [s.id, s.color])
) as Record<OrderStatus, string>;

export const STATUS_BG: Record<OrderStatus, string> = Object.fromEntries(
  WORKFLOW_STAGES.map(s => [s.id, s.bgColor])
) as Record<OrderStatus, string>;

export const PRIORITY_LABEL: Record<OrderPriority, string> = {
  [OrderPriority.LOW]:    'Baixa',
  [OrderPriority.MEDIUM]: 'Normal',
  [OrderPriority.HIGH]:   'Alta',
  [OrderPriority.URGENT]: 'Urgente',
};

export const PRIORITY_COLOR: Record<OrderPriority, string> = {
  [OrderPriority.LOW]:    'text-gray-500 bg-gray-100',
  [OrderPriority.MEDIUM]: 'text-blue-600 bg-blue-100',
  [OrderPriority.HIGH]:   'text-orange-600 bg-orange-100',
  [OrderPriority.URGENT]: 'text-red-600 bg-red-100',
};

export const ROLE_LABEL: Record<string, string> = {
  ADMIN:   'Administrador',
  MANAGER: 'Gerente',
  STAFF:   'Funcionário',
};

export const EMPLOYEE_STATUS_LABEL: Record<string, string> = {
  ACTIVE:   'Ativo',
  INACTIVE: 'Inativo',
  ON_LEAVE: 'Em Licença',
};

export const PRODUCTION_STATUS_LABEL: Record<string, string> = {
  PENDING:       'Pendente',
  IN_PROGRESS:   'Em Andamento',
  QUALITY_CHECK: 'Controle de Qualidade',
  COMPLETED:     'Concluído',
  ON_HOLD:       'Pausado',
};

export const INCOME_CATEGORIES = ['Serviços', 'Adiantamento', 'Reembolso', 'Outros'];
export const EXPENSE_CATEGORIES = ['Insumos', 'Salários', 'Utilidades', 'Manutenção', 'Aluguel', 'Marketing', 'Outros'];
export const PAYMENT_METHODS = ['Dinheiro', 'PIX', 'Cartão de Débito', 'Cartão de Crédito', 'Transferência', 'Boleto', 'Faturamento'];

export const FABRIC_TYPES = ['Algodão', 'Sintético', 'Lã', 'Seda', 'Linho', 'Delicado'];
export const DIRT_LEVELS  = ['Leve', 'Médio', 'Pesado'];

// Status flow: which statuses can follow which
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.PENDING]:            OrderStatus.CLASSIFICATION,
  [OrderStatus.CLASSIFICATION]:     OrderStatus.WASHING,
  [OrderStatus.WASHING]:            OrderStatus.DRYING,
  [OrderStatus.DRYING]:             OrderStatus.IRONING,
  [OrderStatus.IRONING]:            OrderStatus.INSPECTION,
  [OrderStatus.INSPECTION]:         OrderStatus.PACKAGING,
  [OrderStatus.PACKAGING]:          OrderStatus.READY_FOR_DELIVERY,
  [OrderStatus.READY_FOR_DELIVERY]: OrderStatus.DELIVERED,
};

export const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.PENDING]:            'Iniciar Classificação',
  [OrderStatus.CLASSIFICATION]:     'Enviar p/ Lavagem',
  [OrderStatus.WASHING]:            'Enviar p/ Secagem',
  [OrderStatus.DRYING]:             'Enviar p/ Passadoria',
  [OrderStatus.IRONING]:            'Enviar p/ Inspeção',
  [OrderStatus.INSPECTION]:         'Enviar p/ Embalagem',
  [OrderStatus.PACKAGING]:          'Marcar Pronto',
  [OrderStatus.READY_FOR_DELIVERY]: 'Marcar como Entregue',
};

export const FINAL_STATUSES = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];
