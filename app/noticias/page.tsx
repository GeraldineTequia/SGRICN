"use client";

import React, { useEffect, useMemo, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";

import NoticiaCard from "@/components/noticias/NoticiaCard";
import NoticiaFilters from "@/components/noticias/NoticiaFilters";
import NoticiaForm from "@/components/noticias/NoticiaForm";
import NoticiaModal from "@/components/noticias/NoticiaModal";

import { useAuth } from "@/components/auth/AuthProvider";

import { Noticia } from "@/types/noticias";

/* =========================================================
   REFERENCIAS
   ========================================================= */

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

/* =========================================================
   PÁGINA
   ========================================================= */

export default function NoticiasPage() {
  /* =====================================================
     AUTENTICACIÓN Y PERMISOS
     ===================================================== */

  const { role } = useAuth();

  const puedeGestionar = role === "ADMIN" || role === "FUNCIONARIO";

  /* =====================================================
     ESTADO
     ===================================================== */

  const [noticias, setNoticias] = useState<Noticia[]>([]);

  const [autores, setAutores] = useState<AutorReferencia[]>([]);

  const [catastrofes, setCatastrofes] = useState<CatastrofeReferencia[]>([]);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  /* =====================================================
     FILTROS
     ===================================================== */

  const [busqueda, setBusqueda] = useState("");

  const [categoria, setCategoria] = useState("");

  const [estado, setEstado] = useState("");

  const [catastrofeId, setCatastrofeId] = useState("");

  /* =====================================================
     MODAL
     ===================================================== */

  const [modalAbierto, setModalAbierto] = useState(false);

  const [noticiaSeleccionada, setNoticiaSeleccionada] =
    useState<Noticia | null>(null);

  /* =====================================================
     CARGAR DATOS
     ===================================================== */

  useEffect(() => {
    cargarDatos();
  }, [role]);

  async function cargarDatos() {
    setCargando(true);
    setError("");

    try {
      /*
       * Las noticias y catástrofes pueden ser consultadas
       * por los tres roles.
       *
       * Los autores solamente son necesarios para
       * ADMIN y FUNCIONARIO porque USUARIO no gestiona
       * noticias ni necesita consultar usuarios.
       */

      const peticiones: Promise<Response>[] = [
        fetch("/api/noticias"),
        fetch("/api/catastrofes"),
      ];

      if (puedeGestionar) {
        peticiones.push(fetch("/api/usuarios"));
      }

      const respuestas = await Promise.all(peticiones);

      const respuestaNoticias = respuestas[0];
      const respuestaCatastrofes = respuestas[1];
      const respuestaUsuarios = puedeGestionar ? respuestas[2] : null;

      const resultadoNoticias = await respuestaNoticias.json();

      const resultadoCatastrofes = await respuestaCatastrofes.json();

      const resultadoUsuarios = respuestaUsuarios
        ? await respuestaUsuarios.json()
        : null;

      /* =================================================
         NOTICIAS
         ================================================= */

      if (!respuestaNoticias.ok || !resultadoNoticias.success) {
        throw new Error(
          resultadoNoticias.message || "No fue posible cargar las noticias."
        );
      }

      /* =================================================
         CATÁSTROFES
         ================================================= */

      if (!respuestaCatastrofes.ok || !resultadoCatastrofes.success) {
        throw new Error(
          resultadoCatastrofes.message ||
            "No fue posible cargar las catástrofes."
        );
      }

      /* =================================================
         USUARIOS / AUTORES
         ================================================= */

      if (puedeGestionar) {
        if (
          !respuestaUsuarios ||
          !resultadoUsuarios ||
          !respuestaUsuarios.ok ||
          !resultadoUsuarios.success
        ) {
          throw new Error(
            resultadoUsuarios?.message || "No fue posible cargar los usuarios."
          );
        }

        setAutores(resultadoUsuarios.data || []);
      } else {
        /*
         * USUARIO no tiene acceso a /api/usuarios.
         * No hacemos la petición y tampoco necesitamos
         * los autores para mostrar las noticias.
         */
        setAutores([]);
      }

      setNoticias(resultadoNoticias.data || []);

      setCatastrofes(resultadoCatastrofes.data || []);
    } catch (error) {
      console.error("Error cargando módulo de noticias:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error cargando las noticias."
      );
    } finally {
      setCargando(false);
    }
  }

  /* =====================================================
     NOTICIAS FILTRADAS
     ===================================================== */

  const noticiasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return noticias.filter((noticia) => {
      const autor = autores.find((item) => item._id === noticia.autorId);

      const nombreAutor = autor ? `${autor.nombre} ${autor.apellido}` : "";

      const coincideBusqueda =
        !texto ||
        noticia.titulo.toLowerCase().includes(texto) ||
        noticia.resumen.toLowerCase().includes(texto) ||
        noticia.contenido.toLowerCase().includes(texto) ||
        nombreAutor.toLowerCase().includes(texto) ||
        noticia._id.toLowerCase().includes(texto);

      const coincideCategoria = !categoria || noticia.categoria === categoria;

      /*
       * USUARIO solamente recibe noticias publicadas
       * desde la API.
       *
       * Este filtro adicional evita que una noticia no
       * publicada llegue a mostrarse si en algún momento
       * la API devuelve información adicional.
       */
      const coincideEstadoUsuario =
        role !== "USUARIO" || noticia.estado === "publicada";

      const coincideEstado = !estado || noticia.estado === estado;

      const coincideCatastrofe =
        !catastrofeId || noticia.catastrofeId === catastrofeId;

      return (
        coincideBusqueda &&
        coincideCategoria &&
        coincideEstadoUsuario &&
        coincideEstado &&
        coincideCatastrofe
      );
    });
  }, [noticias, autores, busqueda, categoria, estado, catastrofeId, role]);

  /* =====================================================
     ESTADÍSTICAS
     ===================================================== */

  const estadisticas = useMemo(() => {
    return {
      total: noticias.length,

      publicadas: noticias.filter((noticia) => noticia.estado === "publicada")
        .length,

      borradores: noticias.filter((noticia) => noticia.estado === "borrador")
        .length,

      archivadas: noticias.filter((noticia) => noticia.estado === "archivada")
        .length,
    };
  }, [noticias]);

  /* =====================================================
     ABRIR NUEVA NOTICIA
     ===================================================== */

  function abrirNuevaNoticia() {
    if (!puedeGestionar) {
      return;
    }

    setNoticiaSeleccionada(null);

    setModalAbierto(true);
  }

  /* =====================================================
     ABRIR EDICIÓN
     ===================================================== */

  function abrirEdicion(noticia: Noticia) {
    if (!puedeGestionar) {
      return;
    }

    setNoticiaSeleccionada(noticia);

    setModalAbierto(true);
  }

  /* =====================================================
     CERRAR MODAL
     ===================================================== */

  function cerrarModal() {
    if (!modalAbierto) {
      return;
    }

    setModalAbierto(false);

    setNoticiaSeleccionada(null);
  }

  /* =====================================================
     GUARDADO
     ===================================================== */

  function manejarGuardado(noticiaGuardada: Noticia) {
    if (!puedeGestionar) {
      return;
    }

    setNoticias((actuales) => {
      const existe = actuales.some(
        (noticia) => noticia._id === noticiaGuardada._id
      );

      if (existe) {
        return actuales.map((noticia) =>
          noticia._id === noticiaGuardada._id ? noticiaGuardada : noticia
        );
      }

      return [noticiaGuardada, ...actuales];
    });

    cerrarModal();
  }

  /* =====================================================
     ELIMINAR
     ===================================================== */

  async function eliminarNoticia(id: string) {
    if (!puedeGestionar) {
      return;
    }

    const noticia = noticias.find((item) => item._id === id);

    if (!noticia) {
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de eliminar la noticia "${noticia.titulo}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await fetch(`/api/noticias/${id}`, {
        method: "DELETE",
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.success) {
        throw new Error(
          resultado.message || "No fue posible eliminar la noticia."
        );
      }

      setNoticias((actuales) => actuales.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error eliminando noticia:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al eliminar la noticia."
      );
    }
  }

  /* =====================================================
     LIMPIAR FILTROS
     ===================================================== */

  function limpiarFiltros() {
    setBusqueda("");

    setCategoria("");

    setEstado("");

    setCatastrofeId("");
  }

  /* =====================================================
     OBTENER AUTOR
     ===================================================== */

  function obtenerAutor(autorId: string) {
    const autor = autores.find((item) => item._id === autorId);

    if (!autor) {
      /*
       * Para USUARIO no consultamos /api/usuarios.
       * Por eso, si no tenemos el autor, mostramos
       * el identificador en lugar de generar una
       * petición no autorizada.
       */
      return autorId;
    }

    return `${autor.nombre} ${autor.apellido}`;
  }

  /* =====================================================
     OBTENER CATÁSTROFE
     ===================================================== */

  function obtenerCatastrofe(id: string) {
    const catastrofe = catastrofes.find((item) => item._id === id);

    if (!catastrofe) {
      return id;
    }

    return catastrofe.titulo;
  }

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <DashboardLayout>
      <main className="noticias-page">
        {/* =================================================
            ENCABEZADO
            ================================================= */}

        <section className="noticias-page-header">
          <div>
            <span className="noticias-page-kicker">Sistema SGRICN</span>

            <h1>Noticias</h1>

            <p>
              Consulta y gestión de información oficial relacionada con
              emergencias, prevención y atención a la comunidad.
            </p>
          </div>

          {puedeGestionar && (
            <button
              type="button"
              className="noticias-primary-button"
              onClick={abrirNuevaNoticia}
            >
              <span>＋</span>
              Nueva noticia
            </button>
          )}
        </section>

        {/* =================================================
            ESTADÍSTICAS
            ================================================= */}

        <section className="noticias-stats">
          <article className="noticias-stat-card">
            <div className="noticias-stat-icon">📰</div>

            <div>
              <span>Total de noticias</span>

              <strong>{estadisticas.total}</strong>
            </div>
          </article>

          <article className="noticias-stat-card noticias-stat-publicadas">
            <div className="noticias-stat-icon">✓</div>

            <div>
              <span>Publicadas</span>

              <strong>{estadisticas.publicadas}</strong>
            </div>
          </article>

          {puedeGestionar && (
            <>
              <article className="noticias-stat-card noticias-stat-borradores">
                <div className="noticias-stat-icon">📝</div>

                <div>
                  <span>Borradores</span>

                  <strong>{estadisticas.borradores}</strong>
                </div>
              </article>

              <article className="noticias-stat-card noticias-stat-archivadas">
                <div className="noticias-stat-icon">📁</div>

                <div>
                  <span>Archivadas</span>

                  <strong>{estadisticas.archivadas}</strong>
                </div>
              </article>
            </>
          )}
        </section>

        {/* =================================================
            ERROR GENERAL
            ================================================= */}

        {error && (
          <section className="noticias-page-error" role="alert">
            <div>
              <strong>No fue posible cargar la información</strong>

              <p>{error}</p>
            </div>

            <button type="button" onClick={cargarDatos}>
              Reintentar
            </button>
          </section>
        )}

        {/* =================================================
            FILTROS
            ================================================= */}

        {!cargando && !error && (
          <NoticiaFilters
            noticias={noticiasFiltradas}
            catastrofes={catastrofes}
            busqueda={busqueda}
            categoria={categoria}
            estado={estado}
            catastrofeId={catastrofeId}
            onBusquedaChange={setBusqueda}
            onCategoriaChange={setCategoria}
            onEstadoChange={setEstado}
            onCatastrofeChange={setCatastrofeId}
            onLimpiar={limpiarFiltros}
          />
        )}

        {/* =================================================
            CONTENIDO
            ================================================= */}

        {cargando ? (
          <section className="noticias-loading">
            <div className="noticias-loading-spinner" />

            <p>Cargando noticias...</p>
          </section>
        ) : (
          <section className="noticias-results">
            {noticiasFiltradas.length === 0 ? (
              <div className="noticias-empty">
                <div className="noticias-empty-icon">📰</div>

                <h3>No hay noticias</h3>

                <p>
                  {role === "USUARIO"
                    ? "No hay noticias publicadas disponibles en este momento."
                    : "No se encontraron noticias que coincidan con los filtros seleccionados."}
                </p>

                {(busqueda || categoria || estado || catastrofeId) && (
                  <button
                    type="button"
                    className="noticias-secondary-button"
                    onClick={limpiarFiltros}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="noticias-grid">
                {noticiasFiltradas.map((noticia) => (
                  <NoticiaCard
                    key={noticia._id}
                    noticia={noticia}
                    autorNombre={obtenerAutor(noticia.autorId)}
                    catastrofeTitulo={obtenerCatastrofe(noticia.catastrofeId)}
                    onEditar={puedeGestionar ? abrirEdicion : undefined}
                    onEliminar={puedeGestionar ? eliminarNoticia : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* =================================================
            MODAL
            ================================================= */}

        {puedeGestionar && (
          <NoticiaModal
            abierto={modalAbierto}
            titulo={noticiaSeleccionada ? "Editar noticia" : "Nueva noticia"}
            onCerrar={cerrarModal}
          >
            <NoticiaForm
              noticia={noticiaSeleccionada}
              autores={autores}
              catastrofes={catastrofes}
              onGuardado={manejarGuardado}
              onCancelar={cerrarModal}
            />
          </NoticiaModal>
        )}
      </main>
    </DashboardLayout>
  );
}
