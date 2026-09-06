"use client";

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

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: moneda || "COP",
    maximumFractionDigits: 0,
  }).format(montoSeguro);
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

export default function ReporteModal({
  abierto,
  reporte,
  tipoReporte,
  onCerrar,
}: ReporteModalProps) {
  if (!abierto || !reporte) {
    return null;
  }

  function renderizarContenido() {
    if (tipoReporte === "catastrofes") {
      const catastrofe = reporte as ReporteCatastrofe;

      return (
        <div className="reporte-modal-content">
          <div className="reporte-modal-grid">
            <div>
              <span>Título</span>
              <strong>{catastrofe.titulo || "Sin título"}</strong>
            </div>

            <div>
              <span>Tipo</span>
              <strong>{catastrofe.tipo || "Sin tipo"}</strong>
            </div>

            <div>
              <span>Estado</span>
              <strong>{obtenerEtiquetaEstado(catastrofe.estado)}</strong>
            </div>

            <div>
              <span>Nivel de emergencia</span>
              <strong>{catastrofe.nivelEmergencia || "Sin nivel"}</strong>
            </div>

            <div>
              <span>Departamento</span>
              <strong>{catastrofe.departamento || "Sin departamento"}</strong>
            </div>

            <div>
              <span>Municipio</span>
              <strong>{catastrofe.municipio || "Sin municipio"}</strong>
            </div>

            <div>
              <span>Fecha de inicio</span>
              <strong>{formatearFecha(catastrofe.fechaInicio)}</strong>
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
          </div>
        </div>
      );
    }

    if (tipoReporte === "poblacion") {
      const zona = reporte as ReporteZona;

      return (
        <div className="reporte-modal-content">
          <div className="reporte-modal-grid">
            <div>
              <span>Zona</span>
              <strong>{zona.nombre || "Sin nombre"}</strong>
            </div>

            <div>
              <span>Departamento</span>
              <strong>{zona.departamento || "Sin departamento"}</strong>
            </div>

            <div>
              <span>Municipio</span>
              <strong>{zona.municipio || "Sin municipio"}</strong>
            </div>

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
        <div className="reporte-modal-content">
          <div className="reporte-modal-grid">
            <div>
              <span>Necesidad</span>
              <strong>{necesidad.nombre || "Sin nombre"}</strong>
            </div>

            <div>
              <span>Categoría</span>
              <strong>{necesidad.categoria || "Sin categoría"}</strong>
            </div>

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
              <span>Porcentaje atendido</span>
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
        </div>
      );
    }

    const donacion = reporte as ReporteDonacion;

    return (
      <div className="reporte-modal-content">
        <div className="reporte-modal-grid">
          <div>
            <span>Referencia</span>
            <strong>{donacion.referencia || "Sin referencia"}</strong>
          </div>

          <div>
            <span>Monto</span>
            <strong>{formatearMonto(donacion.monto, donacion.moneda)}</strong>
          </div>

          <div>
            <span>Moneda</span>
            <strong>{donacion.moneda || "COP"}</strong>
          </div>

          <div>
            <span>Método de pago</span>
            <strong>{donacion.metodoPago || "Sin método"}</strong>
          </div>

          <div>
            <span>Estado</span>
            <strong>{obtenerEtiquetaEstado(donacion.estado)}</strong>
          </div>

          <div>
            <span>Fecha</span>
            <strong>{formatearFecha(donacion.fechaCreacion)}</strong>
          </div>

          <div>
            <span>Catástrofe</span>
            <strong>{donacion.catastrofeId || "Sin catástrofe"}</strong>
          </div>
        </div>
      </div>
    );
  }

  const titulos: Record<string, string> = {
    catastrofes: "Detalle de catástrofe",
    poblacion: "Detalle de población",
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
            <span className="reporte-modal-eyebrow">DETALLE DEL REPORTE</span>

            <h2 id="reporte-modal-title">
              {titulos[tipoReporte] || "Detalle del reporte"}
            </h2>
          </div>

          <button
            type="button"
            className="reporte-modal-close"
            onClick={onCerrar}
            aria-label="Cerrar detalle del reporte"
          >
            ×
          </button>
        </div>

        {renderizarContenido()}

        <div className="reporte-modal-footer">
          <button
            type="button"
            className="reporte-modal-button"
            onClick={onCerrar}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
