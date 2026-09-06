"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Donacion,
  EstadoDonacion,
  MetodoPagoDonacion,
} from "@/types/donaciones";

interface Usuario {
  _id?: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
  rol?: string;
  estado?: string;
}

interface Catastrofe {
  _id: string;
  titulo: string;
  estado?: string;
}

interface DonacionFormProps {
  donacion?: Donacion | null;
  usuarios: Usuario[];
  catastrofes: Catastrofe[];
  usuarioActualId?: string;
  onGuardado: (donacion: Donacion) => void;
  onCancelar: () => void;
}

type ResultadoSimulacion = "aprobada" | "rechazada" | null;

interface FormularioDonacion {
  usuarioId: string;
  catastrofeId: string;
  monto: string;
  metodoPago: MetodoPagoDonacion;
  descripcion: string;
}

const METODOS_PAGO: {
  valor: MetodoPagoDonacion;
  etiqueta: string;
  descripcion: string;
  icono: string;
}[] = [
  {
    valor: "PSE",
    etiqueta: "PSE",
    descripcion: "Simulación de pago mediante PSE.",
    icono: "🏦",
  },
  {
    valor: "tarjeta",
    etiqueta: "Tarjeta",
    descripcion: "Simulación de pago con tarjeta.",
    icono: "💳",
  },
  {
    valor: "transferencia",
    etiqueta: "Transferencia bancaria",
    descripcion: "Simulación de transferencia bancaria.",
    icono: "🔄",
  },
  {
    valor: "efectivo",
    etiqueta: "Efectivo",
    descripcion: "Registro de una donación en efectivo.",
    icono: "💵",
  },
];

function obtenerNombreUsuario(usuario: Usuario) {
  const nombreCompleto = [usuario.nombre, usuario.apellido]
    .filter(Boolean)
    .join(" ");

  return nombreCompleto || usuario.correo || usuario._id || "Usuario";
}

function formatearMonto(monto: string) {
  const numero = Number(monto);

  if (!monto || !Number.isFinite(numero)) {
    return "$ 0";
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numero);
}

export default function DonacionForm({
  donacion,
  usuarios,
  catastrofes,
  usuarioActualId,
  onGuardado,
  onCancelar,
}: DonacionFormProps) {
  const esEdicion = Boolean(donacion);

  const [formulario, setFormulario] = useState<FormularioDonacion>({
    usuarioId: donacion?.usuarioId ?? usuarioActualId ?? "",
    catastrofeId: donacion?.catastrofeId ?? "",
    monto: donacion?.monto !== undefined ? String(donacion.monto) : "",
    metodoPago: donacion?.metodoPago ?? "PSE",
    descripcion: donacion?.descripcion ?? "",
  });

  const [resultadoSimulacion, setResultadoSimulacion] =
    useState<ResultadoSimulacion>(
      donacion?.estado === "aprobada"
        ? "aprobada"
        : donacion?.estado === "rechazada"
        ? "rechazada"
        : null
    );

  const [procesando, setProcesando] = useState(false);

  const [error, setError] = useState("");

  const [mensajeExito, setMensajeExito] = useState("");

  const [mostrarResultado, setMostrarResultado] = useState(false);

  useEffect(() => {
    setFormulario({
      usuarioId: donacion?.usuarioId ?? usuarioActualId ?? "",
      catastrofeId: donacion?.catastrofeId ?? "",
      monto: donacion?.monto !== undefined ? String(donacion.monto) : "",
      metodoPago: donacion?.metodoPago ?? "PSE",
      descripcion: donacion?.descripcion ?? "",
    });

    setResultadoSimulacion(
      donacion?.estado === "aprobada"
        ? "aprobada"
        : donacion?.estado === "rechazada"
        ? "rechazada"
        : null
    );

    setMostrarResultado(
      Boolean(
        donacion &&
          (donacion.estado === "aprobada" || donacion.estado === "rechazada")
      )
    );

    setError("");
    setMensajeExito("");
  }, [donacion, usuarioActualId]);

  const usuariosActivos = useMemo(() => {
    return usuarios.filter(
      (usuario) => !usuario.estado || usuario.estado === "activo"
    );
  }, [usuarios]);

  const catastrofesActivas = useMemo(() => {
    return catastrofes.filter(
      (catastrofe) => !catastrofe.estado || catastrofe.estado === "activa"
    );
  }, [catastrofes]);

  const metodoSeleccionado = METODOS_PAGO.find(
    (metodo) => metodo.valor === formulario.metodoPago
  );

  function actualizarCampo(campo: keyof FormularioDonacion, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    setError("");
    setMensajeExito("");
  }

  function validarFormulario() {
    if (!formulario.usuarioId) {
      return "Debes seleccionar el usuario que realiza la donación.";
    }

    if (!formulario.catastrofeId) {
      return "Debes seleccionar la catástrofe a la que se dirige la donación.";
    }

    const monto = Number(formulario.monto);

    if (!formulario.monto || !Number.isFinite(monto)) {
      return "Debes ingresar un monto válido.";
    }

    if (monto <= 0) {
      return "El monto debe ser mayor que cero.";
    }

    if (monto > 1000000000) {
      return "El monto supera el límite permitido para una donación simulada.";
    }

    if (!formulario.descripcion.trim()) {
      return "Debes ingresar una descripción de la donación.";
    }

    if (formulario.descripcion.trim().length < 5) {
      return "La descripción debe tener al menos 5 caracteres.";
    }

    return "";
  }

  function generarResultadoSimulacion() {
    /*
     * Para que la simulación sea útil durante
     * el desarrollo, el resultado no depende
     * de una pasarela real.
     *
     * La mayoría de simulaciones serán aprobadas.
     * Se conserva una pequeña posibilidad de
     * rechazo para poder visualizar ambos estados.
     */

    const numeroAleatorio = Math.random();

    if (numeroAleatorio < 0.9) {
      return "aprobada" as const;
    }

    return "rechazada" as const;
  }

  function generarReferencia() {
    const fecha = new Date();

    const año = fecha.getFullYear();

    const numero = Math.floor(10000 + Math.random() * 90000);

    return `DON-${año}-${numero}`;
  }

  function generarTransaccionId() {
    const numero = Math.floor(10000 + Math.random() * 90000);

    return `TRANS-${numero}`;
  }

  async function simularPago() {
    setError("");
    setMensajeExito("");

    const mensajeValidacion = validarFormulario();

    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    setProcesando(true);

    /*
     * Pequeño retraso para representar
     * la comunicación con una pasarela
     * de pagos.
     */
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const resultado = generarResultadoSimulacion();

    setResultadoSimulacion(resultado);

    setMostrarResultado(true);

    setProcesando(false);
  }

  async function guardarDonacion(estadoForzado?: EstadoDonacion) {
    setError("");
    setMensajeExito("");

    const mensajeValidacion = validarFormulario();

    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    /*
     * Si es una donación nueva,
     * exigimos que primero se simule
     * el pago.
     */
    if (!esEdicion && !resultadoSimulacion) {
      setError("Primero debes simular el pago de la donación.");
      return;
    }

    setProcesando(true);

    try {
      const estado: EstadoDonacion =
        estadoForzado ?? resultadoSimulacion ?? "pendiente";

      const body = {
        usuarioId: formulario.usuarioId,

        catastrofeId: formulario.catastrofeId,

        monto: Number(formulario.monto),

        moneda: "COP",

        metodoPago: formulario.metodoPago,

        pasarela: "Sistema SGRICN",

        referencia: donacion?.referencia ?? generarReferencia(),

        transaccionId: donacion?.transaccionId ?? generarTransaccionId(),

        estado,

        descripcion: formulario.descripcion.trim(),
      };

      const url = donacion
        ? `/api/donaciones/${donacion._id}`
        : "/api/donaciones";

      const response = await fetch(url, {
        method: donacion ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const resultado = await response.json();

      if (!response.ok || !resultado.success) {
        throw new Error(
          resultado.message ?? "No fue posible guardar la donación."
        );
      }

      setMensajeExito(
        donacion
          ? "La donación fue actualizada correctamente."
          : "La donación fue registrada correctamente."
      );

      onGuardado(resultado.data);
    } catch (error) {
      console.error("Error guardando donación:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la donación."
      );
    } finally {
      setProcesando(false);
    }
  }

  function manejarEnvio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void guardarDonacion();
  }

  const puedeGuardar = !procesando && Boolean(resultadoSimulacion);

  return (
    <form className="donacion-form" onSubmit={manejarEnvio}>
      {/* ======================================
          INFORMACIÓN PRINCIPAL
      ======================================= */}

      <div className="donacion-form-section">
        <div className="donacion-form-section-title">
          <span>💰</span>

          <div>
            <h3>Información de la donación</h3>

            <p>Completa los datos de la donación que deseas registrar.</p>
          </div>
        </div>

        <div className="donacion-form-grid">
          {/* USUARIO */}

          <div className="donacion-form-field">
            <label htmlFor="donacion-usuario">
              Usuario
              <span>*</span>
            </label>

            <select
              id="donacion-usuario"
              value={formulario.usuarioId}
              onChange={(event) =>
                actualizarCampo("usuarioId", event.target.value)
              }
              disabled={procesando || Boolean(usuarioActualId && !esEdicion)}
            >
              <option value="">Selecciona un usuario</option>

              {usuariosActivos.map((usuario) => (
                <option key={usuario._id} value={usuario._id}>
                  {obtenerNombreUsuario(usuario)}
                </option>
              ))}
            </select>

            {usuarioActualId && !esEdicion && (
              <small>La donación se registrará con el usuario actual.</small>
            )}
          </div>

          {/* CATÁSTROFE */}

          <div className="donacion-form-field">
            <label htmlFor="donacion-catastrofe">
              Catástrofe
              <span>*</span>
            </label>

            <select
              id="donacion-catastrofe"
              value={formulario.catastrofeId}
              onChange={(event) =>
                actualizarCampo("catastrofeId", event.target.value)
              }
              disabled={procesando}
            >
              <option value="">Selecciona una catástrofe</option>

              {catastrofesActivas.map((catastrofe) => (
                <option key={catastrofe._id} value={catastrofe._id}>
                  {catastrofe.titulo}
                </option>
              ))}
            </select>

            {catastrofesActivas.length === 0 && (
              <small>
                No hay catástrofes activas disponibles para recibir donaciones.
              </small>
            )}
          </div>

          {/* MONTO */}

          <div className="donacion-form-field">
            <label htmlFor="donacion-monto">
              Monto
              <span>*</span>
            </label>

            <div className="donacion-monto-wrapper">
              <span>$</span>

              <input
                id="donacion-monto"
                type="number"
                min="1"
                max="1000000000"
                step="1000"
                value={formulario.monto}
                onChange={(event) =>
                  actualizarCampo("monto", event.target.value)
                }
                placeholder="50000"
                disabled={procesando}
              />

              <span>COP</span>
            </div>

            {formulario.monto && (
              <small>
                Valor: <strong>{formatearMonto(formulario.monto)}</strong>
              </small>
            )}
          </div>

          {/* DESCRIPCIÓN */}

          <div className="donacion-form-field donacion-form-field-full">
            <label htmlFor="donacion-descripcion">
              Descripción
              <span>*</span>
            </label>

            <textarea
              id="donacion-descripcion"
              value={formulario.descripcion}
              onChange={(event) =>
                actualizarCampo("descripcion", event.target.value)
              }
              placeholder="Ejemplo: Donación destinada a la compra de agua potable para las familias afectadas."
              rows={4}
              maxLength={500}
              disabled={procesando}
            />

            <small>{formulario.descripcion.length}/ 500 caracteres</small>
          </div>
        </div>
      </div>

      {/* ======================================
          MÉTODO DE PAGO
      ======================================= */}

      <div className="donacion-form-section">
        <div className="donacion-form-section-title">
          <span>💳</span>

          <div>
            <h3>Método de pago</h3>

            <p>
              Selecciona el método que utilizarás para realizar la donación
              simulada.
            </p>
          </div>
        </div>

        <div className="donacion-metodos">
          {METODOS_PAGO.map((metodo) => (
            <button
              key={metodo.valor}
              type="button"
              className={`donacion-metodo ${
                formulario.metodoPago === metodo.valor
                  ? "donacion-metodo-selected"
                  : ""
              }`}
              onClick={() => actualizarCampo("metodoPago", metodo.valor)}
              disabled={procesando}
            >
              <span className="donacion-metodo-icon">{metodo.icono}</span>

              <span className="donacion-metodo-content">
                <strong>{metodo.etiqueta}</strong>

                <small>{metodo.descripcion}</small>
              </span>

              <span className="donacion-metodo-radio">
                {formulario.metodoPago === metodo.valor ? "●" : "○"}
              </span>
            </button>
          ))}
        </div>

        {metodoSeleccionado && (
          <div className="donacion-metodo-info">
            <span>ℹ️</span>

            <p>
              {metodoSeleccionado.descripcion} Este proceso es una simulación y
              no realiza un cobro real.
            </p>
          </div>
        )}
      </div>

      {/* ======================================
          SIMULACIÓN DE PAGO
      ======================================= */}

      <div className="donacion-form-section donacion-simulacion">
        <div className="donacion-form-section-title">
          <span>🔐</span>

          <div>
            <h3>Simulación del pago</h3>

            <p>
              Simula el resultado de la transacción antes de registrarla en el
              sistema.
            </p>
          </div>
        </div>

        <div className="donacion-simulacion-box">
          <div className="donacion-simulacion-info">
            <strong>Pasarela</strong>

            <span>Sistema SGRICN</span>
          </div>

          <div className="donacion-simulacion-info">
            <strong>Método</strong>

            <span>{metodoSeleccionado?.etiqueta ?? "No seleccionado"}</span>
          </div>

          <div className="donacion-simulacion-info">
            <strong>Monto</strong>

            <span>{formatearMonto(formulario.monto)}</span>
          </div>
        </div>

        <button
          type="button"
          className="donacion-btn-simular"
          onClick={() => void simularPago()}
          disabled={procesando}
        >
          {procesando ? "Procesando simulación..." : "🔄 Simular pago"}
        </button>

        {/* RESULTADO */}

        {mostrarResultado && resultadoSimulacion && (
          <div
            className={`donacion-resultado ${
              resultadoSimulacion === "aprobada"
                ? "donacion-resultado-aprobada"
                : "donacion-resultado-rechazada"
            }`}
          >
            <div className="donacion-resultado-icon">
              {resultadoSimulacion === "aprobada" ? "✓" : "!"}
            </div>

            <div>
              <strong>
                {resultadoSimulacion === "aprobada"
                  ? "Pago simulado aprobado"
                  : "Pago simulado rechazado"}
              </strong>

              <p>
                {resultadoSimulacion === "aprobada"
                  ? "La simulación fue exitosa. Puedes registrar la donación."
                  : "La simulación fue rechazada. Puedes volver a simular el pago."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ======================================
          MENSAJES
      ======================================= */}

      {error && (
        <div className="donacion-form-error">
          <span>⚠️</span>

          <p>{error}</p>
        </div>
      )}

      {mensajeExito && (
        <div className="donacion-form-success">
          <span>✓</span>

          <p>{mensajeExito}</p>
        </div>
      )}

      {/* ======================================
          ACCIONES
      ======================================= */}

      <div className="donacion-form-actions">
        <button
          type="button"
          className="donacion-btn donacion-btn-cancelar"
          onClick={onCancelar}
          disabled={procesando}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="donacion-btn donacion-btn-guardar"
          disabled={!puedeGuardar}
        >
          {procesando
            ? "Guardando..."
            : esEdicion
            ? "💾 Actualizar donación"
            : "💰 Registrar donación"}
        </button>
      </div>
    </form>
  );
}
