"use client";

import { Donacion } from "@/types/donaciones";

interface DonacionCardProps {
  donacion: Donacion;
  nombreUsuario?: string;
  tituloCatastrofe?: string;
  onEditar?: (donacion: Donacion) => void;
  onEliminar?: (donacion: Donacion) => void;
}

const metodoPagoLabels: Record<string, string> = {
  PSE: "PSE",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia bancaria",
  efectivo: "Efectivo",
};

const estadoLabels: Record<string, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
};

function formatearMonto(monto: number, moneda: string) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(monto);
}

function formatearFecha(fecha: string) {
  if (!fecha) {
    return "Sin fecha";
  }

  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return "Fecha no válida";
  }

  return fechaConvertida.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function obtenerClaseEstado(estado: string) {
  switch (estado) {
    case "aprobada":
      return "donacion-estado donacion-estado-aprobada";

    case "pendiente":
      return "donacion-estado donacion-estado-pendiente";

    case "rechazada":
      return "donacion-estado donacion-estado-rechazada";

    case "cancelada":
      return "donacion-estado donacion-estado-cancelada";

    default:
      return "donacion-estado";
  }
}

export default function DonacionCard({
  donacion,
  nombreUsuario,
  tituloCatastrofe,
  onEditar,
  onEliminar,
}: DonacionCardProps) {
  const mostrarAcciones = Boolean(onEditar) || Boolean(onEliminar);

  function manejarEditar() {
    if (!onEditar) {
      return;
    }

    onEditar(donacion);
  }

  function manejarEliminar() {
    if (!onEliminar) {
      return;
    }

    onEliminar(donacion);
  }

  return (
    <article className="donacion-card">
      {/* ======================================
          CABECERA
      ======================================= */}

      <div className="donacion-card-header">
        <div>
          <span className="donacion-card-id">{donacion._id}</span>

          <h3 className="donacion-card-title">
            {formatearMonto(donacion.monto, donacion.moneda)}
          </h3>
        </div>

        <span className={obtenerClaseEstado(donacion.estado)}>
          {estadoLabels[donacion.estado] ?? donacion.estado}
        </span>
      </div>

      {/* ======================================
          INFORMACIÓN PRINCIPAL
      ======================================= */}

      <div className="donacion-card-body">
        <div className="donacion-info">
          <span className="donacion-info-label">👤 Usuario</span>

          <strong>{nombreUsuario ?? donacion.usuarioId}</strong>
        </div>

        <div className="donacion-info">
          <span className="donacion-info-label">🚨 Catástrofe</span>

          <strong>{tituloCatastrofe ?? donacion.catastrofeId}</strong>
        </div>

        <div className="donacion-info">
          <span className="donacion-info-label">💳 Método de pago</span>

          <strong>
            {metodoPagoLabels[donacion.metodoPago] ?? donacion.metodoPago}
          </strong>
        </div>

        <div className="donacion-info">
          <span className="donacion-info-label">🏦 Pasarela</span>

          <strong>{donacion.pasarela || "Sistema SGRICN"}</strong>
        </div>

        <div className="donacion-info">
          <span className="donacion-info-label">🔖 Referencia</span>

          <strong>{donacion.referencia || "Sin referencia"}</strong>
        </div>

        <div className="donacion-info">
          <span className="donacion-info-label">🔑 Transacción</span>

          <strong>{donacion.transaccionId || "Sin transacción"}</strong>
        </div>

        <div className="donacion-info">
          <span className="donacion-info-label">📅 Fecha</span>

          <strong>{formatearFecha(donacion.fechaCreacion)}</strong>
        </div>
      </div>

      {/* ======================================
          DESCRIPCIÓN
      ======================================= */}

      {donacion.descripcion && (
        <div className="donacion-descripcion">
          <span className="donacion-info-label">📝 Descripción</span>

          <p>{donacion.descripcion}</p>
        </div>
      )}

      {/* ======================================
          ACCIONES
      ======================================= */}

      {mostrarAcciones && (
        <div className="donacion-card-actions">
          {onEditar && (
            <button
              type="button"
              className="donacion-btn donacion-btn-editar"
              onClick={manejarEditar}
            >
              ✏️ Editar
            </button>
          )}

          {onEliminar && (
            <button
              type="button"
              className="donacion-btn donacion-btn-eliminar"
              onClick={manejarEliminar}
            >
              🗑️ Eliminar
            </button>
          )}
        </div>
      )}
    </article>
  );
}
