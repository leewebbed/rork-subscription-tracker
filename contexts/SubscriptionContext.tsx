import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Client, Category, ClientWithCategory, SubscriptionStatus, PaymentRecord } from '@/types/subscription';

const CLIENTS_STORAGE_KEY = 'subscription_clients';
const CATEGORIES_STORAGE_KEY = 'subscription_categories';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Website Hosting', color: '#3B82F6', createdAt: new Date().toISOString() },
  { id: '2', name: 'App Advertising', color: '#10B981', createdAt: new Date().toISOString() },
  { id: '3', name: 'Social Media Management', color: '#8B5CF6', createdAt: new Date().toISOString() },
];

const DEFAULT_CLIENTS: Client[] = [
  {
    id: '1001',
    name: 'Acme Corporation',
    email: 'contact@acmecorp.com',
    phone: '+1 555 0100',
    categoryId: '1',
    duration: 'ONE_YEAR',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    payments: [
      {
        id: 'pay1001',
        amount: 299.99,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Annual subscription payment',
      },
    ],
  },
  {
    id: '1002',
    name: 'TechStart Inc',
    email: 'hello@techstart.io',
    phone: '+1 555 0200',
    categoryId: '2',
    duration: 'ONE_MONTH',
    startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    payments: [
      {
        id: 'pay1002',
        amount: 49.99,
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Monthly advertising fee',
      },
    ],
  },
  {
    id: '1003',
    name: 'Green Earth Co',
    email: 'info@greenearth.org',
    phone: '+1 555 0300',
    categoryId: '3',
    duration: 'ONE_MONTH',
    startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    payments: [
      {
        id: 'pay1003',
        amount: 199.00,
        date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Social media management',
      },
    ],
  },
  {
    id: '1004',
    name: 'FitLife Studios',
    email: 'contact@fitlife.com',
    phone: '+1 555 0400',
    categoryId: '1',
    duration: 'ONE_MONTH',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    payments: [
      {
        id: 'pay1004',
        amount: 79.99,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: '1005',
    name: 'Digital Dynamics',
    email: 'support@digitaldynamics.net',
    phone: '+1 555 0500',
    categoryId: '2',
    duration: 'ONE_WEEK',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    payments: [
      {
        id: 'pay1005',
        amount: 25.00,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Weekly campaign',
      },
    ],
  },
  {
    id: '1006',
    name: 'Sunny Cafe',
    email: 'manager@sunnycafe.com',
    phone: '+1 555 0600',
    categoryId: '3',
    duration: 'ONE_MONTH',
    startDate: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
    payments: [
      {
        id: 'pay1006',
        amount: 149.99,
        date: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Social media content creation',
      },
    ],
  },
];

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientsData, categoriesData] = await Promise.all([
        AsyncStorage.getItem(CLIENTS_STORAGE_KEY),
        AsyncStorage.getItem(CATEGORIES_STORAGE_KEY),
      ]);

      if (clientsData) {
        try {
          setClients(JSON.parse(clientsData));
        } catch (parseError) {
          console.error('Error parsing clients data, clearing storage:', parseError);
          await AsyncStorage.removeItem(CLIENTS_STORAGE_KEY);
          setClients(DEFAULT_CLIENTS);
        }
      } else {
        setClients(DEFAULT_CLIENTS);
      }
      
      if (categoriesData) {
        try {
          setCategories(JSON.parse(categoriesData));
        } catch (parseError) {
          console.error('Error parsing categories data, clearing storage:', parseError);
          await AsyncStorage.removeItem(CATEGORIES_STORAGE_KEY);
          setCategories(DEFAULT_CATEGORIES);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveClients = async (newClients: Client[]) => {
    try {
      await AsyncStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(newClients));
      setClients(newClients);
    } catch (error) {
      console.error('Error saving clients:', error);
    }
  };

  const saveCategories = async (newCategories: Category[]) => {
    try {
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt' | 'payments'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      payments: [],
    };
    saveClients([...clients, newClient]);
  }, [clients]);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    const updated = clients.map((client) =>
      client.id === id ? { ...client, ...updates } : client
    );
    saveClients(updated);
  }, [clients]);

  const deleteClient = useCallback((id: string) => {
    saveClients(clients.filter((client) => client.id !== id));
  }, [clients]);

  const addCategory = useCallback((category: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    saveCategories([...categories, newCategory]);
  }, [categories]);

  const deleteCategory = useCallback((id: string) => {
    saveCategories(categories.filter((category) => category.id !== id));
  }, [categories]);

  const getClientsWithCategories = useCallback((): ClientWithCategory[] => {
    return clients.map((client) => ({
      ...client,
      category: categories.find((cat) => cat.id === client.categoryId) || {
        id: 'unknown',
        name: 'Unknown',
        color: '#6B7280',
        createdAt: new Date().toISOString(),
      },
    }));
  }, [clients, categories]);

  const getExpiryDate = useCallback((startDate: string, duration: Client['duration']): Date => {
    const date = new Date(startDate);
    
    switch (duration) {
      case 'ONE_WEEK':
        date.setDate(date.getDate() + 7);
        break;
      case 'ONE_MONTH':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'ONE_YEAR':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return date;
  }, []);

  const getSubscriptionStatus = useCallback((client: Client): SubscriptionStatus => {
    const expiryDate = getExpiryDate(client.startDate, client.duration);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return 'expired';
    } else if (daysUntilExpiry <= 7) {
      return 'expiring_soon';
    }
    return 'active';
  }, [getExpiryDate]);

  const addPayment = useCallback((clientId: string, payment: Omit<PaymentRecord, 'id'>) => {
    const updated = clients.map((client) => {
      if (client.id === clientId) {
        const newPayment: PaymentRecord = {
          ...payment,
          id: Date.now().toString(),
        };
        return {
          ...client,
          payments: [...(client.payments || []), newPayment],
        };
      }
      return client;
    });
    saveClients(updated);
  }, [clients]);

  const deletePayment = useCallback((clientId: string, paymentId: string) => {
    const updated = clients.map((client) => {
      if (client.id === clientId) {
        return {
          ...client,
          payments: (client.payments || []).filter(p => p.id !== paymentId),
        };
      }
      return client;
    });
    saveClients(updated);
  }, [clients]);

  const clearAllData = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(CLIENTS_STORAGE_KEY),
        AsyncStorage.removeItem(CATEGORIES_STORAGE_KEY),
      ]);
      setClients([]);
      setCategories(DEFAULT_CATEGORIES);
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }, []);

  return useMemo(() => ({
    clients,
    categories,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    addCategory,
    deleteCategory,
    getClientsWithCategories,
    getExpiryDate,
    getSubscriptionStatus,
    addPayment,
    deletePayment,
    clearAllData,
  }), [clients, categories, isLoading, addClient, updateClient, deleteClient, addCategory, deleteCategory, getClientsWithCategories, getExpiryDate, getSubscriptionStatus, addPayment, deletePayment, clearAllData]);
});
