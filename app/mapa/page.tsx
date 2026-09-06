"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import EmergencyMap from "@/components/map/EmergencyMap";
import { useAuth } from "@/components/auth/AuthProvider";

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

interface MapaResponse {
  success: boolean;
  data?: {
    catastrofes: PuntoMapa[];
    zonas: PuntoMapa[];
    centros: PuntoMapa[];
  };
  message?: string;
}

export default function MapaPage() {
  const { user, role, loading: authLoading } = useAuth();

  const [catastrofes, setCatastrofes] = useState<PuntoMapa[]>([]);
  const [zonas, setZonas] = useState<PuntoMapa[]>([]);
  const [centros, setCentros] = useState<PuntoMapa[]>([]);

  const [mostrarCatastrofes, setMostrarCatastrofes] = useState(true);
  const [mostrarZonas, setMostrarZonas] = useState(true);
  const [mostrarCentros, setMostrarCentros] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarMapa = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/mapa", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const resultado: MapaResponse = await response.json();

      if (!response.ok || !resultado.success || !resultado.data) {
        throw new Error(
          resultado.message || "No fue posible cargar la información del mapa."
        );
      }

      setCatastrofes(resultado.data.catastrofes || []);
      setZonas(resultado.data.zonas || []);
      setCentros(resultado.data.centros || []);
    } catch (err) {
      console.error("Error cargando mapa:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cargar la información del mapa."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && role) {
      cargarMapa();
    }
  }, [authLoading, user, role, cargarMapa]);

  const totalPuntos = useMemo(() => {
    return catastrofes.length + zonas.length + centros.length;
  }, [catastrofes.length, zonas.length, centros.length]);

  const zonasCriticas = useMemo(() => {
    return zonas.filter((zona) => {
      const nivel = zona.nivelEmergencia
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      return nivel === "critico";
    }).length;
  }, [zonas]);

  /*
   * EmergencyMap no recibe props booleanas para controlar
   * visibilidad. Por eso filtramos aquí las capas que se
   * enviarán al componente.
   */
  const catastrofesVisibles = useMemo(() => {
    return mostrarCatastrofes ? catastrofes : [];
  }, [mostrarCatastrofes, catastrofes]);

  const zonasVisibles = useMemo(() => {
    return mostrarZonas ? zonas : [];
  }, [mostrarZonas, zonas]);

  const centrosVisibles = useMemo(() => {
    return mostrarCentros ? centros : [];
  }, [mostrarCentros, centros]);

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f6f8",
          color: "#003893",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Cargando...
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  return (
    <DashboardLayout>
      <div
        style={{
          width: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            marginBottom: "22px",
          }}
        >
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
              <h1
                style={{
                  margin: 0,
                  color: "#00245f",
                  fontSize: "30px",
                  fontWeight: 700,
                }}
              >
                Mapa de emergencias
              </h1>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#5f6b7a",
                  fontSize: "15px",
                }}
              >
                Consulta la ubicación de las catástrofes, zonas afectadas y
                centros de donación registrados en SGRICN.
              </p>
            </div>

            <button
              type="button"
              onClick={cargarMapa}
              disabled={loading}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                background: loading ? "#9aa5b1" : "#003893",
                color: "#ffffff",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              {loading ? "Actualizando..." : "↻ Actualizar mapa"}
            </button>
          </div>
        </div>

        {/* Tarjetas resumen */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <article
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              borderLeft: "5px solid #ce1126",
            }}
          >
            <div
              style={{
                color: "#6c757d",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Catástrofes
            </div>

            <div
              style={{
                color: "#00245f",
                fontSize: "28px",
                fontWeight: 700,
                marginTop: "5px",
              }}
            >
              {catastrofes.length}
            </div>
          </article>

          <article
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              borderLeft: "5px solid #fcd116",
            }}
          >
            <div
              style={{
                color: "#6c757d",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Zonas afectadas
            </div>

            <div
              style={{
                color: "#00245f",
                fontSize: "28px",
                fontWeight: 700,
                marginTop: "5px",
              }}
            >
              {zonas.length}
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "12px",
                color: "#ce1126",
                fontWeight: 600,
              }}
            >
              {zonasCriticas} críticas
            </div>
          </article>

          <article
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              borderLeft: "5px solid #198754",
            }}
          >
            <div
              style={{
                color: "#6c757d",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Centros de donación
            </div>

            <div
              style={{
                color: "#00245f",
                fontSize: "28px",
                fontWeight: 700,
                marginTop: "5px",
              }}
            >
              {centros.length}
            </div>
          </article>

          <article
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              borderLeft: "5px solid #003893",
            }}
          >
            <div
              style={{
                color: "#6c757d",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Puntos geográficos
            </div>

            <div
              style={{
                color: "#00245f",
                fontSize: "28px",
                fontWeight: 700,
                marginTop: "5px",
              }}
            >
              {totalPuntos}
            </div>
          </article>
        </div>

        {/* Filtros */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "18px 20px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#00245f",
                  fontSize: "17px",
                }}
              >
                Capas del mapa
              </h2>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#6c757d",
                  fontSize: "12px",
                }}
              >
                Selecciona la información que deseas visualizar.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: mostrarCatastrofes ? "#fdecef" : "#f1f3f5",
                  color: mostrarCatastrofes ? "#ce1126" : "#6c757d",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={mostrarCatastrofes}
                  onChange={(event) =>
                    setMostrarCatastrofes(event.target.checked)
                  }
                />
                🚨 Catástrofes
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: mostrarZonas ? "#fff9df" : "#f1f3f5",
                  color: mostrarZonas ? "#8a6d00" : "#6c757d",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={mostrarZonas}
                  onChange={(event) => setMostrarZonas(event.target.checked)}
                />
                📍 Zonas afectadas
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: mostrarCentros ? "#edf8f1" : "#f1f3f5",
                  color: mostrarCentros ? "#198754" : "#6c757d",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={mostrarCentros}
                  onChange={(event) => setMostrarCentros(event.target.checked)}
                />
                🏥 Centros
              </label>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            role="alert"
            style={{
              background: "#fdecef",
              color: "#a50e20",
              border: "1px solid #f3b6bf",
              borderRadius: "10px",
              padding: "14px 16px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            <strong>No fue posible cargar el mapa.</strong>

            <div style={{ marginTop: "4px" }}>{error}</div>
          </div>
        )}

        {/* Mapa */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {loading ? (
            <div
              style={{
                height: "650px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                color: "#003893",
                background: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  border: "4px solid #dce5f2",
                  borderTopColor: "#003893",
                  borderRadius: "50%",
                  animation: "sgricn-map-spin 0.8s linear infinite",
                }}
              />

              <span style={{ fontWeight: 600 }}>
                Cargando información geográfica...
              </span>
            </div>
          ) : (
            <EmergencyMap
              catastrofes={catastrofesVisibles}
              zonas={zonasVisibles}
              centros={centrosVisibles}
              height="650px"
            />
          )}
        </section>

        {/* Información inferior */}
        <div
          style={{
            marginTop: "16px",
            padding: "14px 16px",
            background: "#eef4fb",
            borderRadius: "10px",
            borderLeft: "4px solid #003893",
            color: "#344054",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "#00245f" }}>Información del mapa:</strong>{" "}
          las ubicaciones se obtienen directamente de los registros de SGRICN.
          Las coordenadas geográficas utilizan el formato GeoJSON [longitud,
          latitud].
        </div>
      </div>

      <style jsx>{`
        @keyframes sgricn-map-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
