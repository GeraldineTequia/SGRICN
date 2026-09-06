"use client";

import { ZonaAfectada } from "@/types/zonas";
import ZonaCard from "./ZonaCard";

interface ZonaListProps {
  zonas: ZonaAfectada[];
  catastrofes: {
    _id: string;
    titulo: string;
  }[];
  onEditar: (zona: ZonaAfectada) => void;
  onEliminar: (id: string) => void;
  onCambiarEstado: (zona: ZonaAfectada) => void;
}

export default function ZonaList({
  zonas,
  catastrofes,
  onEditar,
  onEliminar,
  onCambiarEstado,
}: ZonaListProps) {
  if (zonas.length === 0) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #dfe4ea",
          borderRadius: "12px",
          padding: "45px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "42px",
            marginBottom: "12px",
          }}
        >
          📍
        </div>

        <h3
          style={{
            margin: "0 0 8px",
            color: "#00245f",
          }}
        >
          No hay zonas afectadas
        </h3>

        <p
          style={{
            margin: 0,
            color: "#5f6b7a",
          }}
        >
          No se encontraron zonas con los filtros seleccionados.
        </p>
      </div>
    );
  }

  const obtenerNombreCatastrofe = (catastrofeId: string) => {
    const catastrofe = catastrofes.find((item) => item._id === catastrofeId);

    return catastrofe?.titulo;
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        gap: "18px",
      }}
    >
      {zonas.map((zona) => (
        <ZonaCard
          key={zona._id}
          zona={zona}
          nombreCatastrofe={obtenerNombreCatastrofe(zona.catastrofeId)}
          onEditar={onEditar}
          onEliminar={onEliminar}
          onCambiarEstado={onCambiarEstado}
        />
      ))}
    </div>
  );
}
