"use client";

import { TipoReporte } from "@/types/reportes";

interface ReporteFiltersProps {
  tipoReporte: TipoReporte;
  busqueda: string;
  onTipoReporteChange: (tipo: TipoReporte) => void;
  onBusquedaChange: (busqueda: string) => void;
}

export default function ReporteFilters({
  tipoReporte,
  busqueda,
  onTipoReporteChange,
  onBusquedaChange,
}: ReporteFiltersProps) {
  function limpiarFiltros() {
    onTipoReporteChange("general");
    onBusquedaChange("");
  }

  const filtrosActivos =
    tipoReporte !== "general" || busqueda.trim().length > 0;

  return (
    <section
      className="reportes-filters-panel"
      aria-label="Filtros de reportes"
    >
      <div className="reportes-filters-header">
        <div>
          <span className="reportes-section-eyebrow">
            CONSULTA DE INFORMACIÓN
          </span>

          <h2 className="reportes-filters-title">
            Filtrar reportes
          </h2>

          <p>
            Selecciona el tipo de información que deseas consultar
            y utiliza el buscador para encontrar registros específicos.
          </p>
        </div>

        {filtrosActivos && (
          <button
            type="button"
            className="reportes-clear-button"
            onClick={limpiarFiltros}
            aria-label="Limpiar filtros"
          >
            <span aria-hidden="true">↺</span>
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="reportes-filters-grid">
        {/* TIPO DE REPORTE */}
        <div className="reportes-filter-field">
          <label htmlFor="tipo-reporte">
            Tipo de reporte
          </label>

          <select
            id="tipo-reporte"
            name="tipo-reporte"
            value={tipoReporte}
            onChange={(event) =>
              onTipoReporteChange(
                event.target.value as TipoReporte
              )
            }
          >
            <option value="general">
              Resumen general
            </option>

            <option value="catastrofes">
              Catástrofes
            </option>

            <option value="poblacion">
              Población afectada
            </option>

            <option value="necesidades">
              Necesidades
            </option>

            <option value="donaciones">
              Donaciones
            </option>
          </select>
        </div>

        {/* BÚSQUEDA */}
        <div className="reportes-filter-field reportes-search-field">
          <label htmlFor="busqueda-reporte">
            Buscar
          </label>

          <div className="reportes-input-wrapper">
            <span
              className="reportes-input-icon"
              aria-hidden="true"
            >
              🔎
            </span>

            <input
              id="busqueda-reporte"
              name="busqueda-reporte"
              type="search"
              value={busqueda}
              onChange={(event) =>
                onBusquedaChange(event.target.value)
              }
              placeholder="Buscar por nombre, ubicación, estado..."
              autoComplete="off"
              aria-label="Buscar en el reporte"
            />

            {busqueda && (
              <button
                type="button"
                className="reportes-input-clear"
                onClick={() => onBusquedaChange("")}
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* INDICADOR DE FILTROS */}
      <div className="reportes-filter-status">
        <div className="reportes-filter-status-icon">
          {filtrosActivos ? "✓" : "ℹ"}
        </div>

        <div>
          <strong>
            {filtrosActivos
              ? "Filtros aplicados"
              : "Sin filtros adicionales"}
          </strong>

          <span>
            {filtrosActivos
              ? " La información mostrada corresponde a los criterios seleccionados."
              : " Se muestran todos los registros disponibles para el tipo seleccionado."}
          </span>
        </div>
      </div>
    </section>
  );
}
