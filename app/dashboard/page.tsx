"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmergencyMap from "@/components/map/EmergencyMap";
import StatCard from "@/components/dashboard/StatCard";
import EmergencyCard from "@/components/dashboard/EmergencyCard";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Catastrofe } from "@/types/catastrofes";

interface PuntoMapa {
  _id: string;
  tipo: "catastrofe" | "zona" | "centro";
  titulo: string;
  subtitulo: string;
  descripcion: string;
  estado: string;
  nivelEmergencia: string;
  departamento: string;
  municipio: string;
  direccion: string;
  coordinates: [number, number];
  catastrofeId?: string;
  telefono?: string;
  correo?: string;
  horario?: string;
  tipoDonacion?: string[];
}

interface DashboardData {
  stats: {
    emergenciasActivas: number;
    zonasAfectadas: number;
    poblacionAfectada: number;
    necesidadesCriticas: number;
    funcionariosActivos?: number;
  };
  alertas: Array<{
    id: string;
    tipo: string;
    titulo: string;
    mensaje: string;
    fecha: string;
    nivel?: string;
  }>;
}

export default function DashboardPage() {
  const { role, user, loading } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  const [catastrofes, setCatastrofes] = useState<PuntoMapa[]>([]);
  const [zonas, setZonas] = useState<PuntoMapa[]>([]);
  const [centros, setCentros] = useState<PuntoMapa[]>([]);

  const [catastrofesCompletas, setCatastrofesCompletas] = useState<
    Catastrofe[]
  >([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading || !user || !role) {
      return;
    }

    async function cargarDashboard() {
      try {
        setCargando(true);
        setError("");

        const [dashboardResponse, mapaResponse, catastrofesResponse] =
          await Promise.all([
            fetch("/api/dashboard", {
              credentials: "include",
            }),

            fetch("/api/mapa", {
              credentials: "include",
            }),

            fetch("/api/catastrofes", {
              credentials: "include",
            }),
          ]);

        if (!dashboardResponse.ok) {
          throw new Error(
            "No fue posible cargar la información del dashboard."
          );
        }

        if (!mapaResponse.ok) {
          throw new Error("No fue posible cargar la información del mapa.");
        }

        if (!catastrofesResponse.ok) {
          throw new Error("No fue posible cargar las catástrofes.");
        }

        const dashboardJson = await dashboardResponse.json();
        const mapaJson = await mapaResponse.json();
        const catastrofesJson = await catastrofesResponse.json();

        if (!dashboardJson.success) {
          throw new Error(
            dashboardJson.message || "No fue posible cargar el dashboard."
          );
        }

        if (!mapaJson.success) {
          throw new Error(mapaJson.message || "No fue posible cargar el mapa.");
        }

        if (!catastrofesJson.success) {
          throw new Error(
            catastrofesJson.message || "No fue posible cargar las catástrofes."
          );
        }

        setDashboardData(dashboardJson.data);

        setCatastrofes(mapaJson.data.catastrofes || []);
        setZonas(mapaJson.data.zonas || []);
        setCentros(mapaJson.data.centros || []);

        setCatastrofesCompletas(catastrofesJson.data || []);
      } catch (err) {
        console.error("Error cargando dashboard:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar el dashboard."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarDashboard();
  }, [loading, role, user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#003893",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          Cargando sesión...
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !role) {
    return null;
  }

  if (cargando) {
    return (
      <DashboardLayout>
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "40px",
            }}
            aria-hidden="true"
          >
            ⏳
          </div>

          <p
            style={{
              margin: 0,
              color: "#5f6b7a",
              fontSize: "16px",
            }}
          >
            Cargando información del dashboard...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <section
          className="card"
          style={{
            padding: "30px",
            borderLeft: "5px solid #ce1126",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#ce1126",
            }}
          >
            No fue posible cargar el dashboard
          </h2>

          <p
            style={{
              color: "#5f6b7a",
              marginBottom: 0,
            }}
          >
            {error}
          </p>
        </section>
      </DashboardLayout>
    );
  }

  const stats = dashboardData?.stats || {
    emergenciasActivas: 0,
    zonasAfectadas: 0,
    poblacionAfectada: 0,
    necesidadesCriticas: 0,
    funcionariosActivos: 0,
  };

  const alertas = dashboardData?.alertas || [];

  /*
   * Solo mostramos las catástrofes activas en la sección
   * de emergencias del dashboard.
   */
  const emergenciasActivas = catastrofesCompletas.filter(
    (catastrofe) => catastrofe.estado === "activa"
  );

  /*
   * Convertimos una Catastrofe completa al formato que
   * necesita EmergencyMap.
   */
  const catastrofesMapa: PuntoMapa[] = catastrofes;

  /*
   * Función auxiliar para convertir una catástrofe de MongoDB
   * al objeto utilizado por EmergencyCard.
   *
   * IMPORTANTE:
   * Catastrofe utiliza "fuenteInformacion", no "fuente".
   */
  const convertirCatastrofeParaCard = (catastrofe: Catastrofe): Catastrofe => {
    return {
      _id: catastrofe._id,
      titulo: catastrofe.titulo,
      tipo: catastrofe.tipo,
      descripcion: catastrofe.descripcion,
      fechaInicio: catastrofe.fechaInicio,
      fechaActualizacion: catastrofe.fechaActualizacion,
      estado: catastrofe.estado,
      nivelEmergencia: catastrofe.nivelEmergencia,
      departamento: catastrofe.departamento,
      municipio: catastrofe.municipio,
      direccionReferencia: catastrofe.direccionReferencia,
      ubicacion: {
        type: "Point",
        coordinates: [
          Number(catastrofe.ubicacion.coordinates[0]),
          Number(catastrofe.ubicacion.coordinates[1]),
        ],
      },
      fuenteInformacion: catastrofe.fuenteInformacion,
      createdAt: catastrofe.createdAt,
      updatedAt: catastrofe.updatedAt,
    };
  };

  return (
    <DashboardLayout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* ENCABEZADO */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  color: "#5f6b7a",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                SISTEMA DE GESTIÓN Y RESPUESTA INTEGRAL
              </p>

              <h1
                style={{
                  margin: 0,
                  color: "#003893",
                  fontSize: "30px",
                }}
              >
                Dashboard
              </h1>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#5f6b7a",
                }}
              >
                Bienvenido,{" "}
                <strong>
                  {user.nombre} {user.apellido}
                </strong>
              </p>
            </div>

            <div
              style={{
                padding: "8px 14px",
                borderRadius: "20px",
                background: "#eef3fb",
                color: "#003893",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              {role}
            </div>
          </div>
        </section>

        {/* ESTADÍSTICAS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
          }}
        >
          <StatCard
            title="Emergencias activas"
            value={stats.emergenciasActivas}
            description="Catástrofes actualmente activas"
            icon="🚨"
            variant="danger"
          />

          <StatCard
            title="Zonas afectadas"
            value={stats.zonasAfectadas}
            description="Zonas registradas en el sistema"
            icon="📍"
            variant="warning"
          />

          <StatCard
            title="Población afectada"
            value={stats.poblacionAfectada}
            description="Personas registradas como afectadas"
            icon="👥"
            variant="primary"
          />

          <StatCard
            title="Necesidades críticas"
            value={stats.necesidadesCriticas}
            description="Necesidades que requieren atención"
            icon="⚠️"
            variant="danger"
          />

          {(role === "ADMIN" || role === "FUNCIONARIO") && (
            <StatCard
              title="Funcionarios activos"
              value={stats.funcionariosActivos || 0}
              description="Funcionarios disponibles"
              icon="🧑‍💼"
              variant="success"
            />
          )}
        </section>

        {/* MAPA */}
        <section>
          <div
            style={{
              marginBottom: "12px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#003893",
                fontSize: "22px",
              }}
            >
              Mapa de situación
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#5f6b7a",
              }}
            >
              Visualización geográfica de catástrofes, zonas afectadas y centros
              de donación.
            </p>
          </div>

          <EmergencyMap
            catastrofes={catastrofesMapa}
            zonas={zonas}
            centros={centros}
            height="600px"
          />
        </section>

        {/* EMERGENCIAS ACTIVAS */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              marginBottom: "14px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#003893",
                  fontSize: "22px",
                }}
              >
                Emergencias activas
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#5f6b7a",
                }}
              >
                Situaciones que actualmente requieren seguimiento.
              </p>
            </div>

            <span
              style={{
                padding: "6px 12px",
                borderRadius: "18px",
                background: "#fce8eb",
                color: "#ce1126",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              {emergenciasActivas.length} activas
            </span>
          </div>

          {emergenciasActivas.length === 0 ? (
            <div
              className="card"
              style={{
                padding: "28px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "38px",
                  marginBottom: "8px",
                }}
                aria-hidden="true"
              >
                ✅
              </div>

              <h3
                style={{
                  margin: "0 0 6px",
                  color: "#198754",
                }}
              >
                No hay emergencias activas
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#5f6b7a",
                }}
              >
                Actualmente no existen catástrofes registradas con estado
                activo.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "18px",
              }}
            >
              {emergenciasActivas.slice(0, 6).map((catastrofe) => (
                <EmergencyCard
                  key={catastrofe._id}
                  catastrofe={convertirCatastrofeParaCard(catastrofe)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ALERTAS */}
        <section>
          <div
            style={{
              marginBottom: "14px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#003893",
                fontSize: "22px",
              }}
            >
              Alertas recientes
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#5f6b7a",
              }}
            >
              Información que requiere atención o seguimiento.
            </p>
          </div>

          {alertas.length === 0 ? (
            <div
              className="card"
              style={{
                padding: "25px",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                }}
                aria-hidden="true"
              >
                🔔
              </span>

              <p
                style={{
                  margin: "10px 0 0",
                  color: "#5f6b7a",
                }}
              >
                No hay alertas recientes.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {alertas.slice(0, 8).map((alerta) => (
                <article
                  key={alerta.id}
                  className="card"
                  style={{
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "15px",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      fontSize: "24px",
                    }}
                  >
                    {alerta.tipo === "catastrofe"
                      ? "🚨"
                      : alerta.tipo === "necesidad"
                      ? "⚠️"
                      : "📰"}
                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 5px",
                        color: "#1f2937",
                        fontSize: "16px",
                      }}
                    >
                      {alerta.titulo}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#5f6b7a",
                        lineHeight: 1.5,
                      }}
                    >
                      {alerta.mensaje}
                    </p>

                    {alerta.nivel && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "8px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#ce1126",
                        }}
                      >
                        Nivel: {alerta.nivel}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* PIE DEL DASHBOARD */}
        <footer
          style={{
            padding: "18px 0 5px",
            borderTop: "1px solid #e5e7eb",
            color: "#6c757d",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          SGRICN · Sistema de Gestión y Respuesta Integral ante Catástrofes
          Naturales
        </footer>
      </div>
    </DashboardLayout>
  );
}
