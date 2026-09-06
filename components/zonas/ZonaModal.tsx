"use client";

import { ReactNode } from "react";

interface ZonaModalProps {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}

export default function ZonaModal({
  abierto,
  titulo,
  onCerrar,
  children,
}: ZonaModalProps) {
  if (!abierto) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 36, 95, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onCerrar();
        }
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "850px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: "14px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            background: "#00245f",
            color: "#ffffff",
            padding: "18px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: "14px 14px 0 0",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
            }}
          >
            {titulo}
          </h2>

          <button
            type="button"
            onClick={onCerrar}
            style={{
              border: "none",
              background: "rgba(255,255,255,0.12)",
              color: "#ffffff",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div
          style={{
            padding: "22px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
