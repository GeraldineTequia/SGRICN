"use client";

import React from "react";

import { Necesidad } from "@/types/necesidades";
import { Catastrofe } from "@/types/catastrofes";
import { ZonaAfectada } from "@/types/zonas";

import NecesidadCard from "./NecesidadCard";

interface NecesidadListProps {
  necesidades: Necesidad[];
  catastrofes: Catastrofe[];
  zonas: ZonaAfectada[];

  onEditar: (necesidad: Necesidad) => void;
  onEliminar: (id: string) => void;
}

export default function NecesidadList({
  necesidades,
  catastrofes,
  zonas,
  onEditar,
  onEliminar,
}: NecesidadListProps) {
  /*
   * Si no existen necesidades,
   * mostramos un mensaje informativo.
   */
  if (necesidades.length === 0) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #dfe4ea",
          borderRadius: "14px",
          padding: "50px 25px",
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
          📦
        </div>

        <h3
          style={{
            margin: "0 0 8px",
            color: "#00245f",
            fontSize: "20px",
          }}
        >
          No hay necesidades registradas
        </h3>

        <p
          style={{
            margin: 0,
            color: "#5f6b7a",
            fontSize: "14px",
          }}
        >
          Cuando se registre una necesidad, aparecerá en esta sección.
        </p>
      </div>
    );
  }

  /*
   * Buscar el nombre de una catástrofe
   * utilizando su ID.
   */
  const obtenerNombreCatastrofe = (catastrofeId: string) => {
    const catastrofe = catastrofes.find((item) => item._id === catastrofeId);

    return catastrofe?.titulo || catastrofeId;
  };

  /*
   * Buscar el nombre de una zona
   * utilizando su ID.
   */
  const obtenerNombreZona = (zonaId: string) => {
    const zona = zonas.find((item) => item._id === zonaId);

    return zona?.nombre || zonaId;
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
        gap: "20px",
      }}
    >
      {necesidades.map((necesidad) => (
        <NecesidadCard
          key={necesidad._id}
          necesidad={necesidad}
          nombreCatastrofe={obtenerNombreCatastrofe(necesidad.catastrofeId)}
          nombreZona={obtenerNombreZona(necesidad.zonaId)}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}
