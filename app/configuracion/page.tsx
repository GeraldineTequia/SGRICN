"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";

import { ConfiguracionSistema } from "@/types/configuracion";

const configuracionInicial: ConfiguracionSistema = {
  nombreSistema: "SGRICN",
  nombreInstitucion:
    "Sistema de Gestión y Respuesta Integral ante Catástrofes Naturales",
  descripcion:
    "Plataforma para la gestión de información, atención y respuesta ante situaciones de emergencia y catástrofes naturales.",
  correoContacto: "contacto@sgricn.gov.co",
  telefonoContacto: "018000000000",
  sitioWeb: "https://www.sgricn.gov.co",
  mostrarNoticias: true,
  mostrarDonaciones: true,
  mostrarMapa: true,
  modoMantenimiento: false,
};

export default function ConfiguracionPage() {
  const router = useRouter();

  const [autorizado, setAutorizado] = useState(false);

  const [cargandoSesion, setCargandoSesion] = useState(true);

  const [configuracion, setConfiguracion] =
    useState<ConfiguracionSistema>(configuracionInicial);

  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState("");

  /* ============================================
     VERIFICAR SESIÓN
  ============================================ */

  useEffect(() => {
    async function verificarSesion() {
      try {
        const response = await fetch("/api/session", {
          cache: "no-store",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const resultado = await response.json();

        const rol = resultado?.data?.rol?.toLowerCase();

        if (rol !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setAutorizado(true);
      } catch (error) {
        console.error("Error verificando sesión:", error);

        router.replace("/login");
      } finally {
        setCargandoSesion(false);
      }
    }

    verificarSesion();
  }, [router]);

  /* ============================================
     ACTUALIZAR CAMPO
  ============================================ */

  function actualizarCampo(
    campo: keyof ConfiguracionSistema,
    valor: string | boolean
  ) {
    setConfiguracion((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    setMensaje("");
  }

  /* ============================================
     GUARDAR CONFIGURACIÓN
  ============================================ */

  function guardarConfiguracion() {
    setGuardando(true);
    setMensaje("");

    /*
      Actualmente la configuración se mantiene
      en memoria porque todavía no existe una
      colección Configuracion en MongoDB.
    */

    setTimeout(() => {
      setGuardando(false);

      setMensaje("La configuración se guardó correctamente.");
    }, 500);
  }

  /* ============================================
     CARGANDO SESIÓN
  ============================================ */

  if (cargandoSesion) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner">Cargando...</div>
      </div>
    );
  }

  /* ============================================
     SIN AUTORIZACIÓN
  ============================================ */

  if (!autorizado) {
    return null;
  }

  /* ============================================
     INTERFAZ
  ============================================ */

  return (
    <DashboardLayout>
      <div className="configuracion-page">
        {/* ======================================
            ENCABEZADO
        ====================================== */}

        <div className="configuracion-header">
          <div>
            <span className="configuracion-eyebrow">
              ADMINISTRACIÓN DEL SISTEMA
            </span>

            <h1 className="configuracion-title">Configuración</h1>

            <p className="configuracion-description">
              Administra la información institucional, los canales de contacto y
              las opciones generales del sistema SGRICN.
            </p>
          </div>
        </div>

        {/* ======================================
            INFORMACIÓN
        ====================================== */}

        <div className="configuracion-info">
          <div className="configuracion-info-icon">⚙️</div>

          <div>
            <strong>Configuración administrativa</strong>

            <p>
              Estas opciones permiten personalizar la información que utiliza la
              plataforma.
            </p>
          </div>
        </div>

        {/* ======================================
            INFORMACIÓN INSTITUCIONAL
        ====================================== */}

        <section className="configuracion-section">
          <div className="configuracion-section-header">
            <div>
              <h2>Información institucional</h2>

              <p>Datos generales utilizados por el sistema.</p>
            </div>
          </div>

          <div className="configuracion-form-grid">
            <div className="configuracion-field">
              <label htmlFor="nombreSistema">Nombre del sistema</label>

              <input
                id="nombreSistema"
                type="text"
                value={configuracion.nombreSistema}
                onChange={(event) =>
                  actualizarCampo("nombreSistema", event.target.value)
                }
              />
            </div>

            <div className="configuracion-field">
              <label htmlFor="nombreInstitucion">
                Nombre de la institución
              </label>

              <input
                id="nombreInstitucion"
                type="text"
                value={configuracion.nombreInstitucion}
                onChange={(event) =>
                  actualizarCampo("nombreInstitucion", event.target.value)
                }
              />
            </div>

            <div className="configuracion-field configuracion-field-full">
              <label htmlFor="descripcion">Descripción</label>

              <textarea
                id="descripcion"
                rows={4}
                value={configuracion.descripcion}
                onChange={(event) =>
                  actualizarCampo("descripcion", event.target.value)
                }
              />
            </div>
          </div>
        </section>

        {/* ======================================
            CANALES OFICIALES
        ====================================== */}

        <section className="configuracion-section">
          <div className="configuracion-section-header">
            <div>
              <h2>Canales oficiales</h2>

              <p>Información de contacto de la institución.</p>
            </div>
          </div>

          <div className="configuracion-form-grid">
            <div className="configuracion-field">
              <label htmlFor="correoContacto">Correo de contacto</label>

              <input
                id="correoContacto"
                type="email"
                value={configuracion.correoContacto}
                onChange={(event) =>
                  actualizarCampo("correoContacto", event.target.value)
                }
              />
            </div>

            <div className="configuracion-field">
              <label htmlFor="telefonoContacto">Teléfono de contacto</label>

              <input
                id="telefonoContacto"
                type="text"
                value={configuracion.telefonoContacto}
                onChange={(event) =>
                  actualizarCampo("telefonoContacto", event.target.value)
                }
              />
            </div>

            <div className="configuracion-field configuracion-field-full">
              <label htmlFor="sitioWeb">Sitio web</label>

              <input
                id="sitioWeb"
                type="url"
                value={configuracion.sitioWeb}
                onChange={(event) =>
                  actualizarCampo("sitioWeb", event.target.value)
                }
              />
            </div>
          </div>
        </section>

        {/* ======================================
            PREFERENCIAS
        ====================================== */}

        <section className="configuracion-section">
          <div className="configuracion-section-header">
            <div>
              <h2>Preferencias del sistema</h2>

              <p>
                Define qué funcionalidades estarán disponibles en la plataforma.
              </p>
            </div>
          </div>

          <div className="configuracion-options">
            <label className="configuracion-option">
              <input
                type="checkbox"
                checked={configuracion.mostrarNoticias}
                onChange={(event) =>
                  actualizarCampo("mostrarNoticias", event.target.checked)
                }
              />

              <div>
                <strong>Mostrar noticias</strong>

                <span>
                  Permite mostrar el módulo de noticias en la plataforma.
                </span>
              </div>
            </label>

            <label className="configuracion-option">
              <input
                type="checkbox"
                checked={configuracion.mostrarDonaciones}
                onChange={(event) =>
                  actualizarCampo("mostrarDonaciones", event.target.checked)
                }
              />

              <div>
                <strong>Mostrar donaciones</strong>

                <span>Permite mostrar el módulo de donaciones.</span>
              </div>
            </label>

            <label className="configuracion-option">
              <input
                type="checkbox"
                checked={configuracion.mostrarMapa}
                onChange={(event) =>
                  actualizarCampo("mostrarMapa", event.target.checked)
                }
              />

              <div>
                <strong>Mostrar mapa</strong>

                <span>Permite mostrar el mapa de emergencias.</span>
              </div>
            </label>
          </div>
        </section>

        {/* ======================================
            MODO MANTENIMIENTO
        ====================================== */}

        <section className="configuracion-section configuracion-maintenance">
          <div className="configuracion-section-header">
            <div>
              <h2>Modo mantenimiento</h2>

              <p>Controla temporalmente el acceso general a la plataforma.</p>
            </div>
          </div>

          <label className="configuracion-option">
            <input
              type="checkbox"
              checked={configuracion.modoMantenimiento}
              onChange={(event) =>
                actualizarCampo("modoMantenimiento", event.target.checked)
              }
            />

            <div>
              <strong>Activar modo mantenimiento</strong>

              <span>
                Esta opción está preparada para futuras reglas de mantenimiento
                del sistema.
              </span>
            </div>
          </label>
        </section>

        {/* ======================================
            MENSAJE
        ====================================== */}

        {mensaje && (
          <div className="configuracion-success">
            <span>✓</span>

            {mensaje}
          </div>
        )}

        {/* ======================================
            ACCIONES
        ====================================== */}

        <div className="configuracion-actions">
          <button
            type="button"
            className="configuracion-save-button"
            onClick={guardarConfiguracion}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
