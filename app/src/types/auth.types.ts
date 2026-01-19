/**
 * auth.types.ts - Tipos relacionados à autenticação
 * 
 * Define as interfaces para usuário e estado de autenticação.
 */

/**
 * User - Dados do usuário autenticado
 */
export interface User {
    /** ID único do usuário */
    id: string;

    /** Nome completo do usuário */
    name: string;

    /** Email do usuário */
    email: string;

    /** Avatar/foto do usuário (URL ou base64) */
    avatar?: string;

    /** Cargo/função do usuário */
    role?: string;

    /** Departamento do usuário */
    department?: string;

    /** Data de criação da conta */
    createdAt?: string;
}

/**
 * AuthState - Estado de autenticação
 */
export interface AuthState {
    /** Usuário atualmente autenticado (null se não autenticado) */
    user: User | null;

    /** Token JWT de autenticação */
    token: string | null;

    /** Se o usuário está autenticado */
    isAuthenticated: boolean;

    /** Timestamp de quando o token expira */
    tokenExpiry: number | null;
}

/**
 * LoginCredentials - Credenciais para login
 */
export interface LoginCredentials {
    /** Email do usuário */
    email: string;

    /** Senha do usuário */
    password: string;
}

/**
 * LoginResponse - Resposta do servidor após login (mock)
 */
export interface LoginResponse {
    /** Usuário autenticado */
    user: User;

    /** Token JWT */
    token: string;

    /** Tempo de expiração do token em milissegundos */
    expiresIn: number;
}