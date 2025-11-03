import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  oab: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, oab: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = '@lawyer_app_auth';
const USERS_STORAGE_KEY = '@lawyer_app_users';

export const [AuthProvider, useAuth] = createContextHook((): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStoredAuth = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const userData = JSON.parse(stored);
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao carregar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        return false;
      }

      const usersStr = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      if (!usersStr) {
        return false;
      }

      const users: User[] = JSON.parse(usersStr);
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (!user) {
        return false;
      }

      const { password: _, ...userWithoutPassword } = user;
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword as User);
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, oab: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!name?.trim() || !email?.trim() || !oab?.trim() || !password) {
        return { success: false, message: 'Todos os campos são obrigatórios' };
      }

      if (name.trim().length < 3) {
        return { success: false, message: 'Nome deve ter pelo menos 3 caracteres' };
      }

      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
        return { success: false, message: 'Nome deve conter apenas letras' };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Email inválido' };
      }

      const oabRegex = /^OAB\/[A-Z]{2}\s?\d{3,6}$/i;
      if (!oabRegex.test(oab)) {
        return { success: false, message: 'Formato de OAB inválido (ex: OAB/SP 123456)' };
      }

      if (password.length < 8) {
        return { success: false, message: 'A senha deve ter pelo menos 8 caracteres' };
      }

      if (!/[A-Z]/.test(password)) {
        return { success: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
      }

      if (!/[a-z]/.test(password)) {
        return { success: false, message: 'A senha deve conter pelo menos uma letra minúscula' };
      }

      if (!/[0-9]/.test(password)) {
        return { success: false, message: 'A senha deve conter pelo menos um número' };
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { success: false, message: 'A senha deve conter pelo menos um caractere especial' };
      }

      const usersStr = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];

      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return { success: false, message: 'Email já cadastrado' };
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        oab: oab.trim(),
        password,
      };

      users.push(newUser);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      return { success: true, message: 'Usuário criado com sucesso! Faça login para continuar.' };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, message: 'Erro ao criar usuário' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }), [user, isLoading, login, register, logout]);
});
