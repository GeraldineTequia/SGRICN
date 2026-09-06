"use client";

import React from "react";

import NoticiaCard from "./NoticiaCard";

import { Noticia } from "@/types/noticias";

interface AutorReferencia {
  _id: string;
  nombre: string;
  apellido: string;
  correo?: string;
}

interface CatastrofeReferencia {
  _id: string;
  titulo: string;
}

interface NoticiaListProps {
  noticias: Noticia[];
  autores?: AutorReferencia[];
  catastrofes?: CatastrofeReferencia[];
  onEditar: (noticia: Noticia) => void;
  onEliminar: (id: string) => void;
}

export default function NoticiaList({
  noticias,
  autores = [],
  catastrofes = [],
  onEditar,
  onEliminar,
}: NoticiaListProps) {
  /* =====================================================
     OBTENER NOMBRE DEL AUTOR
     ===================================================== */

  function obtenerAutor(autorId: string) {
    const autor = autores.find((item) => item._id === autorId);

    if (!autor) {
      return autorId;
    }

    return `${autor.nombre} ${autor.apellido}`;
  }

  /* =====================================================
     OBTENER TÍTULO DE LA CATÁSTROFE
     ===================================================== */

  function obtenerCatastrofe(catastrofeId: string) {
    const catastrofe = catastrofes.find((item) => item._id === catastrofeId);

    if (!catastrofe) {
      return catastrofeId;
    }

    return catastrofe.titulo;
  }

  /* =====================================================
     ESTADO VACÍO
     ===================================================== */

  if (noticias.length === 0) {
    return (
      <div className="noticias-empty">
        <div className="noticias-empty-icon">📰</div>

        <h3>No hay noticias registradas</h3>

        <p>
          Actualmente no existen noticias que coincidan con los criterios de
          búsqueda.
        </p>
      </div>
    );
  }

  /* =====================================================
     LISTADO
     ===================================================== */

  return (
    <div className="noticias-grid">
      {noticias.map((noticia) => (
        <NoticiaCard
          key={noticia._id}
          noticia={noticia}
          autorNombre={obtenerAutor(noticia.autorId)}
          catastrofeTitulo={obtenerCatastrofe(noticia.catastrofeId)}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}
