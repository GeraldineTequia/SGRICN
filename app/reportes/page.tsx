"use client";

import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useAuth } from "@/components/auth/AuthProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ReporteFilters from "@/components/reportes/ReporteFilters";
import ReporteStatCard from "@/components/reportes/ReporteStatCard";
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

type FiltroEstado = "todos" | string;
type FiltroPrioridad = "todos" | string;

function normalizarTexto(valor: unknown): string {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function capitalizar(valor: unknown): string {
  const texto = String(valor ?? "").trim();

  if (!texto) {
    return "Sin información";
  }

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatearNumero(valor: unknown): string {
  return Number(valor ?? 0).toLocaleString("es-CO");
}

function formatearMoneda(valor: unknown): string {
  return `$${Number(valor ?? 0).toLocaleString("es-CO")}`;
}

function obtenerClaseEstado(estado: unknown): string {
  const valor = normalizarTexto(estado);

  if (
    valor === "activa" ||
    valor === "activo" ||
    valor === "aprobada" ||
    valor === "aprobado" ||
    valor === "atendida" ||
    valor === "atendido" ||
    valor === "completada" ||
    valor === "completado" ||
    valor === "confirmada" ||
    valor === "confirmado"
  ) {
    return "reportes-badge reportes-badge-success";
  }

  if (
    valor === "pendiente" ||
    valor === "en proceso" ||
    valor === "en curso" ||
    valor === "urgente"
  ) {
    return "reportes-badge reportes-badge-warning";
  }

  if (
    valor === "critica" ||
    valor === "crítico" ||
    valor === "critico" ||
    valor === "rechazada" ||
    valor === "rechazado" ||
    valor === "cancelada" ||
    valor === "cancelado"
  ) {
    return "reportes-badge reportes-badge-danger";
  }

  if (
    valor === "inactiva" ||
    valor === "inactivo" ||
    valor === "cerrada" ||
    valor === "cerrado" ||
    valor === "resuelta" ||
    valor === "resuelto"
  ) {
    return "reportes-badge reportes-badge-neutral";
  }

  return "reportes-badge reportes-badge-info";
}

function obtenerClasePrioridad(valor: unknown): string {
  const prioridad = normalizarTexto(valor);

  if (prioridad === "critica" || prioridad === "critico") {
    return "reportes-badge reportes-badge-danger";
  }

  if (prioridad === "alta" || prioridad === "alto") {
    return "reportes-badge reportes-badge-warning";
  }

  if (prioridad === "media" || prioridad === "medio") {
    return "reportes-badge reportes-badge-info";
  }

  if (prioridad === "baja" || prioridad === "bajo") {
    return "reportes-badge reportes-badge-success";
  }

  return "reportes-badge reportes-badge-neutral";
}

export default function ReportesPage() {
  const { role, loading: cargandoSesion } = useAuth();

  const autorizado =
    role === "ADMIN" || role === "FUNCIONARIO";

  const [reportes, setReportes] = useState<ReportesData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [tipoReporte, setTipoReporte] =
    useState<TipoReporte>("general");

  const [busqueda, setBusqueda] = useState("");

  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>("todos");

  const [filtroPrioridad, setFiltroPrioridad] =
    useState<FiltroPrioridad>("todos");

  const [modalAbierto, setModalAbierto] = useState(false);

  const [reporteSeleccionado, setReporteSeleccionado] =
    useState<
      | ReporteCatastrofe
      | ReporteZona
      | ReporteNecesidad
      | ReporteDonacion
      | null
    >(null);

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
        throw new Error(
          "El servidor devolvió una respuesta no válida."
        );
      }

      if (!response.ok) {
        throw new Error(
          resultado.message ||
            "No fue posible cargar los reportes."
        );
      }

      if (!resultado.success || !resultado.data) {
        throw new Error(
          resultado.message ||
            "No fue posible cargar los reportes."
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

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("todos");
    setFiltroPrioridad("todos");
  }

  /*
   * =========================================================
   * FILTRO DE CATÁSTROFES
   * =========================================================
   */

  const catastrofesFiltradas = useMemo(() => {
    if (!reportes) {
      return [];
    }

    const texto = normalizarTexto(busqueda);

    return reportes.catastrofes.filter((catastrofe) => {
      const coincideBusqueda =
        !texto ||
        [
          catastrofe.titulo,
          catastrofe.tipo,
          catastrofe.departamento,
          catastrofe.municipio,
          catastrofe.estado,
          catastrofe.nivelEmergencia,
        ].some((valor) =>
          normalizarTexto(valor).includes(texto)
        );

      const coincideEstado =
        filtroEstado === "todos" ||
        normalizarTexto(catastrofe.estado) ===
          normalizarTexto(filtroEstado);

      const coincidePrioridad =
        filtroPrioridad === "todos" ||
        normalizarTexto(catastrofe.nivelEmergencia) ===
          normalizarTexto(filtroPrioridad);

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincidePrioridad
      );
    });
  }, [
    reportes,
    busqueda,
    filtroEstado,
    filtroPrioridad,
  ]);

  /*
   * =========================================================
   * FILTRO DE ZONAS / POBLACIÓN
   * =========================================================
   */

  const zonasFiltradas = useMemo(() => {
    if (!reportes) {
      return [];
    }

    const texto = normalizarTexto(busqueda);

    return reportes.zonas.filter((zona) => {
      const coincideBusqueda =
        !texto ||
        [
          zona.nombre,
          zona.departamento,
          zona.municipio,
          zona.nivelAfectacion,
          zona.estado,
        ].some((valor) =>
          normalizarTexto(valor).includes(texto)
        );

      const coincideEstado =
        filtroEstado === "todos" ||
        normalizarTexto(zona.estado) ===
          normalizarTexto(filtroEstado);

      const coincidePrioridad =
        filtroPrioridad === "todos" ||
        normalizarTexto(zona.nivelAfectacion) ===
          normalizarTexto(filtroPrioridad);

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincidePrioridad
      );
    });
  }, [
    reportes,
    busqueda,
    filtroEstado,
    filtroPrioridad,
  ]);

  /*
   * =========================================================
   * FILTRO DE NECESIDADES
   * =========================================================
   */

  const necesidadesFiltradas = useMemo(() => {
    if (!reportes) {
      return [];
    }

    const texto = normalizarTexto(busqueda);

    return reportes.necesidades.filter((necesidad) => {
      const coincideBusqueda =
        !texto ||
        [
          necesidad.nombre,
          necesidad.categoria,
          necesidad.prioridad,
          necesidad.estado,
        ].some((valor) =>
          normalizarTexto(valor).includes(texto)
        );

      const coincideEstado =
        filtroEstado === "todos" ||
        normalizarTexto(necesidad.estado) ===
          normalizarTexto(filtroEstado);

      const coincidePrioridad =
        filtroPrioridad === "todos" ||
        normalizarTexto(necesidad.prioridad) ===
          normalizarTexto(filtroPrioridad);

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincidePrioridad
      );
    });
  }, [
    reportes,
    busqueda,
    filtroEstado,
    filtroPrioridad,
  ]);

  /*
   * =========================================================
   * FILTRO DE DONACIONES
   * =========================================================
   */

  const donacionesFiltradas = useMemo(() => {
    if (!reportes) {
      return [];
    }

    const texto = normalizarTexto(busqueda);

    return reportes.donaciones.filter((donacion) => {
      const coincideBusqueda =
        !texto ||
        [
          donacion.referencia,
          donacion.metodoPago,
          donacion.estado,
          donacion.moneda,
        ].some((valor) =>
          normalizarTexto(valor).includes(texto)
        );

      const coincideEstado =
        filtroEstado === "todos" ||
        normalizarTexto(donacion.estado) ===
          normalizarTexto(filtroEstado);

      return coincideBusqueda && coincideEstado;
    });
  }, [
    reportes,
    busqueda,
    filtroEstado,
  ]);

  /*
   * =========================================================
   * PDF
   * =========================================================
   */

  function crearEncabezadoPDF(
    doc: jsPDF,
    titulo: string
  ) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("SGRICN", 14, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Sistema de Gestión y Respuesta Integral ante Catástrofes Naturales",
      14,
      25
    );

    doc.setDrawColor(0, 56, 147);
    doc.setLineWidth(1);
    doc.line(14, 29, 196, 29);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(titulo, 14, 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `Generado: ${new Date().toLocaleString("es-CO")}`,
      14,
      47
    );
  }

  function descargarPDF() {
    if (!reportes) {
      return;
    }

    const doc = new jsPDF();

    /*
     * =======================================================
     * REPORTE GENERAL
     * =======================================================
     */

    if (tipoReporte === "general") {
      crearEncabezadoPDF(
        doc,
        "Reporte general de gestión"
      );

      autoTable(doc, {
        startY: 55,
        head: [["Indicador", "Resultado"]],
        body: [
          [
            "Catástrofes registradas",
            formatearNumero(
              reportes.general.totalCatastrofes
            ),
          ],
          [
            "Catástrofes activas",
            formatearNumero(
              reportes.general.catastrofesActivas
            ),
          ],
          [
            "Zonas afectadas",
            formatearNumero(
              reportes.general.totalZonas
            ),
          ],
          [
            "Zonas críticas",
            formatearNumero(
              reportes.general.zonasCriticas
            ),
          ],
          [
            "Personas afectadas",
            formatearNumero(
              reportes.general.totalPersonasAfectadas
            ),
          ],
          [
            "Familias afectadas",
            formatearNumero(
              reportes.general.totalFamiliasAfectadas
            ),
          ],
          [
            "Necesidades",
            formatearNumero(
              reportes.general.totalNecesidades
            ),
          ],
          [
            "Necesidades críticas",
            formatearNumero(
              reportes.general.necesidadesCriticas
            ),
          ],
          [
            "Necesidades atendidas",
            formatearNumero(
              reportes.general.necesidadesAtendidas
            ),
          ],
          [
            "Donaciones aprobadas",
            formatearNumero(
              reportes.general.totalDonaciones
            ),
          ],
          [
            "Monto donado",
            formatearMoneda(
              reportes.general.montoDonaciones
            ),
          ],
          [
            "Centros autorizados",
            formatearNumero(
              reportes.general.centrosAutorizados
            ),
          ],
        ],
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [0, 56, 147],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
      });

      doc.save("SGRICN-reporte-general.pdf");
      return;
    }

    /*
     * =======================================================
     * CATÁSTROFES
     * =======================================================
     */

    if (tipoReporte === "catastrofes") {
      crearEncabezadoPDF(
        doc,
        "Reporte de catástrofes"
      );

      autoTable(doc, {
        startY: 55,
        head: [
          [
            "Catástrofe",
            "Tipo",
            "Estado",
            "Nivel",
            "Ubicación",
            "Personas",
            "Zonas",
          ],
        ],
        body: catastrofesFiltradas.map((catastrofe) => [
          catastrofe.titulo,
          catastrofe.tipo,
          capitalizar(catastrofe.estado),
          capitalizar(catastrofe.nivelEmergencia),
          `${catastrofe.municipio}, ${catastrofe.departamento}`,
          formatearNumero(
            catastrofe.personasAfectadas
          ),
          formatearNumero(catastrofe.zonas),
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 56, 147],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
      });

      doc.save("SGRICN-reporte-catastrofes.pdf");
      return;
    }

    /*
     * =======================================================
     * POBLACIÓN
     * =======================================================
     */

    if (tipoReporte === "poblacion") {
      crearEncabezadoPDF(
        doc,
        "Reporte de población afectada"
      );

      autoTable(doc, {
        startY: 55,
        head: [
          [
            "Zona",
            "Departamento",
            "Municipio",
            "Nivel",
            "Estado",
            "Personas",
            "Familias",
          ],
        ],
        body: zonasFiltradas.map((zona) => [
          zona.nombre,
          zona.departamento,
          zona.municipio,
          capitalizar(zona.nivelAfectacion),
          capitalizar(zona.estado),
          formatearNumero(
            zona.personasAfectadas
          ),
          formatearNumero(
            zona.familiasAfectadas
          ),
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 56, 147],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
      });

      doc.save("SGRICN-reporte-poblacion.pdf");
      return;
    }

    /*
     * =======================================================
     * NECESIDADES
     * =======================================================
     */

    if (tipoReporte === "necesidades") {
      crearEncabezadoPDF(
        doc,
        "Reporte de necesidades"
      );

      autoTable(doc, {
        startY: 55,
        head: [
          [
            "Necesidad",
            "Categoría",
            "Prioridad",
            "Estado",
            "Necesaria",
            "Recibida",
            "Pendiente",
            "Atendido",
          ],
        ],
        body: necesidadesFiltradas.map(
          (necesidad) => [
            necesidad.nombre,
            necesidad.categoria,
            capitalizar(necesidad.prioridad),
            capitalizar(necesidad.estado),
            formatearNumero(
              necesidad.cantidadNecesaria
            ),
            formatearNumero(
              necesidad.cantidadRecibida
            ),
            formatearNumero(
              necesidad.cantidadPendiente
            ),
            `${Number(
              necesidad.porcentajeAtendido ?? 0
            ).toFixed(1)}%`,
          ]
        ),
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 56, 147],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
      });

      doc.save("SGRICN-reporte-necesidades.pdf");
      return;
    }

    /*
     * =======================================================
     * DONACIONES
     * =======================================================
     */

    if (tipoReporte === "donaciones") {
      crearEncabezadoPDF(
        doc,
        "Reporte de donaciones"
      );

      autoTable(doc, {
        startY: 55,
        head: [
          [
            "Referencia",
            "Monto",
            "Moneda",
            "Método",
            "Estado",
            "Fecha",
          ],
        ],
        body: donacionesFiltradas.map(
          (donacion) => [
            donacion.referencia,
            formatearMoneda(donacion.monto),
            donacion.moneda,
            donacion.metodoPago,
            capitalizar(donacion.estado),
            new Date(
              donacion.fechaCreacion
            ).toLocaleDateString("es-CO"),
          ]
        ),
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 56, 147],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
      });

      doc.save("SGRICN-reporte-donaciones.pdf");
    }
  }

  /*
   * =========================================================
   * SESIÓN
   * =========================================================
   */

  if (cargandoSesion) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner">
          Cargando...
        </div>
      </div>
    );
  }

  if (!autorizado) {
    return null;
  }

  /*
   * =========================================================
   * INTERFAZ
   * =========================================================
   */

  return (
    <DashboardLayout>
      <div className="reportes-page">
        {/* ===================================================
            ENCABEZADO
        =================================================== */}

        <section className="reportes-hero">
          <div className="reportes-hero-content">
            <div>
              <span className="reportes-eyebrow">
                SGRICN · ANÁLISIS Y ESTADÍSTICAS
              </span>

              <h1 className="reportes-title">
                Reportes
              </h1>

              <p className="reportes-description">
                Consulta, analiza y descarga información
                consolidada sobre las catástrofes,
                zonas afectadas, población, necesidades
                y donaciones registradas en el sistema.
              </p>
            </div>

            <div className="reportes-hero-actions">
              <button
                type="button"
                className="reportes-secondary-button"
                onClick={cargarReportes}
                disabled={cargando}
              >
                <span>↻</span>
                Actualizar
              </button>

              <button
                type="button"
                className="reportes-pdf-button"
                onClick={descargarPDF}
                disabled={!reportes || cargando}
              >
                <span>📄</span>
                Descargar PDF
              </button>
            </div>
          </div>

          <div className="reportes-hero-line" />
        </section>

        {/* ===================================================
            INFORMACIÓN
        =================================================== */}

        <section className="reportes-info">
          <div className="reportes-info-icon">
            📊
          </div>

          <div>
            <strong>
              Información generada en tiempo real
            </strong>

            <p>
              Los reportes se generan directamente a
              partir de la información almacenada en
              MongoDB.
            </p>
          </div>
        </section>

        {/* ===================================================
            CARGANDO
        =================================================== */}

        {cargando && (
          <div className="reportes-loading">
            <div className="reportes-loading-spinner" />
            <strong>
              Cargando información...
            </strong>
            <span>
              Estamos preparando los reportes de SGRICN.
            </span>
          </div>
        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {!cargando && error && (
          <div className="reportes-error">
            <div className="reportes-error-icon">
              ⚠️
            </div>

            <div>
              <strong>
                No fue posible cargar los reportes
              </strong>

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

        {/* ===================================================
            CONTENIDO
        =================================================== */}

        {!cargando && !error && reportes && (
          <>
            {/* =================================================
                SELECTOR DE REPORTES
            ================================================= */}

            <section className="reportes-selector">
              <div className="reportes-selector-header">
                <div>
                  <span className="reportes-section-eyebrow">
                    CONSULTA
                  </span>

                  <h2>
                    Selecciona el tipo de reporte
                  </h2>
                </div>

                <div className="reportes-result-count">
                  {tipoReporte === "general"
                    ? "Resumen"
                    : tipoReporte === "catastrofes"
                    ? `${catastrofesFiltradas.length} registros`
                    : tipoReporte === "poblacion"
                    ? `${zonasFiltradas.length} registros`
                    : tipoReporte === "necesidades"
                    ? `${necesidadesFiltradas.length} registros`
                    : `${donacionesFiltradas.length} registros`}
                </div>
              </div>

              <div className="reportes-tabs">
                <button
                  type="button"
                  className={
                    tipoReporte === "general"
                      ? "reportes-tab active"
                      : "reportes-tab"
                  }
                  onClick={() => {
                    setTipoReporte("general");
                    limpiarFiltros();
                  }}
                >
                  <span>📊</span>
                  General
                </button>

                <button
                  type="button"
                  className={
                    tipoReporte === "catastrofes"
                      ? "reportes-tab active"
                      : "reportes-tab"
                  }
                  onClick={() => {
                    setTipoReporte("catastrofes");
                    limpiarFiltros();
                  }}
                >
                  <span>🚨</span>
                  Catástrofes
                </button>

                <button
                  type="button"
                  className={
                    tipoReporte === "poblacion"
                      ? "reportes-tab active"
                      : "reportes-tab"
                  }
                  onClick={() => {
                    setTipoReporte("poblacion");
                    limpiarFiltros();
                  }}
                >
                  <span>👥</span>
                  Población
                </button>

                <button
                  type="button"
                  className={
                    tipoReporte === "necesidades"
                      ? "reportes-tab active"
                      : "reportes-tab"
                  }
                  onClick={() => {
                    setTipoReporte("necesidades");
                    limpiarFiltros();
                  }}
                >
                  <span>📦</span>
                  Necesidades
                </button>

                <button
                  type="button"
                  className={
                    tipoReporte === "donaciones"
                      ? "reportes-tab active"
                      : "reportes-tab"
                  }
                  onClick={() => {
                    setTipoReporte("donaciones");
                    limpiarFiltros();
                  }}
                >
                  <span>💰</span>
                  Donaciones
                </button>
              </div>
            </section>

            {/* =================================================
                FILTROS
            ================================================= */}

            {tipoReporte !== "general" && (
              <section className="reportes-filters-panel">
                <div className="reportes-filters-title">
                  <div className="reportes-filter-icon">
                    🔎
                  </div>

                  <div>
                    <strong>
                      Filtrar información
                    </strong>

                    <span>
                      Refina los resultados del reporte
                    </span>
                  </div>
                </div>

                <div className="reportes-filters-grid">
                  <div className="reportes-filter-field reportes-search-field">
                    <label htmlFor="reporte-busqueda">
                      Buscar
                    </label>

                    <div className="reportes-input-wrapper">
                      <span>🔍</span>

                      <input
                        id="reporte-busqueda"
                        type="text"
                        value={busqueda}
                        onChange={(event) =>
                          setBusqueda(
                            event.target.value
                          )
                        }
                        placeholder={
                          tipoReporte ===
                          "catastrofes"
                            ? "Nombre, tipo, municipio..."
                            : tipoReporte ===
                              "poblacion"
                            ? "Zona, municipio..."
                            : tipoReporte ===
                              "necesidades"
                            ? "Necesidad, categoría..."
                            : "Referencia, método..."
                        }
                      />
                    </div>
                  </div>

                  <div className="reportes-filter-field">
                    <label htmlFor="reporte-estado">
                      Estado
                    </label>

                    <select
                      id="reporte-estado"
                      value={filtroEstado}
                      onChange={(event) =>
                        setFiltroEstado(
                          event.target.value
                        )
                      }
                    >
                      <option value="todos">
                        Todos los estados
                      </option>
                      <option value="activa">
                        Activa
                      </option>
                      <option value="pendiente">
                        Pendiente
                      </option>
                      <option value="en proceso">
                        En proceso
                      </option>
                      <option value="atendida">
                        Atendida
                      </option>
                      <option value="aprobada">
                        Aprobada
                      </option>
                      <option value="rechazada">
                        Rechazada
                      </option>
                      <option value="cerrada">
                        Cerrada
                      </option>
                    </select>
                  </div>

                  {tipoReporte !== "donaciones" && (
                    <div className="reportes-filter-field">
                      <label htmlFor="reporte-prioridad">
                        {tipoReporte ===
                        "poblacion"
                          ? "Nivel de afectación"
                          : tipoReporte ===
                            "catastrofes"
                          ? "Nivel de emergencia"
                          : "Prioridad"}
                      </label>

                      <select
                        id="reporte-prioridad"
                        value={filtroPrioridad}
                        onChange={(event) =>
                          setFiltroPrioridad(
                            event.target.value
                          )
                        }
                      >
                        <option value="todos">
                          Todos
                        </option>

                        <option value="bajo">
                          Bajo
                        </option>

                        <option value="medio">
                          Medio
                        </option>

                        <option value="alto">
                          Alto
                        </option>

                        <option value="critico">
                          Crítico
                        </option>

                        <option value="critica">
                          Crítica
                        </option>
                      </select>
                    </div>
                  )}

                  <div className="reportes-filter-actions">
                    <button
                      type="button"
                      className="reportes-clear-button"
                      onClick={limpiarFiltros}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                GENERAL
            ================================================= */}

            {tipoReporte === "general" && (
              <section className="reportes-general-section">
                <div className="reportes-section-heading">
                  <div>
                    <span className="reportes-section-eyebrow">
                      RESUMEN EJECUTIVO
                    </span>

                    <h2>
                      Estado general de SGRICN
                    </h2>

                    <p>
                      Indicadores principales del sistema.
                    </p>
                  </div>
                </div>

                <div className="reportes-general-grid">
                  <ReporteStatCard
                    titulo="Catástrofes"
                    valor={
                      reportes.general
                        .totalCatastrofes
                    }
                    descripcion="Total registrado"
                    icono="🚨"
                    variante="danger"
                  />

                  <ReporteStatCard
                    titulo="Catástrofes activas"
                    valor={
                      reportes.general
                        .catastrofesActivas
                    }
                    descripcion="Emergencias activas"
                    icono="⚠️"
                    variante="warning"
                  />

                  <ReporteStatCard
                    titulo="Zonas afectadas"
                    valor={
                      reportes.general.totalZonas
                    }
                    descripcion="Zonas registradas"
                    icono="📍"
                    variante="primary"
                  />

                  <ReporteStatCard
                    titulo="Zonas críticas"
                    valor={
                      reportes.general.zonasCriticas
                    }
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
                    valor={
                      reportes.general
                        .totalNecesidades
                    }
                    descripcion="Necesidades registradas"
                    icono="📦"
                    variante="warning"
                  />

                  <ReporteStatCard
                    titulo="Necesidades críticas"
                    valor={
                      reportes.general
                        .necesidadesCriticas
                    }
                    descripcion="Prioridad crítica"
                    icono="🚨"
                    variante="danger"
                  />

                  <ReporteStatCard
                    titulo="Necesidades atendidas"
                    valor={
                      reportes.general
                        .necesidadesAtendidas
                    }
                    descripcion="Necesidades completadas"
                    icono="✅"
                    variante="success"
                  />

                  <ReporteStatCard
                    titulo="Donaciones aprobadas"
                    valor={
                      reportes.general
                        .totalDonaciones
                    }
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
                    valor={
                      reportes.general
                        .centrosAutorizados
                    }
                    descripcion="Centros activos"
                    icono="🏢"
                    variante="primary"
                  />
                </div>
              </section>
            )}

            {/* =================================================
                CATÁSTROFES
            ================================================= */}

            {tipoReporte === "catastrofes" && (
              <section className="reportes-section">
                <div className="reportes-section-header">
                  <div>
                    <span className="reportes-section-eyebrow">
                      INFORMACIÓN DE EMERGENCIAS
                    </span>

                    <h2>
                      Reporte de catástrofes
                    </h2>

                    <p>
                      Catástrofes registradas en el
                      sistema.
                    </p>
                  </div>

                  <span className="reportes-count">
                    {catastrofesFiltradas.length}
                  </span>
                </div>

                {catastrofesFiltradas.length === 0 ? (
                  <div className="reportes-empty">
                    <span>🔎</span>
                    <strong>
                      No se encontraron catástrofes
                    </strong>
                    <p>
                      Intenta cambiar los filtros de
                      búsqueda.
                    </p>
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
                        {catastrofesFiltradas.map(
                          (catastrofe) => (
                            <tr
                              key={
                                catastrofe._id
                              }
                            >
                              <td>
                                <strong>
                                  {
                                    catastrofe.titulo
                                  }
                                </strong>
                              </td>

                              <td>
                                {
                                  catastrofe.tipo
                                }
                              </td>

                              <td>
                                <span
                                  className={obtenerClaseEstado(
                                    catastrofe.estado
                                  )}
                                >
                                  {capitalizar(
                                    catastrofe.estado
                                  )}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={obtenerClasePrioridad(
                                    catastrofe.nivelEmergencia
                                  )}
                                >
                                  {capitalizar(
                                    catastrofe.nivelEmergencia
                                  )}
                                </span>
                              </td>

                              <td>
                                <div className="reportes-location">
                                  <strong>
                                    {
                                      catastrofe
                                        .municipio
                                    }
                                  </strong>

                                  <span>
                                    {
                                      catastrofe
                                        .departamento
                                    }
                                  </span>
                                </div>
                              </td>

                              <td>
                                {formatearNumero(
                                  catastrofe.zonas
                                )}
                              </td>

                              <td>
                                {formatearNumero(
                                  catastrofe.personasAfectadas
                                )}
                              </td>

                              <td>
                                {formatearNumero(
                                  catastrofe.necesidades
                                )}
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="reportes-detail-button"
                                  onClick={() =>
                                    abrirDetalle(
                                      catastrofe
                                    )
                                  }
                                >
                                  👁️ Ver
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* =================================================
                POBLACIÓN
            ================================================= */}

            {tipoReporte === "poblacion" && (
              <section className="reportes-section">
                <div className="reportes-section-header">
                  <div>
                    <span className="reportes-section-eyebrow">
                      IMPACTO HUMANO
                    </span>

                    <h2>
                      Reporte de población afectada
                    </h2>

                    <p>
                      Población afectada registrada
                      por zona.
                    </p>
                  </div>

                  <span className="reportes-count">
                    {zonasFiltradas.length}
                  </span>
                </div>

                {zonasFiltradas.length === 0 ? (
                  <div className="reportes-empty">
                    <span>🔎</span>
                    <strong>
                      No se encontraron registros
                    </strong>
                    <p>
                      Intenta cambiar los filtros de
                      búsqueda.
                    </p>
                  </div>
                ) : (
                  <div className="reportes-table-container">
                    <table className="reportes-table">
                      <thead>
                        <tr>
                          <th>Zona</th>
                          <th>Departamento</th>
                          <th>Municipio</th>
                          <th>Nivel</th>
                          <th>Estado</th>
                          <th>Personas</th>
                          <th>Familias</th>
                          <th>Acción</th>
                        </tr>
                      </thead>

                      <tbody>
                        {zonasFiltradas.map(
                          (zona) => (
                            <tr
                              key={zona._id}
                            >
                              <td>
                                <strong>
                                  {zona.nombre}
                                </strong>
                              </td>

                              <td>
                                {
                                  zona.departamento
                                }
                              </td>

                              <td>
                                {zona.municipio}
                              </td>

                              <td>
                                <span
                                  className={obtenerClasePrioridad(
                                    zona.nivelAfectacion
                                  )}
                                >
                                  {capitalizar(
                                    zona.nivelAfectacion
                                  )}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={obtenerClaseEstado(
                                    zona.estado
                                  )}
                                >
                                  {capitalizar(
                                    zona.estado
                                  )}
                                </span>
                              </td>

                              <td>
                                {formatearNumero(
                                  zona.personasAfectadas
                                )}
                              </td>

                              <td>
                                {formatearNumero(
                                  zona.familiasAfectadas
                                )}
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="reportes-detail-button"
                                  onClick={() =>
                                    abrirDetalle(
                                      zona
                                    )
                                  }
                                >
                                  👁️ Ver
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* =================================================
                NECESIDADES
            ================================================= */}

            {tipoReporte === "necesidades" && (
              <section className="reportes-section">
                <div className="reportes-section-header">
                  <div>
                    <span className="reportes-section-eyebrow">
                      ABASTECIMIENTO
                    </span>

                    <h2>
                      Reporte de necesidades
                    </h2>

                    <p>
                      Estado y nivel de atención de
                      las necesidades registradas.
                    </p>
                  </div>

                  <span className="reportes-count">
                    {
                      necesidadesFiltradas.length
                    }
                  </span>
                </div>

                {necesidadesFiltradas.length ===
                0 ? (
                  <div className="reportes-empty">
                    <span>📦</span>
                    <strong>
                      No se encontraron necesidades
                    </strong>
                    <p>
                      Intenta cambiar los filtros
                      de búsqueda.
                    </p>
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
                        {necesidadesFiltradas.map(
                          (necesidad) => (
                            <tr
                              key={
                                necesidad._id
                              }
                            >
                              <td>
                                <div className="reportes-primary-cell">
                                  <strong>
                                    {
                                      necesidad.nombre
                                    }
                                  </strong>

                                   <span>
                                      {necesidad.categoria}
                                    </span>
                                </div>
                              </td>

                              <td>
                                {
                                  necesidad.categoria
                                }
                              </td>

                              <td>
                                <span
                                  className={obtenerClasePrioridad(
                                    necesidad.prioridad
                                  )}
                                >
                                  {capitalizar(
                                    necesidad.prioridad
                                  )}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={obtenerClaseEstado(
                                    necesidad.estado
                                  )}
                                >
                                  {capitalizar(
                                    necesidad.estado
                                  )}
                                </span>
                              </td>

                              <td>
                                {formatearNumero(
                                  necesidad.cantidadNecesaria
                                )}
                              </td>

                              <td>
                                {formatearNumero(
                                  necesidad.cantidadRecibida
                                )}
                              </td>

                              <td>
                                <strong>
                                  {formatearNumero(
                                    necesidad.cantidadPendiente
                                  )}
                                </strong>
                              </td>

                              <td>
                                <div className="reportes-progress-cell">
                                  <div className="reportes-progress">
                                    <div
                                      className="reportes-progress-bar"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          Math.max(
                                            0,
                                            Number(
                                              necesidad.porcentajeAtendido ??
                                                0
                                            )
                                          )
                                        )}%`,
                                      }}
                                    />
                                  </div>

                                  <span>
                                    {Number(
                                      necesidad.porcentajeAtendido ??
                                        0
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="reportes-detail-button"
                                  onClick={() =>
                                    abrirDetalle(
                                      necesidad
                                    )
                                  }
                                >
                                  👁️ Ver
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* =================================================
                DONACIONES
            ================================================= */}

            {tipoReporte === "donaciones" && (
              <section className="reportes-section">
                <div className="reportes-section-header">
                  <div>
                    <span className="reportes-section-eyebrow">
                      RECURSOS
                    </span>

                    <h2>
                      Reporte de donaciones
                    </h2>

                    <p>
                      Donaciones registradas y su
                      estado de procesamiento.
                    </p>
                  </div>

                  <span className="reportes-count">
                    {
                      donacionesFiltradas.length
                    }
                  </span>
                </div>

                {donacionesFiltradas.length ===
                0 ? (
                  <div className="reportes-empty">
                    <span>💰</span>
                    <strong>
                      No se encontraron donaciones
                    </strong>
                    <p>
                      Intenta cambiar los filtros
                      de búsqueda.
                    </p>
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
                        {donacionesFiltradas.map(
                          (donacion) => (
                            <tr
                              key={
                                donacion._id
                              }
                            >
                              <td>
                                <strong>
                                  {
                                    donacion.referencia
                                  }
                                </strong>
                              </td>

                              <td>
                                <strong className="reportes-money">
                                  {formatearMoneda(
                                    donacion.monto
                                  )}
                                </strong>
                              </td>

                              <td>
                                {
                                  donacion.moneda
                                }
                              </td>

                              <td>
                                {
                                  donacion.metodoPago
                                }
                              </td>

                              <td>
                                <span
                                  className={obtenerClaseEstado(
                                    donacion.estado
                                  )}
                                >
                                  {capitalizar(
                                    donacion.estado
                                  )}
                                </span>
                              </td>

                              <td>
                                {new Date(
                                  donacion.fechaCreacion
                                ).toLocaleDateString(
                                  "es-CO"
                                )}
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="reportes-detail-button"
                                  onClick={() =>
                                    abrirDetalle(
                                      donacion
                                    )
                                  }
                                >
                                  👁️ Ver
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* ===================================================
            MODAL
        =================================================== */}

        <ReporteModal
          abierto={modalAbierto}
          reporte={reporteSeleccionado}
          tipoReporte={tipoReporte}
          onCerrar={cerrarModal}
        />
        <ReporteFilters
  tipoReporte={tipoReporte}
  busqueda={busqueda}
  onTipoReporteChange={setTipoReporte}
  onBusquedaChange={setBusqueda}
/>
      </div>
    </DashboardLayout>
  );
}

