import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Client, ClientStats } from "@/types/client";

const STORAGE_KEY = "legal_clients";

const mockClients: Client[] = [
  {
    id: "1",
    name: "Empresa ABC Ltda",
    type: "company",
    email: "contato@empresaabc.com",
    phone: "+351 21 123 4567",
    document: "12.345.678/0001-90",
    address: "Rua Principal, 123",
    city: "Lisboa",
    state: "Lisboa",
    zipCode: "1000-001",
    notes: "Cliente corporativo - prioridade alta",
    createdAt: new Date(2024, 0, 10).toISOString(),
    updatedAt: new Date(2024, 9, 20).toISOString(),
    activeCases: 2,
  },
  {
    id: "2",
    name: "João Silva",
    type: "individual",
    email: "joao.silva@email.com",
    phone: "+351 91 234 5678",
    document: "123.456.789-00",
    address: "Avenida Central, 456",
    city: "Porto",
    state: "Porto",
    zipCode: "4000-001",
    createdAt: new Date(2024, 7, 15).toISOString(),
    updatedAt: new Date(2024, 9, 25).toISOString(),
    activeCases: 1,
  },
  {
    id: "3",
    name: "Maria Santos",
    type: "individual",
    email: "maria.santos@email.com",
    phone: "+351 92 345 6789",
    document: "987.654.321-00",
    address: "Praça da República, 789",
    city: "Braga",
    state: "Braga",
    zipCode: "4700-001",
    notes: "Servidor público - processo disciplinar",
    createdAt: new Date(2024, 6, 1).toISOString(),
    updatedAt: new Date(2024, 9, 18).toISOString(),
    activeCases: 1,
  },
];

export const [ClientProvider, useClients] = createContextHook(() => {
  const [clients, setClients] = useState<Client[]>([]);

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored) as Client[];
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockClients));
        return mockClients;
      } catch (error) {
        console.error("Error loading clients:", error);
        return mockClients;
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newClients: Client[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newClients));
      return newClients;
    },
  });

  const { mutate: saveClients } = saveMutation;

  useEffect(() => {
    if (clientsQuery.data) {
      setClients(clientsQuery.data);
    }
  }, [clientsQuery.data]);

  const addClient = useCallback((newClient: Omit<Client, "id" | "createdAt" | "updatedAt" | "activeCases">) => {
    const clientToAdd: Client = {
      ...newClient,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeCases: 0,
    };
    const updated = [...clients, clientToAdd];
    setClients(updated);
    saveClients(updated);
  }, [clients, saveClients]);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    const updated = clients.map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    setClients(updated);
    saveClients(updated);
  }, [clients, saveClients]);

  const deleteClient = useCallback((id: string) => {
    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    saveClients(updated);
  }, [clients, saveClients]);

  const stats: ClientStats = useMemo(() => {
    return {
      total: clients.length,
      individuals: clients.filter((c) => c.type === "individual").length,
      companies: clients.filter((c) => c.type === "company").length,
      withActiveCases: clients.filter((c) => c.activeCases > 0).length,
    };
  }, [clients]);

  return useMemo(() => ({
    clients,
    stats,
    isLoading: clientsQuery.isLoading,
    isSaving: saveMutation.isPending,
    addClient,
    updateClient,
    deleteClient,
  }), [clients, stats, clientsQuery.isLoading, saveMutation.isPending, addClient, updateClient, deleteClient]);
});

export function useClientById(id: string) {
  const { clients } = useClients();
  return useMemo(() => clients.find((c) => c.id === id), [clients, id]);
}
