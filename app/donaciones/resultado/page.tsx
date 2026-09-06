"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";

import { Donacion } from "@/types/donaciones";

const bancos = [
  "Bancolombia",
  "Banco de Bogotá",
  "Davivienda",
  "BBVA Colombia",
  "Banco de Occidente",
  "Banco Popular",
  "Scotiabank Colpatria",
];

export default function ResultadoDonacionPage() {
  const searchParams = useSearchParams();

  const donacionId = searchParams.get("donacionId");

  const [donacion, setDonacion] = useState<Donacion | null>(null);

  const [banco, setBanco] = useState("");

  const [tipoDocumento, setTipoDocumento] = useState("CC");

  const [numeroDocumento, setNumeroDocumento] = useState("");

  const [nombre, setNombre] = useState("");

  const [correo, setCorreo] = useState("");

  const [telefono, setTelefono] = useState("");

  const [loading, setLoading] = useState(true);

  const [procesando, setProcesando] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDonacion() {
      if (!donacionId) {
        setError("No se encontró la donación.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/donaciones");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "No se pudo obtener la donación.");
        }

        const encontrada = (data.data || []).find(
          (item: Donacion) => item._id === donacionId
        );

        if (!encontrada) {
          throw new Error("La donación no existe.");
        }

        setDonacion(encontrada);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar la donación."
        );
      } finally {
        setLoading(false);
      }
    }

    cargarDonacion();
  }, [donacionId]);

  async function procesarPago(resultado: "aprobada" | "rechazada") {
    if (!donacionId) {
      return;
    }

    setProcesando(true);
    setError("");

    try {
      const response = await fetch("/api/donaciones/simular", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donacionId,
          resultado,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo procesar el pago.");
      }

      setDonacion(data.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setProcesando(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="USUARIO">
        <div
          style={{
            padding: "50px",
            textAlign: "center",
          }}
        >
          Cargando simulador PSE...
        </div>
      </DashboardLayout>
    );
  }

  if (error && !donacion) {
    return (
      <DashboardLayout role="USUARIO">
        <div
          style={{
            background: "#fdecec",
            color: "#ce1126",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          {error}
        </div>
      </DashboardLayout>
    );
  }

  if (!donacion) {
    return null;
  }

  const monto = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(donacion.monto);

  const pagoFinalizado =
    donacion.estado === "aprobada" || donacion.estado === "rechazada";

  return (
    <DashboardLayout role="USUARIO">
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        {!pagoFinalizado ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
              border: "1px solid #dfe4ea",
            }}
          >
            <div
              style={{
                background: "#003893",
                color: "#ffffff",
                padding: "25px 30px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.85,
                }}
              >
                SIMULADOR DE PAGOS
              </div>

              <h1
                style={{
                  margin: "7px 0 0",
                  fontSize: "28px",
                }}
              >
                PSE
              </h1>
            </div>

            <div
              style={{
                padding: "30px",
              }}
            >
              <div
                style={{
                  background: "#f5f7fa",
                  borderRadius: "10px",
                  padding: "18px",
                  marginBottom: "25px",
                }}
              >
                <div
                  style={{
                    color: "#5f6b7a",
                    fontSize: "13px",
                  }}
                >
                  Valor de la donación
                </div>

                <strong
                  style={{
                    display: "block",
                    fontSize: "28px",
                    color: "#00245f",
                    marginTop: "5px",
                  }}
                >
                  {monto}
                </strong>

                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "#5f6b7a",
                  }}
                >
                  Referencia: {donacion.referencia}
                </div>
              </div>

              <h2
                style={{
                  color: "#00245f",
                  fontSize: "20px",
                  marginBottom: "18px",
                }}
              >
                Información para PSE
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    Banco
                  </label>

                  <select
                    value={banco}
                    onChange={(event) => setBanco(event.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #cbd3dc",
                      borderRadius: "8px",
                    }}
                  >
                    <option value="">Selecciona tu banco</option>

                    {bancos.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "150px 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 700,
                        marginBottom: "6px",
                      }}
                    >
                      Documento
                    </label>

                    <select
                      value={tipoDocumento}
                      onChange={(event) => setTipoDocumento(event.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #cbd3dc",
                        borderRadius: "8px",
                      }}
                    >
                      <option value="CC">CC</option>

                      <option value="CE">CE</option>

                      <option value="NIT">NIT</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 700,
                        marginBottom: "6px",
                      }}
                    >
                      Número
                    </label>

                    <input
                      value={numeroDocumento}
                      onChange={(event) =>
                        setNumeroDocumento(event.target.value)
                      }
                      placeholder="123456789"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #cbd3dc",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    Nombre completo
                  </label>

                  <input
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    placeholder="Nombre del titular"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #cbd3dc",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    Correo electrónico
                  </label>

                  <input
                    type="email"
                    value={correo}
                    onChange={(event) => setCorreo(event.target.value)}
                    placeholder="correo@ejemplo.com"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #cbd3dc",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    Teléfono
                  </label>

                  <input
                    value={telefono}
                    onChange={(event) => setTelefono(event.target.value)}
                    placeholder="3001234567"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #cbd3dc",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                {error && (
                  <div
                    style={{
                      background: "#fdecec",
                      color: "#ce1126",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    {error}
                  </div>
                )}

                <div
                  style={{
                    background: "#fff8dc",
                    border: "1px solid #fcd116",
                    padding: "14px",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <strong>Simulación PSE</strong>

                  <p
                    style={{
                      margin: "6px 0 0",
                    }}
                  >
                    No introduzcas información bancaria real. Este proceso es
                    exclusivamente académico.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    procesando ||
                    !banco ||
                    !numeroDocumento ||
                    !nombre ||
                    !correo ||
                    !telefono
                  }
                  onClick={() => setError("")}
                  style={{
                    padding: "14px",
                    border: "none",
                    borderRadius: "8px",
                    background:
                      !banco ||
                      !numeroDocumento ||
                      !nombre ||
                      !correo ||
                      !telefono
                        ? "#9aa7b5"
                        : "#003893",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Continuar con el pago
                </button>
              </div>

              <div
                style={{
                  marginTop: "25px",
                  paddingTop: "20px",
                  borderTop: "1px solid #dfe4ea",
                  textAlign: "center",
                  color: "#5f6b7a",
                  fontSize: "13px",
                }}
              >
                🔒 Conexión segura · Simulador académico
              </div>

              {/* Panel de simulación */}
              {banco && numeroDocumento && nombre && correo && telefono && (
                <div
                  style={{
                    marginTop: "25px",
                    border: "2px solid #003893",
                    borderRadius: "12px",
                    padding: "22px",
                    background: "#eef5ff",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 8px",
                      color: "#00245f",
                    }}
                  >
                    Simulación de autorización
                  </h3>

                  <p
                    style={{
                      color: "#5f6b7a",
                      fontSize: "14px",
                    }}
                  >
                    Selecciona qué resultado quieres simular para esta
                    transacción.
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={() => procesarPago("aprobada")}
                      style={{
                        padding: "14px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#198754",
                        color: "#ffffff",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ✓ Aprobar pago
                    </button>

                    <button
                      type="button"
                      disabled={procesando}
                      onClick={() => procesarPago("rechazada")}
                      style={{
                        padding: "14px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#ce1126",
                        color: "#ffffff",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ✕ Rechazar pago
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "45px 30px",
              textAlign: "center",
              border: "1px solid #dfe4ea",
              boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
                background:
                  donacion.estado === "aprobada" ? "#e8f7ee" : "#fdecec",
              }}
            >
              {donacion.estado === "aprobada" ? "✓" : "✕"}
            </div>

            <h1
              style={{
                color: donacion.estado === "aprobada" ? "#198754" : "#ce1126",
                marginBottom: "10px",
              }}
            >
              {donacion.estado === "aprobada"
                ? "Donación aprobada"
                : "Donación rechazada"}
            </h1>

            <p
              style={{
                color: "#5f6b7a",
                marginBottom: "25px",
              }}
            >
              {donacion.estado === "aprobada"
                ? "La simulación del pago fue exitosa."
                : "La simulación indica que el pago fue rechazado."}
            </p>

            <div
              style={{
                maxWidth: "450px",
                margin: "0 auto",
                background: "#f5f7fa",
                borderRadius: "10px",
                padding: "20px",
                textAlign: "left",
              }}
            >
              <div>
                <strong>Referencia:</strong> {donacion.referencia}
              </div>

              <div
                style={{
                  marginTop: "8px",
                }}
              >
                <strong>Transacción:</strong> {donacion.transaccionId}
              </div>

              <div
                style={{
                  marginTop: "8px",
                }}
              >
                <strong>Monto:</strong> {monto}
              </div>

              <div
                style={{
                  marginTop: "8px",
                }}
              >
                <strong>Método:</strong> {donacion.metodoPago}
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontWeight: 700,
                  color: donacion.estado === "aprobada" ? "#198754" : "#ce1126",
                }}
              >
                Estado: {donacion.estado.toUpperCase()}
              </div>
            </div>

            <button
              type="button"
              onClick={() => (window.location.href = "/donaciones")}
              style={{
                marginTop: "25px",
                padding: "13px 25px",
                border: "none",
                borderRadius: "8px",
                background: "#003893",
                color: "#ffffff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Volver a donaciones
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
