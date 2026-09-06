"use client";

import React, { useEffect, useMemo, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";

import NecesidadCard from "@/components/necesidades/NecesidadCard";
import NecesidadFilters from "@/components/necesidades/NecesidadFilters";
import NecesidadForm from "@/components/necesidades/NecesidadForm";
import NecesidadModal from "@/components/necesidades/NecesidadModal";

import { Necesidad } from "@/types/necesidades";
import { Catastrofe } from "@/types/catastrofes";
import { ZonaAfectada } from "@/types/zonas";

import { useAuth } from "@/components/auth/AuthProvider";

export default function NecesidadesPage() {
  const { role } = useAuth();

  const puedeGestionar = role === "ADMIN" || role === "FUNCIONARIO";

  const [necesidades, setNecesidades] = useState<Necesidad[]>([]);

  const [catastrofes, setCatastrofes] = useState<Catastrofe[]>([]);

  const [zonas, setZonas] = useState<ZonaAfectada[]>([]);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  /*
   * Estado del modal
   */
  const [modalAbierto, setModalAbierto] = useState(false);

  const [necesidadSeleccionada, setNecesidadSeleccionada] =
    useState<Necesidad | null>(null);

  /*
   * Filtros
   */
  const [busqueda, setBusqueda] = useState("");

  const [catastrofeSeleccionada, setCatastrofeSeleccionada] = useState("");

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  const [prioridadSeleccionada, setPrioridadSeleccionada] = useState<
    Necesidad["prioridad"] | ""
  >("");

  const [estadoSeleccionado, setEstadoSeleccionado] = useState<
    Necesidad["estado"] | ""
  >("");

  /*
   * Cargar información
   */
  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [respuestaNecesidades, respuestaCatastrofes, respuestaZonas] =
        await Promise.all([
          fetch("/api/necesidades"),
          fetch("/api/catastrofes"),
          fetch("/api/zonas"),
        ]);

      const [resultadoNecesidades, resultadoCatastrofes, resultadoZonas] =
        await Promise.all([
          respuestaNecesidades.json(),
          respuestaCatastrofes.json(),
          respuestaZonas.json(),
        ]);

      if (!respuestaNecesidades.ok || !resultadoNecesidades.success) {
        throw new Error(
          resultadoNecesidades.message ||
            "No fue posible cargar las necesidades."
        );
      }

      if (!respuestaCatastrofes.ok || !resultadoCatastrofes.success) {
        throw new Error(
          resultadoCatastrofes.message ||
            "No fue posible cargar las catástrofes."
        );
      }

      if (!respuestaZonas.ok || !resultadoZonas.success) {
        throw new Error(
          resultadoZonas.message || "No fue posible cargar las zonas."
        );
      }

      setNecesidades(resultadoNecesidades.data || []);

      setCatastrofes(resultadoCatastrofes.data || []);

      setZonas(resultadoZonas.data || []);
    } catch (error) {
      console.error("Error cargando necesidades:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error cargando la información."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  /*
   * Filtrar necesidades
   */
  const necesidadesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return necesidades.filter((necesidad) => {
      /*
       * Buscar por nombre,
       * descripción o categoría.
       */
      const coincideTexto =
        !texto ||
        necesidad.nombre.toLowerCase().includes(texto) ||
        necesidad.descripcion.toLowerCase().includes(texto) ||
        necesidad.categoria.toLowerCase().includes(texto);

      /*
       * Filtrar por catástrofe
       */
      const coincideCatastrofe =
        !catastrofeSeleccionada ||
        necesidad.catastrofeId === catastrofeSeleccionada;

      /*
       * Filtrar por categoría
       */
      const coincideCategoria =
        !categoriaSeleccionada || necesidad.categoria === categoriaSeleccionada;

      /*
       * Filtrar por prioridad
       */
      const coincidePrioridad =
        !prioridadSeleccionada || necesidad.prioridad === prioridadSeleccionada;

      /*
       * Filtrar por estado
       */
      const coincideEstado =
        !estadoSeleccionado || necesidad.estado === estadoSeleccionado;

      return (
        coincideTexto &&
        coincideCatastrofe &&
        coincideCategoria &&
        coincidePrioridad &&
        coincideEstado
      );
    });
  }, [
    necesidades,
    busqueda,
    catastrofeSeleccionada,
    categoriaSeleccionada,
    prioridadSeleccionada,
    estadoSeleccionado,
  ]);

  /*
   * Estadísticas generales
   */
  const estadisticas = useMemo(() => {
    const total = necesidades.length;

    const pendientes = necesidades.filter(
      (item) => item.estado === "pendiente"
    ).length;

    const enAtencion = necesidades.filter(
      (item) => item.estado === "en_atencion"
    ).length;

    const atendidas = necesidades.filter(
      (item) => item.estado === "atendida"
    ).length;

    const criticas = necesidades.filter(
      (item) => item.prioridad === "critica"
    ).length;

    const cantidadNecesaria = necesidades.reduce(
      (total, item) => total + (item.cantidadNecesaria || 0),
      0
    );

    const cantidadRecibida = necesidades.reduce(
      (total, item) => total + (item.cantidadRecibida || 0),
      0
    );

    const cantidadPendiente = necesidades.reduce(
      (total, item) => total + (item.cantidadPendiente || 0),
      0
    );

    return {
      total,
      pendientes,
      enAtencion,
      atendidas,
      criticas,
      cantidadNecesaria,
      cantidadRecibida,
      cantidadPendiente,
    };
  }, [necesidades]);

  /*
   * Abrir modal para crear
   */
  const abrirCrear = () => {
    if (!puedeGestionar) {
      return;
    }

    setNecesidadSeleccionada(null);
    setModalAbierto(true);
  };

  /*
   * Abrir modal para editar
   */
  const abrirEditar = (necesidad: Necesidad) => {
    if (!puedeGestionar) {
      return;
    }

    setNecesidadSeleccionada(necesidad);

    setModalAbierto(true);
  };

  /*
   * Cerrar modal
   */
  const cerrarModal = () => {
    if (!cargando) {
      setModalAbierto(false);

      setNecesidadSeleccionada(null);
    }
  };

  /*
   * Cuando se guarda correctamente
   */
  const manejarGuardado = (necesidad: Necesidad) => {
    if (!puedeGestionar) {
      return;
    }

    setNecesidades((anteriores) => {
      const existe = anteriores.some((item) => item._id === necesidad._id);

      if (existe) {
        return anteriores.map((item) =>
          item._id === necesidad._id ? necesidad : item
        );
      }

      return [necesidad, ...anteriores];
    });

    setModalAbierto(false);
    setNecesidadSeleccionada(null);
  };

  /*
   * Eliminar necesidad
   */
  const eliminarNecesidad = async (id: string) => {
    if (!puedeGestionar) {
      return;
    }

    try {
      setError("");

      const respuesta = await fetch(`/api/necesidades/${id}`, {
        method: "DELETE",
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.success) {
        throw new Error(
          resultado.message || "No fue posible eliminar la necesidad."
        );
      }

      setNecesidades((anteriores) =>
        anteriores.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error("Error eliminando necesidad:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar la necesidad."
      );
    }
  };

  /*
   * Formatear números
   */
  const numero = (valor: number) => {
    return valor.toLocaleString("es-CO");
  };

  return (
    <DashboardLayout>
      <div
        style={{
          padding: "24px",
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#00245f",
                fontSize: "30px",
              }}
            >
              📦 Necesidades
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#5f6b7a",
                fontSize: "15px",
              }}
            >
              Gestiona las necesidades prioritarias de las zonas afectadas por
              las emergencias.
            </p>
          </div>

          {/* Solo ADMIN y FUNCIONARIO */}
          {puedeGestionar && (
            <button
              type="button"
              onClick={abrirCrear}
              style={{
                border: "none",
                borderRadius: "9px",
                padding: "12px 20px",
                background: "#003893",
                color: "#ffffff",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0, 56, 147, 0.2)",
              }}
            >
              ➕ Nueva necesidad
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "13px 16px",
              borderRadius: "9px",
              background: "#fdeaea",
              border: "1px solid #f5b5b5",
              color: "#ce1126",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Estadísticas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "24px",
          }}
        >
          {/* Total */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "18px",
              borderTop: "4px solid #003893",
            }}
          >
            <div
              style={{
                fontSize: "27px",
                fontWeight: 700,
                color: "#003893",
              }}
            >
              {numero(estadisticas.total)}
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#5f6b7a",
                fontSize: "13px",
              }}
            >
              Total de necesidades
            </div>
          </div>

          {/* Críticas */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "18px",
              borderTop: "4px solid #ce1126",
            }}
          >
            <div
              style={{
                fontSize: "27px",
                fontWeight: 700,
                color: "#ce1126",
              }}
            >
              {numero(estadisticas.criticas)}
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#5f6b7a",
                fontSize: "13px",
              }}
            >
              Prioridad crítica
            </div>
          </div>

          {/* Pendientes */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "18px",
              borderTop: "4px solid #ce1126",
            }}
          >
            <div
              style={{
                fontSize: "27px",
                fontWeight: 700,
                color: "#ce1126",
              }}
            >
              {numero(estadisticas.pendientes)}
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#5f6b7a",
                fontSize: "13px",
              }}
            >
              Pendientes
            </div>
          </div>

          {/* En atención */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "18px",
              borderTop: "4px solid #f39c12",
            }}
          >
            <div
              style={{
                fontSize: "27px",
                fontWeight: 700,
                color: "#f39c12",
              }}
            >
              {numero(estadisticas.enAtencion)}
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#5f6b7a",
                fontSize: "13px",
              }}
            >
              En atención
            </div>
          </div>

          {/* Atendidas */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "18px",
              borderTop: "4px solid #198754",
            }}
          >
            <div
              style={{
                fontSize: "27px",
                fontWeight: 700,
                color: "#198754",
              }}
            >
              {numero(estadisticas.atendidas)}
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#5f6b7a",
                fontSize: "13px",
              }}
            >
              Atendidas
            </div>
          </div>
        </div>

        {/* Resumen de cantidades */}
        <div
          style={{
            background: "linear-gradient(135deg, #003893, #00245f)",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "24px",
            color: "#ffffff",
            borderBottom: "4px solid #fcd116",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px",
              fontSize: "17px",
            }}
          >
            📊 Resumen de cantidades
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.8,
                }}
              >
                Cantidad necesaria
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: "4px",
                  fontSize: "22px",
                }}
              >
                {numero(estadisticas.cantidadNecesaria)}
              </strong>
            </div>

            <div>
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.8,
                }}
              >
                Cantidad recibida
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: "4px",
                  fontSize: "22px",
                }}
              >
                {numero(estadisticas.cantidadRecibida)}
              </strong>
            </div>

            <div>
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.8,
                }}
              >
                Cantidad pendiente
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: "4px",
                  fontSize: "22px",
                }}
              >
                {numero(estadisticas.cantidadPendiente)}
              </strong>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <NecesidadFilters
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          catastrofeSeleccionada={catastrofeSeleccionada}
          setCatastrofeSeleccionada={setCatastrofeSeleccionada}
          categoriaSeleccionada={categoriaSeleccionada}
          setCategoriaSeleccionada={setCategoriaSeleccionada}
          prioridadSeleccionada={prioridadSeleccionada}
          setPrioridadSeleccionada={setPrioridadSeleccionada}
          estadoSeleccionado={estadoSeleccionado}
          setEstadoSeleccionado={setEstadoSeleccionado}
          catastrofes={catastrofes}
        />

        {/* Resultado de filtros */}
        {!cargando && (
          <div
            style={{
              marginBottom: "15px",
              color: "#5f6b7a",
              fontSize: "14px",
            }}
          >
            Mostrando{" "}
            <strong
              style={{
                color: "#003893",
              }}
            >
              {numero(necesidadesFiltradas.length)}
            </strong>{" "}
            de{" "}
            <strong
              style={{
                color: "#003893",
              }}
            >
              {numero(necesidades.length)}
            </strong>{" "}
            necesidades.
          </div>
        )}

        {/* Cargando */}
        {cargando && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "14px",
              padding: "50px",
              textAlign: "center",
              color: "#5f6b7a",
            }}
          >
            <div
              style={{
                fontSize: "36px",
                marginBottom: "10px",
              }}
            >
              ⏳
            </div>
            Cargando necesidades...
          </div>
        )}

        {/* Sin resultados */}
        {!cargando && necesidadesFiltradas.length === 0 && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "14px",
              padding: "50px 25px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "46px",
                marginBottom: "12px",
              }}
            >
              📦
            </div>

            <h3
              style={{
                margin: "0 0 8px",
                color: "#00245f",
              }}
            >
              No se encontraron necesidades
            </h3>

            <p
              style={{
                margin: 0,
                color: "#5f6b7a",
              }}
            >
              No existen necesidades que coincidan con los filtros
              seleccionados.
            </p>
          </div>
        )}

        {/* Listado */}
        {!cargando && necesidadesFiltradas.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "20px",
            }}
          >
            {necesidadesFiltradas.map((necesidad) => {
              const catastrofe = catastrofes.find(
                (item) => item._id === necesidad.catastrofeId
              );

              const zona = zonas.find((item) => item._id === necesidad.zonaId);

              return (
                <NecesidadCard
                  key={necesidad._id}
                  necesidad={necesidad}
                  nombreCatastrofe={
                    catastrofe?.titulo || necesidad.catastrofeId
                  }
                  nombreZona={zona?.nombre || necesidad.zonaId}
                  onEditar={puedeGestionar ? abrirEditar : undefined}
                  onEliminar={puedeGestionar ? eliminarNecesidad : undefined}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modal solamente para roles con permisos */}
      {puedeGestionar && modalAbierto && (
        <NecesidadModal
          abierto={modalAbierto}
          titulo={
            necesidadSeleccionada ? "Editar necesidad" : "Nueva necesidad"
          }
          necesidad={necesidadSeleccionada}
          onCerrar={cerrarModal}
        >
          <NecesidadForm
            necesidad={necesidadSeleccionada}
            catastrofes={catastrofes}
            zonas={zonas}
            onGuardado={manejarGuardado}
            onCancelar={cerrarModal}
          />
        </NecesidadModal>
      )}
    </DashboardLayout>
  );
}
