"use client";

import { ReactNode } from "react";

interface ConfiguracionSectionProps {
  titulo: string;
  descripcion: string;
  icono: string;
  children: ReactNode;
}

export default function ConfiguracionSection({
  titulo,
  descripcion,
  icono,
  children,
}: ConfiguracionSectionProps) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #dfe4ea",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        overflow: "hidden",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "20px 24px",
          borderBottom: "1px solid #dfe4ea",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "10px",
            background: "#003893",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "21px",
          }}
        >
          {icono}
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              color: "#00245f",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            {titulo}
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              color: "#5f6b7a",
              fontSize: "14px",
            }}
          >
            {descripcion}
          </p>
        </div>
      </div>

      <div style={{ padding: "24px" }}>{children}</div>
    </section>
  );
}
