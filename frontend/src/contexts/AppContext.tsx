import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { customersApi, ordersApi, productsApi, employeesApi, brandsApi, categoriesApi } from '../services/api';
import { useAuth } from './AuthContext';
import type { Customer, Order, Product, Employee, Brand, Category } from '../types';

interface AppContextType {
  customers: Customer[];
  orders: Order[];
  inventory: Product[];
  employees: Employee[];
  brands: Brand[];
  categories: Category[];
  loadingCustomers: boolean;
  loadingOrders: boolean;
  loadingInventory: boolean;
  loadingEmployees: boolean;
  loadingBrands: boolean;
  loadingCategories: boolean;
  refreshCustomers: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  refreshEmployees: () => Promise<void>;
  refreshBrands: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, canManage } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const refreshCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    try { setCustomers(await customersApi.list()); } catch {} finally { setLoadingCustomers(false); }
  }, []);

  const refreshOrders = useCallback(async () => {
    setLoadingOrders(true);
    try { setOrders(await ordersApi.list()); } catch {} finally { setLoadingOrders(false); }
  }, []);

  const refreshInventory = useCallback(async () => {
    setLoadingInventory(true);
    try { setInventory(await productsApi.list()); } catch {} finally { setLoadingInventory(false); }
  }, []);

  const refreshEmployees = useCallback(async () => {
    if (!canManage) return;
    setLoadingEmployees(true);
    try { setEmployees(await employeesApi.list()); } catch {} finally { setLoadingEmployees(false); }
  }, [canManage]);

  const refreshBrands = useCallback(async () => {
    setLoadingBrands(true);
    try { setBrands(await brandsApi.list()); } catch {} finally { setLoadingBrands(false); }
  }, []);

  const refreshCategories = useCallback(async () => {
    setLoadingCategories(true);
    try { setCategories(await categoriesApi.list()); } catch {} finally { setLoadingCategories(false); }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshCustomers(), refreshOrders(), refreshInventory(), refreshEmployees(), refreshBrands(), refreshCategories()]);
  }, [refreshCustomers, refreshOrders, refreshInventory, refreshEmployees, refreshBrands, refreshCategories]);

  useEffect(() => {
    if (user) { refreshAll(); }
  }, [user]);

  return (
    <AppContext.Provider value={{
      customers, orders, inventory, employees, brands, categories,
      loadingCustomers, loadingOrders, loadingInventory, loadingEmployees, loadingBrands, loadingCategories,
      refreshCustomers, refreshOrders, refreshInventory, refreshEmployees, refreshBrands, refreshCategories, refreshAll
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
