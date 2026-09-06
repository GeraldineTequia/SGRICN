"use client";

import React, { useEffect, useState } from "react";

import { RolUsuario, EstadoUsuario, Usuario } from "@/types/usuarios";

interface UsuarioFormProps {
  usuario: Usuario | null;
  onGuardado: (usuario: Usuario) => void;
  onCancelar: () => void;
}

interface FormularioUsuario {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  telefono: string;
}

interface ErroresFormulario {
  nombre?: string;
  apellido?: string;
  correo?: string;
  password?: string;
  telefono?: string;
  general?: string;
}

const formularioInicial: FormularioUsuario = {
  nombre: "",
  apellido: "",
  correo: "",
  password: "",
  rol: "usuario",
  estado: "activo",
  telefono: "",
};

export default function UsuarioForm({
  usuario,
  onGuardado,
  onCancelar,
}: UsuarioFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioUsuario>(formularioInicial);

  const [errores, setErrores] = useState<ErroresFormulario>({});

  const [guardando, setGuardando] = useState(false);

  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    if (usuario) {
      setFormulario({
        nombre: usuario.nombre ?? "",
        apellido: usuario.apellido ?? "",
        correo: usuario.correo ?? "",
        password: "",
        rol: usuario.rol ?? "usuario",
        estado: usuario.estado ?? "activo",
        telefono: usuario.telefono ?? "",
      });
    } else {
      setFormulario(formularioInicial);
    }

    setErrores({});
    setMensajeExito("");
  }, [usuario]);

  function actualizarCampo(campo: keyof FormularioUsuario, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    setErrores((actual) => ({
      ...actual,
      [campo]: undefined,
      general: undefined,
    }));
  }

  function validar(): boolean {
    const nuevosErrores: ErroresFormulario = {};

    const nombre = formulario.nombre.trim();
    const apellido = formulario.apellido.trim();
    const correo = formulario.correo.trim();
    const telefono = formulario.telefono.trim();
    const password = formulario.password;

    if (!nombre) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (nombre.length < 2) {
      nuevosErrores.nombre = "El nombre debe tener al menos 2 caracteres.";
    }

    if (!apellido) {
      nuevosErrores.apellido = "El apellido es obligatorio.";
    } else if (apellido.length < 2) {
      nuevosErrores.apellido = "El apellido debe tener al menos 2 caracteres.";
    }

    if (!correo) {
      nuevosErrores.correo = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      nuevosErrores.correo = "Ingresa un correo electrónico válido.";
    }

    if (!usuario && !password) {
      nuevosErrores.password = "La contraseña es obligatoria.";
    } else if (password && password.length < 6) {
      nuevosErrores.password =
        "La contraseña debe tener al menos 6 caracteres.";
    }

    if (!telefono) {
      nuevosErrores.telefono = "El teléfono es obligatorio.";
    } else if (!/^[0-9+\s()-]{7,20}$/.test(telefono)) {
      nuevosErrores.telefono = "Ingresa un número de teléfono válido.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  }

  async function manejarSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensajeExito("");
    setErrores({});

    if (!validar()) {
      return;
    }

    setGuardando(true);

    try {
      const datos: Record<string, unknown> = {
        nombre: formulario.nombre.trim(),
        apellido: formulario.apellido.trim(),
        correo: formulario.correo.trim().toLowerCase(),
        rol: formulario.rol,
        estado: formulario.estado,
        telefono: formulario.telefono.trim(),
      };

      if (formulario.password.trim()) {
        datos.password = formulario.password.trim();
      }

      const url = usuario ? `/api/usuarios/${usuario._id}` : "/api/usuarios";

      const metodo = usuario ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.error || "No fue posible guardar el usuario."
        );
      }

      setMensajeExito(
        usuario
          ? "Usuario actualizado correctamente."
          : "Usuario creado correctamente."
      );

      onGuardado(resultado.data);
    } catch (error) {
      setErrores({
        general:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado.",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="usuario-form" onSubmit={manejarSubmit}>
      <div className="usuario-form-section">
        <div className="usuario-form-section-title">
          <span>01</span>

          <div>
            <h3>Información personal</h3>

            <p>Datos básicos del usuario.</p>
          </div>
        </div>

        <div className="usuario-form-grid">
          <div className="usuario-form-field">
            <label htmlFor="usuario-nombre">Nombre</label>

            <input
              id="usuario-nombre"
              type="text"
              value={formulario.nombre}
              onChange={(event) =>
                actualizarCampo("nombre", event.target.value)
              }
              placeholder="Ej. Carlos"
              maxLength={80}
            />

            {errores.nombre && (
              <span className="usuario-form-error">{errores.nombre}</span>
            )}
          </div>

          <div className="usuario-form-field">
            <label htmlFor="usuario-apellido">Apellido</label>

            <input
              id="usuario-apellido"
              type="text"
              value={formulario.apellido}
              onChange={(event) =>
                actualizarCampo("apellido", event.target.value)
              }
              placeholder="Ej. Gómez"
              maxLength={80}
            />

            {errores.apellido && (
              <span className="usuario-form-error">{errores.apellido}</span>
            )}
          </div>

          <div className="usuario-form-field">
            <label htmlFor="usuario-telefono">Teléfono</label>

            <input
              id="usuario-telefono"
              type="tel"
              value={formulario.telefono}
              onChange={(event) =>
                actualizarCampo("telefono", event.target.value)
              }
              placeholder="Ej. 3001234567"
              maxLength={20}
            />

            {errores.telefono && (
              <span className="usuario-form-error">{errores.telefono}</span>
            )}
          </div>

          <div className="usuario-form-field">
            <label htmlFor="usuario-correo">Correo electrónico</label>

            <input
              id="usuario-correo"
              type="email"
              value={formulario.correo}
              onChange={(event) =>
                actualizarCampo("correo", event.target.value)
              }
              placeholder="correo@ejemplo.com"
              maxLength={150}
            />

            {errores.correo && (
              <span className="usuario-form-error">{errores.correo}</span>
            )}
          </div>
        </div>
      </div>

      <div className="usuario-form-section">
        <div className="usuario-form-section-title">
          <span>02</span>

          <div>
            <h3>Acceso y permisos</h3>

            <p>Define el rol y estado de la cuenta.</p>
          </div>
        </div>

        <div className="usuario-form-grid">
          <div className="usuario-form-field">
            <label htmlFor="usuario-rol-form">Rol</label>

            <select
              id="usuario-rol-form"
              value={formulario.rol}
              onChange={(event) => actualizarCampo("rol", event.target.value)}
            >
              <option value="usuario">Usuario</option>

              <option value="funcionario">Funcionario</option>

              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="usuario-form-field">
            <label htmlFor="usuario-estado-form">Estado</label>

            <select
              id="usuario-estado-form"
              value={formulario.estado}
              onChange={(event) =>
                actualizarCampo("estado", event.target.value)
              }
            >
              <option value="activo">Activo</option>

              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="usuario-form-section">
        <div className="usuario-form-section-title">
          <span>03</span>

          <div>
            <h3>Seguridad</h3>

            <p>Configura la contraseña de acceso.</p>
          </div>
        </div>

        <div className="usuario-password-notice">
          <span>🔐</span>

          <p>
            {usuario
              ? "Deja este campo vacío si no deseas cambiar la contraseña actual."
              : "La contraseña será utilizada para iniciar sesión en el sistema."}
          </p>
        </div>

        <div className="usuario-form-grid">
          <div className="usuario-form-field usuario-password-field">
            <label htmlFor="usuario-password">
              {usuario ? "Nueva contraseña" : "Contraseña"}
            </label>

            <input
              id="usuario-password"
              type="password"
              value={formulario.password}
              onChange={(event) =>
                actualizarCampo("password", event.target.value)
              }
              placeholder={
                usuario ? "Dejar vacío para conservarla" : "Mínimo 6 caracteres"
              }
              autoComplete="new-password"
            />

            {errores.password && (
              <span className="usuario-form-error">{errores.password}</span>
            )}
          </div>
        </div>
      </div>

      {errores.general && (
        <div className="usuario-form-message usuario-form-message-error">
          <span>⚠️</span>

          <p>{errores.general}</p>
        </div>
      )}

      {mensajeExito && (
        <div className="usuario-form-message usuario-form-message-success">
          <span>✓</span>

          <p>{mensajeExito}</p>
        </div>
      )}

      <div className="usuario-form-actions">
        <button
          type="button"
          className="usuario-btn usuario-btn-cancel"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="usuario-btn usuario-btn-save"
          disabled={guardando}
        >
          {guardando ? (
            <>
              <span className="usuario-spinner" />
              Guardando...
            </>
          ) : (
            <>✓ {usuario ? "Guardar cambios" : "Crear usuario"}</>
          )}
        </button>
      </div>
    </form>
  );
}
