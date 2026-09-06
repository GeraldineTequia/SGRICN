"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { UserRole } from "@/types/auth";

export interface AuthUser {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: "admin" | "funcionario" | "usuario";
  estado: "activo" | "inactivo";
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function convertirRol(rol: AuthUser["rol"]): UserRole | null {
  switch (rol) {
    case "admin":
      return "ADMIN";

    case "funcionario":
      return "FUNCIONARIO";

    case "usuario":
      return "USUARIO";

    default:
      return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshSession() {
    try {
      setLoading(true);

      const response = await fetch("/api/session", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      /*
       * /api/session siempre debe responder JSON.
       * Si por alguna razón recibimos HTML, evitamos que
       * response.json() provoque el error:
       * Unexpected token '<'
       */
      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        console.error(
          "La API de sesión no devolvió JSON.",
          "Status:",
          response.status,
          "Content-Type:",
          contentType
        );

        setUser(null);
        setRole(null);
        return;
      }

      const data = await response.json();

      /*
       * El endpoint devuelve:
       *
       * {
       *   success: true,
       *   data: {
       *     _id,
       *     nombre,
       *     apellido,
       *     correo,
       *     rol,
       *     estado
       *   }
       * }
       *
       * Por eso debemos leer data.data,
       * no data.user.
       */
      if (!response.ok || !data.success || !data.data) {
        setUser(null);
        setRole(null);
        return;
      }

      const usuario = data.data as AuthUser;

      const rolConvertido = convertirRol(usuario.rol);

      if (!rolConvertido) {
        console.error("Rol de usuario no válido:", usuario.rol);

        setUser(null);
        setRole(null);
        return;
      }

      setUser(usuario);
      setRole(rolConvertido);
    } catch (error) {
      console.error("Error obteniendo la sesión:", error);

      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    } finally {
      setUser(null);
      setRole(null);

      window.location.href = "/login";
    }
  }

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return context;
}
