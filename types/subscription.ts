export type SubscriptionDuration = 'ONE_WEEK' | 'ONE_MONTH' | 'ONE_YEAR';

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  categoryId: string;
  duration: SubscriptionDuration;
  startDate: string;
  createdAt: string;
  payments: PaymentRecord[];
}

export interface ClientWithCategory extends Client {
  category: Category;
}

export type SubscriptionStatus = 'active' | 'expiring_soon' | 'expired';
