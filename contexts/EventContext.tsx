import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Event, EventStats } from "@/types/event";

const STORAGE_KEY = "legal_events";

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Reunião com Cliente - Caso ABC",
    description: "Discussão sobre andamento do processo",
    type: "reuniao",
    date: new Date(2024, 10, 3).toISOString(),
    startTime: "14:00",
    endTime: "15:30",
    location: "Escritório - Sala 3",
    participants: ["Empresa ABC Ltda"],
    completed: false,
    reminder: true,
    createdAt: new Date(2024, 9, 15).toISOString(),
    updatedAt: new Date(2024, 9, 15).toISOString(),
  },
  {
    id: "2",
    title: "Audiência - Processo 1234567",
    description: "Audiência de instrução e julgamento",
    type: "audiencia",
    date: new Date(2024, 10, 8).toISOString(),
    startTime: "10:00",
    location: "Tribunal Administrativo",
    notes: "Levar documentos originais",
    completed: false,
    reminder: true,
    createdAt: new Date(2024, 9, 20).toISOString(),
    updatedAt: new Date(2024, 9, 20).toISOString(),
  },
];

export const [EventProvider, useEvents] = createContextHook(() => {
  const [events, setEvents] = useState<Event[]>([]);

  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored) as Event[];
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockEvents));
        return mockEvents;
      } catch (error) {
        console.error("Error loading events:", error);
        return mockEvents;
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newEvents: Event[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEvents));
      return newEvents;
    },
  });

  const { mutate: saveEvents } = saveMutation;

  useEffect(() => {
    if (eventsQuery.data) {
      setEvents(eventsQuery.data);
    }
  }, [eventsQuery.data]);

  const addEvent = useCallback((newEvent: Omit<Event, "id" | "createdAt" | "updatedAt">) => {
    const eventToAdd: Event = {
      ...newEvent,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...events, eventToAdd];
    setEvents(updated);
    saveEvents(updated);
  }, [events, saveEvents]);

  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    const updated = events.map((e) =>
      e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
    );
    setEvents(updated);
    saveEvents(updated);
  }, [events, saveEvents]);

  const deleteEvent = useCallback((id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
  }, [events, saveEvents]);

  const stats: EventStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      total: events.length,
      today: events.filter((e) => {
        const eventDate = new Date(e.date);
        return eventDate.toDateString() === today.toDateString() && !e.completed;
      }).length,
      thisWeek: events.filter((e) => {
        const eventDate = new Date(e.date);
        return eventDate >= today && eventDate <= endOfWeek && !e.completed;
      }).length,
      upcoming: events.filter((e) => {
        const eventDate = new Date(e.date);
        return eventDate >= today && !e.completed;
      }).length,
      completed: events.filter((e) => e.completed).length,
    };
  }, [events]);

  return useMemo(() => ({
    events,
    stats,
    isLoading: eventsQuery.isLoading,
    isSaving: saveMutation.isPending,
    addEvent,
    updateEvent,
    deleteEvent,
  }), [events, stats, eventsQuery.isLoading, saveMutation.isPending, addEvent, updateEvent, deleteEvent]);
});

export function useEventsByDateRange(startDate: Date, endDate: Date) {
  const { events } = useEvents();
  return useMemo(() => {
    return events.filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate >= startDate && eventDate <= endDate;
    }).sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [events, startDate, endDate]);
}
