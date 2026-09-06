"use client";

import { useMemo, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import CatastrofeCard from "@/components/catastrofes/CatastrofeCard";
import CatastrofeFilters from "@/components/catastrofes/CatastrofeFilters";
import CatastrofeModal from "@/components/catastrofes/CatastrofeModal";
import CatastrofeForm from "@/components/catastrofes/CatastrofeForm";

import { useAuth } from "@/components/auth/AuthProvider";
import { Catastrofe } from "@/types/catastrofes";

interface CatastrofePageClientProps {
  catastrofesIniciales: Catastrofe[];
}

export default function CatastrofePageClient({
  catastrofesIniciales,
}: CatastrofePageClientProps) {
  const { role } = useAuth();

  const [catastrofes, setCatastrofes] =
    useState<Catastrofe[]>(catastrofesIniciales);

  const [busqueda, setBusqueda] = useState("");

  const [estadoFiltro, setEstadoFiltro] = useState("todos");

  const [nivelFiltro, setNivelFiltro] = useState("todos");

  const [modalAbierto, setModalAbierto] = useState(false);

  const [catastrofeSeleccionada, setCatastrofeSeleccionada] =
    useState<Catastrofe | null>(null);

  const [cargando, setCargando] = useState(false);

  const [mensaje, setMensaje] = useState("");

  /*
   * ADMIN y FUNCIONARIO pueden gestionar catástrofes.
   * USUARIO solamente puede consultar.
   */
  const puedeGestionar = role === "ADMIN" || role === "FUNCIONARIO";

  const catastrofesFiltradas = useMemo(() => {
    return catastrofes.filter((catastrofe) => {
      const texto = busqueda.toLowerCase().trim();

      const coincideBusqueda =
        !texto ||
        catastrofe.titulo.toLowerCase().includes(texto) ||
        catastrofe.tipo.toLowerCase().includes(texto) ||
        catastrofe.departamento.toLowerCase().includes(texto) ||
        catastrofe.municipio.toLowerCase().includes(texto);

      const coincideEstado =
        estadoFiltro === "todos" || catastrofe.estado === estadoFiltro;

      const coincideNivel =
        nivelFiltro === "todos" || catastrofe.nivelEmergencia === nivelFiltro;

      return coincideBusqueda && coincideEstado && coincideNivel;
    });
  }, [catastrofes, busqueda, estadoFiltro, nivelFiltro]);

  async function cargarCatastrofes() {
    setCargando(true);
    setMensaje("");

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

      setCatastrofes(data.data || []);
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No se pudieron actualizar los datos."
      );
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    if (!puedeGestionar) {
      return;
    }

    setCatastrofeSeleccionada(null);
    setModalAbierto(true);
  }

  function abrirEditar(catastrofe: Catastrofe) {
    if (!puedeGestionar) {
      return;
    }

    setCatastrofeSeleccionada(catastrofe);
    setModalAbierto(true);
  }

  async function eliminar(catastrofe: Catastrofe) {
    if (!puedeGestionar) {
      return;
    }

    const confirmar = window.confirm(
      `¿Deseas eliminar la catástrofe "${catastrofe.titulo}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(`/api/catastrofes/${catastrofe._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo eliminar la catástrofe.");
      }

      setCatastrofes((actuales) =>
        actuales.filter((item) => item._id !== catastrofe._id)
      );

      setMensaje("Catástrofe eliminada correctamente.");
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la catástrofe."
      );
    }
  }

  async function cambiarEstado(catastrofe: Catastrofe) {
    if (!puedeGestionar) {
      return;
    }

    let nuevoEstado: "activa" | "controlada" | "finalizada";

    if (catastrofe.estado === "activa") {
      nuevoEstado = "controlada";
    } else if (catastrofe.estado === "controlada") {
      nuevoEstado = "finalizada";
    } else {
      nuevoEstado = "activa";
    }

    try {
      const response = await fetch(`/api/catastrofes/${catastrofe._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...catastrofe,
          estado: nuevoEstado,
          ubicacion: catastrofe.ubicacion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo actualizar el estado.");
      }

      setCatastrofes((actuales) =>
        actuales.map((item) => (item._id === catastrofe._id ? data.data : item))
      );

      setMensaje("Estado actualizado correctamente.");
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado."
      );
    }
  }

  function cerrarModal() {
    setModalAbierto(false);
    setCatastrofeSeleccionada(null);
  }

  function operacionExitosa() {
    cerrarModal();
    cargarCatastrofes();

    setMensaje(
      catastrofeSeleccionada
        ? "Catástrofe actualizada correctamente."
        : "Catástrofe creada correctamente."
    );
  }

  const total = catastrofes.length;

  const activas = catastrofes.filter((item) => item.estado === "activa").length;

  const controladas = catastrofes.filter(
    (item) => item.estado === "controlada"
  ).length;

  const criticas = catastrofes.filter(
    (item) => item.nivelEmergencia === "critico"
  ).length;

  return (
    <DashboardLayout>
      <div>
        {/* ENCABEZADO */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#00245f",
                fontSize: "30px",
                fontWeight: 800,
              }}
            >
              Catástrofes
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#5f6b7a",
              }}
            >
              Consulta y administra las situaciones de emergencia registradas en
              el sistema.
            </p>
          </div>

          {puedeGestionar && (
            <button
              type="button"
              onClick={abrirCrear}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "12px 18px",
                background: "#003893",
                color: "#ffffff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              + Nueva catástrofe
            </button>
          )}
        </div>

        {/* MENSAJE */}

        {mensaje && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              padding: "12px 15px",
              marginBottom: "20px",
              background: "#eaf7ef",
              border: "1px solid #b8e0c5",
              borderRadius: "8px",
              color: "#146c43",
              fontSize: "14px",
            }}
          >
            <span>✓ {mensaje}</span>

            <button
              type="button"
              onClick={() => setMensaje("")}
              style={{
                border: "none",
                background: "transparent",
                color: "#146c43",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* ESTADÍSTICAS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <Estadistica titulo="Total" valor={total} icono="🚨" />

          <Estadistica titulo="Activas" valor={activas} icono="🔴" />

          <Estadistica titulo="Controladas" valor={controladas} icono="🟠" />

          <Estadistica titulo="Críticas" valor={criticas} icono="⚠️" />
        </div>

        {/* FILTROS */}

        <div
          style={{
            marginBottom: "24px",
          }}
        >
          <CatastrofeFilters
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            estadoFiltro={estadoFiltro}
            setEstadoFiltro={setEstadoFiltro}
            nivelFiltro={nivelFiltro}
            setNivelFiltro={setNivelFiltro}
          />
        </div>

        {/* ACCIONES */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              color: "#5f6b7a",
              fontSize: "14px",
            }}
          >
            Mostrando <strong>{catastrofesFiltradas.length}</strong> de{" "}
            <strong>{total}</strong> catástrofes
          </span>

          <button
            type="button"
            onClick={cargarCatastrofes}
            disabled={cargando}
            style={{
              border: "1px solid #cfd6df",
              background: "#ffffff",
              borderRadius: "8px",
              padding: "9px 14px",
              color: "#003893",
              fontWeight: 600,
              cursor: cargando ? "not-allowed" : "pointer",
              opacity: cargando ? 0.7 : 1,
            }}
          >
            {cargando ? "Actualizando..." : "↻ Actualizar"}
          </button>
        </div>

        {/* LISTADO */}

        {catastrofesFiltradas.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "50px 20px",
              textAlign: "center",
              color: "#5f6b7a",
            }}
          >
            <div
              style={{
                fontSize: "40px",
                marginBottom: "10px",
              }}
            >
              🚨
            </div>

            <h3
              style={{
                margin: "0 0 6px",
                color: "#00245f",
              }}
            >
              No hay catástrofes
            </h3>

            <p
              style={{
                margin: 0,
              }}
            >
              No se encontraron registros con los filtros actuales.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
              gap: "18px",
            }}
          >
            {catastrofesFiltradas.map((catastrofe) => (
              <CatastrofeCard
                key={catastrofe._id}
                catastrofe={catastrofe}
                onEdit={puedeGestionar ? abrirEditar : undefined}
                onDelete={puedeGestionar ? eliminar : undefined}
                onChangeStatus={puedeGestionar ? cambiarEstado : undefined}
              />
            ))}
          </div>
        )}

        {/* MODAL */}

        {puedeGestionar && modalAbierto && (
          <CatastrofeModal
            titulo={
              catastrofeSeleccionada ? "Editar catástrofe" : "Nueva catástrofe"
            }
            onClose={cerrarModal}
          >
            <CatastrofeForm
              catastrofe={catastrofeSeleccionada}
              onSuccess={operacionExitosa}
              onCancel={cerrarModal}
            />
          </CatastrofeModal>
        )}
      </div>
    </DashboardLayout>
  );
}

interface EstadisticaProps {
  titulo: string;
  valor: number;
  icono: string;
}

function Estadistica({ titulo, valor, icono }: EstadisticaProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dfe4ea",
        borderRadius: "12px",
        padding: "18px",
        boxShadow: "0 2px 7px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#5f6b7a",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {titulo}
        </span>

        <span
          style={{
            fontSize: "20px",
          }}
        >
          {icono}
        </span>
      </div>

      <div
        style={{
          marginTop: "8px",
          color: "#00245f",
          fontSize: "26px",
          fontWeight: 800,
        }}
      >
        {valor}
      </div>
    </div>
  );
}
