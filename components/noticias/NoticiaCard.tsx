"use client";

import React from "react";

import { Noticia } from "@/types/noticias";

interface NoticiaCardProps {
  noticia: Noticia;
  autorNombre?: string;
  catastrofeTitulo?: string;

  /*
   * Las acciones son opcionales.
   *
   * ADMIN y FUNCIONARIO reciben estas funciones.
   * USUARIO recibe undefined y por tanto solamente
   * puede consultar la noticia.
   */
  onEditar?: (noticia: Noticia) => void;
  onEliminar?: (id: string) => void;
}

/* =========================================================
   CATEGORÍA
   ========================================================= */

function obtenerEtiquetaCategoria(categoria: Noticia["categoria"]) {
  switch (categoria) {
    case "emergencia":
      return "Emergencia";

    case "prevencion":
      return "Prevención";

    case "ayuda":
      return "Ayuda";

    case "institucional":
      return "Institucional";

    case "comunidad":
      return "Comunidad";

    default:
      return categoria;
  }
}

/* =========================================================
   ESTADO
   ========================================================= */

function obtenerEtiquetaEstado(estado: Noticia["estado"]) {
  switch (estado) {
    case "borrador":
      return "Borrador";

    case "publicada":
      return "Publicada";

    case "archivada":
      return "Archivada";

    default:
      return estado;
  }
}

/* =========================================================
   FECHA
   ========================================================= */

function formatearFecha(fecha: string) {
  if (!fecha) {
    return "Sin fecha";
  }

  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return fecha;
  }

  return fechaObjeto.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/* =========================================================
   COMPONENTE
   ========================================================= */

export default function NoticiaCard({
  noticia,
  autorNombre,
  catastrofeTitulo,
  onEditar,
  onEliminar,
}: NoticiaCardProps) {
  /*
   * Si existe al menos una acción significa que el
   * usuario tiene permisos de gestión.
   *
   * Para USUARIO ambas funciones serán undefined.
   */
  const mostrarAcciones = Boolean(onEditar) || Boolean(onEliminar);

  /* =======================================================
     EDITAR
     ======================================================= */

  function manejarEditar() {
    if (!onEditar) {
      return;
    }

    onEditar(noticia);
  }

  /* =======================================================
     ELIMINAR
     ======================================================= */

  function manejarEliminar() {
    if (!onEliminar) {
      return;
    }

    onEliminar(noticia._id);
  }

  return (
    <article className="noticia-card">
      {/* =====================================================
          IMAGEN
          ===================================================== */}

      <div className="noticia-card-image">
        {noticia.imagenUrl ? (
          <img
            src={noticia.imagenUrl}
            alt={noticia.titulo}
            className="noticia-card-image-img"
          />
        ) : (
          <div className="noticia-card-image-placeholder">
            <span>📰</span>

            <p>Sin imagen</p>
          </div>
        )}

        <span
          className={`noticia-categoria noticia-categoria-${noticia.categoria}`}
        >
          {obtenerEtiquetaCategoria(noticia.categoria)}
        </span>
      </div>

      {/* =====================================================
          CONTENIDO
          ===================================================== */}

      <div className="noticia-card-content">
        <div className="noticia-card-top">
          <span className={`noticia-estado noticia-estado-${noticia.estado}`}>
            <span className="noticia-estado-dot" />

            {obtenerEtiquetaEstado(noticia.estado)}
          </span>

          <span className="noticia-card-id">{noticia._id}</span>
        </div>

        <h3 className="noticia-card-title">{noticia.titulo}</h3>

        <p className="noticia-card-summary">{noticia.resumen}</p>

        {/* =====================================================
            INFORMACIÓN
            ===================================================== */}

        <div className="noticia-card-info">
          <div className="noticia-card-info-item">
            <span className="noticia-card-info-icon">📅</span>

            <div>
              <span className="noticia-card-info-label">Publicación</span>

              <strong>{formatearFecha(noticia.fechaPublicacion)}</strong>
            </div>
          </div>

          <div className="noticia-card-info-item">
            <span className="noticia-card-info-icon">👤</span>

            <div>
              <span className="noticia-card-info-label">Autor</span>

              <strong>{autorNombre || noticia.autorId}</strong>
            </div>
          </div>

          <div className="noticia-card-info-item">
            <span className="noticia-card-info-icon">🚨</span>

            <div>
              <span className="noticia-card-info-label">Catástrofe</span>

              <strong>{catastrofeTitulo || noticia.catastrofeId}</strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            CONTENIDO COMPLETO
            ===================================================== */}

        <details className="noticia-card-details">
          <summary>Ver contenido completo</summary>

          <div className="noticia-card-full-content">
            {noticia.contenido.split("\n").map((parrafo, indice) => (
              <p key={indice}>{parrafo}</p>
            ))}
          </div>
        </details>

        {/* =====================================================
            ACCIONES
            ===================================================== */}

        {mostrarAcciones && (
          <div className="noticia-card-actions">
            {onEditar && (
              <button
                type="button"
                className="noticia-button noticia-button-edit"
                onClick={manejarEditar}
              >
                ✏️ Editar
              </button>
            )}

            {onEliminar && (
              <button
                type="button"
                className="noticia-button noticia-button-delete"
                onClick={manejarEliminar}
              >
                🗑️ Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
