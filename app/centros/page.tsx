"use client";

import React, { useEffect, useMemo, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import CentroCard from "@/components/centros/CentroCard";
import CentroFilters from "@/components/centros/CentroFilters";
import CentroModal from "@/components/centros/CentroModal";
import CentroForm from "@/components/centros/CentroForm";

import { useAuth } from "@/components/auth/AuthProvider";
import { CentroDonacion } from "@/types/centros";

export default function CentrosPage() {
  const { role } = useAuth();

  const puedeGestionar = role === "ADMIN" || role === "FUNCIONARIO";

  const [centros, setCentros] = useState<CentroDonacion[]>([]);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [municipioSeleccionado, setMunicipioSeleccionado] = useState("");

  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");

  const [autorizacionSeleccionada, setAutorizacionSeleccionada] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);

  const [centroSeleccionado, setCentroSeleccionado] =
    useState<CentroDonacion | null>(null);

  const cargarCentros = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch("/api/centros", {
        method: "GET",
        cache: "no-store",
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.success) {
        throw new Error(
          resultado.message || "No fue posible cargar los centros."
        );
      }

      setCentros(resultado.data ?? []);
    } catch (error) {
      console.error("Error cargando centros:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al cargar los centros."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCentros();
  }, []);

  const centrosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return centros.filter((centro) => {
      const coincideBusqueda =
        !texto ||
        centro.nombre.toLowerCase().includes(texto) ||
        centro.direccion.toLowerCase().includes(texto) ||
        centro.municipio.toLowerCase().includes(texto) ||
        centro.departamento.toLowerCase().includes(texto) ||
        centro.responsable.toLowerCase().includes(texto);

      const coincideMunicipio =
        !municipioSeleccionado || centro.municipio === municipioSeleccionado;

      const coincideEstado =
        !estadoSeleccionado || centro.estado === estadoSeleccionado;

      const coincideAutorizacion =
        !autorizacionSeleccionada ||
        String(centro.autorizado) === autorizacionSeleccionada;

      return (
        coincideBusqueda &&
        coincideMunicipio &&
        coincideEstado &&
        coincideAutorizacion
      );
    });
  }, [
    centros,
    busqueda,
    municipioSeleccionado,
    estadoSeleccionado,
    autorizacionSeleccionada,
  ]);

  const abrirNuevoCentro = () => {
    if (!puedeGestionar) {
      return;
    }

    setCentroSeleccionado(null);
    setModalAbierto(true);
  };

  const abrirEditarCentro = (centro: CentroDonacion) => {
    if (!puedeGestionar) {
      return;
    }

    setCentroSeleccionado(centro);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (!cargando) {
      setModalAbierto(false);
      setCentroSeleccionado(null);
    }
  };

  const manejarGuardado = (centroGuardado: CentroDonacion) => {
    if (!puedeGestionar) {
      return;
    }

    setCentros((anteriores) => {
      const existe = anteriores.some(
        (centro) => centro._id === centroGuardado._id
      );

      if (existe) {
        return anteriores.map((centro) =>
          centro._id === centroGuardado._id ? centroGuardado : centro
        );
      }

      return [centroGuardado, ...anteriores];
    });

    setModalAbierto(false);
    setCentroSeleccionado(null);
  };

  const manejarEliminar = async (id: string) => {
    if (!puedeGestionar) {
      return;
    }

    try {
      setError("");

      const respuesta = await fetch(`/api/centros/${id}`, {
        method: "DELETE",
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.success) {
        throw new Error(
          resultado.message || "No fue posible eliminar el centro."
        );
      }

      setCentros((anteriores) =>
        anteriores.filter((centro) => centro._id !== id)
      );
    } catch (error) {
      console.error("Error eliminando centro:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al eliminar el centro."
      );
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setMunicipioSeleccionado("");
    setEstadoSeleccionado("");
    setAutorizacionSeleccionada("");
  };

  const centrosActivos = centros.filter(
    (centro) => centro.estado === "activo"
  ).length;

  const centrosAutorizados = centros.filter(
    (centro) => centro.autorizado
  ).length;

  const centrosInactivos = centros.filter(
    (centro) => centro.estado === "inactivo"
  ).length;

  return (
    <DashboardLayout>
      <div
        style={{
          minHeight: "100%",
          background: "#f5f7fa",
          padding: "25px",
        }}
      >
        {/* ENCABEZADO */}
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
            <h1
              style={{
                margin: 0,
                color: "#00245f",
                fontSize: "28px",
                fontWeight: 800,
              }}
            >
              🏢 Centros de donación
            </h1>

            <p
              style={{
                margin: "7px 0 0",
                color: "#5f6b7a",
                fontSize: "14px",
              }}
            >
              {puedeGestionar
                ? "Administra los centros autorizados para recibir donaciones durante las emergencias."
                : "Consulta los centros autorizados para recibir donaciones durante las emergencias."}
            </p>
          </div>

          {puedeGestionar && (
            <button
              type="button"
              onClick={abrirNuevoCentro}
              style={{
                padding: "12px 18px",
                border: "none",
                borderRadius: "9px",
                background: "#003893",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0, 56, 147, 0.25)",
              }}
            >
              + Nuevo centro
            </button>
          )}
        </div>

        {/* INDICADORES */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "15px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div
              style={{
                color: "#5f6b7a",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              TOTAL CENTROS
            </div>

            <div
              style={{
                marginTop: "7px",
                color: "#00245f",
                fontSize: "25px",
                fontWeight: 800,
              }}
            >
              {centros.length}
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div
              style={{
                color: "#5f6b7a",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              CENTROS ACTIVOS
            </div>

            <div
              style={{
                marginTop: "7px",
                color: "#198754",
                fontSize: "25px",
                fontWeight: 800,
              }}
            >
              {centrosActivos}
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div
              style={{
                color: "#5f6b7a",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              AUTORIZADOS
            </div>

            <div
              style={{
                marginTop: "7px",
                color: "#003893",
                fontSize: "25px",
                fontWeight: 800,
              }}
            >
              {centrosAutorizados}
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div
              style={{
                color: "#5f6b7a",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              INACTIVOS
            </div>

            <div
              style={{
                marginTop: "7px",
                color: "#ce1126",
                fontSize: "25px",
                fontWeight: 800,
              }}
            >
              {centrosInactivos}
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 15px",
              borderRadius: "9px",
              background: "#fdecec",
              border: "1px solid #f1b5b5",
              color: "#ce1126",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* FILTROS */}
        <div
          style={{
            marginBottom: "22px",
          }}
        >
          <CentroFilters
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            municipioSeleccionado={municipioSeleccionado}
            setMunicipioSeleccionado={setMunicipioSeleccionado}
            estadoSeleccionado={estadoSeleccionado}
            setEstadoSeleccionado={setEstadoSeleccionado}
            autorizacionSeleccionada={autorizacionSeleccionada}
            setAutorizacionSeleccionada={setAutorizacionSeleccionada}
            centros={centros}
          />

          {(busqueda ||
            municipioSeleccionado ||
            estadoSeleccionado ||
            autorizacionSeleccionada) && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "10px",
              }}
            >
              <button
                type="button"
                onClick={limpiarFiltros}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#003893",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* CONTENIDO */}
        {cargando ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dfe4ea",
              borderRadius: "14px",
              padding: "45px",
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

            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Cargando centros de donación...
            </div>
          </div>
        ) : centrosFiltrados.length === 0 ? (
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
                fontSize: "45px",
                marginBottom: "10px",
              }}
            >
              🏢
            </div>

            <h3
              style={{
                margin: "0 0 7px",
                color: "#00245f",
                fontSize: "18px",
              }}
            >
              No se encontraron centros
            </h3>

            <p
              style={{
                margin: 0,
                color: "#5f6b7a",
                fontSize: "13px",
              }}
            >
              {centros.length === 0
                ? "Todavía no hay centros de donación registrados."
                : "No hay centros que coincidan con los filtros seleccionados."}
            </p>

            {centros.length === 0 && puedeGestionar && (
              <button
                type="button"
                onClick={abrirNuevoCentro}
                style={{
                  marginTop: "18px",
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#003893",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Registrar primer centro
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: "12px",
                color: "#5f6b7a",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Mostrando {centrosFiltrados.length} de {centros.length} centros
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: "18px",
              }}
            >
              {centrosFiltrados.map((centro) => (
                <CentroCard
                  key={centro._id}
                  centro={centro}
                  onEditar={puedeGestionar ? abrirEditarCentro : undefined}
                  onEliminar={puedeGestionar ? manejarEliminar : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {puedeGestionar && modalAbierto && (
        <CentroModal
          abierto={modalAbierto}
          titulo={
            centroSeleccionado
              ? "Editar centro de donación"
              : "Nuevo centro de donación"
          }
          centro={centroSeleccionado}
          onCerrar={cerrarModal}
        >
          <CentroForm
            centro={centroSeleccionado}
            onGuardado={manejarGuardado}
            onCancelar={cerrarModal}
          />
        </CentroModal>
      )}
    </DashboardLayout>
  );
}
