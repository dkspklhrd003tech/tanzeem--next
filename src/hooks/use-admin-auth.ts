"use client";
import { createContext, useContext } from "react";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatar: string | null;
}

export interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({ user: null, isLoading: true });
export const useAdminAuth = () => useContext(AuthContext);
