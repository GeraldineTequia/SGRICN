"use client";

import { Donacion } from "@/types/donaciones";

interface Catastrofe {
  _id: string;
  titulo: string;
}

interface DonacionFiltersProps {
  donaciones: Donacion[];
  catastrofes?: Catastrofe[];

  busqueda: string;
  estado: string;
  metodoPago: string;
  catastrofeId: string;

  onBusquedaChange: (valor: string) => void;
  onEstadoChange: (valor: string) => void;
  onMetodoPagoChange: (valor: string) => void;
  onCatastrofeChange: (valor: string) => void;
  onLimpiar: () => void;
}

export default function DonacionFilters({
  busqueda,
  estado,
  metodoPago,
  catastrofeId,
  catastrofes = [],
  onBusquedaChange,
  onEstadoChange,
  onMetodoPagoChange,
  onCatastrofeChange,
  onLimpiar,
}: DonacionFiltersProps) {
  const hayFiltrosActivos =
    busqueda.trim() !== "" ||
    estado !== "" ||
    metodoPago !== "" ||
    catastrofeId !== "";

  return (
    <section className="donaciones-filters">
      {/* ======================================
          BÚSQUEDA
      ======================================= */}

      <div className="donaciones-filter-group donaciones-filter-search">
        <label htmlFor="donacion-busqueda">Buscar donación</label>

        <input
          id="donacion-busqueda"
          type="text"
          value={busqueda}
          onChange={(event) => onBusquedaChange(event.target.value)}
          placeholder="Referencia, transacción o usuario..."
        />
      </div>

      {/* ======================================
          ESTADO
      ======================================= */}

      <div className="donaciones-filter-group">
        <label htmlFor="donacion-estado">Estado</label>

        <select
          id="donacion-estado"
          value={estado}
          onChange={(event) => onEstadoChange(event.target.value)}
        >
          <option value="">Todos los estados</option>

          <option value="pendiente">Pendiente</option>

          <option value="aprobada">Aprobada</option>

          <option value="rechazada">Rechazada</option>

          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {/* ======================================
          MÉTODO DE PAGO
      ======================================= */}

      <div className="donaciones-filter-group">
        <label htmlFor="donacion-metodo">Método de pago</label>

        <select
          id="donacion-metodo"
          value={metodoPago}
          onChange={(event) => onMetodoPagoChange(event.target.value)}
        >
          <option value="">Todos los métodos</option>

          <option value="PSE">PSE</option>

          <option value="tarjeta">Tarjeta</option>

          <option value="transferencia">Transferencia bancaria</option>

          <option value="efectivo">Efectivo</option>
        </select>
      </div>

      {/* ======================================
          CATÁSTROFE
      ======================================= */}

      <div className="donaciones-filter-group">
        <label htmlFor="donacion-catastrofe">Catástrofe</label>

        <select
          id="donacion-catastrofe"
          value={catastrofeId}
          onChange={(event) => onCatastrofeChange(event.target.value)}
        >
          <option value="">Todas las catástrofes</option>

          {catastrofes.map((catastrofe) => (
            <option key={catastrofe._id} value={catastrofe._id}>
              {catastrofe.titulo}
            </option>
          ))}
        </select>
      </div>

      {/* ======================================
          LIMPIAR
      ======================================= */}

      {hayFiltrosActivos && (
        <button
          type="button"
          className="donaciones-filter-clear"
          onClick={onLimpiar}
        >
          ↻ Limpiar filtros
        </button>
      )}
    </section>
  );
}
