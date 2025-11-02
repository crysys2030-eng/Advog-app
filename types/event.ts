export type EventType = "reuniao" | "audiencia" | "compromisso" | "consulta" | "outro";

export interface Event {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  participants?: string[];
  notes?: string;
  reminder?: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventStats {
  total: number;
  today: number;
  thisWeek: number;
  upcoming: number;
  completed: number;
}
