"use client";

import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/auth/AuthProvider";

import { ZonaAfectada } from "@/types/zonas";

import ZonaCard from "@/components/zonas/ZonaCard";
import ZonaFilters from "@/components/zonas/ZonaFilters";
import ZonaModal from "@/components/zonas/ZonaModal";
import ZonaForm from "@/components/zonas/ZonaForm";

interface CatastrofeOption {
  _id: string;
  titulo: string;
}

export default function ZonasPage() {
  const { role } = useAuth();

  const puedeGestionar = role === "ADMIN" || role === "FUNCIONARIO";

  const [zonas, setZonas] = useState<ZonaAfectada[]>([]);

  const [catastrofes, setCatastrofes] = useState<CatastrofeOption[]>([]);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [estadoFiltro, setEstadoFiltro] = useState("todos");

  const [nivelFiltro, setNivelFiltro] = useState("todos");

  const [modalAbierto, setModalAbierto] = useState(false);

  const [zonaSeleccionada, setZonaSeleccionada] = useState<ZonaAfectada | null>(
    null
  );

  /*
   * Cargar zonas
   */
  const cargarZonas = async () => {
    try {
      setCargando(true);
      setError("");

      const response = await fetch("/api/zonas", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudieron cargar las zonas.");
      }

      setZonas(data.data || []);
    } catch (error) {
      console.error("Error cargando zonas:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las zonas."
      );
    } finally {
      setCargando(false);
    }
  };

  /*
   * Cargar catástrofes
   *
   * Se utilizan para mostrar el nombre
   * de la catástrofe relacionada y para
   * el selector del formulario.
   */
  const cargarCatastrofes = async () => {
    try {
      const response = await fetch("/api/catastrofes", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "No se pudieron cargar las catástrofes."
        );
      }

      setCatastrofes(
        (data.data || []).map(
          (catastrofe: { _id: string; titulo: string }) => ({
            _id: catastrofe._id,
            titulo: catastrofe.titulo,
          })
        )
      );
    } catch (error) {
      console.error("Error cargando catástrofes:", error);
    }
  };

  /*
   * Carga inicial
   */
  useEffect(() => {
    cargarZonas();
    cargarCatastrofes();
  }, []);

  /*
   * Filtros
   */
  const zonasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return zonas.filter((zona) => {
      const coincideBusqueda =
        !texto ||
        zona.nombre.toLowerCase().includes(texto) ||
        zona.descripcion.toLowerCase().includes(texto) ||
        zona.departamento.toLowerCase().includes(texto) ||
        zona.municipio.toLowerCase().includes(texto) ||
        zona.direccionReferencia.toLowerCase().includes(texto) ||
        zona.catastrofeId.toLowerCase().includes(texto);

      const coincideEstado =
        estadoFiltro === "todos" || zona.estado === estadoFiltro;

      const coincideNivel =
        nivelFiltro === "todos" || zona.nivelAfectacion === nivelFiltro;

      return coincideBusqueda && coincideEstado && coincideNivel;
    });
  }, [zonas, busqueda, estadoFiltro, nivelFiltro]);

  /*
   * Estadísticas
   */
  const totalZonas = zonas.length;

  const zonasActivas = zonas.filter((zona) => zona.estado === "activa").length;

  const zonasControladas = zonas.filter(
    (zona) => zona.estado === "controlada"
  ).length;

  const zonasCriticas = zonas.filter(
    (zona) => zona.nivelAfectacion === "critico"
  ).length;

  /*
   * Abrir creación
   */
  const abrirCrear = () => {
    if (!puedeGestionar) {
      return;
    }

    setZonaSeleccionada(null);
    setModalAbierto(true);
  };

  /*
   * Abrir edición
   */
  const abrirEditar = (zona: ZonaAfectada) => {
    if (!puedeGestionar) {
      return;
    }

    setZonaSeleccionada(zona);
    setModalAbierto(true);
  };

  /*
   * Cerrar modal
   */
  const cerrarModal = () => {
    if (cargando) {
      return;
    }

    setModalAbierto(false);
    setZonaSeleccionada(null);
  };

  /*
   * Después de guardar
   */
  const manejarGuardado = async () => {
    setModalAbierto(false);
    setZonaSeleccionada(null);

    await cargarZonas();
  };

  /*
   * Eliminar
   */
  const eliminarZona = async (id: string) => {
    if (!puedeGestionar) {
      return;
    }

    const confirmar = window.confirm(
      "¿Estás seguro de eliminar esta zona afectada?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(`/api/zonas/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo eliminar la zona.");
      }

      await cargarZonas();
    } catch (error) {
      console.error("Error eliminando zona:", error);

      window.alert(
        error instanceof Error ? error.message : "No se pudo eliminar la zona."
      );
    }
  };

  /*
   * Cambiar estado
   */
  const cambiarEstado = async (zona: ZonaAfectada) => {
    if (!puedeGestionar) {
      return;
    }

    let nuevoEstado: "activa" | "controlada" | "finalizada";

    if (zona.estado === "activa") {
      nuevoEstado = "controlada";
    } else if (zona.estado === "controlada") {
      nuevoEstado = "finalizada";
    } else {
      nuevoEstado = "activa";
    }

    try {
      const response = await fetch(`/api/zonas/${zona._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          catastrofeId: zona.catastrofeId,
          nombre: zona.nombre,
          descripcion: zona.descripcion,
          departamento: zona.departamento,
          municipio: zona.municipio,
          direccionReferencia: zona.direccionReferencia,
          latitud: zona.ubicacion.coordinates[1],
          longitud: zona.ubicacion.coordinates[0],
          nivelAfectacion: zona.nivelAfectacion,
          estado: nuevoEstado,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo cambiar el estado.");
      }

      await cargarZonas();
    } catch (error) {
      console.error("Error cambiando estado:", error);

      window.alert(
        error instanceof Error ? error.message : "No se pudo cambiar el estado."
      );
    }
  };

  return (
    <DashboardLayout>
      <div
        style={{
          padding: "28px",
          background: "#f5f7fa",
          minHeight: "100vh",
        }}
      >
        {/* ENCABEZADO */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#003893",
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "5px",
              }}
            >
              GESTIÓN DE EMERGENCIAS
            </div>

            <h1
              style={{
                margin: 0,
                color: "#00245f",
                fontSize: "30px",
              }}
            >
              Zonas afectadas
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#5f6b7a",
                fontSize: "15px",
              }}
            >
              Consulta y administra las zonas afectadas por las catástrofes
              registradas.
            </p>
          </div>

          {puedeGestionar && (
            <button
              type="button"
              onClick={abrirCrear}
              style={{
                border: "none",
                background: "#003893",
                color: "#ffffff",
                padding: "12px 18px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              + Registrar zona
            </button>
          )}
        </div>

        {/* ESTADÍSTICAS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
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
                color: "#5f6b7a",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Total de zonas
            </div>

            <div
              style={{
                color: "#00245f",
                fontSize: "28px",
                fontWeight: 800,
                marginTop: "6px",
              }}
            >
              {totalZonas}
            </div>
          </div>

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
                color: "#5f6b7a",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Zonas activas
            </div>

            <div
              style={{
                color: "#198754",
                fontSize: "28px",
                fontWeight: 800,
                marginTop: "6px",
              }}
            >
              {zonasActivas}
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "18px",
              borderTop: "4px solid #fcd116",
            }}
          >
            <div
              style={{
                color: "#5f6b7a",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Controladas
            </div>

            <div
              style={{
                color: "#8a6d00",
                fontSize: "28px",
                fontWeight: 800,
                marginTop: "6px",
              }}
            >
              {zonasControladas}
            </div>
          </div>

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
                color: "#5f6b7a",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Afectación crítica
            </div>

            <div
              style={{
                color: "#ce1126",
                fontSize: "28px",
                fontWeight: 800,
                marginTop: "6px",
              }}
            >
              {zonasCriticas}
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              background: "#fde7e9",
              border: "1px solid #f3b5bb",
              color: "#ce1126",
              padding: "13px 16px",
              borderRadius: "8px",
              marginBottom: "18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span>⚠️ {error}</span>

            <button
              type="button"
              onClick={cargarZonas}
              style={{
                border: "1px solid #ce1126",
                background: "#ffffff",
                color: "#ce1126",
                padding: "7px 12px",
                borderRadius: "6px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* FILTROS */}

        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <ZonaFilters
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            estadoFiltro={estadoFiltro}
            setEstadoFiltro={setEstadoFiltro}
            nivelFiltro={nivelFiltro}
            setNivelFiltro={setNivelFiltro}
          />
        </div>

        {/* BARRA DE RESULTADOS */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              color: "#5f6b7a",
              fontSize: "14px",
            }}
          >
            Mostrando{" "}
            <strong
              style={{
                color: "#17202a",
              }}
            >
              {zonasFiltradas.length}
            </strong>{" "}
            de{" "}
            <strong
              style={{
                color: "#17202a",
              }}
            >
              {totalZonas}
            </strong>{" "}
            zonas
          </div>

          <button
            type="button"
            onClick={cargarZonas}
            disabled={cargando}
            style={{
              border: "1px solid #cfd6df",
              background: "#ffffff",
              color: "#17202a",
              padding: "8px 13px",
              borderRadius: "7px",
              fontWeight: 600,
              opacity: cargando ? 0.6 : 1,
              cursor: cargando ? "not-allowed" : "pointer",
            }}
          >
            🔄 Actualizar
          </button>
        </div>

        {/* CARGANDO */}

        {cargando && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "45px 20px",
              textAlign: "center",
              color: "#5f6b7a",
            }}
          >
            <div
              style={{
                fontSize: "30px",
                marginBottom: "10px",
              }}
            >
              ⏳
            </div>
            Cargando zonas afectadas...
          </div>
        )}

        {/* SIN RESULTADOS */}

        {!cargando && zonasFiltradas.length === 0 && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "45px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                marginBottom: "12px",
              }}
            >
              📍
            </div>

            <h3
              style={{
                margin: "0 0 8px",
                color: "#00245f",
              }}
            >
              No se encontraron zonas
            </h3>

            <p
              style={{
                margin: 0,
                color: "#5f6b7a",
              }}
            >
              No hay zonas que coincidan con los filtros seleccionados.
            </p>
          </div>
        )}

        {/* RESULTADOS */}

        {!cargando && zonasFiltradas.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "18px",
            }}
          >
            {zonasFiltradas.map((zona) => {
              const catastrofe = catastrofes.find(
                (item) => item._id === zona.catastrofeId
              );

              return (
                <ZonaCard
                  key={zona._id}
                  zona={zona}
                  nombreCatastrofe={catastrofe?.titulo}
                  onEditar={puedeGestionar ? abrirEditar : undefined}
                  onEliminar={puedeGestionar ? eliminarZona : undefined}
                  onCambiarEstado={puedeGestionar ? cambiarEstado : undefined}
                />
              );
            })}
          </div>
        )}

        {/* MODAL */}

        {puedeGestionar && modalAbierto && (
          <ZonaModal
            abierto={modalAbierto}
            titulo={
              zonaSeleccionada
                ? "Editar zona afectada"
                : "Registrar zona afectada"
            }
            onCerrar={cerrarModal}
          >
            <ZonaForm
              zona={zonaSeleccionada}
              catastrofes={catastrofes}
              onGuardado={manejarGuardado}
              onCancelar={cerrarModal}
            />
          </ZonaModal>
        )}
      </div>
    </DashboardLayout>
  );
}
