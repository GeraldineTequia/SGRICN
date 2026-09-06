"use client";

import { useState } from "react";
import { Catastrofe } from "@/types/catastrofes";

interface CatastrofeFormProps {
  catastrofe?: Catastrofe | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CatastrofeForm({
  catastrofe,
  onSuccess,
  onCancel,
}: CatastrofeFormProps) {
  const editando = Boolean(catastrofe);

  const [titulo, setTitulo] = useState(catastrofe?.titulo || "");

  const [tipo, setTipo] = useState(catastrofe?.tipo || "Inundación");

  const [descripcion, setDescripcion] = useState(catastrofe?.descripcion || "");

  const [fechaInicio, setFechaInicio] = useState(
    catastrofe?.fechaInicio
      ? new Date(catastrofe.fechaInicio).toISOString().slice(0, 16)
      : ""
  );

  const [estado, setEstado] = useState<Catastrofe["estado"]>(
    catastrofe?.estado || "activa"
  );

  const [nivelEmergencia, setNivelEmergencia] = useState<
    Catastrofe["nivelEmergencia"]
  >(catastrofe?.nivelEmergencia || "medio");

  const [departamento, setDepartamento] = useState(
    catastrofe?.departamento || "Antioquia"
  );

  const [municipio, setMunicipio] = useState(
    catastrofe?.municipio || "Medellín"
  );

  const [direccionReferencia, setDireccionReferencia] = useState(
    catastrofe?.direccionReferencia || ""
  );

  const [latitud, setLatitud] = useState(
    catastrofe ? String(catastrofe.ubicacion.coordinates[1]) : ""
  );

  const [longitud, setLongitud] = useState(
    catastrofe ? String(catastrofe.ubicacion.coordinates[0]) : ""
  );

  const [fuenteInformacion, setFuenteInformacion] = useState(
    catastrofe?.fuenteInformacion || "Sistema SGRICN"
  );

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  async function guardar(event: React.FormEvent) {
    event.preventDefault();

    setError("");

    if (
      !titulo.trim() ||
      !descripcion.trim() ||
      !fechaInicio ||
      !direccionReferencia.trim()
    ) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    const lat = Number(latitud);
    const lng = Number(longitud);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError("La latitud y longitud deben ser números.");
      return;
    }

    if (lat < -90 || lat > 90) {
      setError("La latitud debe estar entre -90 y 90.");
      return;
    }

    if (lng < -180 || lng > 180) {
      setError("La longitud debe estar entre -180 y 180.");
      return;
    }

    setGuardando(true);

    try {
      const payload = {
        titulo,
        tipo,
        descripcion,
        fechaInicio,
        estado,
        nivelEmergencia,
        departamento,
        municipio,
        direccionReferencia,
        ubicacion: {
          type: "Point",
          coordinates: [lng, lat],
        },
        fuenteInformacion,
      };

      const response = await fetch(
        editando ? `/api/catastrofes/${catastrofe?._id}` : "/api/catastrofes",
        {
          method: editando ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo guardar la catástrofe.");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form
      onSubmit={guardar}
      style={{
        display: "grid",
        gap: "18px",
      }}
    >
      {error && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "8px",
            background: "#fdecec",
            border: "1px solid #f2b8b8",
            color: "#a61b1b",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        <Campo
          label="Título *"
          value={titulo}
          onChange={setTitulo}
          placeholder="Ej. Inundaciones en Medellín"
        />

        <div>
          <label style={labelStyle}>Tipo *</label>

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={inputStyle}
          >
            <option value="Inundación">Inundación</option>
            <option value="Deslizamiento">Deslizamiento</option>
            <option value="Incendio">Incendio</option>
            <option value="Terremoto">Terremoto</option>
            <option value="Sequía">Sequía</option>
            <option value="Tormenta">Tormenta</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Descripción *</label>

        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
          placeholder="Describe la situación de emergencia..."
          style={{
            ...inputStyle,
            resize: "vertical",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <div>
          <label style={labelStyle}>Fecha de inicio *</label>

          <input
            type="datetime-local"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Estado *</label>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as Catastrofe["estado"])}
            style={inputStyle}
          >
            <option value="activa">Activa</option>

            <option value="controlada">Controlada</option>

            <option value="finalizada">Finalizada</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Nivel de emergencia *</label>

          <select
            value={nivelEmergencia}
            onChange={(e) =>
              setNivelEmergencia(
                e.target.value as Catastrofe["nivelEmergencia"]
              )
            }
            style={inputStyle}
          >
            <option value="bajo">Bajo</option>

            <option value="medio">Medio</option>

            <option value="alto">Alto</option>

            <option value="critico">Crítico</option>
          </select>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <Campo
          label="Departamento *"
          value={departamento}
          onChange={setDepartamento}
        />

        <Campo label="Municipio *" value={municipio} onChange={setMunicipio} />

        <Campo
          label="Dirección / referencia *"
          value={direccionReferencia}
          onChange={setDireccionReferencia}
        />
      </div>

      <div
        style={{
          padding: "18px",
          borderRadius: "10px",
          background: "#f5f7fa",
          border: "1px solid #dfe4ea",
        }}
      >
        <h3
          style={{
            margin: "0 0 15px",
            color: "#00245f",
            fontSize: "16px",
          }}
        >
          📍 Ubicación geográfica
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <Campo
            label="Latitud *"
            value={latitud}
            onChange={setLatitud}
            placeholder="6.2442"
          />

          <Campo
            label="Longitud *"
            value={longitud}
            onChange={setLongitud}
            placeholder="-75.5812"
          />
        </div>

        <p
          style={{
            margin: "10px 0 0",
            color: "#5f6b7a",
            fontSize: "12px",
          }}
        >
          Recuerda: MongoDB almacena las coordenadas como [longitud, latitud].
        </p>
      </div>

      <Campo
        label="Fuente de información *"
        value={fuenteInformacion}
        onChange={setFuenteInformacion}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          paddingTop: "8px",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={guardando}
          style={secondaryButtonStyle}
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={guardando}
          style={{
            ...primaryButtonStyle,
            opacity: guardando ? 0.7 : 1,
          }}
        >
          {guardando
            ? "Guardando..."
            : editando
            ? "Guardar cambios"
            : "Crear catástrofe"}
        </button>
      </div>
    </form>
  );
}

interface CampoProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function Campo({ label, value, onChange, placeholder }: CampoProps) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "7px",
  color: "#17202a",
  fontWeight: 600,
  fontSize: "14px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  border: "1px solid #cfd6df",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#17202a",
  outline: "none",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "8px",
  padding: "11px 18px",
  background: "#003893",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid #cfd6df",
  borderRadius: "8px",
  padding: "11px 18px",
  background: "#ffffff",
  color: "#17202a",
  fontWeight: 600,
  cursor: "pointer",
};
