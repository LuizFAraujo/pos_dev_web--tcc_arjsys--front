/**
 * authStore.ts - Store para gerenciar autenticação
 * 
 * Gerencia login, logout, token JWT e estado do usuário.
 * Persiste dados no localStorage para manter sessão.
 * 
 * IMPORTANTE: Este é um sistema de autenticação MOCK para desenvolvimento.
 * Aceita qualquer email/senha e gera token fake.
 * Em produção, conectar com API real.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState, LoginCredentials } from '@/types/auth.types';

interface AuthStore extends AuthState {
    /** Faz login do usuário (mock - aceita qualquer credencial) */
    login: (credentials: LoginCredentials) => Promise<void>;

    /** Faz logout e limpa todos os dados */
    logout: () => void;

    /** Verifica se token ainda é válido */
    checkAuth: () => boolean;

    /** Atualiza dados do usuário */
    updateUser: (updates: Partial<User>) => void;
}

/**
 * Gera token JWT fake para desenvolvimento
 */
function generateMockToken(): string {
    const randomString = Math.random().toString(36).substring(2, 15);
    return `mock_token_${randomString}`;
}

/**
 * Tempo de expiração do token
 * - Desenvolvimento: 24 horas
 * - Produção: 7 dias
 */
const TOKEN_EXPIRY_MS = import.meta.env.DEV
    ? 24 * 60 * 60 * 1000  // 24 horas
    : 7 * 24 * 60 * 60 * 1000; // 7 dias

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Estado inicial
            user: null,
            token: null,
            isAuthenticated: false,
            tokenExpiry: null,

            /**
             * Login (MOCK - aceita qualquer email/senha)
             */
            login: async (credentials: LoginCredentials) => {
                // Simula delay de requisição
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Gera usuário mock baseado no email
                const mockUser: User = {
                    id: `user_${Math.random().toString(36).substring(2, 9)}`,
                    name: credentials.email.split('@')[0], // Nome = parte antes do @
                    email: credentials.email,
                    avatar: `https://ui-avatars.com/api/?name=${credentials.email.split('@')[0]}&background=3b82f6&color=fff`,
                    role: 'Usuário',
                    department: 'Desenvolvimento',
                    createdAt: new Date().toISOString(),
                };

                // Gera token mock
                const mockToken = generateMockToken();
                const expiry = Date.now() + TOKEN_EXPIRY_MS;

                // Atualiza store
                set({
                    user: mockUser,
                    token: mockToken,
                    isAuthenticated: true,
                    tokenExpiry: expiry,
                });
            },

            /**
             * Logout - Limpa todos os dados de autenticação
             */
            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    tokenExpiry: null,
                });
            },

            /**
             * Verifica se token ainda é válido
             * @returns true se autenticado e token não expirou
             */
            checkAuth: () => {
                const { isAuthenticated, tokenExpiry } = get();

                // Se não está autenticado, retorna false
                if (!isAuthenticated || !tokenExpiry) {
                    return false;
                }

                // Verifica se token expirou
                const isExpired = Date.now() > tokenExpiry;

                // Se expirou, faz logout automático
                if (isExpired) {
                    get().logout();
                    return false;
                }

                return true;
            },

            /**
             * Atualiza dados do usuário
             */
            updateUser: (updates: Partial<User>) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                }));
            },
        }),
        {
            name: 'arjsys-auth', // Nome da chave no localStorage
        }
    )
);