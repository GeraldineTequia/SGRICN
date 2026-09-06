"use client";

import React from "react";

import {
  ReporteCatastrofe,
  ReporteDonacion,
  ReporteNecesidad,
  ReporteZona,
} from "@/types/reportes";

interface ReporteCardProps {
  tipo: "catastrofe" | "zona" | "necesidad" | "donacion";
  datos: ReporteCatastrofe | ReporteZona | ReporteNecesidad | ReporteDonacion;
  onVerDetalle?: () => void;
}

function formatearMonto(monto: number, moneda: string) {
  const montoSeguro = Number(monto) || 0;

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: moneda || "COP",
    maximumFractionDigits: 0,
  }).format(montoSeguro);
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

function obtenerEtiquetaEstado(estado: string) {
  const estados: Record<string, string> = {
    activa: "Activa",
    controlada: "Controlada",
    finalizada: "Finalizada",
    pendiente: "Pendiente",
    en_atencion: "En atención",
    atendida: "Atendida",
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
  if (estado === "activa" || estado === "aprobada" || estado === "atendida") {
    return "reporte-status reporte-status-success";
  }

  if (
    estado === "rechazada" ||
    estado === "cancelada" ||
    estado === "finalizada"
  ) {
    return "reporte-status reporte-status-danger";
  }

  if (
    estado === "pendiente" ||
    estado === "en_atencion" ||
    estado === "controlada"
  ) {
    return "reporte-status reporte-status-warning";
  }

  return "reporte-status";
}

function renderizarContenido(
  tipo: ReporteCardProps["tipo"],
  datos: ReporteCardProps["datos"]
) {
  if (tipo === "catastrofe") {
    const catastrofe = datos as ReporteCatastrofe;

    return (
      <>
        <div className="reporte-card-main">
          <h3>{catastrofe.titulo}</h3>

          <span className="reporte-card-type">
            {catastrofe.tipo || "Sin tipo"}
          </span>
        </div>

        <div className="reporte-card-grid">
          <div>
            <span>Ubicación</span>
            <strong>
              {catastrofe.municipio || "Sin municipio"},{" "}
              {catastrofe.departamento || "Sin departamento"}
            </strong>
          </div>

          <div>
            <span>Nivel</span>
            <strong>{catastrofe.nivelEmergencia || "Sin nivel"}</strong>
          </div>

          <div>
            <span>Zonas afectadas</span>
            <strong>{formatearNumero(catastrofe.zonas)}</strong>
          </div>

          <div>
            <span>Personas afectadas</span>
            <strong>{formatearNumero(catastrofe.personasAfectadas)}</strong>
          </div>

          <div>
            <span>Necesidades</span>
            <strong>{formatearNumero(catastrofe.necesidades)}</strong>
          </div>

          <div>
            <span>Fecha de inicio</span>
            <strong>{formatearFecha(catastrofe.fechaInicio)}</strong>
          </div>
        </div>
      </>
    );
  }

  if (tipo === "zona") {
    const zona = datos as ReporteZona;

    return (
      <>
        <div className="reporte-card-main">
          <h3>{zona.nombre}</h3>

          <span className="reporte-card-type">
            {zona.municipio || "Sin municipio"},{" "}
            {zona.departamento || "Sin departamento"}
          </span>
        </div>

        <div className="reporte-card-grid">
          <div>
            <span>Nivel de afectación</span>
            <strong>{zona.nivelAfectacion || "Sin nivel"}</strong>
          </div>

          <div>
            <span>Estado</span>
            <strong>{obtenerEtiquetaEstado(zona.estado)}</strong>
          </div>

          <div>
            <span>Personas afectadas</span>
            <strong>{formatearNumero(zona.personasAfectadas)}</strong>
          </div>

          <div>
            <span>Familias afectadas</span>
            <strong>{formatearNumero(zona.familiasAfectadas)}</strong>
          </div>
        </div>
      </>
    );
  }

  if (tipo === "necesidad") {
    const necesidad = datos as ReporteNecesidad;

    const porcentaje = Math.min(
      100,
      Math.max(0, Number(necesidad.porcentajeAtendido) || 0)
    );

    return (
      <>
        <div className="reporte-card-main">
          <h3>{necesidad.nombre}</h3>

          <span className="reporte-card-type">
            {necesidad.categoria || "Sin categoría"}
          </span>
        </div>

        <div className="reporte-card-grid">
          <div>
            <span>Prioridad</span>
            <strong>{obtenerEtiquetaPrioridad(necesidad.prioridad)}</strong>
          </div>

          <div>
            <span>Estado</span>
            <strong>{obtenerEtiquetaEstado(necesidad.estado)}</strong>
          </div>

          <div>
            <span>Cantidad necesaria</span>
            <strong>{formatearNumero(necesidad.cantidadNecesaria)}</strong>
          </div>

          <div>
            <span>Cantidad recibida</span>
            <strong>{formatearNumero(necesidad.cantidadRecibida)}</strong>
          </div>

          <div>
            <span>Cantidad pendiente</span>
            <strong>{formatearNumero(necesidad.cantidadPendiente)}</strong>
          </div>

          <div>
            <span>Atendido</span>
            <strong>{porcentaje}%</strong>
          </div>
        </div>

        <div className="reporte-progress">
          <div className="reporte-progress-header">
            <span>Progreso de atención</span>

            <strong>{porcentaje}%</strong>
          </div>

          <div className="reporte-progress-track">
            <div
              className="reporte-progress-bar"
              style={{
                width: `${porcentaje}%`,
              }}
            />
          </div>
        </div>
      </>
    );
  }

  const donacion = datos as ReporteDonacion;

  return (
    <>
      <div className="reporte-card-main">
        <h3>{donacion.referencia}</h3>

        <span className="reporte-card-type">
          {donacion.metodoPago || "Sin método"}
        </span>
      </div>

      <div className="reporte-card-grid">
        <div>
          <span>Monto</span>
          <strong>{formatearMonto(donacion.monto, donacion.moneda)}</strong>
        </div>

        <div>
          <span>Estado</span>
          <strong>{obtenerEtiquetaEstado(donacion.estado)}</strong>
        </div>

        <div>
          <span>Método de pago</span>
          <strong>{donacion.metodoPago || "Sin método"}</strong>
        </div>

        <div>
          <span>Fecha</span>
          <strong>{formatearFecha(donacion.fechaCreacion)}</strong>
        </div>
      </div>
    </>
  );
}

export default function ReporteCard({
  tipo,
  datos,
  onVerDetalle,
}: ReporteCardProps) {
  return (
    <article className="reporte-card">
      <div className="reporte-card-header">
        <div className="reporte-card-icon">
          {tipo === "catastrofe" && "🚨"}
          {tipo === "zona" && "📍"}
          {tipo === "necesidad" && "📦"}
          {tipo === "donacion" && "💰"}
        </div>

        <span className={obtenerClaseEstado(datos.estado)}>
          {obtenerEtiquetaEstado(datos.estado)}
        </span>
      </div>

      {renderizarContenido(tipo, datos)}

      {onVerDetalle && (
        <div className="reporte-card-footer">
          <button
            type="button"
            className="reporte-card-detail-button"
            onClick={onVerDetalle}
          >
            Ver detalle
          </button>
        </div>
      )}
    </article>
  );
}
