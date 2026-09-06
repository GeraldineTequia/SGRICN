"use client";

import React from "react";

import { Usuario } from "@/types/usuarios";

interface FuncionarioFiltersProps {
  busqueda: string;
  estado: Usuario["estado"] | "todos";
  funcionarios: Usuario[];
  onBusquedaChange: (valor: string) => void;
  onEstadoChange: (valor: Usuario["estado"] | "todos") => void;
  onLimpiar: () => void;
}

export default function FuncionarioFilters({
  busqueda,
  estado,
  funcionarios,
  onBusquedaChange,
  onEstadoChange,
  onLimpiar,
}: FuncionarioFiltersProps) {
  return (
    <section className="funcionarios-filters">
      <div className="funcionarios-filter-header">
        <div>
          <span className="funcionarios-filter-kicker">Buscar y filtrar</span>

          <h2>Funcionarios del sistema</h2>
        </div>

        <span className="funcionarios-filter-count">
          {funcionarios.length} resultado
          {funcionarios.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="funcionarios-filter-grid">
        <div className="funcionario-filter-field funcionario-filter-search">
          <label htmlFor="funcionario-busqueda">Buscar funcionario</label>

          <div className="funcionario-search-wrapper">
            <span className="funcionario-search-icon">🔎</span>

            <input
              id="funcionario-busqueda"
              type="text"
              value={busqueda}
              onChange={(event) => onBusquedaChange(event.target.value)}
              placeholder="Nombre, correo, teléfono o ID..."
            />
          </div>
        </div>

        <div className="funcionario-filter-field">
          <label htmlFor="funcionario-estado">Estado</label>

          <select
            id="funcionario-estado"
            value={estado}
            onChange={(event) =>
              onEstadoChange(event.target.value as Usuario["estado"] | "todos")
            }
          >
            <option value="todos">Todos los estados</option>

            <option value="activo">Activos</option>

            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        <div className="funcionario-filter-actions">
          <button
            type="button"
            className="funcionario-btn funcionario-btn-clear"
            onClick={onLimpiar}
          >
            ↺ Limpiar
          </button>
        </div>
      </div>
    </section>
  );
}
