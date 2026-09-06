"use client";

import { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";

import { useAuth } from "@/components/auth/AuthProvider";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, role, loading, logout } = useAuth();

  /*
   * Mientras se obtiene la sesión real desde /api/session,
   * mostramos una pantalla de carga.
   */
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-card">
          <div className="dashboard-loading-spinner" />

          <h2>Cargando SGRICN</h2>

          <p>Verificando la sesión del usuario...</p>
        </div>
      </div>
    );
  }

  /*
   * El middleware protege las rutas privadas.
   * Si por alguna razón no existe sesión aquí,
   * no renderizamos el panel.
   */
  if (!user || !role) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />

      <div className="dashboard-main">
        <Header role={role} user={user} onLogout={logout} />

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
