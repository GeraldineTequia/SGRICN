"use client";

import React from "react";

import { CentroDonacion } from "@/types/centros";

interface CentroCardProps {
  centro: CentroDonacion;

  onEditar?: (centro: CentroDonacion) => void;

  onEliminar?: (id: string) => void;
}

export default function CentroCard({
  centro,
  onEditar,
  onEliminar,
}: CentroCardProps) {
  const mostrarAcciones = Boolean(onEditar) || Boolean(onEliminar);

  const manejarEliminar = () => {
    if (!onEliminar) {
      return;
    }

    const confirmar = window.confirm(
      `¿Está seguro de eliminar el centro "${centro.nombre}"?`
    );

    if (confirmar) {
      onEliminar(centro._id);
    }
  };

  const obtenerColorEstado = () => {
    return centro.estado === "activo" ? "#198754" : "#ce1126";
  };

  const obtenerTextoEstado = () => {
    return centro.estado === "activo" ? "Activo" : "Inactivo";
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dfe4ea",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.06)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Encabezado */}
      <div
        style={{
          padding: "18px 20px",
          background: "linear-gradient(135deg, #003893, #00245f)",
          borderBottom: "4px solid #fcd116",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "15px",
          }}
        >
          <div
            style={{
              flex: 1,
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "4px 9px",
                marginBottom: "8px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              ID: {centro._id}
            </div>

            <h3
              style={{
                margin: 0,
                color: "#ffffff",
                fontSize: "19px",
                lineHeight: 1.3,
              }}
            >
              🏢 {centro.nombre}
            </h3>
          </div>

          {/* Estado */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              borderRadius: "20px",
              background: "rgba(255, 255, 255, 0.95)",
              color: obtenerColorEstado(),
              fontSize: "12px",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: obtenerColorEstado(),
              }}
            />

            {obtenerTextoEstado()}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div
        style={{
          padding: "20px",
        }}
      >
        {/* Ubicación */}
        <div
          style={{
            marginBottom: "18px",
          }}
        >
          <h4
            style={{
              margin: "0 0 8px",
              color: "#00245f",
              fontSize: "14px",
            }}
          >
            📍 Ubicación
          </h4>

          <p
            style={{
              margin: "0 0 4px",
              color: "#17202a",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {centro.direccion}
          </p>

          <p
            style={{
              margin: 0,
              color: "#5f6b7a",
              fontSize: "13px",
            }}
          >
            {centro.municipio}, {centro.departamento}
          </p>
        </div>

        {/* Contacto */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              padding: "12px",
              background: "#f5f7fa",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                color: "#5f6b7a",
                fontSize: "11px",
                fontWeight: 700,
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              Teléfono
            </div>

            <div
              style={{
                color: "#17202a",
                fontSize: "13px",
              }}
            >
              ☎️ {centro.telefono}
            </div>
          </div>

          <div
            style={{
              padding: "12px",
              background: "#f5f7fa",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                color: "#5f6b7a",
                fontSize: "11px",
                fontWeight: 700,
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              Horario
            </div>

            <div
              style={{
                color: "#17202a",
                fontSize: "13px",
              }}
            >
              🕐 {centro.horario}
            </div>
          </div>
        </div>

        {/* Correo */}
        <div
          style={{
            marginBottom: "18px",
          }}
        >
          <h4
            style={{
              margin: "0 0 7px",
              color: "#00245f",
              fontSize: "14px",
            }}
          >
            ✉️ Correo electrónico
          </h4>

          <p
            style={{
              margin: 0,
              color: "#003893",
              fontSize: "13px",
              wordBreak: "break-word",
            }}
          >
            {centro.correo}
          </p>
        </div>

        {/* Responsable */}
        <div
          style={{
            marginBottom: "18px",
          }}
        >
          <h4
            style={{
              margin: "0 0 7px",
              color: "#00245f",
              fontSize: "14px",
            }}
          >
            👤 Responsable
          </h4>

          <p
            style={{
              margin: 0,
              color: "#17202a",
              fontSize: "13px",
            }}
          >
            {centro.responsable}
          </p>
        </div>

        {/* Tipos de donación */}
        <div
          style={{
            marginBottom: "18px",
          }}
        >
          <h4
            style={{
              margin: "0 0 9px",
              color: "#00245f",
              fontSize: "14px",
            }}
          >
            📦 Donaciones recibidas
          </h4>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "7px",
            }}
          >
            {centro.tipoDonacion.map((tipo, index) => (
              <span
                key={`${tipo}-${index}`}
                style={{
                  padding: "5px 9px",
                  borderRadius: "7px",
                  background: "#fff8d6",
                  border: "1px solid #fcd116",
                  color: "#00245f",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {tipo}
              </span>
            ))}
          </div>
        </div>

        {/* Autorización */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            padding: "12px",
            marginBottom: "18px",
            borderRadius: "10px",
            background: centro.autorizado ? "#eaf7ef" : "#fdecec",
            border: `1px solid ${centro.autorizado ? "#b7dfc5" : "#f1b5b5"}`,
          }}
        >
          <span
            style={{
              color: "#17202a",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Autorización
          </span>

          <span
            style={{
              color: centro.autorizado ? "#198754" : "#ce1126",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {centro.autorizado ? "✓ Autorizado" : "✕ No autorizado"}
          </span>
        </div>

        {/* Coordenadas */}
        <div
          style={{
            padding: "10px 12px",
            marginBottom: mostrarAcciones ? "18px" : "0",
            background: "#f5f7fa",
            borderRadius: "8px",
            color: "#5f6b7a",
            fontSize: "11px",
          }}
        >
          <strong>Coordenadas:</strong>{" "}
          {centro.ubicacion?.coordinates?.[1] ?? 0},{" "}
          {centro.ubicacion?.coordinates?.[0] ?? 0}
        </div>

        {/* Acciones */}
        {mostrarAcciones && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              paddingTop: "5px",
              borderTop: "1px solid #dfe4ea",
            }}
          >
            {onEditar && (
              <button
                type="button"
                onClick={() => onEditar(centro)}
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: "9px",
                  padding: "11px 15px",
                  background: "#003893",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
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
                  flex: 1,
                  border: "1px solid #ce1126",
                  borderRadius: "9px",
                  padding: "11px 15px",
                  background: "#ffffff",
                  color: "#ce1126",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🗑️ Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
