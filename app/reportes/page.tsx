"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";

import ReporteCard from "@/components/reportes/ReporteCatastrofeCard";
import ReporteStatCard from "@/components/reportes/ReporteStatCard";
import ReporteFilters from "@/components/reportes/ReporteFilters";
import ReporteModal from "@/components/reportes/ReporteModal";

import {
  ReporteCatastrofe,
  ReporteDonacion,
  ReporteGeneral,
  ReporteNecesidad,
  ReporteZona,
  TipoReporte,
} from "@/types/reportes";

interface ReportesData {
  general: ReporteGeneral;
  catastrofes: ReporteCatastrofe[];
  zonas: ReporteZona[];
  necesidades: ReporteNecesidad[];
  donaciones: ReporteDonacion[];
}

export default function ReportesPage() {
  const { role, loading: cargandoSesion } = useAuth();

  /*
   * Reportes es un módulo únicamente de consulta
   * para ADMIN y FUNCIONARIO.
   */
  const autorizado = role === "ADMIN" || role === "FUNCIONARIO";

  const [reportes, setReportes] = useState<ReportesData | null>(null);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [tipoReporte, setTipoReporte] = useState<TipoReporte>("general");

  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);

  const [reporteSeleccionado, setReporteSeleccionado] = useState<
    ReporteCatastrofe | ReporteZona | ReporteNecesidad | ReporteDonacion | null
  >(null);

  /* ============================================
     CARGAR REPORTES
  ============================================ */

  async function cargarReportes() {
    if (!autorizado) {
      return;
    }

    try {
      setCargando(true);
      setError("");

      const response = await fetch("/api/reportes", {
        cache: "no-store",
        credentials: "include",
      });

      let resultado: {
        success?: boolean;
        message?: string;
        data?: ReportesData;
      } = {};

      try {
        resultado = await response.json();
      } catch {
        throw new Error("El servidor devolvió una respuesta no válida.");
      }

      if (!response.ok) {
        throw new Error(
          resultado.message || "No fue posible cargar los reportes."
        );
      }

      if (!resultado.success || !resultado.data) {
        throw new Error(
          resultado.message || "No fue posible cargar los reportes."
        );
      }

      setReportes(resultado.data);
    } catch (error) {
      console.error("Error cargando reportes:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los reportes."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (cargandoSesion) {
      return;
    }

    if (!autorizado) {
      setCargando(false);
      return;
    }

    cargarReportes();
  }, [autorizado, cargandoSesion]);

  /* ============================================
     MODAL DE DETALLE
  ============================================ */

  function abrirDetalle(
    reporte:
      | ReporteCatastrofe
      | ReporteZona
      | ReporteNecesidad
      | ReporteDonacion
  ) {
    setReporteSeleccionado(reporte);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setReporteSeleccionado(null);
  }

  /* ============================================
     FILTRO DE CATÁSTROFES
  ============================================ */

  const catastrofesFiltradas =
    reportes?.catastrofes.filter((catastrofe) => {
      const texto = busqueda.toLowerCase().trim();

      if (!texto) {
        return true;
      }

      return (
        catastrofe.titulo.toLowerCase().includes(texto) ||
        catastrofe.tipo.toLowerCase().includes(texto) ||
        catastrofe.departamento.toLowerCase().includes(texto) ||
        catastrofe.municipio.toLowerCase().includes(texto)
      );
    }) || [];

  /* ============================================
     FILTRO DE ZONAS / POBLACIÓN
  ============================================ */

  const zonasFiltradas =
    reportes?.zonas.filter((zona) => {
      const texto = busqueda.toLowerCase().trim();

      if (!texto) {
        return true;
      }

      return (
        zona.nombre.toLowerCase().includes(texto) ||
        zona.departamento.toLowerCase().includes(texto) ||
        zona.municipio.toLowerCase().includes(texto) ||
        zona.nivelAfectacion.toLowerCase().includes(texto)
      );
    }) || [];

  /* ============================================
     FILTRO DE NECESIDADES
  ============================================ */

  const necesidadesFiltradas =
    reportes?.necesidades.filter((necesidad) => {
      const texto = busqueda.toLowerCase().trim();

      if (!texto) {
        return true;
      }

      return (
        necesidad.nombre.toLowerCase().includes(texto) ||
        necesidad.categoria.toLowerCase().includes(texto) ||
        necesidad.prioridad.toLowerCase().includes(texto) ||
        necesidad.estado.toLowerCase().includes(texto)
      );
    }) || [];

  /* ============================================
     FILTRO DE DONACIONES
  ============================================ */

  const donacionesFiltradas =
    reportes?.donaciones.filter((donacion) => {
      const texto = busqueda.toLowerCase().trim();

      if (!texto) {
        return true;
      }

      return (
        donacion.referencia.toLowerCase().includes(texto) ||
        donacion.metodoPago.toLowerCase().includes(texto) ||
        donacion.estado.toLowerCase().includes(texto) ||
        donacion.moneda.toLowerCase().includes(texto)
      );
    }) || [];

  /* ============================================
     CARGANDO SESIÓN
  ============================================ */

  if (cargandoSesion) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner">Cargando...</div>
      </div>
    );
  }

  /*
   * USUARIO no tiene acceso al módulo de reportes.
   *
   * No usamos router.replace aquí porque el middleware
   * y la autorización de la API son las verdaderas
   * barreras de seguridad.
   */
  if (!autorizado) {
    return null;
  }

  /* ============================================
     INTERFAZ
  ============================================ */

  return (
    <DashboardLayout>
      <div className="reportes-page">
        {/* ======================================
            ENCABEZADO
        ====================================== */}

        <div className="reportes-header">
          <div>
            <span className="reportes-eyebrow">ANÁLISIS Y ESTADÍSTICAS</span>

            <h1 className="reportes-title">Reportes</h1>

            <p className="reportes-description">
              Consulta información consolidada sobre las catástrofes, zonas
              afectadas, población, necesidades y donaciones registradas en el
              sistema SGRICN.
            </p>
          </div>
        </div>

        {/* ======================================
            INFORMACIÓN
        ====================================== */}

        <div className="reportes-info">
          <div className="reportes-info-icon">📊</div>

          <div>
            <strong>Información generada en tiempo real</strong>

            <p>
              Los reportes se generan directamente desde la información
              almacenada en MongoDB. No se utiliza una colección independiente
              para los reportes.
            </p>
          </div>
        </div>

        {/* ======================================
            CARGANDO
        ====================================== */}

        {cargando && (
          <div className="reportes-loading">
            <div className="reportes-loading-spinner">Cargando reportes...</div>
          </div>
        )}

        {/* ======================================
            ERROR
        ====================================== */}

        {!cargando && error && (
          <div className="reportes-error">
            <div className="reportes-error-icon">⚠️</div>

            <div>
              <strong>No fue posible cargar los reportes</strong>

              <p>{error}</p>

              <button
                type="button"
                className="reportes-retry-button"
                onClick={cargarReportes}
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* ======================================
            CONTENIDO
        ====================================== */}

        {!cargando && !error && reportes && (
          <>
            {/* ==================================
                  FILTROS
            ================================== */}

            <ReporteFilters
              tipoReporte={tipoReporte}
              busqueda={busqueda}
              onTipoReporteChange={setTipoReporte}
              onBusquedaChange={setBusqueda}
            />

            {/* ==================================
                  REPORTE GENERAL
            ================================== */}

            {tipoReporte === "general" && (
              <div className="reportes-general-grid">
                <ReporteStatCard
                  titulo="Catástrofes"
                  valor={reportes.general.totalCatastrofes}
                  descripcion="Total registrado"
                  icono="🚨"
                  variante="danger"
                />

                <ReporteStatCard
                  titulo="Catástrofes activas"
                  valor={reportes.general.catastrofesActivas}
                  descripcion="Emergencias activas"
                  icono="⚠️"
                  variante="warning"
                />

                <ReporteStatCard
                  titulo="Zonas afectadas"
                  valor={reportes.general.totalZonas}
                  descripcion="Zonas registradas"
                  icono="📍"
                  variante="primary"
                />

                <ReporteStatCard
                  titulo="Zonas críticas"
                  valor={reportes.general.zonasCriticas}
                  descripcion="Nivel crítico"
                  icono="🔴"
                  variante="danger"
                />

                <ReporteStatCard
                  titulo="Personas afectadas"
                  valor={reportes.general.totalPersonasAfectadas.toLocaleString(
                    "es-CO"
                  )}
                  descripcion="Personas registradas"
                  icono="👥"
                  variante="primary"
                />

                <ReporteStatCard
                  titulo="Familias afectadas"
                  valor={reportes.general.totalFamiliasAfectadas.toLocaleString(
                    "es-CO"
                  )}
                  descripcion="Familias registradas"
                  icono="🏠"
                  variante="primary"
                />

                <ReporteStatCard
                  titulo="Necesidades"
                  valor={reportes.general.totalNecesidades}
                  descripcion="Necesidades registradas"
                  icono="📦"
                  variante="warning"
                />

                <ReporteStatCard
                  titulo="Necesidades críticas"
                  valor={reportes.general.necesidadesCriticas}
                  descripcion="Prioridad crítica"
                  icono="🚨"
                  variante="danger"
                />

                <ReporteStatCard
                  titulo="Necesidades atendidas"
                  valor={reportes.general.necesidadesAtendidas}
                  descripcion="Necesidades completadas"
                  icono="✅"
                  variante="success"
                />

                <ReporteStatCard
                  titulo="Donaciones aprobadas"
                  valor={reportes.general.totalDonaciones}
                  descripcion="Donaciones confirmadas"
                  icono="💰"
                  variante="success"
                />

                <ReporteStatCard
                  titulo="Monto donado"
                  valor={`$${reportes.general.montoDonaciones.toLocaleString(
                    "es-CO"
                  )}`}
                  descripcion="Pesos colombianos"
                  icono="💵"
                  variante="success"
                />

                <ReporteStatCard
                  titulo="Centros autorizados"
                  valor={reportes.general.centrosAutorizados}
                  descripcion="Centros activos"
                  icono="🏢"
                  variante="primary"
                />
              </div>
            )}

            {/* ==================================
                  REPORTE DE CATÁSTROFES
            ================================== */}

            {tipoReporte === "catastrofes" && (
              <div className="reportes-section">
                <div className="reportes-section-header">
                  <div>
                    <h2>Reporte de catástrofes</h2>

                    <p>
                      Información consolidada de las catástrofes registradas.
                    </p>
                  </div>

                  <span className="reportes-count">
                    {catastrofesFiltradas.length}
                  </span>
                </div>

                {catastrofesFiltradas.length === 0 ? (
                  <div className="reportes-empty">
                    No se encontraron catástrofes.
                  </div>
                ) : (
                  <div className="reportes-table-container">
                    <table className="reportes-table">
                      <thead>
                        <tr>
                          <th>Catástrofe</th>
                          <th>Tipo</th>
                          <th>Estado</th>
                          <th>Nivel</th>
                          <th>Ubicación</th>
                          <th>Zonas</th>
                          <th>Personas</th>
                          <th>Necesidades</th>
                          <th>Acción</th>
                        </tr>
                      </thead>

                      <tbody>
                        {catastrofesFiltradas.map((catastrofe) => (
                          <tr key={catastrofe._id}>
                            <td>
                              <strong>{catastrofe.titulo}</strong>
                            </td>

                            <td>{catastrofe.tipo}</td>

                            <td>{catastrofe.estado}</td>

                            <td>{catastrofe.nivelEmergencia}</td>

                            <td>
                              {catastrofe.municipio}, {catastrofe.departamento}
                            </td>

                            <td>{catastrofe.zonas}</td>

                            <td>{catastrofe.personasAfectadas}</td>

                            <td>{catastrofe.necesidades}</td>

                            <td>
                              <button
                                type="button"
                                className="reportes-detail-button"
                                onClick={() => abrirDetalle(catastrofe)}
                              >
                                Ver detalle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ==================================
                  REPORTE DE POBLACIÓN
            ================================== */}

            {tipoReporte === "poblacion" && (
              <div className="reportes-section">
                <div className="reportes-section-header">
                  <div>
                    <h2>Reporte de población</h2>

                    <p>Población afectada por zona.</p>
                  </div>

                  <span className="reportes-count">
                    {zonasFiltradas.length}
                  </span>
                </div>

                {zonasFiltradas.length === 0 ? (
                  <div className="reportes-empty">
                    No se encontraron registros de población.
                  </div>
                ) : (
                  <div className="reportes-table-container">
                    <table className="reportes-table">
                      <thead>
                        <tr>
                          <th>Zona</th>
                          <th>Departamento</th>
                          <th>Municipio</th>
                          <th>Nivel afectación</th>
                          <th>Estado</th>
                          <th>Personas</th>
                          <th>Familias</th>
                          <th>Acción</th>
                        </tr>
                      </thead>

                      <tbody>
                        {zonasFiltradas.map((zona) => (
                          <tr key={zona._id}>
                            <td>
                              <strong>{zona.nombre}</strong>
                            </td>

                            <td>{zona.departamento}</td>

                            <td>{zona.municipio}</td>

                            <td>{zona.nivelAfectacion}</td>

                            <td>{zona.estado}</td>

                            <td>{zona.personasAfectadas}</td>

                            <td>{zona.familiasAfectadas}</td>

                            <td>
                              <button
                                type="button"
                                className="reportes-detail-button"
                                onClick={() => abrirDetalle(zona)}
                              >
                                Ver detalle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ==================================
                  REPORTE DE NECESIDADES
            ================================== */}

            {tipoReporte === "necesidades" && (
              <div className="reportes-section">
                <div className="reportes-section-header">
                  <div>
                    <h2>Reporte de necesidades</h2>

                    <p>Estado de las necesidades registradas.</p>
                  </div>

                  <span className="reportes-count">
                    {necesidadesFiltradas.length}
                  </span>
                </div>

                {necesidadesFiltradas.length === 0 ? (
                  <div className="reportes-empty">
                    No se encontraron necesidades.
                  </div>
                ) : (
                  <div className="reportes-table-container">
                    <table className="reportes-table">
                      <thead>
                        <tr>
                          <th>Necesidad</th>
                          <th>Categoría</th>
                          <th>Prioridad</th>
                          <th>Estado</th>
                          <th>Necesaria</th>
                          <th>Recibida</th>
                          <th>Pendiente</th>
                          <th>Atendido</th>
                          <th>Acción</th>
                        </tr>
                      </thead>

                      <tbody>
                        {necesidadesFiltradas.map((necesidad) => (
                          <tr key={necesidad._id}>
                            <td>
                              <strong>{necesidad.nombre}</strong>
                            </td>

                            <td>{necesidad.categoria}</td>

                            <td>{necesidad.prioridad}</td>

                            <td>{necesidad.estado}</td>

                            <td>{necesidad.cantidadNecesaria}</td>

                            <td>{necesidad.cantidadRecibida}</td>

                            <td>{necesidad.cantidadPendiente}</td>

                            <td>{necesidad.porcentajeAtendido.toFixed(1)}%</td>

                            <td>
                              <button
                                type="button"
                                className="reportes-detail-button"
                                onClick={() => abrirDetalle(necesidad)}
                              >
                                Ver detalle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ==================================
                  REPORTE DE DONACIONES
            ================================== */}

            {tipoReporte === "donaciones" && (
              <div className="reportes-section">
                <div className="reportes-section-header">
                  <div>
                    <h2>Reporte de donaciones</h2>

                    <p>Información de las donaciones registradas.</p>
                  </div>

                  <span className="reportes-count">
                    {donacionesFiltradas.length}
                  </span>
                </div>

                {donacionesFiltradas.length === 0 ? (
                  <div className="reportes-empty">
                    No se encontraron donaciones.
                  </div>
                ) : (
                  <div className="reportes-table-container">
                    <table className="reportes-table">
                      <thead>
                        <tr>
                          <th>Referencia</th>
                          <th>Monto</th>
                          <th>Moneda</th>
                          <th>Método</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                          <th>Acción</th>
                        </tr>
                      </thead>

                      <tbody>
                        {donacionesFiltradas.map((donacion) => (
                          <tr key={donacion._id}>
                            <td>
                              <strong>{donacion.referencia}</strong>
                            </td>

                            <td>${donacion.monto.toLocaleString("es-CO")}</td>

                            <td>{donacion.moneda}</td>

                            <td>{donacion.metodoPago}</td>

                            <td>{donacion.estado}</td>

                            <td>
                              {new Date(
                                donacion.fechaCreacion
                              ).toLocaleDateString("es-CO")}
                            </td>

                            <td>
                              <button
                                type="button"
                                className="reportes-detail-button"
                                onClick={() => abrirDetalle(donacion)}
                              >
                                Ver detalle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ======================================
            MODAL DE DETALLE
        ====================================== */}

        <ReporteModal
          abierto={modalAbierto}
          reporte={reporteSeleccionado}
          tipoReporte={tipoReporte}
          onCerrar={cerrarModal}
        />
      </div>
    </DashboardLayout>
  );
}
