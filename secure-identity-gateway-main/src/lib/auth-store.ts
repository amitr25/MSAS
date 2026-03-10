import { create } from 'zustand';
import type { User, AuthToken, LogEntry, Role } from './crypto';

interface AuthState {
  users: User[];
  currentToken: AuthToken | null;
  pendingOTP: { otp: string; username: string; expiresAt: number } | null;
  logs: LogEntry[];
  activeStep: number;
  addUser: (user: User) => void;
  getUser: (username: string) => User | undefined;
  updateUser: (username: string, updates: Partial<User>) => void;
  setToken: (token: AuthToken | null) => void;
  setPendingOTP: (otp: { otp: string; username: string; expiresAt: number } | null) => void;
  addLog: (entry: Omit<LogEntry, 'timestamp'>) => void;
  setActiveStep: (step: number) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  users: [],
  currentToken: null,
  pendingOTP: null,
  logs: [],
  activeStep: 0,
  addUser: (user) => set((s) => ({ users: [...s.users, user] })),
  getUser: (username) => get().users.find(u => u.username === username),
  updateUser: (username, updates) => set((s) => ({
    users: s.users.map(u => u.username === username ? { ...u, ...updates } : u)
  })),
  setToken: (token) => set({ currentToken: token }),
  setPendingOTP: (otp) => set({ pendingOTP: otp }),
  addLog: (entry) => set((s) => ({ logs: [{ ...entry, timestamp: new Date() }, ...s.logs] })),
  setActiveStep: (step) => set({ activeStep: step }),
  reset: () => set({ users: [], currentToken: null, pendingOTP: null, logs: [], activeStep: 0 }),
}));
