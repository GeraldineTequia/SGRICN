"use client";

import React from "react";

interface DonacionModalProps {
  abierto: boolean;
  titulo: string;
  children: React.ReactNode;
  onCerrar: () => void;
}

export default function DonacionModal({
  abierto,
  titulo,
  children,
  onCerrar,
}: DonacionModalProps) {
  if (!abierto) {
    return null;
  }

  return (
    <div
      className="donacion-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCerrar();
        }
      }}
    >
      <div
        className="donacion-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donacion-modal-titulo"
      >
        {/* ======================================
            CABECERA
        ======================================= */}

        <div className="donacion-modal-header">
          <div>
            <span className="donacion-modal-kicker">Gestión de donaciones</span>

            <h2 id="donacion-modal-titulo">{titulo}</h2>
          </div>

          <button
            type="button"
            className="donacion-modal-close"
            onClick={onCerrar}
            aria-label="Cerrar ventana"
          >
            ×
          </button>
        </div>

        {/* ======================================
            CONTENIDO
        ======================================= */}

        <div className="donacion-modal-content">{children}</div>
      </div>
    </div>
  );
}
