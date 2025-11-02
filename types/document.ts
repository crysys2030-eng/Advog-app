export type DocumentCategory = "peticao" | "decisao" | "documento_processual" | "contrato" | "procuracao" | "outro";

export interface Document {
  id: string;
  caseId: string;
  clientId?: string;
  title: string;
  category: DocumentCategory;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface DocumentStats {
  total: number;
  byCategory: Record<DocumentCategory, number>;
}
