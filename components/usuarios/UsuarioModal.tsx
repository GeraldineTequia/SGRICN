"use client";

import React from "react";

interface UsuarioModalProps {
  abierto: boolean;
  titulo: string;
  children: React.ReactNode;
  onCerrar: () => void;
}

export default function UsuarioModal({
  abierto,
  titulo,
  children,
  onCerrar,
}: UsuarioModalProps) {
  if (!abierto) {
    return null;
  }

  return (
    <div
      className="usuario-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCerrar();
        }
      }}
    >
      <div
        className="usuario-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="usuario-modal-titulo"
      >
        <div className="usuario-modal-header">
          <div>
            <span className="usuario-modal-kicker">Gestión de usuarios</span>

            <h2 id="usuario-modal-titulo">{titulo}</h2>
          </div>

          <button
            type="button"
            className="usuario-modal-close"
            onClick={onCerrar}
            aria-label="Cerrar ventana"
          >
            ×
          </button>
        </div>

        <div className="usuario-modal-content">{children}</div>
      </div>
    </div>
  );
}
