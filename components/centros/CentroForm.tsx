"use client";

import React, { useEffect, useState } from "react";

import { CentroDonacion, EstadoCentro } from "@/types/centros";

interface CentroFormProps {
  centro?: CentroDonacion | null;

  onGuardado: (centro: CentroDonacion) => void;

  onCancelar: () => void;
}

interface FormularioCentro {
  nombre: string;
  direccion: string;
  departamento: string;
  municipio: string;
  telefono: string;
  correo: string;
  horario: string;
  responsable: string;
  longitud: string;
  latitud: string;
  tipoDonacion: string[];
  estado: EstadoCentro;
  autorizado: boolean;
}

const TIPOS_DONACION = [
  "Alimentos",
  "Agua",
  "Medicamentos",
  "Higiene",
  "Ropa",
  "Vivienda",
  "Transporte",
  "Servicios básicos",
  "Otro",
];

const FORMULARIO_INICIAL: FormularioCentro = {
  nombre: "",
  direccion: "",
  departamento: "",
  municipio: "",
  telefono: "",
  correo: "",
  horario: "",
  responsable: "",
  longitud: "",
  latitud: "",
  tipoDonacion: [],
  estado: "activo",
  autorizado: true,
};

export default function CentroForm({
  centro,
  onGuardado,
  onCancelar,
}: CentroFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioCentro>(FORMULARIO_INICIAL);

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  const esEdicion = Boolean(centro?._id);

  useEffect(() => {
    if (centro) {
      const [longitud, latitud] = centro.ubicacion.coordinates;

      setFormulario({
        nombre: centro.nombre ?? "",
        direccion: centro.direccion ?? "",
        departamento: centro.departamento ?? "",
        municipio: centro.municipio ?? "",
        telefono: centro.telefono ?? "",
        correo: centro.correo ?? "",
        horario: centro.horario ?? "",
        responsable: centro.responsable ?? "",
        longitud: String(longitud ?? ""),
        latitud: String(latitud ?? ""),
        tipoDonacion: centro.tipoDonacion ?? [],
        estado: centro.estado ?? "activo",
        autorizado: centro.autorizado ?? true,
      });
    } else {
      setFormulario(FORMULARIO_INICIAL);
    }

    setError("");
  }, [centro]);

  const actualizarCampo = (campo: keyof FormularioCentro, valor: string) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const alternarTipoDonacion = (tipo: string) => {
    setFormulario((anterior) => {
      const existe = anterior.tipoDonacion.includes(tipo);

      return {
        ...anterior,
        tipoDonacion: existe
          ? anterior.tipoDonacion.filter((item) => item !== tipo)
          : [...anterior.tipoDonacion, tipo],
      };
    });
  };

  const validarFormulario = (): string | null => {
    if (!formulario.nombre.trim()) {
      return "El nombre del centro es obligatorio.";
    }

    if (!formulario.direccion.trim()) {
      return "La dirección es obligatoria.";
    }

    if (!formulario.departamento.trim()) {
      return "El departamento es obligatorio.";
    }

    if (!formulario.municipio.trim()) {
      return "El municipio es obligatorio.";
    }

    if (!formulario.telefono.trim()) {
      return "El teléfono es obligatorio.";
    }

    if (!formulario.correo.trim()) {
      return "El correo electrónico es obligatorio.";
    }

    if (!formulario.horario.trim()) {
      return "El horario es obligatorio.";
    }

    if (!formulario.responsable.trim()) {
      return "El responsable es obligatorio.";
    }

    if (formulario.tipoDonacion.length === 0) {
      return "Debe seleccionar al menos un tipo de donación.";
    }

    const longitud = Number(formulario.longitud);

    const latitud = Number(formulario.latitud);

    if (!Number.isFinite(longitud) || longitud < -180 || longitud > 180) {
      return "La longitud debe estar entre -180 y 180.";
    }

    if (!Number.isFinite(latitud) || latitud < -90 || latitud > 90) {
      return "La latitud debe estar entre -90 y 90.";
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      formulario.correo.trim()
    );

    if (!correoValido) {
      return "Ingrese un correo electrónico válido.";
    }

    return null;
  };

  const manejarSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setGuardando(true);

    try {
      const datos = {
        nombre: formulario.nombre.trim(),

        direccion: formulario.direccion.trim(),

        departamento: formulario.departamento.trim(),

        municipio: formulario.municipio.trim(),

        ubicacion: {
          type: "Point",

          coordinates: [
            Number(formulario.longitud),
            Number(formulario.latitud),
          ],
        },

        telefono: formulario.telefono.trim(),

        correo: formulario.correo.trim(),

        horario: formulario.horario.trim(),

        tipoDonacion: formulario.tipoDonacion,

        estado: formulario.estado,

        autorizado: formulario.autorizado,

        responsable: formulario.responsable.trim(),
      };

      const respuesta = await fetch(
        esEdicion ? `/api/centros/${centro?._id}` : "/api/centros",
        {
          method: esEdicion ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(datos),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.success) {
        throw new Error(
          resultado.message || "No fue posible guardar el centro."
        );
      }

      onGuardado(resultado.data);
    } catch (error) {
      console.error("Error guardando centro:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar el centro."
      );
    } finally {
      setGuardando(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #dfe4ea",
    borderRadius: "8px",
    outline: "none",
    color: "#17202a",
    background: "#ffffff",
    fontSize: "13px",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    color: "#17202a",
    fontSize: "12px",
    fontWeight: 700,
  };

  return (
    <form onSubmit={manejarSubmit}>
      {/* Error */}
      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 14px",
            borderRadius: "9px",
            background: "#fdecec",
            border: "1px solid #f1b5b5",
            color: "#ce1126",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Información general */}
      <section
        style={{
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            margin: "0 0 15px",
            paddingBottom: "8px",
            borderBottom: "2px solid #fcd116",
            color: "#00245f",
            fontSize: "16px",
          }}
        >
          📋 Información general
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "15px",
          }}
        >
          <div
            style={{
              gridColumn: "1 / -1",
            }}
          >
            <label htmlFor="nombre-centro" style={labelStyle}>
              Nombre del centro *
            </label>

            <input
              id="nombre-centro"
              type="text"
              value={formulario.nombre}
              onChange={(event) =>
                actualizarCampo("nombre", event.target.value)
              }
              placeholder="Ej. Centro de Acopio Medellín"
              style={inputStyle}
            />
          </div>

          <div
            style={{
              gridColumn: "1 / -1",
            }}
          >
            <label htmlFor="direccion-centro" style={labelStyle}>
              Dirección *
            </label>

            <input
              id="direccion-centro"
              type="text"
              value={formulario.direccion}
              onChange={(event) =>
                actualizarCampo("direccion", event.target.value)
              }
              placeholder="Ej. Calle 50 # 40-20"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="departamento-centro" style={labelStyle}>
              Departamento *
            </label>

            <input
              id="departamento-centro"
              type="text"
              value={formulario.departamento}
              onChange={(event) =>
                actualizarCampo("departamento", event.target.value)
              }
              placeholder="Ej. Antioquia"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="municipio-centro" style={labelStyle}>
              Municipio *
            </label>

            <input
              id="municipio-centro"
              type="text"
              value={formulario.municipio}
              onChange={(event) =>
                actualizarCampo("municipio", event.target.value)
              }
              placeholder="Ej. Medellín"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section
        style={{
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            margin: "0 0 15px",
            paddingBottom: "8px",
            borderBottom: "2px solid #fcd116",
            color: "#00245f",
            fontSize: "16px",
          }}
        >
          📞 Información de contacto
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <label htmlFor="telefono-centro" style={labelStyle}>
              Teléfono *
            </label>

            <input
              id="telefono-centro"
              type="tel"
              value={formulario.telefono}
              onChange={(event) =>
                actualizarCampo("telefono", event.target.value)
              }
              placeholder="Ej. 6041234567"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="correo-centro" style={labelStyle}>
              Correo electrónico *
            </label>

            <input
              id="correo-centro"
              type="email"
              value={formulario.correo}
              onChange={(event) =>
                actualizarCampo("correo", event.target.value)
              }
              placeholder="ejemplo@sgricn.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="horario-centro" style={labelStyle}>
              Horario de atención *
            </label>

            <input
              id="horario-centro"
              type="text"
              value={formulario.horario}
              onChange={(event) =>
                actualizarCampo("horario", event.target.value)
              }
              placeholder="Ej. 8:00 AM - 6:00 PM"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="responsable-centro" style={labelStyle}>
              Responsable *
            </label>

            <input
              id="responsable-centro"
              type="text"
              value={formulario.responsable}
              onChange={(event) =>
                actualizarCampo("responsable", event.target.value)
              }
              placeholder="Ej. Carlos Gómez"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section
        style={{
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            margin: "0 0 8px",
            paddingBottom: "8px",
            borderBottom: "2px solid #fcd116",
            color: "#00245f",
            fontSize: "16px",
          }}
        >
          📍 Ubicación geográfica
        </h3>

        <p
          style={{
            margin: "0 0 15px",
            color: "#5f6b7a",
            fontSize: "12px",
          }}
        >
          Las coordenadas se almacenan como GeoJSON: [longitud, latitud].
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <label htmlFor="longitud-centro" style={labelStyle}>
              Longitud *
            </label>

            <input
              id="longitud-centro"
              type="number"
              step="any"
              value={formulario.longitud}
              onChange={(event) =>
                actualizarCampo("longitud", event.target.value)
              }
              placeholder="-75.5812"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="latitud-centro" style={labelStyle}>
              Latitud *
            </label>

            <input
              id="latitud-centro"
              type="number"
              step="any"
              value={formulario.latitud}
              onChange={(event) =>
                actualizarCampo("latitud", event.target.value)
              }
              placeholder="6.2442"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Tipos de donación */}
      <section
        style={{
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            margin: "0 0 8px",
            paddingBottom: "8px",
            borderBottom: "2px solid #fcd116",
            color: "#00245f",
            fontSize: "16px",
          }}
        >
          📦 Tipos de donación
        </h3>

        <p
          style={{
            margin: "0 0 14px",
            color: "#5f6b7a",
            fontSize: "12px",
          }}
        >
          Selecciona los tipos de donación que puede recibir este centro.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "9px",
          }}
        >
          {TIPOS_DONACION.map((tipo) => {
            const seleccionado = formulario.tipoDonacion.includes(tipo);

            return (
              <button
                key={tipo}
                type="button"
                onClick={() => alternarTipoDonacion(tipo)}
                style={{
                  padding: "9px 13px",
                  borderRadius: "9px",
                  border: seleccionado
                    ? "2px solid #003893"
                    : "1px solid #dfe4ea",
                  background: seleccionado ? "#e8f0fb" : "#ffffff",
                  color: seleccionado ? "#003893" : "#5f6b7a",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {seleccionado ? "✓ " : ""}
                {tipo}
              </button>
            );
          })}
        </div>
      </section>

      {/* Estado y autorización */}
      <section
        style={{
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            margin: "0 0 15px",
            paddingBottom: "8px",
            borderBottom: "2px solid #fcd116",
            color: "#00245f",
            fontSize: "16px",
          }}
        >
          ⚙️ Estado del centro
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <label htmlFor="estado-centro" style={labelStyle}>
              Estado
            </label>

            <select
              id="estado-centro"
              value={formulario.estado}
              onChange={(event) =>
                setFormulario((anterior) => ({
                  ...anterior,
                  estado: event.target.value as EstadoCentro,
                }))
              }
              style={{
                ...inputStyle,
                cursor: "pointer",
              }}
            >
              <option value="activo">Activo</option>

              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                minHeight: "40px",
                padding: "0 12px",
                boxSizing: "border-box",
                border: "1px solid #dfe4ea",
                borderRadius: "8px",
                cursor: "pointer",
                background: formulario.autorizado ? "#eaf7ef" : "#fdecec",
              }}
            >
              <input
                type="checkbox"
                checked={formulario.autorizado}
                onChange={(event) =>
                  setFormulario((anterior) => ({
                    ...anterior,
                    autorizado: event.target.checked,
                  }))
                }
                style={{
                  width: "17px",
                  height: "17px",
                  cursor: "pointer",
                  accentColor: "#003893",
                }}
              />

              <span
                style={{
                  color: formulario.autorizado ? "#198754" : "#ce1126",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {formulario.autorizado
                  ? "✓ Centro autorizado"
                  : "✕ Centro no autorizado"}
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Botones */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
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
            border: "1px solid #dfe4ea",
            borderRadius: "9px",
            background: "#ffffff",
            color: "#5f6b7a",
            fontSize: "13px",
            fontWeight: 700,
            cursor: guardando ? "not-allowed" : "pointer",
            opacity: guardando ? 0.6 : 1,
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
            borderRadius: "9px",
            background: "#003893",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 700,
            cursor: guardando ? "not-allowed" : "pointer",
            opacity: guardando ? 0.7 : 1,
          }}
        >
          {guardando
            ? "⏳ Guardando..."
            : esEdicion
            ? "💾 Actualizar centro"
            : "💾 Crear centro"}
        </button>
      </div>
    </form>
  );
}
