"use client";

import { ReactNode } from "react";

interface CatastrofeModalProps {
  titulo: string;
  children: ReactNode;
  onClose: () => void;
}

export default function CatastrofeModal({
  titulo,
  children,
  onClose,
}: CatastrofeModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000,
      }}
      onMouseDown={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "950px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: "14px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 22px",
            background: "#003893",
            color: "#ffffff",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "19px",
            }}
          >
            {titulo}
          </h2>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: "#ffffff",
              fontSize: "25px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

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
