"use client";

import React, { useEffect, useMemo, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/auth/AuthProvider";

import { Usuario } from "@/types/usuarios";

import UsuarioCard from "@/components/usuarios/UsuarioCard";
import UsuarioFilters from "@/components/usuarios/UsuarioFilters";
import UsuarioForm from "@/components/usuarios/UsuarioForm";
import UsuarioModal from "@/components/usuarios/UsuarioModal";

export default function UsuariosPage() {
  const { role } = useAuth();

  const puedeGestionar = role === "ADMIN";
  const puedeConsultar = role === "ADMIN" || role === "FUNCIONARIO";

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [rolFiltro, setRolFiltro] = useState<Usuario["rol"] | "todos">("todos");

  const [estadoFiltro, setEstadoFiltro] = useState<Usuario["estado"] | "todos">(
    "todos"
  );

  const [modalAbierto, setModalAbierto] = useState(false);

  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);

  async function cargarUsuarios() {
    if (!puedeConsultar) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch("/api/usuarios", {
        cache: "no-store",
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.error || "No fue posible cargar los usuarios."
        );
      }

      setUsuarios(resultado.data || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error cargando los usuarios."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (role) {
      cargarUsuarios();
    }
  }, [role]);

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const coincideBusqueda =
        !texto ||
        usuario._id.toLowerCase().includes(texto) ||
        usuario.nombre.toLowerCase().includes(texto) ||
        usuario.apellido.toLowerCase().includes(texto) ||
        usuario.correo.toLowerCase().includes(texto) ||
        usuario.telefono.toLowerCase().includes(texto);

      const coincideRol = rolFiltro === "todos" || usuario.rol === rolFiltro;

      const coincideEstado =
        estadoFiltro === "todos" || usuario.estado === estadoFiltro;

      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }, [usuarios, busqueda, rolFiltro, estadoFiltro]);

  const estadisticas = useMemo(() => {
    const total = usuarios.length;

    const activos = usuarios.filter(
      (usuario) => usuario.estado === "activo"
    ).length;

    const inactivos = usuarios.filter(
      (usuario) => usuario.estado === "inactivo"
    ).length;

    const administradores = usuarios.filter(
      (usuario) => usuario.rol === "admin"
    ).length;

    const funcionarios = usuarios.filter(
      (usuario) => usuario.rol === "funcionario"
    ).length;

    const usuariosRegulares = usuarios.filter(
      (usuario) => usuario.rol === "usuario"
    ).length;

    return {
      total,
      activos,
      inactivos,
      administradores,
      funcionarios,
      usuariosRegulares,
    };
  }, [usuarios]);

  function abrirNuevoUsuario() {
    if (!puedeGestionar) {
      return;
    }

    setUsuarioSeleccionado(null);
    setModalAbierto(true);
  }

  function abrirEdicion(usuario: Usuario) {
    if (!puedeGestionar) {
      return;
    }

    setUsuarioSeleccionado(usuario);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
  }

  function manejarGuardado(usuarioGuardado: Usuario) {
    if (!puedeGestionar) {
      return;
    }

    setUsuarios((actuales) => {
      const existe = actuales.some(
        (usuario) => usuario._id === usuarioGuardado._id
      );

      if (existe) {
        return actuales.map((usuario) =>
          usuario._id === usuarioGuardado._id ? usuarioGuardado : usuario
        );
      }

      return [usuarioGuardado, ...actuales];
    });

    cerrarModal();
  }

  async function eliminarUsuario(id: string) {
    if (!puedeGestionar) {
      return;
    }

    const usuario = usuarios.find((item) => item._id === id);

    if (!usuario) {
      return;
    }

    const confirmado = window.confirm(
      `¿Estás seguro de eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`
    );

    if (!confirmado) {
      return;
    }

    try {
      setError("");

      const respuesta = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.error || "No fue posible eliminar el usuario."
        );
      }

      setUsuarios((actuales) => actuales.filter((item) => item._id !== id));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error eliminando el usuario."
      );
    }
  }

  function limpiarFiltros() {
    setBusqueda("");
    setRolFiltro("todos");
    setEstadoFiltro("todos");
  }

  /*
   * El middleware y la API también protegen esta ruta.
   * Este control evita mostrar contenido del módulo a USUARIO
   * aunque alguien intente acceder manualmente a /usuarios.
   */
  if (role === "USUARIO") {
    return null;
  }

  return (
    <DashboardLayout>
      <main className="usuarios-page">
        <header className="usuarios-page-header">
          <div>
            <span className="usuarios-page-kicker">
              Administración del sistema
            </span>

            <h1>Usuarios</h1>

            <p>
              {puedeGestionar
                ? "Gestiona las cuentas de usuarios, funcionarios y administradores del sistema SGRICN."
                : "Consulta las cuentas de usuarios registradas en el sistema SGRICN."}
            </p>
          </div>

          {puedeGestionar && (
            <button
              type="button"
              className="usuarios-primary-button"
              onClick={abrirNuevoUsuario}
            >
              <span>+</span>
              Nuevo usuario
            </button>
          )}
        </header>

        <section className="usuarios-stats">
          <article className="usuario-stat-card">
            <div className="usuario-stat-icon usuario-stat-icon-total">👥</div>

            <div>
              <span>Total usuarios</span>

              <strong>{estadisticas.total}</strong>
            </div>
          </article>

          <article className="usuario-stat-card">
            <div className="usuario-stat-icon usuario-stat-icon-active">✓</div>

            <div>
              <span>Usuarios activos</span>

              <strong>{estadisticas.activos}</strong>
            </div>
          </article>

          <article className="usuario-stat-card">
            <div className="usuario-stat-icon usuario-stat-icon-official">
              👨‍💼
            </div>

            <div>
              <span>Funcionarios</span>

              <strong>{estadisticas.funcionarios}</strong>
            </div>
          </article>

          <article className="usuario-stat-card">
            <div className="usuario-stat-icon usuario-stat-icon-admin">🛡️</div>

            <div>
              <span>Administradores</span>

              <strong>{estadisticas.administradores}</strong>
            </div>
          </article>
        </section>

        {error && (
          <div className="usuarios-error">
            <div>
              <strong>Ocurrió un problema</strong>

              <p>{error}</p>
            </div>

            <button type="button" onClick={cargarUsuarios}>
              Reintentar
            </button>
          </div>
        )}

        <UsuarioFilters
          busqueda={busqueda}
          rol={rolFiltro}
          estado={estadoFiltro}
          usuarios={usuariosFiltrados}
          onBusquedaChange={setBusqueda}
          onRolChange={setRolFiltro}
          onEstadoChange={setEstadoFiltro}
          onLimpiar={limpiarFiltros}
        />

        {cargando ? (
          <div className="usuarios-loading">
            <div className="usuario-spinner usuario-spinner-large" />

            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <section className="usuarios-results">
            <div className="usuarios-results-header">
              <div>
                <span>Resultados</span>

                <h2>Usuarios registrados</h2>
              </div>

              <div className="usuarios-results-summary">
                Mostrando <strong>{usuariosFiltrados.length}</strong> de{" "}
                <strong>{usuarios.length}</strong>
              </div>
            </div>

            {usuariosFiltrados.length === 0 ? (
              <div className="usuarios-empty">
                <div className="usuarios-empty-icon">🔎</div>

                <h3>No se encontraron usuarios</h3>

                <p>
                  Intenta modificar los filtros utilizados para realizar la
                  búsqueda.
                </p>

                <button
                  type="button"
                  className="usuario-btn usuario-btn-clear"
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="usuarios-grid">
                {usuariosFiltrados.map((usuario) => (
                  <UsuarioCard
                    key={usuario._id}
                    usuario={usuario}
                    onEditar={puedeGestionar ? abrirEdicion : undefined}
                    onEliminar={puedeGestionar ? eliminarUsuario : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {puedeGestionar && (
          <UsuarioModal
            abierto={modalAbierto}
            titulo={usuarioSeleccionado ? "Editar usuario" : "Nuevo usuario"}
            onCerrar={cerrarModal}
          >
            <UsuarioForm
              usuario={usuarioSeleccionado}
              onGuardado={manejarGuardado}
              onCancelar={cerrarModal}
            />
          </UsuarioModal>
        )}
      </main>
    </DashboardLayout>
  );
}
