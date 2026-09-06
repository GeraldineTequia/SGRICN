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
  return (
    <section className="reportes-filters" aria-label="Filtros de reportes">
      <div className="reportes-filter-group">
        <label htmlFor="tipo-reporte">Tipo de reporte</label>

        <select
          id="tipo-reporte"
          name="tipo-reporte"
          value={tipoReporte}
          onChange={(event) =>
            onTipoReporteChange(event.target.value as TipoReporte)
          }
        >
          <option value="general">Resumen general</option>
          <option value="catastrofes">Catástrofes</option>
          <option value="poblacion">Población afectada</option>
          <option value="necesidades">Necesidades</option>
          <option value="donaciones">Donaciones</option>
        </select>
      </div>

      <div className="reportes-filter-group reportes-filter-search">
        <label htmlFor="busqueda-reporte">Buscar</label>

        <input
          id="busqueda-reporte"
          name="busqueda-reporte"
          type="search"
          value={busqueda}
          onChange={(event) => onBusquedaChange(event.target.value)}
          placeholder="Buscar en el reporte..."
          autoComplete="off"
          aria-label="Buscar en el reporte"
        />
      </div>
    </section>
  );
}
