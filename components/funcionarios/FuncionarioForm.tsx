"use client";

import React, { useEffect, useState } from "react";

import { EstadoUsuario, Usuario } from "@/types/usuarios";

interface FuncionarioFormProps {
  funcionario?: Usuario | null;
  onGuardado: (funcionario: Usuario) => void;
  onCancelar: () => void;
}

interface FormularioFuncionario {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  estado: EstadoUsuario;
  password: string;
}

const formularioInicial: FormularioFuncionario = {
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  estado: "activo",
  password: "",
};

export default function FuncionarioForm({
  funcionario,
  onGuardado,
  onCancelar,
}: FuncionarioFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioFuncionario>(formularioInicial);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const esEdicion = Boolean(funcionario);

  useEffect(() => {
    if (funcionario) {
      setFormulario({
        nombre: funcionario.nombre ?? "",
        apellido: funcionario.apellido ?? "",
        correo: funcionario.correo ?? "",
        telefono: funcionario.telefono ?? "",
        estado: funcionario.estado ?? "activo",
        password: "",
      });
    } else {
      setFormulario({ ...formularioInicial });
    }

    setError("");
    setMensaje("");
  }, [funcionario]);

  function actualizarCampo(campo: keyof FormularioFuncionario, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function validarFormulario(): string | null {
    const nombre = formulario.nombre.trim();
    const apellido = formulario.apellido.trim();
    const correo = formulario.correo.trim();
    const telefono = formulario.telefono.trim();
    const password = formulario.password.trim();

    if (!nombre) {
      return "El nombre es obligatorio.";
    }

    if (nombre.length < 2) {
      return "El nombre debe tener al menos 2 caracteres.";
    }

    if (nombre.length > 80) {
      return "El nombre no puede superar los 80 caracteres.";
    }

    if (!apellido) {
      return "El apellido es obligatorio.";
    }

    if (apellido.length < 2) {
      return "El apellido debe tener al menos 2 caracteres.";
    }

    if (apellido.length > 80) {
      return "El apellido no puede superar los 80 caracteres.";
    }

    if (!correo) {
      return "El correo electrónico es obligatorio.";
    }

    if (correo.length > 150) {
      return "El correo electrónico no puede superar los 150 caracteres.";
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correoValido.test(correo)) {
      return "Ingresa un correo electrónico válido.";
    }

    if (!telefono) {
      return "El teléfono es obligatorio.";
    }

    const telefonoValido = /^[0-9+\s()-]{7,20}$/;

    if (!telefonoValido.test(telefono)) {
      return "El teléfono debe contener entre 7 y 20 caracteres válidos.";
    }

    if (!esEdicion && password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }

    if (password && password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }

    if (password && password.length > 100) {
      return "La contraseña no puede superar los 100 caracteres.";
    }

    if (formulario.estado !== "activo" && formulario.estado !== "inactivo") {
      return "El estado seleccionado no es válido.";
    }

    return null;
  }

  async function manejarEnvio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (guardando) {
      return;
    }

    setError("");
    setMensaje("");

    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setGuardando(true);

    try {
      const datos: Record<string, unknown> = {
        nombre: formulario.nombre.trim(),
        apellido: formulario.apellido.trim(),
        correo: formulario.correo.trim().toLowerCase(),
        telefono: formulario.telefono.trim(),
        estado: formulario.estado,

        // Este módulo solo puede crear/editar funcionarios.
        rol: "funcionario",
      };

      /*
       * En creación la contraseña es obligatoria.
       *
       * En edición solamente se envía si el administrador
       * escribió una nueva contraseña.
       *
       * Si se deja vacía durante la edición, la API conserva
       * la contraseña actual almacenada en MongoDB.
       */
      if (formulario.password.trim()) {
        datos.password = formulario.password.trim();
      }

      const url = esEdicion
        ? `/api/usuarios/${funcionario?._id}`
        : "/api/usuarios";

      const metodo = esEdicion ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(datos),
      });

      let resultado: {
        message?: string;
        data?: Usuario;
      } = {};

      try {
        resultado = await respuesta.json();
      } catch {
        throw new Error("El servidor devolvió una respuesta no válida.");
      }

      if (!respuesta.ok) {
        throw new Error(
          resultado.message || "No fue posible guardar el funcionario."
        );
      }

      if (!resultado.data) {
        throw new Error(
          "El servidor no devolvió la información del funcionario guardado."
        );
      }

      const funcionarioGuardado = resultado.data;

      setMensaje(
        esEdicion
          ? "Funcionario actualizado correctamente."
          : "Funcionario creado correctamente."
      );

      onGuardado(funcionarioGuardado);

      if (!esEdicion) {
        setFormulario({ ...formularioInicial });
      }
    } catch (error) {
      console.error("Error guardando funcionario:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar el funcionario."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="funcionario-form" onSubmit={manejarEnvio} noValidate>
      <div className="funcionario-form-intro">
        <div className="funcionario-form-icon">👨‍💼</div>

        <div>
          <h3>
            {esEdicion ? "Actualizar funcionario" : "Registrar funcionario"}
          </h3>

          <p>
            {esEdicion
              ? "Modifica la información del funcionario seleccionado."
              : "Registra un nuevo funcionario para administrar la plataforma."}
          </p>
        </div>
      </div>

      {error && (
        <div
          className="funcionario-form-alert funcionario-form-alert-error"
          role="alert"
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {mensaje && (
        <div
          className="funcionario-form-alert funcionario-form-alert-success"
          role="status"
        >
          <span>✓</span>
          <span>{mensaje}</span>
        </div>
      )}

      <div className="funcionario-form-section">
        <div className="funcionario-form-section-title">
          <span>👤</span>

          <div>
            <h4>Información personal</h4>
            <p>Datos básicos del funcionario.</p>
          </div>
        </div>

        <div className="funcionario-form-grid">
          <div className="funcionario-form-field">
            <label htmlFor="funcionario-nombre">
              Nombre
              <span>*</span>
            </label>

            <input
              id="funcionario-nombre"
              type="text"
              value={formulario.nombre}
              onChange={(event) =>
                actualizarCampo("nombre", event.target.value)
              }
              placeholder="Ej. Carlos"
              disabled={guardando}
              maxLength={80}
              autoComplete="given-name"
            />
          </div>

          <div className="funcionario-form-field">
            <label htmlFor="funcionario-apellido">
              Apellido
              <span>*</span>
            </label>

            <input
              id="funcionario-apellido"
              type="text"
              value={formulario.apellido}
              onChange={(event) =>
                actualizarCampo("apellido", event.target.value)
              }
              placeholder="Ej. Gómez"
              disabled={guardando}
              maxLength={80}
              autoComplete="family-name"
            />
          </div>
        </div>
      </div>

      <div className="funcionario-form-section">
        <div className="funcionario-form-section-title">
          <span>📧</span>

          <div>
            <h4>Información de contacto</h4>
            <p>Datos utilizados para comunicarse con el funcionario.</p>
          </div>
        </div>

        <div className="funcionario-form-grid">
          <div className="funcionario-form-field">
            <label htmlFor="funcionario-correo">
              Correo electrónico
              <span>*</span>
            </label>

            <input
              id="funcionario-correo"
              type="email"
              value={formulario.correo}
              onChange={(event) =>
                actualizarCampo("correo", event.target.value)
              }
              placeholder="funcionario@ejemplo.com"
              disabled={guardando}
              maxLength={150}
              autoComplete="email"
            />
          </div>

          <div className="funcionario-form-field">
            <label htmlFor="funcionario-telefono">
              Teléfono
              <span>*</span>
            </label>

            <input
              id="funcionario-telefono"
              type="tel"
              value={formulario.telefono}
              onChange={(event) =>
                actualizarCampo("telefono", event.target.value)
              }
              placeholder="3001234567"
              disabled={guardando}
              maxLength={20}
              autoComplete="tel"
            />
          </div>
        </div>
      </div>

      <div className="funcionario-form-section">
        <div className="funcionario-form-section-title">
          <span>🔐</span>

          <div>
            <h4>Acceso al sistema</h4>
            <p>Configuración de acceso del funcionario.</p>
          </div>
        </div>

        <div className="funcionario-form-grid">
          <div className="funcionario-form-field">
            <label htmlFor="funcionario-rol">Rol</label>

            <input
              id="funcionario-rol"
              type="text"
              value="Funcionario"
              disabled
              readOnly
            />

            <small>
              El rol está definido automáticamente para este módulo.
            </small>
          </div>

          <div className="funcionario-form-field">
            <label htmlFor="funcionario-estado">
              Estado
              <span>*</span>
            </label>

            <select
              id="funcionario-estado"
              value={formulario.estado}
              onChange={(event) =>
                actualizarCampo("estado", event.target.value as EstadoUsuario)
              }
              disabled={guardando}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="funcionario-form-field funcionario-form-field-full">
            <label htmlFor="funcionario-password">
              {esEdicion ? "Nueva contraseña" : "Contraseña"}
              {!esEdicion && <span>*</span>}
            </label>

            <input
              id="funcionario-password"
              type="password"
              value={formulario.password}
              onChange={(event) =>
                actualizarCampo("password", event.target.value)
              }
              placeholder={
                esEdicion
                  ? "Déjalo vacío para conservar la actual"
                  : "Mínimo 6 caracteres"
              }
              disabled={guardando}
              minLength={6}
              maxLength={100}
              autoComplete={esEdicion ? "new-password" : "new-password"}
            />

            <small>
              {esEdicion
                ? "Si no deseas cambiar la contraseña, deja este campo vacío."
                : "La contraseña será protegida antes de almacenarse en la base de datos."}
            </small>
          </div>
        </div>
      </div>

      <div className="funcionario-form-info">
        <span>ℹ️</span>

        <p>
          Los funcionarios podrán acceder a las funcionalidades administrativas
          que les correspondan según los permisos definidos en el sistema.
        </p>
      </div>

      <div className="funcionario-form-actions">
        <button
          type="button"
          className="funcionario-form-btn funcionario-form-btn-secondary"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="funcionario-form-btn funcionario-form-btn-primary"
          disabled={guardando}
        >
          {guardando ? (
            <>
              <span className="funcionario-form-spinner" />
              Guardando...
            </>
          ) : (
            <>
              <span>✓</span>

              {esEdicion ? "Guardar cambios" : "Crear funcionario"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
