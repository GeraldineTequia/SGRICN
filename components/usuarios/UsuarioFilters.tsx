"use client";

import React from "react";

import { RolUsuario, EstadoUsuario, Usuario } from "@/types/usuarios";

interface UsuarioFiltersProps {
  busqueda: string;
  rol: RolUsuario | "todos";
  estado: EstadoUsuario | "todos";
  usuarios: Usuario[];
  onBusquedaChange: (valor: string) => void;
  onRolChange: (valor: RolUsuario | "todos") => void;
  onEstadoChange: (valor: EstadoUsuario | "todos") => void;
  onLimpiar: () => void;
}

export default function UsuarioFilters({
  busqueda,
  rol,
  estado,
  usuarios,
  onBusquedaChange,
  onRolChange,
  onEstadoChange,
  onLimpiar,
}: UsuarioFiltersProps) {
  return (
    <section className="usuarios-filters">
      <div className="usuarios-filter-header">
        <div>
          <span className="usuarios-filter-kicker">Buscar y filtrar</span>

          <h2>Usuarios del sistema</h2>
        </div>

        <span className="usuarios-filter-count">
          {usuarios.length} resultado
          {usuarios.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="usuarios-filter-grid">
        <div className="usuario-filter-field usuario-filter-search">
          <label htmlFor="usuario-busqueda">Buscar usuario</label>

          <div className="usuario-search-wrapper">
            <span className="usuario-search-icon">🔎</span>

            <input
              id="usuario-busqueda"
              type="text"
              value={busqueda}
              onChange={(event) => onBusquedaChange(event.target.value)}
              placeholder="Nombre, correo, teléfono o ID..."
            />
          </div>
        </div>

        <div className="usuario-filter-field">
          <label htmlFor="usuario-rol">Rol</label>

          <select
            id="usuario-rol"
            value={rol}
            onChange={(event) =>
              onRolChange(event.target.value as RolUsuario | "todos")
            }
          >
            <option value="todos">Todos los roles</option>

            <option value="admin">Administrador</option>

            <option value="funcionario">Funcionario</option>

            <option value="usuario">Usuario</option>
          </select>
        </div>

        <div className="usuario-filter-field">
          <label htmlFor="usuario-estado">Estado</label>

          <select
            id="usuario-estado"
            value={estado}
            onChange={(event) =>
              onEstadoChange(event.target.value as EstadoUsuario | "todos")
            }
          >
            <option value="todos">Todos los estados</option>

            <option value="activo">Activos</option>

            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        <div className="usuario-filter-actions">
          <button
            type="button"
            className="usuario-btn usuario-btn-clear"
            onClick={onLimpiar}
          >
            ↺ Limpiar
          </button>
        </div>
      </div>
    </section>
  );
}
