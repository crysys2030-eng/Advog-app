export type BillingStatus = "pending" | "paid" | "overdue" | "cancelled";

export type BillingType = "hourly" | "fixed" | "success_fee" | "subscription";

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  notes?: string;
}

export interface Billing {
  id: string;
  caseId?: string;
  clientId: string;
  clientName: string;
  description: string;
  type: BillingType;
  amount: number;
  paidAmount: number;
  status: BillingStatus;
  issueDate: string;
  dueDate: string;
  payments: Payment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingStats {
  total: number;
  pending: number;
  paid: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}
