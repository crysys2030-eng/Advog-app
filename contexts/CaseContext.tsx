import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Case, CaseStats, Deadline } from "@/types/case";

const STORAGE_KEY = "legal_cases";

const mockCases: Case[] = [
  {
    id: "1",
    processNumber: "1234567-89.2024.8.02.0001",
    title: "Recurso Administrativo - Licença Ambiental",
    client: "Empresa ABC Ltda",
    description: "Recurso contra indeferimento de licença ambiental",
    status: "active",
    priority: "high",
    entity: "Secretaria de Meio Ambiente",
    subject: "Licenciamento Ambiental",
    createdAt: new Date(2024, 0, 15).toISOString(),
    updatedAt: new Date(2024, 9, 25).toISOString(),
    deadlines: [
      {
        id: "d1",
        caseId: "1",
        title: "Apresentar contrarrazões",
        type: "recurso",
        date: new Date(2024, 10, 5).toISOString(),
        completed: false,
      },
    ],
  },
  {
    id: "2",
    processNumber: "9876543-21.2024.8.02.0002",
    title: "Mandado de Segurança - Concurso Público",
    client: "João Silva",
    description: "MS para garantir nomeação em concurso público",
    status: "urgent",
    priority: "urgent",
    entity: "Prefeitura Municipal",
    subject: "Direito Administrativo - Concursos",
    createdAt: new Date(2024, 8, 1).toISOString(),
    updatedAt: new Date(2024, 9, 28).toISOString(),
    deadlines: [
      {
        id: "d2",
        caseId: "2",
        title: "Audiência de Justificação",
        type: "audiencia",
        date: new Date(2024, 10, 2).toISOString(),
        completed: false,
      },
    ],
  },
  {
    id: "3",
    processNumber: "5555555-55.2024.8.02.0003",
    title: "Processo Administrativo Disciplinar",
    client: "Maria Santos",
    description: "Defesa em PAD - Servidor Público",
    status: "pending",
    priority: "medium",
    entity: "Governo do Estado",
    subject: "Direito Administrativo - Servidores",
    createdAt: new Date(2024, 7, 10).toISOString(),
    updatedAt: new Date(2024, 9, 20).toISOString(),
    deadlines: [
      {
        id: "d3",
        caseId: "3",
        title: "Alegações Finais",
        type: "manifestacao",
        date: new Date(2024, 10, 10).toISOString(),
        completed: false,
      },
    ],
  },
];

export const [CaseProvider, useCases] = createContextHook(() => {
  const [cases, setCases] = useState<Case[]>([]);

  const casesQuery = useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored) as Case[];
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockCases));
        return mockCases;
      } catch (error) {
        console.error("Error loading cases:", error);
        return mockCases;
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newCases: Case[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCases));
      return newCases;
    },
  });

  const { mutate: saveCases } = saveMutation;

  useEffect(() => {
    if (casesQuery.data) {
      setCases(casesQuery.data);
    }
  }, [casesQuery.data]);

  const addCase = useCallback((newCase: Omit<Case, "id" | "createdAt" | "updatedAt">) => {
    const caseToAdd: Case = {
      ...newCase,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...cases, caseToAdd];
    setCases(updated);
    saveCases(updated);
  }, [cases, saveCases]);

  const updateCase = useCallback((id: string, updates: Partial<Case>) => {
    const updated = cases.map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    setCases(updated);
    saveCases(updated);
  }, [cases, saveCases]);

  const deleteCase = useCallback((id: string) => {
    const updated = cases.filter((c) => c.id !== id);
    setCases(updated);
    saveCases(updated);
  }, [cases, saveCases]);

  const addDeadline = useCallback((caseId: string, deadline: Omit<Deadline, "id" | "caseId">) => {
    const updated = cases.map((c) => {
      if (c.id === caseId) {
        const newDeadline: Deadline = {
          ...deadline,
          id: Date.now().toString(),
          caseId,
        };
        return {
          ...c,
          deadlines: [...c.deadlines, newDeadline],
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    setCases(updated);
    saveCases(updated);
  }, [cases, saveCases]);

  const updateDeadline = useCallback((caseId: string, deadlineId: string, updates: Partial<Deadline>) => {
    const updated = cases.map((c) => {
      if (c.id === caseId) {
        return {
          ...c,
          deadlines: c.deadlines.map((d) =>
            d.id === deadlineId ? { ...d, ...updates } : d
          ),
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    setCases(updated);
    saveCases(updated);
  }, [cases, saveCases]);

  const deleteDeadline = useCallback((caseId: string, deadlineId: string) => {
    const updated = cases.map((c) => {
      if (c.id === caseId) {
        return {
          ...c,
          deadlines: c.deadlines.filter((d) => d.id !== deadlineId),
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    setCases(updated);
    saveCases(updated);
  }, [cases, saveCases]);

  const stats: CaseStats = useMemo(() => {
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingDeadlines = cases.reduce((count, c) => {
      return count + c.deadlines.filter((d) => {
        const deadlineDate = new Date(d.date);
        return !d.completed && deadlineDate >= now && deadlineDate <= next7Days;
      }).length;
    }, 0);

    return {
      total: cases.length,
      active: cases.filter((c) => c.status === "active").length,
      pending: cases.filter((c) => c.status === "pending").length,
      completed: cases.filter((c) => c.status === "completed").length,
      urgent: cases.filter((c) => c.status === "urgent").length,
      upcomingDeadlines,
    };
  }, [cases]);

  return useMemo(() => ({
    cases,
    stats,
    isLoading: casesQuery.isLoading,
    isSaving: saveMutation.isPending,
    addCase,
    updateCase,
    deleteCase,
    addDeadline,
    updateDeadline,
    deleteDeadline,
  }), [cases, stats, casesQuery.isLoading, saveMutation.isPending, addCase, updateCase, deleteCase, addDeadline, updateDeadline, deleteDeadline]);
});

export function useCaseById(id: string) {
  const { cases } = useCases();
  return useMemo(() => cases.find((c) => c.id === id), [cases, id]);
}

export function useUpcomingDeadlines(days: number = 7) {
  const { cases } = useCases();
  return useMemo(() => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const deadlines: (Deadline & { caseName: string; processNumber: string })[] = [];

    cases.forEach((c) => {
      c.deadlines.forEach((d) => {
        const deadlineDate = new Date(d.date);
        if (!d.completed && deadlineDate >= now && deadlineDate <= futureDate) {
          deadlines.push({
            ...d,
            caseName: c.title,
            processNumber: c.processNumber,
          });
        }
      });
    });

    return deadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [cases, days]);
}
