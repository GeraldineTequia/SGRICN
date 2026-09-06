"use client";

import React from "react";

import { CentroDonacion } from "@/types/centros";
import CentroCard from "./CentroCard";

interface CentroListProps {
  centros: CentroDonacion[];

  onEditar: (centro: CentroDonacion) => void;

  onEliminar: (id: string) => void;
}

export default function CentroList({
  centros,
  onEditar,
  onEliminar,
}: CentroListProps) {
  if (centros.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          padding: "50px 25px",
          background: "#ffffff",
          border: "1px solid #dfe4ea",
          borderRadius: "16px",
          textAlign: "center",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            marginBottom: "15px",
          }}
        >
          🏢
        </div>

        <h3
          style={{
            margin: "0 0 8px",
            color: "#00245f",
            fontSize: "20px",
          }}
        >
          No hay centros de donación
        </h3>

        <p
          style={{
            margin: 0,
            color: "#5f6b7a",
            fontSize: "14px",
          }}
        >
          No se encontraron centros de donación que coincidan con los criterios
          seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "20px",
        width: "100%",
      }}
    >
      {centros.map((centro) => (
        <CentroCard
          key={centro._id}
          centro={centro}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}
