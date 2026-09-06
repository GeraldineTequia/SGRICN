"use client";

import React from "react";

import { Usuario } from "@/types/usuarios";

interface UsuarioCardProps {
  usuario: Usuario;
  onEditar?: (usuario: Usuario) => void;
  onEliminar?: (id: string) => void;
}

const rolLabels: Record<Usuario["rol"], string> = {
  admin: "Administrador",
  funcionario: "Funcionario",
  usuario: "Usuario",
};

const rolClasses: Record<Usuario["rol"], string> = {
  admin: "usuario-rol-admin",
  funcionario: "usuario-rol-funcionario",
  usuario: "usuario-rol-usuario",
};

const estadoLabels: Record<Usuario["estado"], string> = {
  activo: "Activo",
  inactivo: "Inactivo",
};

function formatearFecha(fecha: string | null | undefined) {
  if (!fecha) {
    return "No registrada";
  }

  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return "Fecha no válida";
  }

  return fechaObjeto.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function UsuarioCard({
  usuario,
  onEditar,
  onEliminar,
}: UsuarioCardProps) {
  const iniciales = `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(
    0
  )}`.toUpperCase();

  const mostrarAcciones = Boolean(onEditar) || Boolean(onEliminar);

  function manejarEditar() {
    if (onEditar) {
      onEditar(usuario);
    }
  }

  function manejarEliminar() {
    if (onEliminar) {
      onEliminar(usuario._id);
    }
  }

  return (
    <article className="usuario-card">
      <div className="usuario-card-header">
        <div className="usuario-avatar">{iniciales}</div>

        <div className="usuario-card-identidad">
          <span className="usuario-card-id">{usuario._id}</span>

          <h3>
            {usuario.nombre} {usuario.apellido}
          </h3>

          <p>{usuario.correo}</p>
        </div>

        <span className={`usuario-rol ${rolClasses[usuario.rol]}`}>
          {rolLabels[usuario.rol]}
        </span>
      </div>

      <div className="usuario-card-body">
        <div className="usuario-info-item">
          <span className="usuario-info-label">Estado</span>

          <span className={`usuario-estado usuario-estado-${usuario.estado}`}>
            <span className="usuario-estado-dot" />
            {estadoLabels[usuario.estado]}
          </span>
        </div>

        <div className="usuario-info-item">
          <span className="usuario-info-label">Teléfono</span>

          <span className="usuario-info-value">
            {usuario.telefono || "No registrado"}
          </span>
        </div>

        <div className="usuario-info-item">
          <span className="usuario-info-label">Fecha de registro</span>

          <span className="usuario-info-value">
            {formatearFecha(usuario.fechaRegistro)}
          </span>
        </div>

        <div className="usuario-info-item">
          <span className="usuario-info-label">Última sesión</span>

          <span className="usuario-info-value">
            {formatearFecha(usuario.ultimaSesion)}
          </span>
        </div>
      </div>

      <div className="usuario-card-footer">
        <div className="usuario-card-created">
          <span>ID del sistema</span>

          <strong>{usuario._id}</strong>
        </div>

        {mostrarAcciones && (
          <div className="usuario-card-actions">
            {onEditar && (
              <button
                type="button"
                className="usuario-btn usuario-btn-edit"
                onClick={manejarEditar}
              >
                ✏️ Editar
              </button>
            )}

            {onEliminar && (
              <button
                type="button"
                className="usuario-btn usuario-btn-delete"
                onClick={manejarEliminar}
              >
                🗑️ Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
