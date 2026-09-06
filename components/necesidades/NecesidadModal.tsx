"use client";

import React from "react";

import { Necesidad } from "@/types/necesidades";

interface NecesidadModalProps {
  abierto: boolean;
  titulo: string;
  necesidad?: Necesidad | null;
  onCerrar: () => void;
  children: React.ReactNode;
}

export default function NecesidadModal({
  abierto,
  titulo,
  onCerrar,
  children,
}: NecesidadModalProps) {
  if (!abierto) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0, 36, 95, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        overflowY: "auto",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCerrar();
        }
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          maxHeight: "95vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            padding: "20px 24px",
            background: "linear-gradient(135deg, #003893, #00245f)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            borderBottom: "4px solid #fcd116",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#ffffff",
                fontSize: "22px",
              }}
            >
              📦 {titulo}
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "rgba(255, 255, 255, 0.85)",
                fontSize: "13px",
              }}
            >
              Registra y administra las necesidades de atención de las zonas
              afectadas.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar modal"
            style={{
              width: "40px",
              height: "40px",
              border: "none",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontSize: "22px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div
          style={{
            padding: "24px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
