"use client";

import { useState } from "react";

export interface ConfiguracionData {
  nombreSistema: string;
  descripcionSistema: string;
  correoContacto: string;
  telefonoContacto: string;
  estadoSistema: "activo" | "mantenimiento";
  mostrarNoticias: boolean;
  permitirDonaciones: boolean;
  pagosSimulados: boolean;
}

interface ConfiguracionFormProps {
  configuracionInicial: ConfiguracionData;
}

export default function ConfiguracionForm({
  configuracionInicial,
}: ConfiguracionFormProps) {
  const [configuracion, setConfiguracion] =
    useState<ConfiguracionData>(configuracionInicial);

  const [guardado, setGuardado] = useState(false);

  function actualizarCampo(
    campo: keyof ConfiguracionData,
    valor: string | boolean
  ) {
    setConfiguracion((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    setGuardado(false);
  }

  function guardarConfiguracion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    /*
     * Por ahora la configuración se maneja
     * localmente en la interfaz.
     *
     * La persistencia en MongoDB se agregará
     * durante la etapa de integración final.
     */

    setGuardado(true);

    setTimeout(() => {
      setGuardado(false);
    }, 3000);
  }

  return (
    <form onSubmit={guardarConfiguracion}>
      {/* Información general */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: 600,
              color: "#17202a",
            }}
          >
            Nombre del sistema
          </label>

          <input
            type="text"
            value={configuracion.nombreSistema}
            onChange={(e) => actualizarCampo("nombreSistema", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: 600,
              color: "#17202a",
            }}
          >
            Correo de contacto
          </label>

          <input
            type="email"
            value={configuracion.correoContacto}
            onChange={(e) => actualizarCampo("correoContacto", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: 600,
              color: "#17202a",
            }}
          >
            Teléfono de contacto
          </label>

          <input
            type="text"
            value={configuracion.telefonoContacto}
            onChange={(e) =>
              actualizarCampo("telefonoContacto", e.target.value)
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: 600,
              color: "#17202a",
            }}
          >
            Estado del sistema
          </label>

          <select
            value={configuracion.estadoSistema}
            onChange={(e) => actualizarCampo("estadoSistema", e.target.value)}
            style={inputStyle}
          >
            <option value="activo">Activo</option>

            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>
      </div>

      {/* Descripción */}

      <div style={{ marginTop: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "7px",
            fontWeight: 600,
            color: "#17202a",
          }}
        >
          Descripción del sistema
        </label>

        <textarea
          value={configuracion.descripcionSistema}
          onChange={(e) =>
            actualizarCampo("descripcionSistema", e.target.value)
          }
          rows={4}
          style={{
            ...inputStyle,
            resize: "vertical",
          }}
        />
      </div>

      {/* Opciones */}

      <div style={{ marginTop: "28px" }}>
        <h3
          style={{
            margin: "0 0 16px",
            color: "#00245f",
            fontSize: "16px",
          }}
        >
          Opciones del sistema
        </h3>

        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          <SwitchOption
            titulo="Mostrar noticias"
            descripcion="Permite mostrar las noticias publicadas en el sistema."
            activo={configuracion.mostrarNoticias}
            onChange={(valor) => actualizarCampo("mostrarNoticias", valor)}
          />

          <SwitchOption
            titulo="Permitir donaciones"
            descripcion="Permite que los usuarios realicen donaciones monetarias."
            activo={configuracion.permitirDonaciones}
            onChange={(valor) => actualizarCampo("permitirDonaciones", valor)}
          />

          <SwitchOption
            titulo="Pagos simulados"
            descripcion="Utiliza el simulador de pagos PSE para las pruebas académicas."
            activo={configuracion.pagosSimulados}
            onChange={(valor) => actualizarCampo("pagosSimulados", valor)}
          />
        </div>
      </div>

      {/* Botón */}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "15px",
          marginTop: "28px",
          paddingTop: "20px",
          borderTop: "1px solid #dfe4ea",
        }}
      >
        {guardado && (
          <span
            style={{
              color: "#198754",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            ✓ Configuración guardada
          </span>
        )}

        <button
          type="submit"
          style={{
            background: "#003893",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "12px 22px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Guardar configuración
        </button>
      </div>
    </form>
  );
}

interface SwitchOptionProps {
  titulo: string;
  descripcion: string;
  activo: boolean;
  onChange: (valor: boolean) => void;
}

function SwitchOption({
  titulo,
  descripcion,
  activo,
  onChange,
}: SwitchOptionProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        padding: "16px",
        border: "1px solid #dfe4ea",
        borderRadius: "8px",
        background: "#fafbfd",
      }}
    >
      <div>
        <div
          style={{
            fontWeight: 600,
            color: "#17202a",
            marginBottom: "4px",
          }}
        >
          {titulo}
        </div>

        <div
          style={{
            color: "#5f6b7a",
            fontSize: "13px",
          }}
        >
          {descripcion}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!activo)}
        aria-label={`Cambiar ${titulo}`}
        style={{
          width: "50px",
          height: "28px",
          borderRadius: "20px",
          border: "none",
          background: activo ? "#198754" : "#adb5bd",
          position: "relative",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "4px",
            left: activo ? "26px" : "4px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#ffffff",
            transition: "left 0.2s ease",
          }}
        />
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  border: "1px solid #cfd6df",
  borderRadius: "8px",
  outline: "none",
  color: "#17202a",
  background: "#ffffff",
};
