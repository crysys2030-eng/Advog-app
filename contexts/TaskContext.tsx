import { useState, useEffect, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { Task, TaskStats } from "@/types/task";

const STORAGE_KEY = "tasks";

export const [TaskProvider, useTasks] = createContextHook(() => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };



  const addTask = useCallback((task: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => {
      const updated = [newTask, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const updated = prev.map((task) => {
        if (task.id !== id) return task;
        
        const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() };
        
        if (updates.status === "completed" && task.status !== "completed") {
          updatedTask.completedAt = new Date().toISOString();
        }
        
        return updatedTask;
      });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const updated = prev.filter((task) => task.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const stats = useMemo((): TaskStats => {
    const now = new Date();
    
    const todo = tasks.filter((t) => t.status === "todo");
    const inProgress = tasks.filter((t) => t.status === "in_progress");
    const completed = tasks.filter((t) => t.status === "completed");
    const overdue = tasks.filter((t) => {
      if (t.status === "completed" || t.status === "cancelled") return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now;
    });

    return {
      total: tasks.length,
      todo: todo.length,
      inProgress: inProgress.length,
      completed: completed.length,
      overdue: overdue.length,
    };
  }, [tasks]);

  return useMemo(() => ({
    tasks,
    isLoading,
    stats,
    addTask,
    updateTask,
    deleteTask,
  }), [tasks, isLoading, stats, addTask, updateTask, deleteTask]);
});
