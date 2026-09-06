"use client";

import React from "react";

import { Usuario } from "@/types/usuarios";

interface FuncionarioCardProps {
  funcionario: Usuario;
  onEditar?: (funcionario: Usuario) => void;
  onEliminar?: (funcionario: Usuario) => void;
}

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

export default function FuncionarioCard({
  funcionario,
  onEditar,
  onEliminar,
}: FuncionarioCardProps) {
  const iniciales = `${funcionario.nombre.charAt(
    0
  )}${funcionario.apellido.charAt(0)}`.toUpperCase();

  const mostrarAcciones = Boolean(onEditar) || Boolean(onEliminar);

  return (
    <article className="funcionario-card">
      <div className="funcionario-card-top">
        <div className="funcionario-avatar">{iniciales}</div>

        <div className="funcionario-identidad">
          <span className="funcionario-id">{funcionario._id}</span>

          <h3>
            {funcionario.nombre} {funcionario.apellido}
          </h3>

          <p>{funcionario.correo}</p>
        </div>

        <span className="funcionario-badge">Funcionario</span>
      </div>

      <div className="funcionario-card-body">
        <div className="funcionario-info">
          <span className="funcionario-info-label">Estado</span>

          <span
            className={`funcionario-estado funcionario-estado-${funcionario.estado}`}
          >
            <span className="funcionario-estado-dot" />

            {funcionario.estado === "activo" ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div className="funcionario-info">
          <span className="funcionario-info-label">Teléfono</span>

          <span className="funcionario-info-value">
            {funcionario.telefono || "No registrado"}
          </span>
        </div>

        <div className="funcionario-info">
          <span className="funcionario-info-label">Fecha de registro</span>

          <span className="funcionario-info-value">
            {formatearFecha(funcionario.fechaRegistro)}
          </span>
        </div>

        <div className="funcionario-info">
          <span className="funcionario-info-label">Última sesión</span>

          <span className="funcionario-info-value">
            {formatearFecha(funcionario.ultimaSesion)}
          </span>
        </div>
      </div>

      <div
        className={`funcionario-card-footer${
          !mostrarAcciones ? " funcionario-card-footer-sin-acciones" : ""
        }`}
      >
        <div className="funcionario-responsibility">
          <span>Rol del sistema</span>

          <strong>Gestión operativa</strong>
        </div>

        {mostrarAcciones && (
          <div className="funcionario-actions">
            {onEditar && (
              <button
                type="button"
                className="funcionario-btn funcionario-btn-edit"
                onClick={() => onEditar(funcionario)}
              >
                ✏️ Editar
              </button>
            )}

            {onEliminar && (
              <button
                type="button"
                className="funcionario-card-action funcionario-card-action-delete"
                onClick={() => onEliminar(funcionario)}
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
