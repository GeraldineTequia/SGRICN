"use client";

import { ZonaAfectada } from "@/types/zonas";

interface ZonaCardProps {
  zona: ZonaAfectada;
  nombreCatastrofe?: string;
  onEditar?: (zona: ZonaAfectada) => void;
  onEliminar?: (id: string) => void;
  onCambiarEstado?: (zona: ZonaAfectada) => void;
}

function obtenerColorNivel(nivel: string) {
  switch (nivel) {
    case "critico":
      return {
        background: "#fde7e9",
        color: "#ce1126",
      };

    case "alto":
      return {
        background: "#fff0d9",
        color: "#b45309",
      };

    case "medio":
      return {
        background: "#fff8d6",
        color: "#8a6d00",
      };

    default:
      return {
        background: "#e8f5e9",
        color: "#198754",
      };
  }
}

function obtenerColorEstado(estado: string) {
  switch (estado) {
    case "activa":
      return {
        background: "#e8f5e9",
        color: "#198754",
      };

    case "controlada":
      return {
        background: "#fff8d6",
        color: "#8a6d00",
      };

    default:
      return {
        background: "#eef1f5",
        color: "#5f6b7a",
      };
  }
}

function capitalizar(texto: string) {
  if (!texto) return "";

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function ZonaCard({
  zona,
  nombreCatastrofe,
  onEditar,
  onEliminar,
  onCambiarEstado,
}: ZonaCardProps) {
  const nivelColor = obtenerColorNivel(zona.nivelAfectacion);

  const estadoColor = obtenerColorEstado(zona.estado);

  const [longitud, latitud] = zona.ubicacion.coordinates;

  const mostrarAcciones =
    Boolean(onEditar) || Boolean(onEliminar) || Boolean(onCambiarEstado);

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dfe4ea",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Encabezado */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "#5f6b7a",
              marginBottom: "5px",
              fontWeight: 600,
            }}
          >
            ID: {zona._id}
          </div>

          <h3
            style={{
              margin: 0,
              color: "#00245f",
              fontSize: "19px",
            }}
          >
            {zona.nombre}
          </h3>
        </div>

        <span
          style={{
            background: estadoColor.background,
            color: estadoColor.color,
            padding: "6px 10px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {capitalizar(zona.estado)}
        </span>
      </div>

      {/* Catástrofe relacionada */}
      <div
        style={{
          background: "#f5f7fa",
          borderRadius: "8px",
          padding: "11px 13px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: "#5f6b7a",
            marginBottom: "3px",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Catástrofe relacionada
        </div>

        <div
          style={{
            color: "#17202a",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {nombreCatastrofe || zona.catastrofeId}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <p
          style={{
            margin: 0,
            color: "#5f6b7a",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          {zona.descripcion}
        </p>
      </div>

      {/* Ubicación */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "10px",
        }}
      >
        <div>
          <div
            style={{
              color: "#5f6b7a",
              fontSize: "12px",
              marginBottom: "3px",
            }}
          >
            Departamento
          </div>

          <strong
            style={{
              color: "#17202a",
              fontSize: "14px",
            }}
          >
            {zona.departamento}
          </strong>
        </div>

        <div>
          <div
            style={{
              color: "#5f6b7a",
              fontSize: "12px",
              marginBottom: "3px",
            }}
          >
            Municipio
          </div>

          <strong
            style={{
              color: "#17202a",
              fontSize: "14px",
            }}
          >
            {zona.municipio}
          </strong>
        </div>
      </div>

      {/* Dirección */}
      <div>
        <div
          style={{
            color: "#5f6b7a",
            fontSize: "12px",
            marginBottom: "3px",
          }}
        >
          Dirección de referencia
        </div>

        <div
          style={{
            color: "#17202a",
            fontSize: "14px",
          }}
        >
          {zona.direccionReferencia}
        </div>
      </div>

      {/* Nivel */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "4px",
        }}
      >
        <span
          style={{
            color: "#5f6b7a",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          Nivel de afectación
        </span>

        <span
          style={{
            background: nivelColor.background,
            color: nivelColor.color,
            padding: "6px 11px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {capitalizar(zona.nivelAfectacion)}
        </span>
      </div>

      {/* Coordenadas */}
      <div
        style={{
          borderTop: "1px solid #eef1f5",
          paddingTop: "12px",
          color: "#5f6b7a",
          fontSize: "12px",
        }}
      >
        Coordenadas: {latitud.toFixed(6)}, {longitud.toFixed(6)}
      </div>

      {/* Acciones */}
      {mostrarAcciones && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            borderTop: "1px solid #eef1f5",
            paddingTop: "14px",
          }}
        >
          {/* Editar */}
          {onEditar && (
            <button
              type="button"
              onClick={() => onEditar(zona)}
              style={{
                border: "none",
                background: "#003893",
                color: "#ffffff",
                padding: "9px 13px",
                borderRadius: "7px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ✏️ Editar
            </button>
          )}

          {/* Cambiar estado */}
          {onCambiarEstado && (
            <button
              type="button"
              onClick={() => onCambiarEstado(zona)}
              style={{
                border: "1px solid #cfd6df",
                background: "#ffffff",
                color: "#17202a",
                padding: "9px 13px",
                borderRadius: "7px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🔄 Cambiar estado
            </button>
          )}

          {/* Eliminar */}
          {onEliminar && (
            <button
              type="button"
              onClick={() => onEliminar(zona._id)}
              style={{
                border: "none",
                background: "#ce1126",
                color: "#ffffff",
                padding: "9px 13px",
                borderRadius: "7px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🗑️ Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
