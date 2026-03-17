export const formatCurrency = (val: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

export const formatDate = (date: string | Date, opts?: Intl.DateTimeFormatOptions): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR', opts || { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const formatTime = (date: string | Date): string => {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const truncate = (str: string, len = 40): string =>
  str?.length > len ? str.slice(0, len) + '...' : str || '';

export const classNames = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ');

export const isOverdue = (dueDate?: string | null): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const daysUntil = (date?: string | null): number | null => {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
