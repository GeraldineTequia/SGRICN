"use client";

import React from "react";

import { Noticia } from "@/types/noticias";

interface CatastrofeReferencia {
  _id: string;
  titulo: string;
}

interface NoticiaFiltersProps {
  noticias: Noticia[];
  catastrofes?: CatastrofeReferencia[];

  busqueda: string;
  categoria: string;
  estado: string;
  catastrofeId: string;

  onBusquedaChange: (valor: string) => void;

  onCategoriaChange: (valor: string) => void;

  onEstadoChange: (valor: string) => void;

  onCatastrofeChange: (valor: string) => void;

  onLimpiar: () => void;
}

export default function NoticiaFilters({
  noticias,
  catastrofes = [],
  busqueda,
  categoria,
  estado,
  catastrofeId,
  onBusquedaChange,
  onCategoriaChange,
  onEstadoChange,
  onCatastrofeChange,
  onLimpiar,
}: NoticiaFiltersProps) {
  const hayFiltrosActivos =
    busqueda.trim() !== "" ||
    categoria !== "" ||
    estado !== "" ||
    catastrofeId !== "";

  return (
    <section className="noticias-filters">
      {/* =====================================================
          ENCABEZADO
          ===================================================== */}

      <div className="noticias-filters-header">
        <div>
          <span className="noticias-filters-kicker">
            Consulta de información
          </span>

          <h2>Filtrar noticias</h2>
        </div>

        <span className="noticias-filters-count">
          {noticias.length} {noticias.length === 1 ? "resultado" : "resultados"}
        </span>
      </div>

      {/* =====================================================
          CAMPOS DE FILTRO
          ===================================================== */}

      <div className="noticias-filters-grid">
        {/* -------------------------------------------------
            BÚSQUEDA
            ------------------------------------------------- */}

        <div className="noticia-filter-field noticia-filter-search">
          <label htmlFor="noticia-busqueda">Buscar noticia</label>

          <div className="noticia-filter-input-wrapper">
            <span className="noticia-filter-icon">🔎</span>

            <input
              id="noticia-busqueda"
              type="text"
              value={busqueda}
              onChange={(event) => onBusquedaChange(event.target.value)}
              placeholder="Título, resumen, autor o ID..."
            />
          </div>
        </div>

        {/* -------------------------------------------------
            CATEGORÍA
            ------------------------------------------------- */}

        <div className="noticia-filter-field">
          <label htmlFor="noticia-categoria">Categoría</label>

          <select
            id="noticia-categoria"
            value={categoria}
            onChange={(event) => onCategoriaChange(event.target.value)}
          >
            <option value="">Todas las categorías</option>

            <option value="emergencia">Emergencia</option>

            <option value="prevencion">Prevención</option>

            <option value="ayuda">Ayuda</option>

            <option value="institucional">Institucional</option>

            <option value="comunidad">Comunidad</option>
          </select>
        </div>

        {/* -------------------------------------------------
            ESTADO
            ------------------------------------------------- */}

        <div className="noticia-filter-field">
          <label htmlFor="noticia-estado">Estado</label>

          <select
            id="noticia-estado"
            value={estado}
            onChange={(event) => onEstadoChange(event.target.value)}
          >
            <option value="">Todos los estados</option>

            <option value="borrador">Borrador</option>

            <option value="publicada">Publicada</option>

            <option value="archivada">Archivada</option>
          </select>
        </div>

        {/* -------------------------------------------------
            CATÁSTROFE
            ------------------------------------------------- */}

        <div className="noticia-filter-field">
          <label htmlFor="noticia-catastrofe">Catástrofe</label>

          <select
            id="noticia-catastrofe"
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
      </div>

      {/* =====================================================
          ACCIONES
          ===================================================== */}

      {hayFiltrosActivos && (
        <div className="noticias-filters-actions">
          <button
            type="button"
            className="noticia-filter-clear"
            onClick={onLimpiar}
          >
            ✕ Limpiar filtros
          </button>
        </div>
      )}
    </section>
  );
}
