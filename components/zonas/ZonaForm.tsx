"use client";

import { FormEvent, useEffect, useState } from "react";
import { ZonaAfectada } from "@/types/zonas";

interface CatastrofeOption {
  _id: string;
  titulo: string;
}

interface ZonaFormProps {
  zona?: ZonaAfectada | null;
  catastrofes: CatastrofeOption[];
  onGuardado: () => void;
  onCancelar: () => void;
}

interface FormularioZona {
  catastrofeId: string;
  nombre: string;
  descripcion: string;
  departamento: string;
  municipio: string;
  direccionReferencia: string;
  latitud: string;
  longitud: string;
  nivelAfectacion: "bajo" | "medio" | "alto" | "critico";
  estado: "activa" | "controlada" | "finalizada";
}

const formularioInicial: FormularioZona = {
  catastrofeId: "",
  nombre: "",
  descripcion: "",
  departamento: "",
  municipio: "",
  direccionReferencia: "",
  latitud: "",
  longitud: "",
  nivelAfectacion: "medio",
  estado: "activa",
};

export default function ZonaForm({
  zona,
  catastrofes,
  onGuardado,
  onCancelar,
}: ZonaFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioZona>(formularioInicial);

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  const modoEdicion = Boolean(zona);

  useEffect(() => {
    if (!zona) {
      setFormulario(formularioInicial);
      return;
    }

    const [longitud, latitud] = zona.ubicacion.coordinates;

    setFormulario({
      catastrofeId: zona.catastrofeId,
      nombre: zona.nombre,
      descripcion: zona.descripcion,
      departamento: zona.departamento,
      municipio: zona.municipio,
      direccionReferencia: zona.direccionReferencia,
      latitud: String(latitud),
      longitud: String(longitud),
      nivelAfectacion: zona.nivelAfectacion,
      estado: zona.estado,
    });
  }, [zona]);

  const actualizarCampo = (campo: keyof FormularioZona, valor: string) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    if (error) {
      setError("");
    }
  };

  const guardar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!formulario.catastrofeId) {
      setError("Debes seleccionar una catástrofe.");
      return;
    }

    if (!formulario.nombre.trim()) {
      setError("Debes ingresar el nombre de la zona.");
      return;
    }

    if (!formulario.descripcion.trim()) {
      setError("Debes ingresar la descripción.");
      return;
    }

    const latitud = Number(formulario.latitud);

    const longitud = Number(formulario.longitud);

    if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
      setError("Las coordenadas deben ser números válidos.");
      return;
    }

    if (latitud < -90 || latitud > 90) {
      setError("La latitud debe estar entre -90 y 90.");
      return;
    }

    if (longitud < -180 || longitud > 180) {
      setError("La longitud debe estar entre -180 y 180.");
      return;
    }

    setGuardando(true);

    try {
      const cuerpo = {
        catastrofeId: formulario.catastrofeId,
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim(),
        departamento: formulario.departamento.trim(),
        municipio: formulario.municipio.trim(),
        direccionReferencia: formulario.direccionReferencia.trim(),
        latitud,
        longitud,
        nivelAfectacion: formulario.nivelAfectacion,
        estado: formulario.estado,
      };

      const url = modoEdicion ? `/api/zonas/${zona?._id}` : "/api/zonas";

      const response = await fetch(url, {
        method: modoEdicion ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cuerpo),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo guardar la zona.");
      }

      onGuardado();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Ocurrió un error al guardar."
      );
    } finally {
      setGuardando(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #cfd6df",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#17202a",
    outline: "none",
  };

  const labelStyle = {
    display: "block" as const,
    marginBottom: "6px",
    color: "#17202a",
    fontSize: "13px",
    fontWeight: 700,
  };

  return (
    <form onSubmit={guardar}>
      {error && (
        <div
          style={{
            background: "#fde7e9",
            color: "#ce1126",
            border: "1px solid #f3b5bb",
            borderRadius: "8px",
            padding: "11px 13px",
            marginBottom: "18px",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Catástrofe */}
      <div
        style={{
          marginBottom: "16px",
        }}
      >
        <label style={labelStyle}>Catástrofe relacionada *</label>

        <select
          value={formulario.catastrofeId}
          onChange={(e) => actualizarCampo("catastrofeId", e.target.value)}
          style={inputStyle}
          required
        >
          <option value="">Selecciona una catástrofe</option>

          {catastrofes.map((catastrofe) => (
            <option key={catastrofe._id} value={catastrofe._id}>
              {catastrofe.titulo}
            </option>
          ))}
        </select>
      </div>

      {/* Nombre */}
      <div
        style={{
          marginBottom: "16px",
        }}
      >
        <label style={labelStyle}>Nombre de la zona *</label>

        <input
          type="text"
          value={formulario.nombre}
          onChange={(e) => actualizarCampo("nombre", e.target.value)}
          placeholder="Ej. Barrio La Esperanza"
          style={inputStyle}
          required
        />
      </div>

      {/* Descripción */}
      <div
        style={{
          marginBottom: "16px",
        }}
      >
        <label style={labelStyle}>Descripción *</label>

        <textarea
          value={formulario.descripcion}
          onChange={(e) => actualizarCampo("descripcion", e.target.value)}
          placeholder="Describe la afectación de la zona..."
          rows={4}
          style={{
            ...inputStyle,
            resize: "vertical",
          }}
          required
        />
      </div>

      {/* Departamento / Municipio */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "14px",
          marginBottom: "16px",
        }}
      >
        <div>
          <label style={labelStyle}>Departamento *</label>

          <input
            type="text"
            value={formulario.departamento}
            onChange={(e) => actualizarCampo("departamento", e.target.value)}
            placeholder="Ej. Antioquia"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Municipio *</label>

          <input
            type="text"
            value={formulario.municipio}
            onChange={(e) => actualizarCampo("municipio", e.target.value)}
            placeholder="Ej. Medellín"
            style={inputStyle}
            required
          />
        </div>
      </div>

      {/* Dirección */}
      <div
        style={{
          marginBottom: "16px",
        }}
      >
        <label style={labelStyle}>Dirección de referencia *</label>

        <input
          type="text"
          value={formulario.direccionReferencia}
          onChange={(e) =>
            actualizarCampo("direccionReferencia", e.target.value)
          }
          placeholder="Ej. Carrera 50 # 45-20"
          style={inputStyle}
          required
        />
      </div>

      {/* Coordenadas */}
      <div
        style={{
          background: "#f5f7fa",
          borderRadius: "10px",
          padding: "15px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            color: "#00245f",
            fontWeight: 700,
            fontSize: "14px",
            marginBottom: "12px",
          }}
        >
          📍 Ubicación geográfica
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "14px",
          }}
        >
          <div>
            <label style={labelStyle}>Latitud *</label>

            <input
              type="number"
              step="any"
              value={formulario.latitud}
              onChange={(e) => actualizarCampo("latitud", e.target.value)}
              placeholder="6.2442"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Longitud *</label>

            <input
              type="number"
              step="any"
              value={formulario.longitud}
              onChange={(e) => actualizarCampo("longitud", e.target.value)}
              placeholder="-75.5812"
              style={inputStyle}
              required
            />
          </div>
        </div>

        <p
          style={{
            margin: "10px 0 0",
            color: "#5f6b7a",
            fontSize: "12px",
          }}
        >
          Ejemplo Medellín: latitud 6.2442, longitud -75.5812.
        </p>
      </div>

      {/* Nivel / Estado */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "14px",
          marginBottom: "22px",
        }}
      >
        <div>
          <label style={labelStyle}>Nivel de afectación *</label>

          <select
            value={formulario.nivelAfectacion}
            onChange={(e) => actualizarCampo("nivelAfectacion", e.target.value)}
            style={inputStyle}
          >
            <option value="bajo">Bajo</option>

            <option value="medio">Medio</option>

            <option value="alto">Alto</option>

            <option value="critico">Crítico</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Estado *</label>

          <select
            value={formulario.estado}
            onChange={(e) => actualizarCampo("estado", e.target.value)}
            style={inputStyle}
          >
            <option value="activa">Activa</option>

            <option value="controlada">Controlada</option>

            <option value="finalizada">Finalizada</option>
          </select>
        </div>
      </div>

      {/* Botones */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
        }}
      >
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          style={{
            border: "1px solid #cfd6df",
            background: "#ffffff",
            color: "#17202a",
            padding: "10px 18px",
            borderRadius: "8px",
            fontWeight: 700,
          }}
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={guardando}
          style={{
            border: "none",
            background: "#003893",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: 700,
            opacity: guardando ? 0.7 : 1,
          }}
        >
          {guardando
            ? "Guardando..."
            : modoEdicion
            ? "Guardar cambios"
            : "Crear zona"}
        </button>
      </div>
    </form>
  );
}
