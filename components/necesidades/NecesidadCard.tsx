"use client";

import React from "react";
import { Necesidad } from "@/types/necesidades";

interface NecesidadCardProps {
  necesidad: Necesidad;
  nombreCatastrofe?: string;
  nombreZona?: string;
  onEditar?: (necesidad: Necesidad) => void;
  onEliminar?: (id: string) => void;
}

function numero(valor: number | undefined | null) {
  return (valor ?? 0).toLocaleString("es-CO");
}

function obtenerColorPrioridad(prioridad: Necesidad["prioridad"]) {
  switch (prioridad) {
    case "critica":
      return {
        background: "#ce1126",
        color: "#ffffff",
      };

    case "alta":
      return {
        background: "#f39c12",
        color: "#ffffff",
      };

    case "media":
      return {
        background: "#fcd116",
        color: "#17202a",
      };

    case "baja":
      return {
        background: "#198754",
        color: "#ffffff",
      };

    default:
      return {
        background: "#5f6b7a",
        color: "#ffffff",
      };
  }
}

function obtenerColorEstado(estado: Necesidad["estado"]) {
  switch (estado) {
    case "atendida":
      return {
        background: "#198754",
        color: "#ffffff",
      };

    case "en_atencion":
      return {
        background: "#f39c12",
        color: "#ffffff",
      };

    case "pendiente":
      return {
        background: "#ce1126",
        color: "#ffffff",
      };

    default:
      return {
        background: "#5f6b7a",
        color: "#ffffff",
      };
  }
}

function textoPrioridad(prioridad: Necesidad["prioridad"]) {
  switch (prioridad) {
    case "critica":
      return "Crítica";

    case "alta":
      return "Alta";

    case "media":
      return "Media";

    case "baja":
      return "Baja";

    default:
      return prioridad;
  }
}

function textoEstado(estado: Necesidad["estado"]) {
  switch (estado) {
    case "atendida":
      return "Atendida";

    case "en_atencion":
      return "En atención";

    case "pendiente":
      return "Pendiente";

    default:
      return estado;
  }
}

export default function NecesidadCard({
  necesidad,
  nombreCatastrofe,
  nombreZona,
  onEditar,
  onEliminar,
}: NecesidadCardProps) {
  const porcentaje = Math.min(
    Math.max(necesidad.porcentajeAtendido ?? 0, 0),
    100
  );

  const estiloPrioridad = obtenerColorPrioridad(necesidad.prioridad);

  const estiloEstado = obtenerColorEstado(necesidad.estado);

  const mostrarAcciones = Boolean(onEditar) || Boolean(onEliminar);

  const manejarEliminar = () => {
    if (!onEliminar) {
      return;
    }

    const confirmar = window.confirm(
      `¿Está seguro de eliminar la necesidad "${necesidad.nombre}"?`
    );

    if (confirmar) {
      onEliminar(necesidad._id);
    }
  };

  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #dfe4ea",
        borderRadius: "14px",
        padding: "22px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      }}
    >
      {/* ENCABEZADO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "#5f6b7a",
              marginBottom: "5px",
            }}
          >
            ID: {necesidad._id}
          </div>

          <h3
            style={{
              margin: 0,
              color: "#00245f",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            {necesidad.nombre}
          </h3>

          <div
            style={{
              marginTop: "7px",
              fontSize: "14px",
              color: "#5f6b7a",
            }}
          >
            Categoría: <strong>{necesidad.categoria}</strong>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "7px",
          }}
        >
          <span
            style={{
              ...estiloPrioridad,
              padding: "5px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {textoPrioridad(necesidad.prioridad)}
          </span>

          <span
            style={{
              ...estiloEstado,
              padding: "5px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {textoEstado(necesidad.estado)}
          </span>
        </div>
      </div>

      {/* UBICACIÓN */}
      <div
        style={{
          background: "#f5f7fa",
          borderRadius: "10px",
          padding: "14px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
        }}
      >
        <div>
          <span
            style={{
              display: "block",
              fontSize: "12px",
              color: "#5f6b7a",
              marginBottom: "3px",
            }}
          >
            Catástrofe
          </span>

          <strong
            style={{
              color: "#17202a",
              fontSize: "14px",
            }}
          >
            {nombreCatastrofe || necesidad.catastrofeId}
          </strong>
        </div>

        <div>
          <span
            style={{
              display: "block",
              fontSize: "12px",
              color: "#5f6b7a",
              marginBottom: "3px",
            }}
          >
            Zona afectada
          </span>

          <strong
            style={{
              color: "#17202a",
              fontSize: "14px",
            }}
          >
            {nombreZona || necesidad.zonaId}
          </strong>
        </div>

        <div>
          <span
            style={{
              display: "block",
              fontSize: "12px",
              color: "#5f6b7a",
              marginBottom: "3px",
            }}
          >
            Unidad
          </span>

          <strong
            style={{
              color: "#17202a",
              fontSize: "14px",
            }}
          >
            {necesidad.unidad}
          </strong>
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <div>
        <div
          style={{
            fontSize: "12px",
            color: "#5f6b7a",
            marginBottom: "5px",
          }}
        >
          Descripción
        </div>

        <p
          style={{
            margin: 0,
            color: "#17202a",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          {necesidad.descripcion}
        </p>
      </div>

      {/* CANTIDADES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
        }}
      >
        <div
          style={{
            border: "1px solid #dfe4ea",
            borderRadius: "10px",
            padding: "14px",
          }}
        >
          <span
            style={{
              display: "block",
              color: "#5f6b7a",
              fontSize: "12px",
              marginBottom: "5px",
            }}
          >
            Cantidad necesaria
          </span>

          <strong
            style={{
              color: "#00245f",
              fontSize: "20px",
            }}
          >
            {numero(necesidad.cantidadNecesaria)}
          </strong>
        </div>

        <div
          style={{
            border: "1px solid #dfe4ea",
            borderRadius: "10px",
            padding: "14px",
          }}
        >
          <span
            style={{
              display: "block",
              color: "#5f6b7a",
              fontSize: "12px",
              marginBottom: "5px",
            }}
          >
            Cantidad recibida
          </span>

          <strong
            style={{
              color: "#198754",
              fontSize: "20px",
            }}
          >
            {numero(necesidad.cantidadRecibida)}
          </strong>
        </div>

        <div
          style={{
            border: "1px solid #dfe4ea",
            borderRadius: "10px",
            padding: "14px",
          }}
        >
          <span
            style={{
              display: "block",
              color: "#5f6b7a",
              fontSize: "12px",
              marginBottom: "5px",
            }}
          >
            Cantidad pendiente
          </span>

          <strong
            style={{
              color: necesidad.cantidadPendiente > 0 ? "#ce1126" : "#198754",
              fontSize: "20px",
            }}
          >
            {numero(necesidad.cantidadPendiente)}
          </strong>
        </div>
      </div>

      {/* PROGRESO */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "#5f6b7a",
              fontWeight: 600,
            }}
          >
            Progreso de atención
          </span>

          <strong
            style={{
              color: "#00245f",
              fontSize: "15px",
            }}
          >
            {porcentaje}%
          </strong>
        </div>

        <div
          style={{
            width: "100%",
            height: "12px",
            background: "#e9ecef",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${porcentaje}%`,
              height: "100%",
              background:
                porcentaje >= 100
                  ? "#198754"
                  : porcentaje >= 50
                  ? "#fcd116"
                  : "#ce1126",
              borderRadius: "999px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* BOTONES */}
      {mostrarAcciones && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            paddingTop: "4px",
            borderTop: "1px solid #dfe4ea",
          }}
        >
          {onEditar && (
            <button
              type="button"
              onClick={() => onEditar(necesidad)}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                background: "#003893",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ✏️ Editar
            </button>
          )}

          {onEliminar && (
            <button
              type="button"
              onClick={manejarEliminar}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                background: "#ce1126",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🗑️ Eliminar
            </button>
          )}
        </div>
      )}
    </article>
  );
}
