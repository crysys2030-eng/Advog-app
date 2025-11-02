import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Document, DocumentStats, DocumentCategory } from "@/types/document";

const STORAGE_KEY = "legal_documents";

const mockDocuments: Document[] = [
  {
    id: "1",
    caseId: "1",
    clientId: "1",
    title: "Petição Inicial - Recurso Administrativo",
    category: "peticao",
    description: "Petição inicial do recurso contra indeferimento de licença ambiental",
    fileName: "peticao_inicial.pdf",
    fileSize: 245000,
    createdAt: new Date(2024, 0, 15).toISOString(),
    updatedAt: new Date(2024, 0, 15).toISOString(),
    tags: ["recurso", "licença ambiental"],
  },
  {
    id: "2",
    caseId: "1",
    clientId: "1",
    title: "Decisão de Primeira Instância",
    category: "decisao",
    description: "Decisão que indeferiu o pedido de licença",
    fileName: "decisao_indeferimento.pdf",
    fileSize: 180000,
    createdAt: new Date(2024, 0, 10).toISOString(),
    updatedAt: new Date(2024, 0, 10).toISOString(),
    tags: ["decisão", "indeferimento"],
  },
  {
    id: "3",
    caseId: "2",
    clientId: "2",
    title: "Procuração - João Silva",
    category: "procuracao",
    description: "Procuração com poderes para impetrar mandado de segurança",
    fileName: "procuracao_joao.pdf",
    fileSize: 95000,
    createdAt: new Date(2024, 8, 1).toISOString(),
    updatedAt: new Date(2024, 8, 1).toISOString(),
    tags: ["procuração"],
  },
];

export const [DocumentProvider, useDocuments] = createContextHook(() => {
  const [documents, setDocuments] = useState<Document[]>([]);

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored) as Document[];
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockDocuments));
        return mockDocuments;
      } catch (error) {
        console.error("Error loading documents:", error);
        return mockDocuments;
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newDocuments: Document[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newDocuments));
      return newDocuments;
    },
    onSuccess: (data) => {
      console.log('[DocumentContext] Documentos salvos com sucesso:', data.length);
    },
    onError: (error) => {
      console.error('[DocumentContext] Erro ao salvar documentos:', error);
    },
  });

  const { mutate: saveDocuments } = saveMutation;

  useEffect(() => {
    if (documentsQuery.data) {
      setDocuments(documentsQuery.data);
    }
  }, [documentsQuery.data]);

  const addDocument = useCallback((newDocument: Omit<Document, "id" | "createdAt" | "updatedAt">) => {
    const documentToAdd: Document = {
      ...newDocument,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('[DocumentContext] Adicionando novo documento:', documentToAdd.title);
    const updated = [...documents, documentToAdd];
    setDocuments(updated);
    saveDocuments(updated);
    console.log('[DocumentContext] Total de documentos após adicionar:', updated.length);
  }, [documents, saveDocuments]);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    console.log('[DocumentContext] Atualizando documento:', id);
    const updated = documents.map((d) =>
      d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
    );
    setDocuments(updated);
    saveDocuments(updated);
  }, [documents, saveDocuments]);

  const deleteDocument = useCallback((id: string) => {
    console.log('[DocumentContext] Eliminando documento:', id);
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    saveDocuments(updated);
    console.log('[DocumentContext] Total de documentos após eliminar:', updated.length);
  }, [documents, saveDocuments]);

  const getDocumentsByCase = useCallback((caseId: string) => {
    return documents.filter((d) => d.caseId === caseId);
  }, [documents]);

  const getDocumentsByClient = useCallback((clientId: string) => {
    return documents.filter((d) => d.clientId === clientId);
  }, [documents]);

  const stats: DocumentStats = useMemo(() => {
    const byCategory: Record<DocumentCategory, number> = {
      peticao: 0,
      decisao: 0,
      documento_processual: 0,
      contrato: 0,
      procuracao: 0,
      outro: 0,
    };

    documents.forEach((doc) => {
      byCategory[doc.category]++;
    });

    return {
      total: documents.length,
      byCategory,
    };
  }, [documents]);

  return useMemo(() => ({
    documents,
    stats,
    isLoading: documentsQuery.isLoading,
    isSaving: saveMutation.isPending,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByCase,
    getDocumentsByClient,
  }), [documents, stats, documentsQuery.isLoading, saveMutation.isPending, addDocument, updateDocument, deleteDocument, getDocumentsByCase, getDocumentsByClient]);
});

export function useDocumentById(id: string) {
  const { documents } = useDocuments();
  return useMemo(() => documents.find((d) => d.id === id), [documents, id]);
}
