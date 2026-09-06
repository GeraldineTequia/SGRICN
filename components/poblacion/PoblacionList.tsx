"use client";

import { PoblacionAfectada } from "@/types/poblacion";
import PoblacionCard from "./PoblacionCard";

interface Opcion {
  _id: string;
  nombre: string;
}

interface CatastrofeOpcion {
  _id: string;
  titulo: string;
}

interface PoblacionListProps {
  poblaciones: PoblacionAfectada[];
  catastrofes: CatastrofeOpcion[];
  zonas: Opcion[];
  onEditar: (poblacion: PoblacionAfectada) => void;
  onEliminar: (id: string) => void;
}

export default function PoblacionList({
  poblaciones,
  catastrofes,
  zonas,
  onEditar,
  onEliminar,
}: PoblacionListProps) {
  if (poblaciones.length === 0) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #dfe4ea",
          borderRadius: "12px",
          padding: "40px 20px",
          textAlign: "center",
          color: "#5f6b7a",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>👥</div>

        <h3
          style={{
            margin: "0 0 6px",
            color: "#00245f",
          }}
        >
          No hay registros de población
        </h3>

        <p style={{ margin: 0 }}>
          No se encontraron registros con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(390px, 1fr))",
        gap: "18px",
      }}
    >
      {poblaciones.map((poblacion) => {
        const catastrofe = catastrofes.find(
          (item) => item._id === poblacion.catastrofeId
        );

        const zona = zonas.find((item) => item._id === poblacion.zonaId);

        return (
          <PoblacionCard
            key={poblacion._id}
            poblacion={poblacion}
            catastrofeTitulo={catastrofe?.titulo}
            zonaNombre={zona?.nombre}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
        );
      })}
    </div>
  );
}
