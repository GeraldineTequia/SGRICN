"use client";

import { useEffect } from "react";
import jsPDF from "jspdf";

import {
  ReporteCatastrofe,
  ReporteDonacion,
  ReporteNecesidad,
  ReporteZona,
  TipoReporte,
} from "@/types/reportes";

interface ReporteModalProps {
  abierto: boolean;
  reporte:
    | ReporteCatastrofe
    | ReporteZona
    | ReporteNecesidad
    | ReporteDonacion
    | null;
  tipoReporte: TipoReporte;
  onCerrar: () => void;
}

function formatearNumero(numero: number) {
  return (Number(numero) || 0).toLocaleString("es-CO");
}

function formatearFecha(fecha: string) {
  if (!fecha) {
    return "Sin fecha";
  }

  const fechaFormateada = new Date(fecha);

  if (Number.isNaN(fechaFormateada.getTime())) {
    return "Sin fecha";
  }

  return fechaFormateada.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatearMonto(monto: number, moneda: string) {
  const montoSeguro = Number(monto) || 0;

  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: moneda || "COP",
      maximumFractionDigits: 0,
    }).format(montoSeguro);
  } catch {
    return `$ ${montoSeguro.toLocaleString("es-CO")}`;
  }
}

function obtenerEtiquetaEstado(estado: string) {
  const estados: Record<string, string> = {
    activa: "Activa",
    activo: "Activo",
    controlada: "Controlada",
    finalizada: "Finalizada",
    pendiente: "Pendiente",
    en_atencion: "En atención",
    atendida: "Atendida",
    urgente: "Urgente",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
    cancelada: "Cancelada",
    borrador: "Borrador",
    publicada: "Publicada",
    archivada: "Archivada",
  };

  return estados[estado] || estado || "Sin estado";
}

function obtenerEtiquetaPrioridad(prioridad: string) {
  const prioridades: Record<string, string> = {
    baja: "Baja",
    media: "Media",
    alta: "Alta",
    critica: "Crítica",
  };

  return prioridades[prioridad] || prioridad || "Sin prioridad";
}

function obtenerClaseEstado(estado: string) {
  const estadoNormalizado = (estado || "").toLowerCase();

  if (
    [
      "activa",
      "activo",
      "atendida",
      "aprobada",
      "controlada",
      "publicada",
    ].includes(estadoNormalizado)
  ) {
    return "reporte-modal-status reporte-modal-status-success";
  }

  if (
    ["urgente", "rechazada", "cancelada"].includes(estadoNormalizado)
  ) {
    return "reporte-modal-status reporte-modal-status-danger";
  }

  if (
    ["pendiente", "en_atencion", "borrador"].includes(
      estadoNormalizado
    )
  ) {
    return "reporte-modal-status reporte-modal-status-warning";
  }

  return "reporte-modal-status reporte-modal-status-neutral";
}

function obtenerClasePrioridad(prioridad: string) {
  const prioridadNormalizada = (prioridad || "").toLowerCase();

  if (prioridadNormalizada === "critica") {
    return "reporte-modal-status reporte-modal-status-danger";
  }

  if (prioridadNormalizada === "alta") {
    return "reporte-modal-status reporte-modal-status-warning";
  }

  if (prioridadNormalizada === "media") {
    return "reporte-modal-status reporte-modal-status-info";
  }

  return "reporte-modal-status reporte-modal-status-success";
}

function agregarCampoPDF(
  doc: jsPDF,
  etiqueta: string,
  valor: string,
  y: number
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`${etiqueta}:`, 18, y);

  doc.setFont("helvetica", "normal");
  doc.text(valor || "Sin información", 70, y);

  return y + 8;
}

function crearEncabezadoPDF(doc: jsPDF, titulo: string) {
  doc.setFillColor(0, 56, 147);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("SGRICN", 18, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Sistema de Gestión y Respuesta Integral ante Catástrofes Naturales",
    18,
    21
  );

  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(titulo, 18, 43);

  doc.setDrawColor(206, 17, 38);
  doc.setLineWidth(1.2);
  doc.line(18, 48, 192, 48);
}

export default function ReporteModal({
  abierto,
  reporte,
  tipoReporte,
  onCerrar,
}: ReporteModalProps) {
  useEffect(() => {
    if (!abierto) {
      return;
    }

    function manejarTecla(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCerrar();
      }
    }

    document.addEventListener("keydown", manejarTecla);

    return () => {
      document.removeEventListener("keydown", manejarTecla);
    };
  }, [abierto, onCerrar]);

  if (!abierto || !reporte) {
    return null;
  }

  function descargarPDF() {
    const doc = new jsPDF();

    let titulo = "Detalle del reporte";
    let nombreArchivo = "reporte-sgricn";

    if (tipoReporte === "catastrofes") {
      const catastrofe = reporte as ReporteCatastrofe;

      titulo = "Detalle de catástrofe";
      nombreArchivo = `catastrofe-${catastrofe._id}`;

      crearEncabezadoPDF(doc, titulo);

      let y = 60;

      y = agregarCampoPDF(doc, "ID", catastrofe._id, y);
      y = agregarCampoPDF(
        doc,
        "Título",
        catastrofe.titulo || "Sin título",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Tipo",
        catastrofe.tipo || "Sin tipo",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Estado",
        obtenerEtiquetaEstado(catastrofe.estado),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Nivel",
        catastrofe.nivelEmergencia || "Sin nivel",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Departamento",
        catastrofe.departamento || "Sin departamento",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Municipio",
        catastrofe.municipio || "Sin municipio",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Fecha de inicio",
        formatearFecha(catastrofe.fechaInicio),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Zonas afectadas",
        formatearNumero(catastrofe.zonas),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Personas afectadas",
        formatearNumero(catastrofe.personasAfectadas),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Necesidades",
        formatearNumero(catastrofe.necesidades),
        y
      );

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Documento generado por SGRICN · ${new Date().toLocaleDateString(
          "es-CO"
        )}`,
        18,
        285
      );
    }

    if (tipoReporte === "poblacion") {
      const zona = reporte as ReporteZona;

      titulo = "Detalle de población afectada";
      nombreArchivo = `poblacion-${zona._id}`;

      crearEncabezadoPDF(doc, titulo);

      let y = 60;

      y = agregarCampoPDF(doc, "ID", zona._id, y);
      y = agregarCampoPDF(
        doc,
        "Zona",
        zona.nombre || "Sin nombre",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Departamento",
        zona.departamento || "Sin departamento",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Municipio",
        zona.municipio || "Sin municipio",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Nivel de afectación",
        zona.nivelAfectacion || "Sin nivel",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Estado",
        obtenerEtiquetaEstado(zona.estado),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Catástrofe",
        zona.catastrofeId || "Sin catástrofe",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Personas afectadas",
        formatearNumero(zona.personasAfectadas),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Familias afectadas",
        formatearNumero(zona.familiasAfectadas),
        y
      );

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Documento generado por SGRICN · ${new Date().toLocaleDateString(
          "es-CO"
        )}`,
        18,
        285
      );
    }

    if (tipoReporte === "necesidades") {
      const necesidad = reporte as ReporteNecesidad;

      titulo = "Detalle de necesidad";
      nombreArchivo = `necesidad-${necesidad._id}`;

      crearEncabezadoPDF(doc, titulo);

      let y = 60;

      const porcentaje = Math.min(
        100,
        Math.max(0, Number(necesidad.porcentajeAtendido) || 0)
      );

      y = agregarCampoPDF(doc, "ID", necesidad._id, y);
      y = agregarCampoPDF(
        doc,
        "Necesidad",
        necesidad.nombre || "Sin nombre",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Categoría",
        necesidad.categoria || "Sin categoría",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Prioridad",
        obtenerEtiquetaPrioridad(necesidad.prioridad),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Estado",
        obtenerEtiquetaEstado(necesidad.estado),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Cantidad necesaria",
        formatearNumero(necesidad.cantidadNecesaria),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Cantidad recibida",
        formatearNumero(necesidad.cantidadRecibida),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Cantidad pendiente",
        formatearNumero(necesidad.cantidadPendiente),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Atención",
        `${porcentaje}%`,
        y
      );

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Documento generado por SGRICN · ${new Date().toLocaleDateString(
          "es-CO"
        )}`,
        18,
        285
      );
    }

    if (tipoReporte === "donaciones") {
      const donacion = reporte as ReporteDonacion;

      titulo = "Detalle de donación";
      nombreArchivo = `donacion-${donacion._id}`;

      crearEncabezadoPDF(doc, titulo);

      let y = 60;

      y = agregarCampoPDF(doc, "ID", donacion._id, y);
      y = agregarCampoPDF(
        doc,
        "Referencia",
        donacion.referencia || "Sin referencia",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Monto",
        formatearMonto(donacion.monto, donacion.moneda),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Moneda",
        donacion.moneda || "COP",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Método de pago",
        donacion.metodoPago || "Sin método",
        y
      );
      y = agregarCampoPDF(
        doc,
        "Estado",
        obtenerEtiquetaEstado(donacion.estado),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Fecha",
        formatearFecha(donacion.fechaCreacion),
        y
      );
      y = agregarCampoPDF(
        doc,
        "Catástrofe",
        donacion.catastrofeId || "Sin catástrofe",
        y
      );

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Documento generado por SGRICN · ${new Date().toLocaleDateString(
          "es-CO"
        )}`,
        18,
        285
      );
    }

    doc.save(`${nombreArchivo}.pdf`);
  }

  function renderizarContenido() {
    if (tipoReporte === "catastrofes") {
      const catastrofe = reporte as ReporteCatastrofe;

      return (
        <div className="reporte-modal-body">
          <div className="reporte-modal-summary">
            <div className="reporte-modal-summary-icon">
              🚨
            </div>

            <div>
              <span className="reporte-modal-summary-label">
                CATÁSTROFE REGISTRADA
              </span>

              <h3>
                {catastrofe.titulo || "Sin título"}
              </h3>

              <p>
                {catastrofe.tipo || "Tipo de catástrofe no especificado"}
              </p>
            </div>
          </div>

          <div className="reporte-modal-section">
            <div className="reporte-modal-section-title">
              <span>📋</span>
              Información general
            </div>

            <div className="reporte-modal-grid">
              <div className="reporte-modal-field">
                <span>ID del registro</span>
                <strong>{catastrofe._id}</strong>
              </div>

              <div className="reporte-modal-field">
                <span>Tipo</span>
                <strong>{catastrofe.tipo || "Sin tipo"}</strong>
              </div>

              <div className="reporte-modal-field">
                <span>Estado</span>
                <strong>
                  <span className={obtenerClaseEstado(catastrofe.estado)}>
                    {obtenerEtiquetaEstado(catastrofe.estado)}
                  </span>
                </strong>
              </div>

              <div className="reporte-modal-field">
                <span>Nivel de emergencia</span>
                <strong>
                  {catastrofe.nivelEmergencia || "Sin nivel"}
                </strong>
              </div>
            </div>
          </div>

          <div className="reporte-modal-section">
            <div className="reporte-modal-section-title">
              <span>📍</span>
              Ubicación y fecha
            </div>

            <div className="reporte-modal-grid">
              <div className="reporte-modal-field">
                <span>Departamento</span>
                <strong>
                  {catastrofe.departamento || "Sin departamento"}
                </strong>
              </div>

              <div className="reporte-modal-field">
                <span>Municipio</span>
                <strong>
                  {catastrofe.municipio || "Sin municipio"}
                </strong>
              </div>

              <div className="reporte-modal-field">
                <span>Fecha de inicio</span>
                <strong>
                  {formatearFecha(catastrofe.fechaInicio)}
                </strong>
              </div>
            </div>
          </div>

          <div className="reporte-modal-section">
            <div className="reporte-modal-section-title">
              <span>📊</span>
              Impacto registrado
            </div>

            <div className="reporte-modal-metrics">
              <div className="reporte-modal-metric">
                <span>🗺️</span>
                <strong>
                  {formatearNumero(catastrofe.zonas)}
                </strong>
                <small>Zonas afectadas</small>
              </div>

              <div className="reporte-modal-metric">
                <span>👥</span>
                <strong>
                  {formatearNumero(catastrofe.personasAfectadas)}
                </strong>
                <small>Personas afectadas</small>
              </div>

              <div className="reporte-modal-metric">
                <span>📦</span>
                <strong>
                  {formatearNumero(catastrofe.necesidades)}
                </strong>
                <small>Necesidades</small>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (tipoReporte === "poblacion") {
      const zona = reporte as ReporteZona;

      return (
        <div className="reporte-modal-body">
          <div className="reporte-modal-summary">
            <div className="reporte-modal-summary-icon">
              👥
            </div>

            <div>
              <span className="reporte-modal-summary-label">
                ZONA AFECTADA
              </span>

              <h3>{zona.nombre || "Sin nombre"}</h3>

              <p>
                {zona.municipio || "Sin municipio"},{" "}
                {zona.departamento || "Sin departamento"}
              </p>
            </div>
          </div>

          <div className="reporte-modal-section">
            <div className="reporte-modal-section-title">
              <span>📋</span>
              Información de la zona
            </div>

            <div className="reporte-modal-grid">
              <div className="reporte-modal-field">
                <span>ID del registro</span>
                <strong>{zona._id}</strong>
              </div>

              <div className="reporte-modal-field">
                <span>Catástrofe relacionada</span>
                <strong>{zona.catastrofeId || "Sin catástrofe"}</strong>
              </div>

              <div className="reporte-modal-field">
                <span>Departamento</span>
                <strong>
                  {zona.departamento || "Sin departamento"}
                </strong>
              </div>

              <div className="reporte-modal-field">
                <span>Municipio</span>
                <strong>
                  {zona.municipio || "Sin municipio"}
                </strong>
              </div>

              <div className="reporte-modal-field">
                <span>Nivel de afectación</span>
                <strong>{zona.nivelAfectacion || "Sin nivel"}</strong>
              </div>

              <div className="reporte-modal-field">
                <span>Estado</span>
                <strong>
                  <span className={obtenerClaseEstado(zona.estado)}>
                    {obtenerEtiquetaEstado(zona.estado)}
                  </span>
                </strong>
              </div>
            </div>
          </div>

          <div className="reporte-modal-section">
            <div className="reporte-modal-section-title">
              <span>👨‍👩‍👧‍👦</span>
              Población afectada
            </div>

            <div className="reporte-modal-metrics">
              <div className="reporte-modal-metric">
                <span>👤</span>
                <strong>
                  {formatearNumero(zona.personasAfectadas)}
                </strong>
                <small>Personas afectadas</small>
              </div>

              <div className="reporte-modal-metric">
                <span>🏠</span>
                <strong>
                  {formatearNumero(zona.familiasAfectadas)}
                </strong>
                <small>Familias afectadas</small>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (tipoReporte === "necesidades") {
      const necesidad = reporte as ReporteNecesidad;

      const porcentaje = Math.min(
        100,
        Math.max(0, Number(necesidad.porcentajeAtendido) || 0)
      );

      return (
        <div className="reporte-modal-body">
          <div className="reporte-modal-summary">
            <div className="reporte-modal-summary-icon">
              📦
            </div>

            <div>
              <span className="reporte-modal-summary-label">
                NECESIDAD REGISTRADA
              </span>

              <h3>{necesidad.nombre || "Sin nombre"}</h3>

              <p>
                {necesidad.categoria || "Sin categoría"}
              </p>
            </div>
          </div>

          <div className="reporte-modal-section">
            <div className="reporte-modal-section-title">
              <span>📋</span>
              Información de la necesidad
            </div>

            <div className="reporte-modal-grid">
              <div className="reporte-modal-field">
                <span>ID del registro</span>
                <strong>{necesidad._id}</strong>
              </div>

              <div className="reporte-modal-field">
                <span>Categoría</span>
                <strong>
                  {necesidad.categoria || "Sin categoría"}
                </strong>
              </div>

              <div className="reporte-modal-field">
                <span>Prioridad</span>
                <strong>
                  <span
                    className={obtenerClasePrioridad(
                      necesidad.prioridad
                    )}
                  >
                    {obtenerEtiquetaPrioridad(
                      necesidad.prioridad
                    )}
                  </span>
                </strong>
              </div>

              <div className="reporte-modal-field">
                <span>Estado</span>
                <strong>
                  <span className={obtenerClaseEstado(necesidad.estado)}>
                    {obtenerEtiquetaEstado(necesidad.estado)}
                  </span>
                </strong>
              </div>
            </div>
          </div>

          <div className="reporte-modal-section">
            <div className="reporte-modal-section-title">
              <span>📊</span>
              Cantidades
            </div>

            <div className="reporte-modal-metrics reporte-modal-metrics-four">
              <div className="reporte-modal-metric">
                <span>📋</span>
                <strong>
                  {formatearNumero(
                    necesidad.cantidadNecesaria
                  )}
                </strong>
                <small>Necesarias</small>
              </div>

              <div className="reporte-modal-metric">
                <span>✅</span>
                <strong>
                  {formatearNumero(
                    necesidad.cantidadRecibida
                  )}
                </strong>
                <small>Recibidas</small>
              </div>

              <div className="reporte-modal-metric">
                <span>⏳</span>
                <strong>
                  {formatearNumero(
                    necesidad.cantidadPendiente
                  )}
                </strong>
                <small>Pendientes</small>
              </div>

              <div className="reporte-modal-metric">
                <span>📈</span>
                <strong>{porcentaje}%</strong>
                <small>Atendido</small>
              </div>
            </div>
          </div>

          <div className="reporte-modal-section">
            <div className="reporte-modal-section-title">
              <span>📈</span>
              Progreso de atención
            </div>

            <div className="reporte-modal-progress">
              <div className="reporte-modal-progress-header">
                <span>Nivel de atención</span>
                <strong>{porcentaje}%</strong>
              </div>

              <div className="reporte-modal-progress-track">
                <div
                  className="reporte-modal-progress-bar"
                  style={{
                    width: `${porcentaje}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    const donacion = reporte as ReporteDonacion;

    return (
      <div className="reporte-modal-body">
        <div className="reporte-modal-summary">
          <div className="reporte-modal-summary-icon">
            💰
          </div>

          <div>
            <span className="reporte-modal-summary-label">
              DONACIÓN REGISTRADA
            </span>

            <h3>
              {formatearMonto(
                donacion.monto,
                donacion.moneda
              )}
            </h3>

            <p>
              {donacion.metodoPago || "Método de pago no especificado"}
            </p>
          </div>
        </div>

        <div className="reporte-modal-section">
          <div className="reporte-modal-section-title">
            <span>📋</span>
            Información de la donación
          </div>

          <div className="reporte-modal-grid">
            <div className="reporte-modal-field">
              <span>ID del registro</span>
              <strong>{donacion._id}</strong>
            </div>

            <div className="reporte-modal-field">
              <span>Referencia</span>
              <strong>
                {donacion.referencia || "Sin referencia"}
              </strong>
            </div>

            <div className="reporte-modal-field">
              <span>Monto</span>
              <strong>
                {formatearMonto(
                  donacion.monto,
                  donacion.moneda
                )}
              </strong>
            </div>

            <div className="reporte-modal-field">
              <span>Moneda</span>
              <strong>{donacion.moneda || "COP"}</strong>
            </div>

            <div className="reporte-modal-field">
              <span>Método de pago</span>
              <strong>
                {donacion.metodoPago || "Sin método"}
              </strong>
            </div>

            <div className="reporte-modal-field">
              <span>Estado</span>
              <strong>
                <span className={obtenerClaseEstado(donacion.estado)}>
                  {obtenerEtiquetaEstado(donacion.estado)}
                </span>
              </strong>
            </div>

            <div className="reporte-modal-field">
              <span>Fecha</span>
              <strong>
                {formatearFecha(donacion.fechaCreacion)}
              </strong>
            </div>

            <div className="reporte-modal-field">
              <span>Catástrofe relacionada</span>
              <strong>
                {donacion.catastrofeId || "Sin catástrofe"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const titulos: Record<string, string> = {
    catastrofes: "Detalle de catástrofe",
    poblacion: "Detalle de población afectada",
    necesidades: "Detalle de necesidad",
    donaciones: "Detalle de donación",
  };

  return (
    <div
      className="reporte-modal-overlay"
      onClick={onCerrar}
      role="presentation"
    >
      <div
        className="reporte-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reporte-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="reporte-modal-header">
          <div>
            <span className="reporte-modal-eyebrow">
              SGRICN · REPORTES
            </span>

            <h2 id="reporte-modal-title">
              {titulos[tipoReporte] || "Detalle del reporte"}
            </h2>
          </div>

          <button
            type="button"
            className="reporte-modal-close"
            onClick={onCerrar}
            aria-label="Cerrar detalle del reporte"
            title="Cerrar"
          >
            ×
          </button>
        </div>

        {renderizarContenido()}

        <div className="reporte-modal-footer">
          <button
            type="button"
            className="reporte-modal-button reporte-modal-button-secondary"
            onClick={onCerrar}
          >
            Cerrar
          </button>

          <button
            type="button"
            className="reporte-modal-button reporte-modal-button-pdf"
            onClick={descargarPDF}
          >
            📄 Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
