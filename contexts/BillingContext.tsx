import { useState, useEffect, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { Billing, BillingStats, Payment } from "@/types/billing";

const STORAGE_KEY = "billings";

export const [BillingProvider, useBilling] = createContextHook(() => {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBillings();
  }, []);

  const loadBillings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBillings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading billings:", error);
    } finally {
      setIsLoading(false);
    }
  };



  const addBilling = useCallback((billing: Omit<Billing, "id" | "createdAt" | "updatedAt" | "paidAmount" | "payments">) => {
    const newBilling: Billing = {
      ...billing,
      id: Date.now().toString(),
      paidAmount: 0,
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBillings(prev => {
      const updated = [newBilling, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const updateBilling = useCallback((id: string, updates: Partial<Billing>) => {
    setBillings(prev => {
      const updated = prev.map((billing) =>
        billing.id === id
          ? { ...billing, ...updates, updatedAt: new Date().toISOString() }
          : billing
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const deleteBilling = useCallback((id: string) => {
    setBillings(prev => {
      const updated = prev.filter((billing) => billing.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const addPayment = useCallback((billingId: string, payment: Omit<Payment, "id">) => {
    setBillings(prev => {
      const billing = prev.find((b) => b.id === billingId);
      if (!billing) return prev;

      const newPayment: Payment = {
        ...payment,
        id: Date.now().toString(),
      };

      const newPaidAmount = billing.paidAmount + payment.amount;
      const newStatus = newPaidAmount >= billing.amount ? "paid" : billing.status;

      const updated = prev.map((b) =>
        b.id === billingId
          ? {
              ...b,
              payments: [...b.payments, newPayment],
              paidAmount: newPaidAmount,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : b
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const stats = useMemo((): BillingStats => {
    const now = new Date();
    
    const pending = billings.filter((b) => b.status === "pending");
    const paid = billings.filter((b) => b.status === "paid");
    const overdue = billings.filter((b) => {
      if (b.status !== "pending") return false;
      return new Date(b.dueDate) < now;
    });

    return {
      total: billings.length,
      pending: pending.length,
      paid: paid.length,
      overdue: overdue.length,
      totalAmount: billings.reduce((sum, b) => sum + b.amount, 0),
      paidAmount: billings.reduce((sum, b) => sum + b.paidAmount, 0),
      pendingAmount: pending.reduce((sum, b) => sum + (b.amount - b.paidAmount), 0),
      overdueAmount: overdue.reduce((sum, b) => sum + (b.amount - b.paidAmount), 0),
    };
  }, [billings]);

  return useMemo(() => ({
    billings,
    isLoading,
    stats,
    addBilling,
    updateBilling,
    deleteBilling,
    addPayment,
  }), [billings, isLoading, stats, addBilling, updateBilling, deleteBilling, addPayment]);
});
