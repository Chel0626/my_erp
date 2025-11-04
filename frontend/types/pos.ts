// Types for POS module

export interface CashRegister {
  id: number;
  user: number;
  user_details: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  opened_at: string;
  closed_at: string | null;
  opening_balance: string;
  closing_balance: string | null;
  expected_balance: string | null;
  difference: string | null;
  status: 'open' | 'closed';
  status_display: string;
  notes: string;
  total_sales: string;
  total_sales_count: number;
  payment_breakdown: {
    [key: string]: {
      label: string;
      total: number;
    };
  };
}

export interface SaleItem {
  id?: number;
  product: number | null;
  product_name?: string;
  service: number | null;
  service_name?: string;
  professional: number | null;
  professional_name?: string;
  item_name?: string;
  quantity: string;
  unit_price: string;
  discount: string;
  total?: string;
}

export interface Sale {
  id: number;
  cash_register: number;
  cash_register_id: number;
  customer: number | null;
  customer_details?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  user: number;
  user_details: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  date: string;
  subtotal: string;
  discount: string;
  total: string;
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer';
  payment_method_display: string;
  payment_status: 'pending' | 'paid' | 'cancelled';
  payment_status_display: string;
  notes: string;
  items: SaleItem[];
}

export interface SaleCreate {
  customer: number | null;
  discount: string;
  payment_method: string;
  payment_status: string;
  notes: string;
  items: Omit<SaleItem, 'id' | 'total' | 'product_name' | 'service_name' | 'professional_name' | 'item_name'>[];
}

export interface SaleDashboard {
  total: {
    amount: number;
    count: number;
  };
  today: {
    amount: number;
    count: number;
  };
  week: {
    amount: number;
    count: number;
  };
  month: {
    amount: number;
    count: number;
  };
  top_sellers: Array<{
    name: string;
    total: number;
    count: number;
  }>;
}

export interface CashRegisterCreate {
  opening_balance: string;
  notes?: string;
}

export interface CashRegisterClose {
  closing_balance: string;
  notes?: string;
}

export interface CartItem {
  type: 'product' | 'service';
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  professional?: number;
  professionalName?: string;
}
