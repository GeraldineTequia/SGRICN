import type { Catastrofe, NivelEmergencia } from "@/types/catastrofes";

interface EmergencyCardProps {
  catastrofe: Catastrofe;
}

const nivelStyles: Record<
  NivelEmergencia,
  {
    background: string;
    color: string;
    label: string;
  }
> = {
  bajo: {
    background: "#e8f5e9",
    color: "#198754",
    label: "Bajo",
  },

  medio: {
    background: "#fff3cd",
    color: "#856404",
    label: "Medio",
  },

  alto: {
    background: "#ffe5e5",
    color: "#ce1126",
    label: "Alto",
  },

  critico: {
    background: "#ce1126",
    color: "#ffffff",
    label: "Crítico",
  },
};

function normalizarNivel(
  nivel: NivelEmergencia | string | undefined | null
): NivelEmergencia {
  const valor = String(nivel ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (valor === "bajo") {
    return "bajo";
  }

  if (valor === "alto") {
    return "alto";
  }

  if (valor === "critico") {
    return "critico";
  }

  return "medio";
}

function formatearFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) {
    return "Fecha no disponible";
  }

  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return "Fecha no disponible";
  }

  return fechaConvertida.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatearCoordenadas(ubicacion: Catastrofe["ubicacion"]): string {
  if (
    !ubicacion ||
    ubicacion.type !== "Point" ||
    !Array.isArray(ubicacion.coordinates) ||
    ubicacion.coordinates.length !== 2
  ) {
    return "Ubicación no disponible";
  }

  /*
   * MongoDB GeoJSON utiliza:
   *
   * coordinates = [longitud, latitud]
   *
   * Para mostrar al usuario:
   *
   * latitud, longitud
   */
  const [longitud, latitud] = ubicacion.coordinates;

  if (
    typeof longitud !== "number" ||
    typeof latitud !== "number" ||
    !Number.isFinite(longitud) ||
    !Number.isFinite(latitud)
  ) {
    return "Ubicación no disponible";
  }

  return `${latitud.toFixed(6)}, ${longitud.toFixed(6)}`;
}

function formatearEstado(estado: Catastrofe["estado"]): string {
  switch (estado) {
    case "activa":
      return "Activa";

    case "controlada":
      return "Controlada";

    case "finalizada":
      return "Finalizada";

    default:
      return "No disponible";
  }
}

export default function EmergencyCard({ catastrofe }: EmergencyCardProps) {
  const nivel = normalizarNivel(catastrofe.nivelEmergencia);

  const estilo = nivelStyles[nivel];

  const coordenadas = formatearCoordenadas(catastrofe.ubicacion);

  return (
    <article
      className="card"
      aria-label={`Emergencia: ${catastrofe.titulo}`}
      style={{
        padding: "20px",
        borderLeft: `5px solid ${estilo.color}`,
      }}
    >
      {/* ENCABEZADO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "15px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#003893",
              fontSize: "18px",
              lineHeight: 1.3,
            }}
          >
            {catastrofe.titulo}
          </h3>

          <p
            style={{
              margin: "7px 0 0",
              color: "#6c757d",
              fontSize: "13px",
            }}
          >
            {catastrofe.tipo}
          </p>
        </div>

        <span
          aria-label={`Nivel de emergencia: ${estilo.label}`}
          style={{
            background: estilo.background,
            color: estilo.color,
            padding: "6px 10px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {estilo.label}
        </span>
      </div>

      {/* DESCRIPCIÓN */}
      <p
        style={{
          color: "#495057",
          lineHeight: 1.5,
          margin: "16px 0",
        }}
      >
        {catastrofe.descripcion || "Sin descripción disponible."}
      </p>

      {/* INFORMACIÓN PRINCIPAL */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
          marginTop: "15px",
        }}
      >
        {/* ESTADO */}
        <div
          style={{
            padding: "10px 12px",
            background: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "11px",
              color: "#6c757d",
              marginBottom: "4px",
            }}
          >
            Estado
          </span>

          <strong
            style={{
              color:
                catastrofe.estado === "activa"
                  ? "#ce1126"
                  : catastrofe.estado === "controlada"
                  ? "#856404"
                  : "#198754",
              fontSize: "13px",
            }}
          >
            {formatearEstado(catastrofe.estado)}
          </strong>
        </div>

        {/* FECHA DE INICIO */}
        <div
          style={{
            padding: "10px 12px",
            background: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "11px",
              color: "#6c757d",
              marginBottom: "4px",
            }}
          >
            Fecha de inicio
          </span>

          <strong
            style={{
              color: "#212529",
              fontSize: "13px",
            }}
          >
            {formatearFecha(catastrofe.fechaInicio)}
          </strong>
        </div>

        {/* DEPARTAMENTO */}
        <div
          style={{
            padding: "10px 12px",
            background: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "11px",
              color: "#6c757d",
              marginBottom: "4px",
            }}
          >
            Departamento
          </span>

          <strong
            style={{
              color: "#212529",
              fontSize: "13px",
            }}
          >
            {catastrofe.departamento || "No disponible"}
          </strong>
        </div>

        {/* MUNICIPIO */}
        <div
          style={{
            padding: "10px 12px",
            background: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "11px",
              color: "#6c757d",
              marginBottom: "4px",
            }}
          >
            Municipio
          </span>

          <strong
            style={{
              color: "#212529",
              fontSize: "13px",
            }}
          >
            {catastrofe.municipio || "No disponible"}
          </strong>
        </div>
      </div>

      {/* DIRECCIÓN */}
      {catastrofe.direccionReferencia && (
        <div
          style={{
            marginTop: "14px",
            padding: "12px",
            background: "#f8f9fa",
            borderRadius: "8px",
            color: "#495057",
            fontSize: "13px",
          }}
        >
          <strong
            style={{
              color: "#003893",
            }}
          >
            📍 Dirección de referencia:
          </strong>{" "}
          {catastrofe.direccionReferencia}
        </div>
      )}

      {/* COORDENADAS */}
      <div
        style={{
          marginTop: "10px",
          padding: "12px",
          borderTop: "1px solid #e9ecef",
          color: "#495057",
          fontSize: "12px",
        }}
      >
        <strong
          style={{
            color: "#003893",
          }}
        >
          🌐 Coordenadas:
        </strong>{" "}
        {coordenadas}
      </div>

      {/* FUENTE DE INFORMACIÓN */}
      {catastrofe.fuenteInformacion && (
        <div
          style={{
            marginTop: "8px",
            color: "#6c757d",
            fontSize: "11px",
          }}
        >
          Fuente: {catastrofe.fuenteInformacion}
        </div>
      )}
    </article>
  );
}
