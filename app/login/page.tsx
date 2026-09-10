"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setCargando(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No fue posible iniciar sesión.");
        return;
      }

      // La API ya creó la cookie de sesión.
      // Ahora enviamos al usuario al dashboard.
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error iniciando sesión:", error);

      setError("No fue posible conectarse con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "linear-gradient(135deg, #003893 0%, #0056b3 100%)",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "430px",
          padding: "35px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "65px",
              height: "65px",
              background: "#fcd116",
              borderRadius: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              margin: "0 auto 15px",
            }}
          >
            🚨
          </div>

          <h1
            style={{
              margin: 0,
              color: "#003893",
            }}
          >
            Ayuda Emergencia
          </h1>

          <p
            style={{
              color: "#6c757d",
              fontSize: "14px",
            }}
          >
            Sistema de gestión de emergencias
          </p>
        </div>

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 15px",
              borderRadius: "8px",
              background: "#fdeaea",
              border: "1px solid #ce1126",
              color: "#a00d1d",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Correo electrónico
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #dfe4ea",
              marginBottom: "18px",
              boxSizing: "border-box",
            }}
            placeholder="correo@ejemplo.com"
          />

          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Contraseña
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #dfe4ea",
              marginBottom: "22px",
              boxSizing: "border-box",
            }}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            disabled={cargando}
            style={{
              width: "100%",
            }}
          >
            {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "22px",
            fontSize: "14px",
          }}
        >
          ¿No tienes una cuenta?{" "}
          <Link
            href="/registro"
            style={{
              color: "#003893",
              fontWeight: 700,
            }}
          >
            Regístrate
          </Link>
        </div>
      </div>
    </main>
  );
}
