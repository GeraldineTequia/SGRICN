"use client";

import React, { useEffect, useMemo, useState } from "react";

import { CategoriaNoticia, EstadoNoticia, Noticia } from "@/types/noticias";

interface AutorReferencia {
  _id: string;
  nombre: string;
  apellido: string;
  correo?: string;
  rol?: string;
  estado?: string;
}

interface CatastrofeReferencia {
  _id: string;
  titulo: string;
  estado?: string;
}

interface NoticiaFormProps {
  noticia: Noticia | null;
  autores: AutorReferencia[];
  catastrofes: CatastrofeReferencia[];
  onGuardado: (noticia: Noticia) => void;
  onCancelar: () => void;
}

interface FormularioNoticia {
  titulo: string;
  resumen: string;
  contenido: string;
  categoria: CategoriaNoticia;
  imagenUrl: string;
  autorId: string;
  catastrofeId: string;
  estado: EstadoNoticia;
  fechaPublicacion: string;
}

const formularioInicial: FormularioNoticia = {
  titulo: "",
  resumen: "",
  contenido: "",
  categoria: "emergencia",
  imagenUrl: "",
  autorId: "",
  catastrofeId: "",
  estado: "borrador",
  fechaPublicacion: "",
};

export default function NoticiaForm({
  noticia,
  autores,
  catastrofes,
  onGuardado,
  onCancelar,
}: NoticiaFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioNoticia>(formularioInicial);

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  const [mensajeExito, setMensajeExito] = useState("");

  /* =====================================================
     CARGAR DATOS DE EDICIÓN
     ===================================================== */

  useEffect(() => {
    if (noticia) {
      setFormulario({
        titulo: noticia.titulo,
        resumen: noticia.resumen,
        contenido: noticia.contenido,
        categoria: noticia.categoria,
        imagenUrl: noticia.imagenUrl || "",
        autorId: noticia.autorId,
        catastrofeId: noticia.catastrofeId,
        estado: noticia.estado,
        fechaPublicacion: noticia.fechaPublicacion
          ? noticia.fechaPublicacion.slice(0, 16)
          : "",
      });
    } else {
      setFormulario(formularioInicial);
    }

    setError("");
    setMensajeExito("");
  }, [noticia]);

  /* =====================================================
     AUTORES DISPONIBLES
     ===================================================== */

  const autoresDisponibles = useMemo(() => {
    return autores.filter((autor) => autor.estado !== "inactivo");
  }, [autores]);

  /* =====================================================
     CATÁSTROFES DISPONIBLES
     ===================================================== */

  const catastrofesDisponibles = useMemo(() => {
    return catastrofes.filter(
      (catastrofe) => catastrofe.estado !== "finalizada"
    );
  }, [catastrofes]);

  /* =====================================================
     ACTUALIZAR CAMPO
     ===================================================== */

  function actualizarCampo(campo: keyof FormularioNoticia, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    setError("");
    setMensajeExito("");
  }

  /* =====================================================
     VALIDACIONES DEL FRONTEND
     ===================================================== */

  function validarFormulario() {
    if (!formulario.titulo.trim()) {
      return "El título de la noticia es obligatorio.";
    }

    if (formulario.titulo.trim().length < 5) {
      return "El título debe tener al menos 5 caracteres.";
    }

    if (formulario.titulo.trim().length > 200) {
      return "El título no puede superar los 200 caracteres.";
    }

    if (!formulario.resumen.trim()) {
      return "El resumen de la noticia es obligatorio.";
    }

    if (formulario.resumen.trim().length > 500) {
      return "El resumen no puede superar los 500 caracteres.";
    }

    if (!formulario.contenido.trim()) {
      return "El contenido de la noticia es obligatorio.";
    }

    if (formulario.contenido.trim().length < 20) {
      return "El contenido debe tener al menos 20 caracteres.";
    }

    if (!formulario.autorId) {
      return "Debes seleccionar el autor de la noticia.";
    }

    if (!formulario.catastrofeId) {
      return "Debes seleccionar la catástrofe relacionada.";
    }

    if (!formulario.categoria) {
      return "Debes seleccionar una categoría.";
    }

    if (!formulario.estado) {
      return "Debes seleccionar un estado.";
    }

    return "";
  }

  /* =====================================================
     GUARDAR
     ===================================================== */

  async function manejarSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMensajeExito("");

    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setGuardando(true);

    try {
      const datos = {
        titulo: formulario.titulo.trim(),

        resumen: formulario.resumen.trim(),

        contenido: formulario.contenido.trim(),

        categoria: formulario.categoria,

        imagenUrl: formulario.imagenUrl.trim(),

        autorId: formulario.autorId,

        catastrofeId: formulario.catastrofeId,

        estado: formulario.estado,

        fechaPublicacion: formulario.fechaPublicacion
          ? new Date(formulario.fechaPublicacion).toISOString()
          : new Date().toISOString(),
      };

      const url = noticia ? `/api/noticias/${noticia._id}` : "/api/noticias";

      const metodo = noticia ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.success) {
        throw new Error(
          resultado.message || "No fue posible guardar la noticia."
        );
      }

      setMensajeExito(
        noticia
          ? "Noticia actualizada correctamente."
          : "Noticia registrada correctamente."
      );

      if (resultado.data) {
        onGuardado(resultado.data);
      }
    } catch (error) {
      console.error("Error guardando noticia:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar la noticia."
      );
    } finally {
      setGuardando(false);
    }
  }

  /* =====================================================
     CONTADOR DE CONTENIDO
     ===================================================== */

  const caracteresResumen = formulario.resumen.length;

  const caracteresContenido = formulario.contenido.length;

  return (
    <form className="noticia-form" onSubmit={manejarSubmit}>
      {/* =====================================================
          INFORMACIÓN GENERAL
          ===================================================== */}

      <section className="noticia-form-section">
        <div className="noticia-form-section-header">
          <div>
            <span className="noticia-form-kicker">Información general</span>

            <h3>Datos de la noticia</h3>
          </div>
        </div>

        <div className="noticia-form-grid">
          {/* TÍTULO */}

          <div className="noticia-form-field noticia-form-field-full">
            <label htmlFor="noticia-titulo">
              Título
              <span>*</span>
            </label>

            <input
              id="noticia-titulo"
              type="text"
              value={formulario.titulo}
              onChange={(event) =>
                actualizarCampo("titulo", event.target.value)
              }
              placeholder="Ej. Continúan las labores de atención en Medellín"
              maxLength={200}
            />

            <small>{formulario.titulo.length}/200 caracteres</small>
          </div>

          {/* RESUMEN */}

          <div className="noticia-form-field noticia-form-field-full">
            <label htmlFor="noticia-resumen">
              Resumen
              <span>*</span>
            </label>

            <textarea
              id="noticia-resumen"
              value={formulario.resumen}
              onChange={(event) =>
                actualizarCampo("resumen", event.target.value)
              }
              placeholder="Escribe un resumen breve de la noticia..."
              rows={3}
              maxLength={500}
            />

            <small>{caracteresResumen}/500 caracteres</small>
          </div>

          {/* CONTENIDO */}

          <div className="noticia-form-field noticia-form-field-full">
            <label htmlFor="noticia-contenido">
              Contenido
              <span>*</span>
            </label>

            <textarea
              id="noticia-contenido"
              value={formulario.contenido}
              onChange={(event) =>
                actualizarCampo("contenido", event.target.value)
              }
              placeholder="Escribe el contenido completo de la noticia..."
              rows={8}
            />

            <small>{caracteresContenido} caracteres</small>
          </div>
        </div>
      </section>

      {/* =====================================================
          CLASIFICACIÓN
          ===================================================== */}

      <section className="noticia-form-section">
        <div className="noticia-form-section-header">
          <div>
            <span className="noticia-form-kicker">Clasificación</span>

            <h3>Relación y estado</h3>
          </div>
        </div>

        <div className="noticia-form-grid">
          {/* CATEGORÍA */}

          <div className="noticia-form-field">
            <label htmlFor="noticia-categoria-form">
              Categoría
              <span>*</span>
            </label>

            <select
              id="noticia-categoria-form"
              value={formulario.categoria}
              onChange={(event) =>
                actualizarCampo("categoria", event.target.value)
              }
            >
              <option value="emergencia">Emergencia</option>

              <option value="prevencion">Prevención</option>

              <option value="ayuda">Ayuda</option>

              <option value="institucional">Institucional</option>

              <option value="comunidad">Comunidad</option>
            </select>
          </div>

          {/* ESTADO */}

          <div className="noticia-form-field">
            <label htmlFor="noticia-estado-form">
              Estado
              <span>*</span>
            </label>

            <select
              id="noticia-estado-form"
              value={formulario.estado}
              onChange={(event) =>
                actualizarCampo("estado", event.target.value)
              }
            >
              <option value="borrador">Borrador</option>

              <option value="publicada">Publicada</option>

              <option value="archivada">Archivada</option>
            </select>
          </div>

          {/* AUTOR */}

          <div className="noticia-form-field">
            <label htmlFor="noticia-autor">
              Autor
              <span>*</span>
            </label>

            <select
              id="noticia-autor"
              value={formulario.autorId}
              onChange={(event) =>
                actualizarCampo("autorId", event.target.value)
              }
            >
              <option value="">Selecciona un autor</option>

              {autoresDisponibles.map((autor) => (
                <option key={autor._id} value={autor._id}>
                  {autor.nombre} {autor.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* CATÁSTROFE */}

          <div className="noticia-form-field">
            <label htmlFor="noticia-catastrofe-form">
              Catástrofe relacionada
              <span>*</span>
            </label>

            <select
              id="noticia-catastrofe-form"
              value={formulario.catastrofeId}
              onChange={(event) =>
                actualizarCampo("catastrofeId", event.target.value)
              }
            >
              <option value="">Selecciona una catástrofe</option>

              {catastrofesDisponibles.map((catastrofe) => (
                <option key={catastrofe._id} value={catastrofe._id}>
                  {catastrofe.titulo}
                </option>
              ))}
            </select>
          </div>

          {/* FECHA */}

          <div className="noticia-form-field">
            <label htmlFor="noticia-fecha">Fecha de publicación</label>

            <input
              id="noticia-fecha"
              type="datetime-local"
              value={formulario.fechaPublicacion}
              onChange={(event) =>
                actualizarCampo("fechaPublicacion", event.target.value)
              }
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          IMAGEN
          ===================================================== */}

      <section className="noticia-form-section">
        <div className="noticia-form-section-header">
          <div>
            <span className="noticia-form-kicker">Recursos multimedia</span>

            <h3>Imagen de la noticia</h3>
          </div>
        </div>

        <div className="noticia-form-grid">
          <div className="noticia-form-field noticia-form-field-full">
            <label htmlFor="noticia-imagen">URL de imagen</label>

            <input
              id="noticia-imagen"
              type="url"
              value={formulario.imagenUrl}
              onChange={(event) =>
                actualizarCampo("imagenUrl", event.target.value)
              }
              placeholder="https://ejemplo.com/imagen.jpg"
            />

            <small>
              Puedes dejar este campo vacío si la noticia no tendrá imagen.
            </small>
          </div>

          {/* PREVISUALIZACIÓN */}

          {formulario.imagenUrl && (
            <div className="noticia-form-image-preview noticia-form-field-full">
              <span>Vista previa</span>

              <img
                src={formulario.imagenUrl}
                alt="Vista previa de la noticia"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          MENSAJES
          ===================================================== */}

      {error && (
        <div className="noticia-form-error" role="alert">
          <span>⚠️</span>

          <p>{error}</p>
        </div>
      )}

      {mensajeExito && (
        <div className="noticia-form-success" role="status">
          <span>✓</span>

          <p>{mensajeExito}</p>
        </div>
      )}

      {/* =====================================================
          ACCIONES
          ===================================================== */}

      <div className="noticia-form-actions">
        <button
          type="button"
          className="noticia-form-button noticia-form-button-cancel"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="noticia-form-button noticia-form-button-submit"
          disabled={guardando}
        >
          {guardando
            ? "Guardando..."
            : noticia
            ? "Guardar cambios"
            : "Publicar noticia"}
        </button>
      </div>
    </form>
  );
}
