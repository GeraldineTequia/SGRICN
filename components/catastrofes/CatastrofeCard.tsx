"use client";

import { Catastrofe } from "@/types/catastrofes";

interface CatastrofeCardProps {
  catastrofe: Catastrofe;
  onView?: (catastrofe: Catastrofe) => void;
  onEdit?: (catastrofe: Catastrofe) => void;
  onDelete?: (catastrofe: Catastrofe) => void;
  onChangeStatus?: (catastrofe: Catastrofe) => void;
}

export default function CatastrofeCard({
  catastrofe,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
}: CatastrofeCardProps) {
  const nivelClass: Record<
    Catastrofe["nivelEmergencia"],
    {
      background: string;
      color: string;
      label: string;
    }
  > = {
    bajo: {
      background: "#eaf7ef",
      color: "#146c43",
      label: "Bajo",
    },
    medio: {
      background: "#fff4cc",
      color: "#705500",
      label: "Medio",
    },
    alto: {
      background: "#fff0df",
      color: "#9a4d00",
      label: "Alto",
    },
    critico: {
      background: "#fdecec",
      color: "#a61b1b",
      label: "Crítico",
    },
  };

  const estadoLabel: Record<Catastrofe["estado"], string> = {
    activa: "Activa",
    controlada: "Controlada",
    finalizada: "Finalizada",
  };

  const nivel = nivelClass[catastrofe.nivelEmergencia];

  const fecha = new Date(catastrofe.fechaInicio).toLocaleDateString("es-CO", {
    dateStyle: "medium",
    timeZone: "America/Bogota",
  });

  const mostrarAcciones =
    Boolean(onEdit) || Boolean(onDelete) || Boolean(onChangeStatus);

  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #dfe4ea",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          height: "6px",
          background:
            catastrofe.nivelEmergencia === "critico"
              ? "#ce1126"
              : catastrofe.nivelEmergencia === "alto"
              ? "#f08a24"
              : catastrofe.nivelEmergencia === "medio"
              ? "#fcd116"
              : "#198754",
        }}
      />

      <div
        style={{
          padding: "20px",
        }}
      >
        {/* ENCABEZADO */}

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
                color: "#5f6b7a",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "5px",
              }}
            >
              {catastrofe._id}
            </div>

            <h3
              style={{
                margin: 0,
                color: "#00245f",
                fontSize: "18px",
                lineHeight: 1.3,
              }}
            >
              {catastrofe.titulo}
            </h3>
          </div>

          <span
            style={{
              padding: "5px 9px",
              borderRadius: "20px",
              background: nivel.background,
              color: nivel.color,
              fontSize: "11px",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {nivel.label}
          </span>
        </div>

        {/* DESCRIPCIÓN */}

        <p
          style={{
            color: "#5f6b7a",
            fontSize: "14px",
            lineHeight: 1.5,
            margin: "14px 0",
          }}
        >
          {catastrofe.descripcion}
        </p>

        {/* INFORMACIÓN */}

        <div
          style={{
            display: "grid",
            gap: "9px",
            fontSize: "13px",
          }}
        >
          <Info icono="🚨" etiqueta="Tipo" valor={catastrofe.tipo} />

          <Info
            icono="📍"
            etiqueta="Ubicación"
            valor={`${catastrofe.municipio}, ${catastrofe.departamento}`}
          />

          <Info icono="📅" etiqueta="Inicio" valor={fecha} />

          <Info
            icono="📌"
            etiqueta="Estado"
            valor={estadoLabel[catastrofe.estado]}
          />
        </div>

        {/* ACCIONES DE GESTIÓN */}

        {mostrarAcciones && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginTop: "18px",
              paddingTop: "16px",
              borderTop: "1px solid #dfe4ea",
            }}
          >
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(catastrofe)}
                style={buttonStyle("#003893")}
              >
                ✏️ Editar
              </button>
            )}

            {onChangeStatus && (
              <button
                type="button"
                onClick={() => onChangeStatus(catastrofe)}
                style={buttonStyle("#198754")}
              >
                🔄 Cambiar estado
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(catastrofe)}
                style={buttonStyle("#ce1126")}
              >
                🗑️ Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

interface InfoProps {
  icono: string;
  etiqueta: string;
  valor: string;
}

function Info({ icono, etiqueta, valor }: InfoProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
      }}
    >
      <span>{icono}</span>

      <span
        style={{
          color: "#5f6b7a",
          fontWeight: 600,
        }}
      >
        {etiqueta}:
      </span>

      <span
        style={{
          color: "#17202a",
        }}
      >
        {valor}
      </span>
    </div>
  );
}

function buttonStyle(background: string): React.CSSProperties {
  return {
    border: "none",
    borderRadius: "7px",
    padding: "8px 11px",
    background,
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  };
}
