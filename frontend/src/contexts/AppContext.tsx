import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { customersApi, ordersApi, productsApi, employeesApi, clothingItemsApi, brandsApi, colorsApi } from '../services/api';
import { useAuth } from './AuthContext';
import type { Customer, Order, Product, Employee, ClothingItem, Brand, Color } from '../types';

interface AppContextType {
  customers: Customer[];
  orders: Order[];
  inventory: Product[];
  employees: Employee[];
  clothingItems: ClothingItem[];
  brands: Brand[];
  colors: Color[];
  loadingCustomers: boolean;
  loadingOrders: boolean;
  loadingInventory: boolean;
  loadingEmployees: boolean;
  loadingClothingItems: boolean;
  loadingBrands: boolean;
  loadingColors: boolean;
  refreshCustomers: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  refreshEmployees: () => Promise<void>;
  refreshClothingItems: () => Promise<void>;
  refreshBrands: () => Promise<void>;
  refreshColors: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, canManage } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingClothingItems, setLoadingClothingItems] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingColors, setLoadingColors] = useState(false);

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

  const refreshClothingItems = useCallback(async () => {
    setLoadingClothingItems(true);
    try { setClothingItems(await clothingItemsApi.list()); } catch {} finally { setLoadingClothingItems(false); }
  }, []);

  const refreshBrands = useCallback(async () => {
    setLoadingBrands(true);
    try { setBrands(await brandsApi.list({ active: 'true' })); } catch {} finally { setLoadingBrands(false); }
  }, []);

  const refreshColors = useCallback(async () => {
    setLoadingColors(true);
    try { setColors(await colorsApi.list({ active: 'true' })); } catch {} finally { setLoadingColors(false); }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshCustomers(), refreshOrders(), refreshInventory(), refreshEmployees(), refreshClothingItems(), refreshBrands(), refreshColors()]);
  }, [refreshCustomers, refreshOrders, refreshInventory, refreshEmployees, refreshClothingItems, refreshBrands, refreshColors]);

  useEffect(() => {
    if (user) { refreshAll(); }
  }, [user]);

  return (
    <AppContext.Provider value={{
      customers, orders, inventory, employees, clothingItems, brands, colors,
      loadingCustomers, loadingOrders, loadingInventory, loadingEmployees, loadingClothingItems, loadingBrands, loadingColors,
      refreshCustomers, refreshOrders, refreshInventory, refreshEmployees, refreshClothingItems, refreshBrands, refreshColors, refreshAll
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