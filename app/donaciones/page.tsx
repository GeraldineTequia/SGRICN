"use client";

import React, { useEffect, useMemo, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/auth/AuthProvider";

import DonacionCard from "@/components/donaciones/DonacionCard";
import DonacionFilters from "@/components/donaciones/DonacionFilters";
import DonacionForm from "@/components/donaciones/DonacionForm";
import DonacionModal from "@/components/donaciones/DonacionModal";

import { Donacion } from "@/types/donaciones";

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

interface RespuestaApi<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export default function DonacionesPage() {
  const { role, user } = useAuth();

  /*
   * ==========================================
   * PERMISOS
   * ==========================================
   */

  const puedeRegistrar = role === "USUARIO";

  const puedeConsultarTodas = role === "ADMIN" || role === "FUNCIONARIO";

  /*
   * ==========================================
   * ESTADO
   * ==========================================
   */

  const [donaciones, setDonaciones] = useState<Donacion[]>([]);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [catastrofes, setCatastrofes] = useState<Catastrofe[]>([]);

  const [cargando, setCargando] = useState(true);

  const [errorCarga, setErrorCarga] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [estado, setEstado] = useState("");

  const [metodoPago, setMetodoPago] = useState("");

  const [catastrofeId, setCatastrofeId] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);

  const [donacionSeleccionada, setDonacionSeleccionada] =
    useState<Donacion | null>(null);

  const [mensaje, setMensaje] = useState("");

  const [tipoMensaje, setTipoMensaje] = useState<"exito" | "error">("exito");

  /*
   * ==========================================
   * CARGA INICIAL
   * ==========================================
   */

  useEffect(() => {
    if (!role) {
      return;
    }

    void cargarDatos();
  }, [role]);

  async function cargarDatos() {
    setCargando(true);
    setErrorCarga("");

    try {
      /*
       * La API de donaciones ya determina automáticamente:
       *
       * ADMIN/FUNCIONARIO -> todas las donaciones
       * USUARIO            -> solamente sus donaciones
       */
      const promesas: [Promise<Response>, Promise<Response>] = [
        fetch("/api/donaciones", {
          method: "GET",
          cache: "no-store",
        }),

        fetch("/api/catastrofes", {
          method: "GET",
          cache: "no-store",
        }),
      ];

      const [respuestaDonaciones, respuestaCatastrofes] = await Promise.all(
        promesas
      );

      if (!respuestaDonaciones.ok) {
        const resultado = await respuestaDonaciones.json().catch(() => null);

        throw new Error(
          resultado?.message ?? "No fue posible cargar las donaciones."
        );
      }

      if (!respuestaCatastrofes.ok) {
        const resultado = await respuestaCatastrofes.json().catch(() => null);

        throw new Error(
          resultado?.message ?? "No fue posible cargar las catástrofes."
        );
      }

      const datosDonaciones: RespuestaApi<Donacion[]> =
        await respuestaDonaciones.json();

      const datosCatastrofes: RespuestaApi<Catastrofe[]> =
        await respuestaCatastrofes.json();

      if (!datosDonaciones.success) {
        throw new Error(
          datosDonaciones.message ?? "No fue posible cargar las donaciones."
        );
      }

      if (!datosCatastrofes.success) {
        throw new Error(
          datosCatastrofes.message ?? "No fue posible cargar las catástrofes."
        );
      }

      setDonaciones(datosDonaciones.data ?? []);

      setCatastrofes(datosCatastrofes.data ?? []);

      /*
       * Solamente ADMIN y FUNCIONARIO pueden consultar
       * la colección completa de usuarios.
       *
       * USUARIO no realiza esta petición porque la API
       * correctamente responde 403.
       */
      if (puedeConsultarTodas) {
        const respuestaUsuarios = await fetch("/api/usuarios", {
          method: "GET",
          cache: "no-store",
        });

        if (!respuestaUsuarios.ok) {
          const resultado = await respuestaUsuarios.json().catch(() => null);

          throw new Error(
            resultado?.message ?? "No fue posible cargar los usuarios."
          );
        }

        const datosUsuarios: RespuestaApi<Usuario[]> =
          await respuestaUsuarios.json();

        if (!datosUsuarios.success) {
          throw new Error(
            datosUsuarios.message ?? "No fue posible cargar los usuarios."
          );
        }

        setUsuarios(datosUsuarios.data ?? []);
      } else {
        /*
         * Para USUARIO no necesitamos cargar usuarios.
         * La API de donaciones ya devuelve únicamente
         * sus propios registros.
         */
        setUsuarios([]);
      }
    } catch (error) {
      console.error("Error cargando módulo de donaciones:", error);

      setErrorCarga(
        error instanceof Error
          ? error.message
          : "No fue posible cargar la información."
      );
    } finally {
      setCargando(false);
    }
  }

  /*
   * ==========================================
   * FILTROS
   * ==========================================
   */

  const donacionesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return donaciones.filter((donacion) => {
      const usuario = usuarios.find(
        (item) => String(item._id) === String(donacion.usuarioId)
      );

      const catastrofe = catastrofes.find(
        (item) => String(item._id) === String(donacion.catastrofeId)
      );

      const nombreUsuario = [
        usuario?.nombre,
        usuario?.apellido,
        usuario?.correo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const tituloCatastrofe = (catastrofe?.titulo ?? "").toLowerCase();

      const coincideBusqueda =
        !texto ||
        donacion._id.toLowerCase().includes(texto) ||
        donacion.referencia.toLowerCase().includes(texto) ||
        donacion.transaccionId.toLowerCase().includes(texto) ||
        nombreUsuario.includes(texto) ||
        tituloCatastrofe.includes(texto);

      const coincideEstado = !estado || donacion.estado === estado;

      const coincideMetodo = !metodoPago || donacion.metodoPago === metodoPago;

      const coincideCatastrofe =
        !catastrofeId || donacion.catastrofeId === catastrofeId;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideMetodo &&
        coincideCatastrofe
      );
    });
  }, [
    donaciones,
    usuarios,
    catastrofes,
    busqueda,
    estado,
    metodoPago,
    catastrofeId,
  ]);

  /*
   * ==========================================
   * ESTADÍSTICAS
   * ==========================================
   */

  const estadisticas = useMemo(() => {
    const total = donaciones.length;

    const aprobadas = donaciones.filter(
      (donacion) => donacion.estado === "aprobada"
    );

    const pendientes = donaciones.filter(
      (donacion) => donacion.estado === "pendiente"
    );

    const rechazadas = donaciones.filter(
      (donacion) => donacion.estado === "rechazada"
    );

    const montoAprobado = aprobadas.reduce(
      (acumulado, donacion) => acumulado + donacion.monto,
      0
    );

    const montoTotal = donaciones.reduce(
      (acumulado, donacion) => acumulado + donacion.monto,
      0
    );

    return {
      total,
      aprobadas: aprobadas.length,
      pendientes: pendientes.length,
      rechazadas: rechazadas.length,
      montoAprobado,
      montoTotal,
    };
  }, [donaciones]);

  /*
   * ==========================================
   * MODAL
   * ==========================================
   */

  function abrirNuevaDonacion() {
    if (!puedeRegistrar) {
      return;
    }

    setDonacionSeleccionada(null);

    setModalAbierto(true);

    limpiarMensaje();
  }

  function cerrarModal() {
    setModalAbierto(false);

    setDonacionSeleccionada(null);
  }

  /*
   * ==========================================
   * GUARDADO
   * ==========================================
   */

  function manejarGuardado(donacion: Donacion) {
    if (!puedeRegistrar) {
      return;
    }

    setDonaciones((actuales) => {
      const existe = actuales.some((item) => item._id === donacion._id);

      if (existe) {
        return actuales.map((item) =>
          item._id === donacion._id ? donacion : item
        );
      }

      return [donacion, ...actuales];
    });

    setTipoMensaje("exito");

    setMensaje("La donación fue registrada correctamente.");

    cerrarModal();
  }

  /*
   * ==========================================
   * ELIMINACIÓN
   * ==========================================
   *
   * Se conserva únicamente como protección
   * adicional en caso de que algún componente
   * intente llamar esta función.
   *
   * La API también bloquea DELETE.
   */

  async function eliminarDonacion(donacion: Donacion) {
    if (role !== "ADMIN" && role !== "FUNCIONARIO") {
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de eliminar la donación ${donacion._id}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(`/api/donaciones/${donacion._id}`, {
        method: "DELETE",
      });

      const resultado = await response.json();

      if (!response.ok || !resultado.success) {
        throw new Error(
          resultado.message ?? "No fue posible eliminar la donación."
        );
      }

      setDonaciones((actuales) =>
        actuales.filter((item) => item._id !== donacion._id)
      );

      setTipoMensaje("exito");

      setMensaje("La donación fue eliminada correctamente.");
    } catch (error) {
      console.error("Error eliminando donación:", error);

      setTipoMensaje("error");

      setMensaje(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar la donación."
      );
    }
  }

  /*
   * ==========================================
   * FILTROS
   * ==========================================
   */

  function limpiarFiltros() {
    setBusqueda("");
    setEstado("");
    setMetodoPago("");
    setCatastrofeId("");
  }

  function limpiarMensaje() {
    setMensaje("");
  }

  /*
   * ==========================================
   * FORMATO DE MONEDA
   * ==========================================
   */

  function formatearMonto(monto: number) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(monto);
  }

  /*
   * ==========================================
   * NOMBRE DE USUARIO
   * ==========================================
   */

  function obtenerNombreUsuario(usuarioId: string) {
    const usuario = usuarios.find(
      (item) => String(item._id) === String(usuarioId)
    );

    /*
     * Para USUARIO no consultamos /api/usuarios.
     * Si no encontramos el nombre, mostramos
     * solamente el identificador.
     */
    if (!usuario) {
      if (user && String(user._id) === String(usuarioId)) {
        return [user.nombre, user.apellido].filter(Boolean).join(" ") || "Tú";
      }

      return usuarioId;
    }

    const nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ");

    return nombre || usuario.correo || usuarioId;
  }

  /*
   * ==========================================
   * TÍTULO DE CATÁSTROFE
   * ==========================================
   */

  function obtenerTituloCatastrofe(catastrofeId: string) {
    const catastrofe = catastrofes.find(
      (item) => String(item._id) === String(catastrofeId)
    );

    return catastrofe?.titulo ?? catastrofeId;
  }

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <DashboardLayout>
      <div className="donaciones-page">
        {/* ====================================
            ENCABEZADO
        ===================================== */}

        <div className="donaciones-page-header">
          <div>
            <span className="donaciones-page-kicker">SGRICN</span>

            <h1>Donaciones</h1>

            <p>
              {puedeRegistrar
                ? "Realiza una donación para apoyar la atención de las catástrofes."
                : "Consulta las donaciones destinadas a la atención de las catástrofes."}
            </p>
          </div>

          {puedeRegistrar && (
            <button
              type="button"
              className="donaciones-btn-primary"
              onClick={abrirNuevaDonacion}
            >
              <span>+</span>
              Nueva donación
            </button>
          )}
        </div>

        {/* ====================================
            MENSAJE
        ===================================== */}

        {mensaje && (
          <div
            className={`donaciones-alert ${
              tipoMensaje === "exito"
                ? "donaciones-alert-success"
                : "donaciones-alert-error"
            }`}
          >
            <span>{tipoMensaje === "exito" ? "✓" : "⚠️"}</span>

            <p>{mensaje}</p>

            <button
              type="button"
              onClick={limpiarMensaje}
              aria-label="Cerrar mensaje"
            >
              ×
            </button>
          </div>
        )}

        {/* ====================================
            ESTADÍSTICAS
        ===================================== */}

        <section className="donaciones-stats">
          <article className="donaciones-stat-card">
            <div className="donaciones-stat-icon">💰</div>

            <div>
              <span>Total donaciones</span>

              <strong>{estadisticas.total}</strong>
            </div>
          </article>

          <article className="donaciones-stat-card">
            <div className="donaciones-stat-icon">✓</div>

            <div>
              <span>Donaciones aprobadas</span>

              <strong>{estadisticas.aprobadas}</strong>
            </div>
          </article>

          <article className="donaciones-stat-card">
            <div className="donaciones-stat-icon">⏳</div>

            <div>
              <span>Pendientes</span>

              <strong>{estadisticas.pendientes}</strong>
            </div>
          </article>

          <article className="donaciones-stat-card">
            <div className="donaciones-stat-icon">📊</div>

            <div>
              <span>Total recaudado</span>

              <strong>{formatearMonto(estadisticas.montoAprobado)}</strong>
            </div>
          </article>
        </section>

        {/* ====================================
            FILTROS
        ===================================== */}

        <DonacionFilters
          donaciones={donaciones}
          catastrofes={catastrofes}
          busqueda={busqueda}
          estado={estado}
          metodoPago={metodoPago}
          catastrofeId={catastrofeId}
          onBusquedaChange={setBusqueda}
          onEstadoChange={setEstado}
          onMetodoPagoChange={setMetodoPago}
          onCatastrofeChange={setCatastrofeId}
          onLimpiar={limpiarFiltros}
        />

        {/* ====================================
            CONTENIDO
        ===================================== */}

        {cargando ? (
          <div className="donaciones-loading">
            <div className="donaciones-loading-spinner">⏳</div>

            <h3>Cargando donaciones...</h3>

            <p>Estamos consultando la información registrada en el sistema.</p>
          </div>
        ) : errorCarga ? (
          <div className="donaciones-error">
            <div className="donaciones-error-icon">⚠️</div>

            <h3>No fue posible cargar la información</h3>

            <p>{errorCarga}</p>

            <button
              type="button"
              className="donaciones-btn-secondary"
              onClick={() => void cargarDatos()}
            >
              ↻ Intentar nuevamente
            </button>
          </div>
        ) : (
          <>
            <div className="donaciones-results-header">
              <div>
                <h2>
                  {role === "USUARIO"
                    ? "Mis donaciones"
                    : "Donaciones registradas"}
                </h2>

                <p>
                  Mostrando <strong>{donacionesFiltradas.length}</strong> de{" "}
                  <strong>{donaciones.length}</strong> donaciones.
                </p>
              </div>

              {estadisticas.montoTotal > 0 && (
                <div className="donaciones-total-info">
                  <span>Monto registrado</span>

                  <strong>{formatearMonto(estadisticas.montoTotal)}</strong>
                </div>
              )}
            </div>

            {donacionesFiltradas.length === 0 ? (
              <div className="donaciones-empty">
                <div className="donaciones-empty-icon">💰</div>

                <h3>
                  {role === "USUARIO"
                    ? "Aún no tienes donaciones"
                    : "No se encontraron donaciones"}
                </h3>

                <p>
                  {role === "USUARIO"
                    ? "Puedes realizar una nueva donación para apoyar la atención de las catástrofes."
                    : "No existen donaciones que coincidan con los filtros seleccionados."}
                </p>

                {role === "USUARIO" && (
                  <button
                    type="button"
                    className="donaciones-btn-primary"
                    onClick={abrirNuevaDonacion}
                  >
                    <span>+</span>
                    Realizar una donación
                  </button>
                )}

                {role !== "USUARIO" && (
                  <button
                    type="button"
                    className="donaciones-btn-secondary"
                    onClick={limpiarFiltros}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="donaciones-grid">
                {donacionesFiltradas.map((donacion) => (
                  <DonacionCard
                    key={donacion._id}
                    donacion={donacion}
                    nombreUsuario={obtenerNombreUsuario(donacion.usuarioId)}
                    tituloCatastrofe={obtenerTituloCatastrofe(
                      donacion.catastrofeId
                    )}
                    /*
                     * Las donaciones no pueden
                     * editarse ni eliminarse desde
                     * la interfaz.
                     *
                     * La API también bloquea PUT
                     * y DELETE para preservar la
                     * trazabilidad.
                     */
                    onEditar={undefined}
                    onEliminar={undefined}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ====================================
            MODAL DE NUEVA DONACIÓN
        ===================================== */}

        {puedeRegistrar && (
          <DonacionModal
            abierto={modalAbierto}
            titulo="Nueva donación"
            onCerrar={cerrarModal}
          >
            <DonacionForm
              donacion={null}
              usuarios={usuarios}
              catastrofes={catastrofes}
              onGuardado={manejarGuardado}
              onCancelar={cerrarModal}
            />
          </DonacionModal>
        )}
      </div>
    </DashboardLayout>
  );
}
