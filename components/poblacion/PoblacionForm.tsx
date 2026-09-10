"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PoblacionAfectada } from "@/types/poblacion";

interface Catastrofe {
  _id: string;
  titulo: string;
}

interface Zona {
  _id: string;
  nombre: string;
  catastrofeId: string;
}

interface PoblacionFormProps {
  poblacion?: PoblacionAfectada | null;
  catastrofes: Catastrofe[];
  zonas: Zona[];
  onGuardado: () => void;
  onCancelar: () => void;
}

interface Formulario {
  catastrofeId: string;
  zonaId: string;

  familiasAfectadas: string;
  personasAfectadas: string;

  personasHeridas: string;
  personasFallecidas: string;
  personasDesaparecidas: string;

  niños: string;
  adultos: string;
  adultosMayores: string;
  personasDiscapacidad: string;

  personasEvacuadas: string;
  personasAlbergadas: string;
  personasPendientesAtencion: string;
}

const formularioInicial: Formulario = {
  catastrofeId: "",
  zonaId: "",

  familiasAfectadas: "0",
  personasAfectadas: "0",

  personasHeridas: "0",
  personasFallecidas: "0",
  personasDesaparecidas: "0",

  niños: "0",
  adultos: "0",
  adultosMayores: "0",
  personasDiscapacidad: "0",

  personasEvacuadas: "0",
  personasAlbergadas: "0",
  personasPendientesAtencion: "0",
};

export default function PoblacionForm({
  poblacion,
  catastrofes,
  zonas,
  onGuardado,
  onCancelar,
}: PoblacionFormProps) {
  const [formulario, setFormulario] = useState<Formulario>(formularioInicial);

  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const editando = Boolean(poblacion);

  useEffect(() => {
    if (!poblacion) {
      setFormulario(formularioInicial);
      return;
    }

    setFormulario({
      catastrofeId: poblacion.catastrofeId,
      zonaId: poblacion.zonaId,

      familiasAfectadas: String(poblacion.familiasAfectadas ?? 0),
      personasAfectadas: String(poblacion.personasAfectadas ?? 0),

      personasHeridas: String(poblacion.personasHeridas ?? 0),
      personasFallecidas: String(poblacion.personasFallecidas ?? 0),
      personasDesaparecidas: String(poblacion.personasDesaparecidas ?? 0),

      niños: String(poblacion.niños ?? 0),
      adultos: String(poblacion.adultos ?? 0),
      adultosMayores: String(poblacion.adultosMayores ?? 0),
      personasDiscapacidad: String(poblacion.personasDiscapacidad ?? 0),

      personasEvacuadas: String(poblacion.personasEvacuadas ?? 0),
      personasAlbergadas: String(poblacion.personasAlbergadas ?? 0),
      personasPendientesAtencion: String(
        poblacion.personasPendientesAtencion ?? 0
      ),
    });
  }, [poblacion]);

  const zonasDisponibles = useMemo(() => {
    if (!formulario.catastrofeId) {
      return [];
    }

    return zonas.filter(
      (zona) => zona.catastrofeId === formulario.catastrofeId
    );
  }, [zonas, formulario.catastrofeId]);

  function cambiarCampo(campo: keyof Formulario, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    if (campo === "catastrofeId") {
      setFormulario((actual) => ({
        ...actual,
        catastrofeId: valor,
        zonaId: "",
      }));
    }

    setError("");
  }

  function convertirNumero(valor: string) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      return 0;
    }

    return Math.max(0, Math.floor(numero));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!formulario.catastrofeId) {
      setError("Selecciona una catástrofe.");
      return;
    }

    if (!formulario.zonaId) {
      setError("Selecciona una zona afectada.");
      return;
    }

    if (convertirNumero(formulario.personasAfectadas) < 0) {
      setError("La cantidad de personas afectadas no puede ser negativa.");
      return;
    }

    setGuardando(true);

    try {
      const body = {
        catastrofeId: formulario.catastrofeId,
        zonaId: formulario.zonaId,

        familiasAfectadas: convertirNumero(formulario.familiasAfectadas),
        personasAfectadas: convertirNumero(formulario.personasAfectadas),

        personasHeridas: convertirNumero(formulario.personasHeridas),
        personasFallecidas: convertirNumero(formulario.personasFallecidas),
        personasDesaparecidas: convertirNumero(formulario.personasDesaparecidas),

        niños: convertirNumero(formulario.niños),
        adultos: convertirNumero(formulario.adultos),
        adultosMayores: convertirNumero(formulario.adultosMayores),
        personasDiscapacidad: convertirNumero(formulario.personasDiscapacidad),

        personasEvacuadas: convertirNumero(formulario.personasEvacuadas),
        personasAlbergadas: convertirNumero(formulario.personasAlbergadas),
        personasPendientesAtencion: convertirNumero(
          formulario.personasPendientesAtencion
        ),
      };

      const url = editando
        ? `/api/poblacion/${poblacion?._id}`
        : "/api/poblacion";

      const method = editando ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo guardar el registro.");
      }

      onGuardado();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error al guardar."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar}>
      {error && (
        <div
          style={{
            background: "#fde8eb",
            border: "1px solid #ce1126",
            color: "#9b1020",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "18px",
            fontSize: "14px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Relaciones */}
      <Section titulo="Ubicación y relación">
        <div style={gridStyle}>
          <Field label="Catástrofe" required>
            <select
              value={formulario.catastrofeId}
              onChange={(e) => cambiarCampo("catastrofeId", e.target.value)}
              style={inputStyle}
            >
              <option value="">Seleccionar catástrofe</option>

              {catastrofes.map((catastrofe) => (
                <option key={catastrofe._id} value={catastrofe._id}>
                  {catastrofe.titulo}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Zona afectada" required>
            <select
              value={formulario.zonaId}
              onChange={(e) => cambiarCampo("zonaId", e.target.value)}
              disabled={!formulario.catastrofeId}
              style={{
                ...inputStyle,
                background: !formulario.catastrofeId ? "#f0f2f5" : "#ffffff",
              }}
            >
              <option value="">
                {!formulario.catastrofeId
                  ? "Primero selecciona una catástrofe"
                  : "Seleccionar zona"}
              </option>

              {zonasDisponibles.map((zona) => (
                <option key={zona._id} value={zona._id}>
                  {zona.nombre}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Totales */}
      <Section titulo="Población afectada">
        <div style={gridStyle}>
          <NumberField
            label="Familias afectadas"
            value={formulario.familiasAfectadas}
            onChange={(value) => cambiarCampo("familiasAfectadas", value)}
          />

          <NumberField
            label="Personas afectadas"
            value={formulario.personasAfectadas}
            onChange={(value) => cambiarCampo("personasAfectadas", value)}
          />

         <NumberField
            label="Heridos"
            value={formulario.personasHeridas}
            onChange={(value) => cambiarCampo("personasHeridas", value)}
          />
          
          <NumberField
            label="Fallecidos"
            value={formulario.personasFallecidas}
            onChange={(value) => cambiarCampo("personasFallecidas", value)}
          />
          
          <NumberField
            label="Desaparecidos"
            value={formulario.personasDesaparecidas}
            onChange={(value) => cambiarCampo("personasDesaparecidas", value)}
          />
        </div>
      </Section>

      {/* Distribución */}
      <Section titulo="Distribución de la población">
        <div style={gridStyle}>
          <NumberField
            label="Niños"
            value={formulario.niños}
            onChange={(value) => cambiarCampo("niños", value)}
          />

          <NumberField
            label="Adultos"
            value={formulario.adultos}
            onChange={(value) => cambiarCampo("adultos", value)}
          />

          <NumberField
            label="Adultos mayores"
            value={formulario.adultosMayores}
            onChange={(value) => cambiarCampo("adultosMayores", value)}
          />

          <NumberField
            label="Personas con discapacidad"
            value={formulario.personasDiscapacidad}
            onChange={(value) => cambiarCampo("personasDiscapacidad", value)}
          />
        </div>
      </Section>

      {/* Atención */}
      <Section titulo="Atención y evacuación">
        <div style={gridStyle}>
          <NumberField
            label="Personas evacuadas"
            value={formulario.personasEvacuadas}
            onChange={(value) => cambiarCampo("personasEvacuadas", value)}
          />

          <NumberField
            label="Personas albergadas"
            value={formulario.personasAlbergadas}
            onChange={(value) => cambiarCampo("personasAlbergadas", value)}
          />

          <NumberField
            label="Pendientes de atención"
            value={formulario.personasPendientesAtencion}
            onChange={(value) =>
              cambiarCampo("personasPendientesAtencion", value)
            }
          />
        </div>
      </Section>

      {/* Botones */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "24px",
          paddingTop: "18px",
          borderTop: "1px solid #dfe4ea",
        }}
      >
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          style={{
            padding: "11px 18px",
            border: "1px solid #cfd6df",
            borderRadius: "8px",
            background: "#ffffff",
            color: "#17202a",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={guardando}
          style={{
            padding: "11px 20px",
            border: "none",
            borderRadius: "8px",
            background: "#003893",
            color: "#ffffff",
            fontWeight: 700,
            cursor: "pointer",
            opacity: guardando ? 0.7 : 1,
          }}
        >
          {guardando
            ? "Guardando..."
            : editando
            ? "Guardar cambios"
            : "Crear registro"}
        </button>
      </div>
    </form>
  );
}

function Section({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginBottom: "22px",
      }}
    >
      <h3
        style={{
          margin: "0 0 13px",
          color: "#00245f",
          fontSize: "16px",
          borderLeft: "4px solid #fcd116",
          paddingLeft: "10px",
        }}
      >
        {titulo}
      </h3>

      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          color: "#17202a",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {label}
        {required && <span style={{ color: "#ce1126" }}> *</span>}
      </label>

      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </Field>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #cfd6df",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#17202a",
  outline: "none",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "14px",
};
