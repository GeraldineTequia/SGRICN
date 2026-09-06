"use client";

import React from "react";

interface NoticiaModalProps {
  abierto: boolean;
  titulo: string;
  children: React.ReactNode;
  onCerrar: () => void;
}

export default function NoticiaModal({
  abierto,
  titulo,
  children,
  onCerrar,
}: NoticiaModalProps) {
  if (!abierto) {
    return null;
  }

  return (
    <div
      className="noticia-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCerrar();
        }
      }}
    >
      <div
        className="noticia-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="noticia-modal-titulo"
      >
        {/* =====================================================
            ENCABEZADO
            ===================================================== */}

        <div className="noticia-modal-header">
          <div>
            <span className="noticia-modal-kicker">Gestión de noticias</span>

            <h2 id="noticia-modal-titulo">{titulo}</h2>
          </div>

          <button
            type="button"
            className="noticia-modal-close"
            onClick={onCerrar}
            aria-label="Cerrar ventana"
          >
            ×
          </button>
        </div>

        {/* =====================================================
            CONTENIDO
            ===================================================== */}

        <div className="noticia-modal-content">{children}</div>
      </div>
    </div>
  );
}
