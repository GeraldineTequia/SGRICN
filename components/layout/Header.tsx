"use client";

import { useEffect, useRef, useState } from "react";
import { UserRole } from "@/types/auth";

interface HeaderUser {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: "admin" | "funcionario" | "usuario";
  estado: "activo" | "inactivo";
}

interface HeaderProps {
  role: UserRole;
  user: HeaderUser;
  onLogout: () => Promise<void>;
}

interface Notificacion {
  id: string;
  tipo: "catastrofe" | "necesidad" | "noticia";
  titulo: string;
  mensaje: string;
  fecha: string;
  href: string;
  prioridad?: "alta" | "media" | "baja";
}

interface NotificacionesResponse {
  success: boolean;
  notificaciones: Notificacion[];
}

function obtenerNombreRol(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "Administrador";

    case "FUNCIONARIO":
      return "Funcionario";

    case "USUARIO":
      return "Usuario";

    default:
      return "Usuario";
  }
}

function formatearFecha(fecha: string): string {
  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return "";
  }

  return fechaObjeto.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Header({ role, user, onLogout }: HeaderProps) {
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(false);

  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);

  async function cargarNotificaciones() {
    try {
      setCargandoNotificaciones(true);

      const response = await fetch("/api/notificaciones", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data: NotificacionesResponse = await response.json();

      if (data.success) {
        setNotificaciones(data.notificaciones ?? []);
      }
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setCargandoNotificaciones(false);
    }
  }

  function alternarNotificaciones() {
    const nuevoEstado = !mostrarNotificaciones;

    setMostrarNotificaciones(nuevoEstado);
    setMostrarMenu(false);

    if (nuevoEstado) {
      cargarNotificaciones();
    }
  }

  function alternarMenuUsuario() {
    setMostrarMenu((actual) => !actual);
    setMostrarNotificaciones(false);
  }

  async function manejarCerrarSesion() {
    if (cerrandoSesion) {
      return;
    }

    try {
      setCerrandoSesion(true);
      await onLogout();
    } catch (error) {
      console.error("Error cerrando sesión:", error);

      setCerrandoSesion(false);
    }
  }

  useEffect(() => {
    function manejarClickFuera(event: MouseEvent) {
      const target = event.target as Node;

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setMostrarNotificaciones(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setMostrarMenu(false);
      }
    }

    document.addEventListener("mousedown", manejarClickFuera);

    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
    };
  }, []);

  const nombreCompleto = `${user.nombre} ${user.apellido}`.trim();

  const iniciales = `${user.nombre.charAt(0)}${user.apellido.charAt(
    0
  )}`.toUpperCase();

  const nombreRol = obtenerNombreRol(role);

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-left">
        <div className="dashboard-header-brand">
          <div className="dashboard-header-brand-icon">🇨🇴</div>

          <div>
            <h1>SGRICN</h1>

            <span>Gestión y respuesta ante emergencias</span>
          </div>
        </div>
      </div>

      <div className="dashboard-header-right">
        {/* NOTIFICACIONES */}
        <div className="dashboard-header-notifications" ref={notificationsRef}>
          <button
            type="button"
            className="dashboard-header-icon-button"
            aria-label="Notificaciones"
            aria-expanded={mostrarNotificaciones}
            onClick={alternarNotificaciones}
          >
            🔔
            {notificaciones.length > 0 && (
              <span className="dashboard-notification-badge">
                {notificaciones.length > 99 ? "99+" : notificaciones.length}
              </span>
            )}
          </button>

          {mostrarNotificaciones && (
            <div className="dashboard-notifications-panel">
              <div className="dashboard-notifications-header">
                <div>
                  <h3>Notificaciones</h3>

                  <span>Información reciente</span>
                </div>

                <button
                  type="button"
                  className="dashboard-notifications-refresh"
                  onClick={cargarNotificaciones}
                  disabled={cargandoNotificaciones}
                  aria-label="Actualizar notificaciones"
                >
                  🔄
                </button>
              </div>

              <div className="dashboard-notifications-content">
                {cargandoNotificaciones ? (
                  <div className="dashboard-notifications-empty">
                    <span>⏳</span>

                    <p>Cargando notificaciones...</p>
                  </div>
                ) : notificaciones.length === 0 ? (
                  <div className="dashboard-notifications-empty">
                    <span>🔕</span>

                    <p>No hay notificaciones nuevas.</p>
                  </div>
                ) : (
                  notificaciones.map((notificacion) => (
                    <button
                      type="button"
                      key={notificacion.id}
                      className={`dashboard-notification-item dashboard-notification-${notificacion.tipo}`}
                      onClick={() => {
                        window.location.href = notificacion.href;
                      }}
                    >
                      <div className="dashboard-notification-icon">
                        {notificacion.tipo === "catastrofe" && "🚨"}

                        {notificacion.tipo === "necesidad" && "📦"}

                        {notificacion.tipo === "noticia" && "📰"}
                      </div>

                      <div className="dashboard-notification-info">
                        <strong>{notificacion.titulo}</strong>

                        <p>{notificacion.mensaje}</p>

                        <span>{formatearFecha(notificacion.fecha)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="dashboard-notifications-footer">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/noticias";
                  }}
                >
                  Ver información
                </button>
              </div>
            </div>
          )}
        </div>

        {/* USUARIO */}
        <div className="dashboard-header-user" ref={userMenuRef}>
          <button
            type="button"
            className="dashboard-header-user-button"
            onClick={alternarMenuUsuario}
            aria-expanded={mostrarMenu}
          >
            <div className="dashboard-header-avatar">{iniciales}</div>

            <div className="dashboard-header-user-info">
              <strong>{nombreCompleto}</strong>

              <span>{nombreRol}</span>
            </div>

            <span className="dashboard-header-user-arrow">
              {mostrarMenu ? "▲" : "▼"}
            </span>
          </button>

          {mostrarMenu && (
            <div className="dashboard-header-user-menu">
              <div className="dashboard-header-user-menu-profile">
                <div className="dashboard-header-avatar dashboard-header-avatar-large">
                  {iniciales}
                </div>

                <div>
                  <strong>{nombreCompleto}</strong>

                  <span>{user.correo}</span>

                  <small>{nombreRol}</small>
                </div>
              </div>

              <div className="dashboard-header-user-menu-divider" />

              <button
                type="button"
                className="dashboard-header-user-menu-item"
                onClick={() => {
                  setMostrarMenu(false);
                  window.location.href = "/dashboard";
                }}
              >
                🏠 Inicio
              </button>

              {role === "ADMIN" && (
                <button
                  type="button"
                  className="dashboard-header-user-menu-item"
                  onClick={() => {
                    setMostrarMenu(false);
                    window.location.href = "/configuracion";
                  }}
                >
                  ⚙️ Configuración
                </button>
              )}

              <div className="dashboard-header-user-menu-divider" />

              <button
                type="button"
                className="dashboard-header-user-menu-logout"
                onClick={manejarCerrarSesion}
                disabled={cerrandoSesion}
              >
                {cerrandoSesion ? "⏳ Cerrando sesión..." : "🚪 Cerrar sesión"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
