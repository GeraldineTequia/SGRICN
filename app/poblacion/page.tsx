"use client";

import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";

import { useAuth } from "@/components/auth/AuthProvider";

import { PoblacionAfectada } from "@/types/poblacion";

import PoblacionCard from "@/components/poblacion/PoblacionCard";
import PoblacionFilters from "@/components/poblacion/PoblacionFilters";
import PoblacionModal from "@/components/poblacion/PoblacionModal";
import PoblacionForm from "@/components/poblacion/PoblacionForm";

interface Catastrofe {
  _id: string;
  titulo: string;
}

interface Zona {
  _id: string;
  nombre: string;
  catastrofeId: string;
}

export default function PoblacionPage() {
  const { role } = useAuth();

  const puedeGestionar = role === "ADMIN" || role === "FUNCIONARIO";

  const [poblaciones, setPoblaciones] = useState<PoblacionAfectada[]>([]);

  const [catastrofes, setCatastrofes] = useState<Catastrofe[]>([]);

  const [zonas, setZonas] = useState<Zona[]>([]);

  const [busqueda, setBusqueda] = useState("");

  const [catastrofeFiltro, setCatastrofeFiltro] = useState("todos");

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);

  const [poblacionSeleccionada, setPoblacionSeleccionada] =
    useState<PoblacionAfectada | null>(null);

  async function cargarDatos() {
    setCargando(true);
    setError("");

    try {
      const [poblacionResponse, catastrofesResponse, zonasResponse] =
        await Promise.all([
          fetch("/api/poblacion", {
            cache: "no-store",
          }),

          fetch("/api/catastrofes", {
            cache: "no-store",
          }),

          fetch("/api/zonas", {
            cache: "no-store",
          }),
        ]);

      const poblacionData = await poblacionResponse.json();

      const catastrofesData = await catastrofesResponse.json();

      const zonasData = await zonasResponse.json();

      if (!poblacionResponse.ok) {
        throw new Error(
          poblacionData.message || "No se pudo cargar la población."
        );
      }

      if (!catastrofesResponse.ok) {
        throw new Error(
          catastrofesData.message || "No se pudieron cargar las catástrofes."
        );
      }

      if (!zonasResponse.ok) {
        throw new Error(
          zonasData.message || "No se pudieron cargar las zonas."
        );
      }

      setPoblaciones(poblacionData.data || []);

      setCatastrofes(
        (catastrofesData.data || []).map((item: any) => ({
          _id: item._id,
          titulo: item.titulo,
        }))
      );

      setZonas(
        (zonasData.data || []).map((item: any) => ({
          _id: item._id,
          nombre: item.nombre,
          catastrofeId: item.catastrofeId,
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los datos."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const poblacionesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return poblaciones.filter((poblacion) => {
      const catastrofe = catastrofes.find(
        (item) => item._id === poblacion.catastrofeId
      );

      const zona = zonas.find((item) => item._id === poblacion.zonaId);

      const coincideBusqueda =
        !texto ||
        poblacion._id.toLowerCase().includes(texto) ||
        poblacion.catastrofeId.toLowerCase().includes(texto) ||
        poblacion.zonaId.toLowerCase().includes(texto) ||
        catastrofe?.titulo.toLowerCase().includes(texto) ||
        zona?.nombre.toLowerCase().includes(texto);

      const coincideCatastrofe =
        catastrofeFiltro === "todos" ||
        poblacion.catastrofeId === catastrofeFiltro;

      return coincideBusqueda && coincideCatastrofe;
    });
  }, [poblaciones, catastrofes, zonas, busqueda, catastrofeFiltro]);

  const estadisticas = useMemo(() => {
  return {
    registros: poblaciones.length,

    personas: poblaciones.reduce(
      (total, item) => total + (item.personasAfectadas ?? 0),
      0
    ),

    familias: poblaciones.reduce(
      (total, item) => total + (item.familiasAfectadas ?? 0),
      0
    ),

    heridos: poblaciones.reduce(
      (total, item) => total + (item.personasHeridas ?? 0),
      0
    ),

    fallecidos: poblaciones.reduce(
      (total, item) => total + (item.personasFallecidas ?? 0),
      0
    ),

    desaparecidos: poblaciones.reduce(
      (total, item) => total + (item.personasDesaparecidas ?? 0),
      0
    ),

    pendientes: poblaciones.reduce(
      (total, item) => total + (item.personasPendientesAtencion ?? 0),
      0
    ),
  };
}, [poblaciones]);

  function abrirCrear() {
    if (!puedeGestionar) {
      return;
    }

    setPoblacionSeleccionada(null);
    setModalAbierto(true);
  }

  function abrirEditar(poblacion: PoblacionAfectada) {
    if (!puedeGestionar) {
      return;
    }

    setPoblacionSeleccionada(poblacion);

    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setPoblacionSeleccionada(null);
  }

  async function eliminar(id: string) {
    if (!puedeGestionar) {
      return;
    }

    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este registro de población afectada?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(`/api/poblacion/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo eliminar el registro.");
      }

      await cargarDatos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el registro."
      );
    }
  }

  async function guardarExitoso() {
    cerrarModal();
    await cargarDatos();
  }

  return (
    <DashboardLayout>
      <div
        style={{
          padding: "24px",
          maxWidth: "1500px",
          margin: "0 auto",
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "22px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                background: "#fcd116",
                color: "#00245f",
                padding: "5px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 800,
                marginBottom: "8px",
              }}
            >
              SGRICN
            </div>

            <h1
              style={{
                margin: 0,
                color: "#00245f",
                fontSize: "30px",
              }}
            >
              Población afectada
            </h1>

            <p
              style={{
                margin: "7px 0 0",
                color: "#5f6b7a",
              }}
            >
              Consulta y gestión de personas y familias afectadas por las
              catástrofes registradas.
            </p>
          </div>

          {/* Registrar población */}
          {puedeGestionar && (
            <button
              type="button"
              onClick={abrirCrear}
              style={{
                padding: "12px 18px",
                border: "none",
                borderRadius: "9px",
                background: "#003893",
                color: "#ffffff",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(0,56,147,0.2)",
              }}
            >
              ➕ Registrar población
            </button>
          )}
        </div>

        {/* Estadísticas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          <Stat titulo="Registros" valor={estadisticas.registros} icono="📋" />

          <Stat
            titulo="Personas afectadas"
            valor={estadisticas.personas}
            icono="👥"
          />

          <Stat titulo="Familias" valor={estadisticas.familias} icono="🏠" />

          <Stat titulo="Heridos" valor={estadisticas.heridos} icono="🩹" />

          <Stat
            titulo="Fallecidos"
            valor={estadisticas.fallecidos}
            icono="⚠️"
          />

          <Stat
            titulo="Desaparecidos"
            valor={estadisticas.desaparecidos}
            icono="🔎"
          />

          <Stat
            titulo="Pendientes atención"
            valor={estadisticas.pendientes}
            icono="⏳"
          />
        </div>

        {/* Filtros */}
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <PoblacionFilters
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            catastrofeFiltro={catastrofeFiltro}
            setCatastrofeFiltro={setCatastrofeFiltro}
            catastrofes={catastrofes}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fde8eb",
              border: "1px solid #ce1126",
              color: "#9b1020",
              borderRadius: "9px",
              padding: "13px",
              marginBottom: "20px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Contenido */}
        {cargando ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "50px",
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
            Cargando población afectada...
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: "14px",
                color: "#5f6b7a",
                fontSize: "14px",
              }}
            >
              Mostrando <strong>{poblacionesFiltradas.length}</strong> de{" "}
              <strong>{poblaciones.length}</strong> registros.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(390px, 1fr))",
                gap: "18px",
              }}
            >
              {poblacionesFiltradas.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "#ffffff",
                    border: "1px solid #dfe4ea",
                    borderRadius: "12px",
                    padding: "45px",
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
                    👥
                  </div>

                  <h3
                    style={{
                      margin: "0 0 7px",
                      color: "#00245f",
                    }}
                  >
                    No se encontraron registros
                  </h3>

                  <p
                    style={{
                      margin: 0,
                    }}
                  >
                    Intenta cambiar los filtros de búsqueda.
                  </p>
                </div>
              ) : (
                poblacionesFiltradas.map((poblacion) => {
                  const catastrofe = catastrofes.find(
                    (item) => item._id === poblacion.catastrofeId
                  );

                  const zona = zonas.find(
                    (item) => item._id === poblacion.zonaId
                  );

                  return (
                    <PoblacionCard
                      key={poblacion._id}
                      poblacion={poblacion}
                      catastrofeTitulo={catastrofe?.titulo}
                      zonaNombre={zona?.nombre}
                      onEditar={puedeGestionar ? abrirEditar : undefined}
                      onEliminar={puedeGestionar ? eliminar : undefined}
                    />
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Modal */}
        {puedeGestionar && modalAbierto && (
          <PoblacionModal
            abierto={modalAbierto}
            titulo={
              poblacionSeleccionada
                ? "Editar población afectada"
                : "Registrar población afectada"
            }
            onCerrar={cerrarModal}
          >
            <PoblacionForm
              poblacion={poblacionSeleccionada}
              catastrofes={catastrofes}
              zonas={zonas}
              onGuardado={guardarExitoso}
              onCancelar={cerrarModal}
            />
          </PoblacionModal>
        )}
      </div>
    </DashboardLayout>
  );
}

function Stat({
  titulo,
  valor,
  icono,
}: {
  titulo: string;
  valor: number;
  icono: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dfe4ea",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 2px 7px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontSize: "22px",
          }}
        >
          {icono}
        </span>

        <span
          style={{
            color: "#5f6b7a",
            fontSize: "11px",
            fontWeight: 700,
            textAlign: "right",
          }}
        >
          {titulo}
        </span>
      </div>

      <div
        style={{
          color: "#00245f",
          fontSize: "25px",
          fontWeight: 800,
        }}
      >
        {valor.toLocaleString("es-CO")}
      </div>
    </div>
  );
}
