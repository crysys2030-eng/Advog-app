export type CaseStatus = "active" | "pending" | "completed" | "urgent";

export type CasePriority = "low" | "medium" | "high" | "urgent";

export type DeadlineType = "audiencia" | "recurso" | "manifestacao" | "peticao" | "outro";

export interface Deadline {
  id: string;
  caseId: string;
  title: string;
  type: DeadlineType;
  date: string;
  completed: boolean;
  notes?: string;
}

export interface Case {
  id: string;
  processNumber: string;
  title: string;
  client: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: string;
  updatedAt: string;
  deadlines: Deadline[];
  entity: string;
  subject: string;
  notes?: string;
}

export interface CaseStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
  urgent: number;
  upcomingDeadlines: number;
}
