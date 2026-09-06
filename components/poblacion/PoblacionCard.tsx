"use client";

import { PoblacionAfectada } from "@/types/poblacion";

interface PoblacionCardProps {
  poblacion: PoblacionAfectada;
  catastrofeTitulo?: string;
  zonaNombre?: string;
  onEditar?: (poblacion: PoblacionAfectada) => void;
  onEliminar?: (id: string) => void;
}

function numero(valor: number | undefined | null) {
  return (valor ?? 0).toLocaleString("es-CO");
}

export default function PoblacionCard({
  poblacion,
  catastrofeTitulo,
  zonaNombre,
  onEditar,
  onEliminar,
}: PoblacionCardProps) {
  const mostrarAcciones = Boolean(onEditar) || Boolean(onEliminar);

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dfe4ea",
        borderRadius: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      {/* Encabezado */}
      <div
        style={{
          background: "#00245f",
          color: "#ffffff",
          padding: "18px",
          borderBottom: "4px solid #fcd116",
        }}
      >
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
                opacity: 0.8,
                marginBottom: "5px",
              }}
            >
              REGISTRO {poblacion._id}
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: "20px",
              }}
            >
              Población afectada
            </h3>
          </div>

          <div
            style={{
              background: "#fcd116",
              color: "#00245f",
              borderRadius: "20px",
              padding: "6px 12px",
              fontWeight: 700,
              fontSize: "12px",
            }}
          >
            {numero(poblacion.personasAfectadas)} personas
          </div>
        </div>
      </div>

      <div style={{ padding: "18px" }}>
        {/* Relaciones */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              background: "#f5f7fa",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#5f6b7a",
                fontWeight: 700,
                marginBottom: "4px",
              }}
            >
              CATÁSTROFE
            </div>

            <div
              style={{
                color: "#17202a",
                fontWeight: 600,
              }}
            >
              {catastrofeTitulo || poblacion.catastrofeId}
            </div>
          </div>

          <div
            style={{
              background: "#f5f7fa",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#5f6b7a",
                fontWeight: 700,
                marginBottom: "4px",
              }}
            >
              ZONA
            </div>

            <div
              style={{
                color: "#17202a",
                fontWeight: 600,
              }}
            >
              {zonaNombre || poblacion.zonaId}
            </div>
          </div>
        </div>

        {/* Afectaciones principales */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "10px",
            marginBottom: "18px",
          }}
        >
          <Dato titulo="Familias" valor={numero(poblacion.familiasAfectadas)} />

          <Dato titulo="Heridos" valor={numero(poblacion.heridos)} />

          <Dato titulo="Fallecidos" valor={numero(poblacion.fallecidos)} />

          <Dato
            titulo="Desaparecidos"
            valor={numero(poblacion.desaparecidos)}
          />
        </div>

        {/* Distribución poblacional */}
        <div
          style={{
            borderTop: "1px solid #dfe4ea",
            paddingTop: "16px",
            marginBottom: "18px",
          }}
        >
          <h4
            style={{
              margin: "0 0 12px",
              color: "#00245f",
              fontSize: "15px",
            }}
          >
            Distribución de la población
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "10px",
            }}
          >
            <Dato titulo="Niños" valor={numero(poblacion.niños)} />

            <Dato titulo="Adultos" valor={numero(poblacion.adultos)} />

            <Dato
              titulo="Adultos mayores"
              valor={numero(poblacion.adultosMayores)}
            />

            <Dato
              titulo="Discapacidad"
              valor={numero(poblacion.personasDiscapacidad)}
            />
          </div>
        </div>

        {/* Atención */}
        <div
          style={{
            borderTop: "1px solid #dfe4ea",
            paddingTop: "16px",
            marginBottom: mostrarAcciones ? "18px" : "0",
          }}
        >
          <h4
            style={{
              margin: "0 0 12px",
              color: "#00245f",
              fontSize: "15px",
            }}
          >
            Situación de atención
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "10px",
            }}
          >
            <Dato
              titulo="Evacuadas"
              valor={numero(poblacion.personasEvacuadas)}
            />

            <Dato
              titulo="Albergadas"
              valor={numero(poblacion.personasAlbergadas)}
            />

            <Dato
              titulo="Pendientes de atención"
              valor={numero(poblacion.personasPendientesAtencion)}
            />
          </div>
        </div>

        {/* Botones */}
        {mostrarAcciones && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {/* Editar */}
            {onEditar && (
              <button
                type="button"
                onClick={() => onEditar(poblacion)}
                style={{
                  flex: 1,
                  minWidth: "120px",
                  padding: "10px 14px",
                  border: "1px solid #003893",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#003893",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✏️ Editar
              </button>
            )}

            {/* Eliminar */}
            {onEliminar && (
              <button
                type="button"
                onClick={() => onEliminar(poblacion._id)}
                style={{
                  flex: 1,
                  minWidth: "120px",
                  padding: "10px 14px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#ce1126",
                  color: "#ffffff",
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

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div
      style={{
        border: "1px solid #dfe4ea",
        borderRadius: "8px",
        padding: "11px",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          color: "#5f6b7a",
          fontSize: "11px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        {titulo.toUpperCase()}
      </div>

      <div
        style={{
          color: "#17202a",
          fontSize: "17px",
          fontWeight: 700,
        }}
      >
        {valor}
      </div>
    </div>
  );
}
