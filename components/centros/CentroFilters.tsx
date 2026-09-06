"use client";

import React from "react";

import { CentroDonacion } from "@/types/centros";

interface CentroFiltersProps {
  busqueda: string;
  setBusqueda: (valor: string) => void;

  municipioSeleccionado: string;
  setMunicipioSeleccionado: (valor: string) => void;

  estadoSeleccionado: string;
  setEstadoSeleccionado: (valor: string) => void;

  autorizacionSeleccionada: string;
  setAutorizacionSeleccionada: (valor: string) => void;

  centros: CentroDonacion[];
}

export default function CentroFilters({
  busqueda,
  setBusqueda,
  municipioSeleccionado,
  setMunicipioSeleccionado,
  estadoSeleccionado,
  setEstadoSeleccionado,
  autorizacionSeleccionada,
  setAutorizacionSeleccionada,
  centros,
}: CentroFiltersProps) {
  /*
   * Obtenemos los municipios existentes
   * directamente desde los centros cargados.
   */
  const municipios = Array.from(
    new Set(centros.map((centro) => centro.municipio).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "es"));

  const limpiarFiltros = () => {
    setBusqueda("");
    setMunicipioSeleccionado("");
    setEstadoSeleccionado("");
    setAutorizacionSeleccionada("");
  };

  const hayFiltrosActivos =
    busqueda !== "" ||
    municipioSeleccionado !== "" ||
    estadoSeleccionado !== "" ||
    autorizacionSeleccionada !== "";

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dfe4ea",
        borderRadius: "16px",
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
              fontSize: "17px",
            }}
          >
            🔎 Buscar y filtrar centros
          </h3>

          <p
            style={{
              margin: "5px 0 0",
              color: "#5f6b7a",
              fontSize: "12px",
            }}
          >
            Utiliza los filtros para encontrar rápidamente un centro de
            donación.
          </p>
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={limpiarFiltros}
            style={{
              border: "1px solid #ce1126",
              borderRadius: "8px",
              padding: "8px 13px",
              background: "#ffffff",
              color: "#ce1126",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {/* Campos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(220px, 2fr) repeat(3, minmax(160px, 1fr))",
          gap: "14px",
        }}
      >
        {/* Búsqueda */}
        <div>
          <label
            htmlFor="busqueda-centros"
            style={{
              display: "block",
              marginBottom: "6px",
              color: "#17202a",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            Buscar
          </label>

          <div
            style={{
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "15px",
              }}
            >
              🔍
            </span>

            <input
              id="busqueda-centros"
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Nombre, dirección, correo..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px 10px 36px",
                border: "1px solid #dfe4ea",
                borderRadius: "8px",
                outline: "none",
                color: "#17202a",
                background: "#ffffff",
                fontSize: "13px",
              }}
            />
          </div>
        </div>

        {/* Municipio */}
        <div>
          <label
            htmlFor="municipio-centros"
            style={{
              display: "block",
              marginBottom: "6px",
              color: "#17202a",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            Municipio
          </label>

          <select
            id="municipio-centros"
            value={municipioSeleccionado}
            onChange={(event) => setMunicipioSeleccionado(event.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              border: "1px solid #dfe4ea",
              borderRadius: "8px",
              outline: "none",
              color: "#17202a",
              background: "#ffffff",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <option value="">Todos los municipios</option>

            {municipios.map((municipio) => (
              <option key={municipio} value={municipio}>
                {municipio}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label
            htmlFor="estado-centros"
            style={{
              display: "block",
              marginBottom: "6px",
              color: "#17202a",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            Estado
          </label>

          <select
            id="estado-centros"
            value={estadoSeleccionado}
            onChange={(event) => setEstadoSeleccionado(event.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              border: "1px solid #dfe4ea",
              borderRadius: "8px",
              outline: "none",
              color: "#17202a",
              background: "#ffffff",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <option value="">Todos los estados</option>

            <option value="activo">Activos</option>

            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        {/* Autorización */}
        <div>
          <label
            htmlFor="autorizacion-centros"
            style={{
              display: "block",
              marginBottom: "6px",
              color: "#17202a",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            Autorización
          </label>

          <select
            id="autorizacion-centros"
            value={autorizacionSeleccionada}
            onChange={(event) =>
              setAutorizacionSeleccionada(event.target.value)
            }
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              border: "1px solid #dfe4ea",
              borderRadius: "8px",
              outline: "none",
              color: "#17202a",
              background: "#ffffff",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <option value="">Todas</option>

            <option value="autorizado">Autorizados</option>

            <option value="no_autorizado">No autorizados</option>
          </select>
        </div>
      </div>
    </div>
  );
}
