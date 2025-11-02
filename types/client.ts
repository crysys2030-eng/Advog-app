export type ClientType = "individual" | "company";

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  email: string;
  phone: string;
  document: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  activeCases: number;
}

export interface ClientStats {
  total: number;
  individuals: number;
  companies: number;
  withActiveCases: number;
}
