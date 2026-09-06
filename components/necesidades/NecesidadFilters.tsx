"use client";

import React from "react";

import { Catastrofe } from "@/types/catastrofes";
import { PrioridadNecesidad, EstadoNecesidad } from "@/types/necesidades";

interface NecesidadFiltersProps {
  busqueda: string;
  setBusqueda: (valor: string) => void;

  catastrofeSeleccionada: string;
  setCatastrofeSeleccionada: (valor: string) => void;

  categoriaSeleccionada: string;
  setCategoriaSeleccionada: (valor: string) => void;

  prioridadSeleccionada: PrioridadNecesidad | "";

  setPrioridadSeleccionada: (valor: PrioridadNecesidad | "") => void;

  estadoSeleccionado: EstadoNecesidad | "";

  setEstadoSeleccionado: (valor: EstadoNecesidad | "") => void;

  catastrofes: Catastrofe[];
}

export default function NecesidadFilters({
  busqueda,
  setBusqueda,
  catastrofeSeleccionada,
  setCatastrofeSeleccionada,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  prioridadSeleccionada,
  setPrioridadSeleccionada,
  estadoSeleccionado,
  setEstadoSeleccionado,
  catastrofes,
}: NecesidadFiltersProps) {
  /*
   * Limpiar todos los filtros
   */
  const limpiarFiltros = () => {
    setBusqueda("");
    setCatastrofeSeleccionada("");
    setCategoriaSeleccionada("");
    setPrioridadSeleccionada("");
    setEstadoSeleccionado("");
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dfe4ea",
        borderRadius: "14px",
        padding: "20px",
        marginBottom: "24px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Título */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
          marginBottom: "18px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#00245f",
              fontSize: "18px",
            }}
          >
            🔎 Filtrar necesidades
          </h3>

          <p
            style={{
              margin: "5px 0 0",
              color: "#5f6b7a",
              fontSize: "13px",
            }}
          >
            Utiliza los filtros para encontrar rápidamente una necesidad.
          </p>
        </div>

        <button
          type="button"
          onClick={limpiarFiltros}
          style={{
            border: "1px solid #dfe4ea",
            borderRadius: "8px",
            padding: "9px 14px",
            background: "#ffffff",
            color: "#003893",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ↺ Limpiar filtros
        </button>
      </div>

      {/* Filtros */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
        }}
      >
        {/* Búsqueda */}
        <div>
          <label
            htmlFor="buscar-necesidad"
            style={{
              display: "block",
              marginBottom: "6px",
              color: "#17202a",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            Buscar
          </label>

          <input
            id="buscar-necesidad"
            type="text"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Nombre o descripción..."
            style={{
              width: "100%",
              padding: "11px 12px",
              border: "1px solid #cfd6df",
              borderRadius: "8px",
              outline: "none",
              color: "#17202a",
              background: "#ffffff",
            }}
          />
        </div>

        {/* Catástrofe */}
        <div>
          <label
            htmlFor="filtro-catastrofe-necesidad"
            style={{
              display: "block",
              marginBottom: "6px",
              color: "#17202a",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            Catástrofe
          </label>

          <select
            id="filtro-catastrofe-necesidad"
            value={catastrofeSeleccionada}
            onChange={(event) => setCatastrofeSeleccionada(event.target.value)}
            style={{
              width: "100%",
              padding: "11px 12px",
              border: "1px solid #cfd6df",
              borderRadius: "8px",
              outline: "none",
              color: "#17202a",
              background: "#ffffff",
            }}
          >
            <option value="">Todas las catástrofes</option>

            {catastrofes.map((catastrofe) => (
              <option key={catastrofe._id} value={catastrofe._id}>
                {catastrofe.titulo}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label
            htmlFor="filtro-categoria-necesidad"
            style={{
              display: "block",
              marginBottom: "6px",
              color: "#17202a",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            Categoría
          </label>

          <select
            id="filtro-categoria-necesidad"
            value={categoriaSeleccionada}
            onChange={(event) => setCategoriaSeleccionada(event.target.value)}
            style={{
              width: "100%",
              padding: "11px 12px",
              border: "1px solid #cfd6df",
              borderRadius: "8px",
              outline: "none",
              color: "#17202a",
              background: "#ffffff",
            }}
          >
            <option value="">Todas las categorías</option>

            <option value="Alimentos">Alimentos</option>

            <option value="Agua">Agua</option>

            <option value="Medicamentos">Medicamentos</option>

            <option value="Higiene">Higiene</option>

            <option value="Ropa">Ropa</option>

            <option value="Vivienda">Vivienda</option>

            <option value="Transporte">Transporte</option>

            <option value="Servicios básicos">Servicios básicos</option>

            <option value="Otro">Otro</option>
          </select>
        </div>

        {/* Prioridad */}
        <div>
          <label
            htmlFor="filtro-prioridad-necesidad"
            style={{
              display: "block",
              marginBottom: "6px",
              color: "#17202a",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            Prioridad
          </label>

          <select
            id="filtro-prioridad-necesidad"
            value={prioridadSeleccionada}
            onChange={(event) =>
              setPrioridadSeleccionada(
                event.target.value as PrioridadNecesidad | ""
              )
            }
            style={{
              width: "100%",
              padding: "11px 12px",
              border: "1px solid #cfd6df",
              borderRadius: "8px",
              outline: "none",
              color: "#17202a",
              background: "#ffffff",
            }}
          >
            <option value="">Todas las prioridades</option>

            <option value="critica">🔴 Crítica</option>

            <option value="alta">🟠 Alta</option>

            <option value="media">🟡 Media</option>

            <option value="baja">🟢 Baja</option>
          </select>
        </div>

        {/* Estado */}
        <div>
          <label
            htmlFor="filtro-estado-necesidad"
            style={{
              display: "block",
              marginBottom: "6px",
              color: "#17202a",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            Estado
          </label>

          <select
            id="filtro-estado-necesidad"
            value={estadoSeleccionado}
            onChange={(event) =>
              setEstadoSeleccionado(event.target.value as EstadoNecesidad | "")
            }
            style={{
              width: "100%",
              padding: "11px 12px",
              border: "1px solid #cfd6df",
              borderRadius: "8px",
              outline: "none",
              color: "#17202a",
              background: "#ffffff",
            }}
          >
            <option value="">Todos los estados</option>

            <option value="pendiente">🔴 Pendiente</option>

            <option value="en_atencion">🟠 En atención</option>

            <option value="atendida">🟢 Atendida</option>
          </select>
        </div>
      </div>
    </div>
  );
}
