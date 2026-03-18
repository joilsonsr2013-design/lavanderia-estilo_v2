import React, { useState, useRef, useEffect } from 'react';
import { XIcon, AlertIcon, InfoIcon, CheckIcon, SearchIcon, ChevronDownIcon } from './icons';

// ============ SPINNER ============
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <div className={`animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 ${sizes[size]} ${className}`} />
  );
};

// ============ BUTTON ============
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ElementType;
  iconRight?: React.ElementType;
}
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', isLoading, icon: Icon, iconRight: IconRight,
  children, className = '', disabled, ...props
}) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 gap-2';
  const variants = {
    primary:   'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-sm',
    secondary: 'bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-500 shadow-sm',
    outline:   'border-2 border-brand-600 text-brand-600 hover:bg-brand-50 focus:ring-brand-400',
    ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus:ring-slate-300',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
  };
  const sizes = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-base px-6 py-3' };
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {isLoading ? <Spinner size="sm" /> : Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      {children}
      {IconRight && !isLoading && <IconRight className="h-4 w-4 shrink-0" />}
    </button>
  );
};

// ============ CARD ============
interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  onClick?: () => void;
}
export const Card: React.FC<CardProps> = ({ title, subtitle, action, children, className = '', padding = true, onClick }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${padding ? 'p-5' : ''} ${className}`} onClick={onClick}>
    {(title || action) && (
      <div className="flex items-center justify-between mb-4">
        <div>
          {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);

// ============ INPUT ============
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  icon?: React.ElementType;
}
export const Input: React.FC<InputProps> = ({ label, error, containerClassName = '', icon: Icon, className = '', ...props }) => (
  <div className={`space-y-1 ${containerClassName}`}>
    {label && <label className="block text-sm font-semibold text-slate-700">{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />}
      <input
        className={`w-full rounded-xl border ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-brand-400'} bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${Icon ? 'pl-9' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ============ SELECT ============
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}
export const Select: React.FC<SelectProps> = ({ label, error, containerClassName = '', options, placeholder, className = '', ...props }) => (
  <div className={`space-y-1 ${containerClassName}`}>
    {label && <label className="block text-sm font-semibold text-slate-700">{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>}
    <select
      className={`w-full rounded-xl border ${error ? 'border-red-400' : 'border-slate-200'} bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ============ TEXTAREA ============
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}
export const Textarea: React.FC<TextareaProps> = ({ label, error, containerClassName = '', className = '', ...props }) => (
  <div className={`space-y-1 ${containerClassName}`}>
    {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}
    <textarea
      rows={3}
      className={`w-full rounded-xl border ${error ? 'border-red-400' : 'border-slate-200'} bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition resize-none ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ============ MODAL ============
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-fade-in`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition"><XIcon className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">{children}</div>
        {footer && <div className="flex justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
};

// ============ BADGE ============
interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}
export const Badge: React.FC<BadgeProps> = ({ children, color = 'bg-slate-100 text-slate-600', className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color} ${className}`}>
    {children}
  </span>
);

// ============ ALERT ============
interface AlertProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  message: string;
  className?: string;
}
export const Alert: React.FC<AlertProps> = ({ type = 'error', message, className = '' }) => {
  const styles = {
    error:   'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info:    'bg-blue-50 text-blue-700 border-blue-200',
  };
  const icons = { error: AlertIcon, success: CheckIcon, warning: AlertIcon, info: InfoIcon };
  const Icon = icons[type];
  return (
    <div className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${styles[type]} ${className}`}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

// ============ EMPTY STATE ============
export const EmptyState: React.FC<{ message: string; icon?: React.ElementType; action?: React.ReactNode }> = ({ message, icon: Icon, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {Icon && <Icon className="h-12 w-12 text-slate-300 mb-3" />}
    <p className="text-sm text-slate-500 mb-4">{message}</p>
    {action}
  </div>
);

// ============ LOADING STATE ============
export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <Spinner size="lg" />
    <p className="text-sm text-slate-500">{message}</p>
  </div>
);

// ============ STAT CARD ============
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  trend?: { value: number; label: string };
  onClick?: () => void;
}
export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'bg-brand-600', trend, onClick }) => (
  <div
    className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
      <div className={`${color} p-3 rounded-2xl`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

// ============ SEARCHABLE SELECT ============
export interface SearchableSelectOption {
  value: string;
  label: string;
}

export interface SearchableSelectGroup {
  label: string;
  options: SearchableSelectOption[];
}

interface SearchableSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options?: SearchableSelectOption[];
  groups?: SearchableSelectGroup[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  containerClassName?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  groups,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  required,
  disabled,
  containerClassName = '',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Find selected label
  const selectedLabel = (() => {
    if (options) {
      const opt = options.find(o => o.value === value);
      return opt?.label || '';
    }
    if (groups) {
      for (const group of groups) {
        const opt = group.options.find(o => o.value === value);
        if (opt) return opt.label;
      }
    }
    return '';
  })();

  // Filter options/groups based on search
  const filteredGroups = (() => {
    if (!groups) return [];
    const lowerSearch = search.toLowerCase();
    return groups
      .map(group => ({
        ...group,
        options: group.options.filter(opt =>
          opt.label.toLowerCase().includes(lowerSearch)
        ),
      }))
      .filter(group => group.options.length > 0);
  })();

  const filteredOptions = (() => {
    if (!options) return [];
    const lowerSearch = search.toLowerCase();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(lowerSearch)
    );
  })();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`space-y-1 ${containerClassName}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between rounded-xl border ${disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50 cursor-pointer hover:border-slate-300'} border-slate-200 px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition ${className}`}
        >
          <span className={selectedLabel ? 'text-slate-800' : 'text-slate-400'}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
            {/* Search input */}
            <div className="relative border-b border-slate-100">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-sm focus:outline-none"
                autoFocus
              />
            </div>

            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {/* Clear option */}
              {!required && (
                <button
                  type="button"
                  onClick={() => handleSelect('')}
                  className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 italic"
                >
                  {placeholder}
                </button>
              )}

              {/* Groups */}
              {filteredGroups.length > 0 && filteredGroups.map(group => (
                <div key={group.label}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase bg-slate-50 border-t border-slate-100 first:border-t-0">
                    {group.label}
                  </div>
                  {group.options.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-brand-50 ${opt.value === value ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-700'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ))}

              {/* Simple options */}
              {filteredOptions.length > 0 && filteredOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-brand-50 ${opt.value === value ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-700'}`}
                >
                  {opt.label}
                </button>
              ))}

              {/* No results */}
              {search && filteredGroups.length === 0 && filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-sm text-slate-500 text-center">
                  Nenhum resultado encontrado
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
