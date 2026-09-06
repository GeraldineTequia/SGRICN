"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function RegistroPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  function updateField(field: keyof typeof form, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setExito("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    try {
      setCargando(true);

      const response = await fetch("/api/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No fue posible crear la cuenta.");
        return;
      }

      setExito(
        "Cuenta creada correctamente. Redirigiendo al inicio de sesión..."
      );

      setForm({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Error registrando usuario:", error);

      setError("No fue posible conectarse con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#f5f7fa",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "35px",
        }}
      >
        <h1
          style={{
            color: "#003893",
            marginTop: 0,
          }}
        >
          Crear cuenta
        </h1>

        <p
          style={{
            color: "#6c757d",
          }}
        >
          Regístrate para solicitar ayuda ante una emergencia.
        </p>

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px 15px",
              borderRadius: "8px",
              background: "#fdeaea",
              border: "1px solid #ce1126",
              color: "#a00d1d",
            }}
          >
            {error}
          </div>
        )}

        {exito && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px 15px",
              borderRadius: "8px",
              background: "#eaf7ef",
              border: "1px solid #198754",
              color: "#146c43",
            }}
          >
            {exito}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "15px",
            }}
          >
            <div>
              <label htmlFor="nombre">Nombre</label>

              <input
                id="nombre"
                value={form.nombre}
                onChange={(e) => updateField("nombre", e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="apellido">Apellido</label>

              <input
                id="apellido"
                value={form.apellido}
                onChange={(e) => updateField("apellido", e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: "15px" }}>
            <label htmlFor="email">Correo electrónico</label>

            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: "15px" }}>
            <label htmlFor="password">Contraseña</label>

            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
              minLength={6}
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: "15px" }}>
            <label htmlFor="confirmPassword">Confirmar contraseña</label>

            <input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              required
              minLength={6}
              style={inputStyle}
            />
          </div>

          <div
            style={{
              marginTop: "25px",
            }}
          >
            <Button
              type="submit"
              disabled={cargando}
              style={{
                width: "100%",
              }}
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </div>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            marginTop: "20px",
          }}
        >
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            style={{
              color: "#003893",
              fontWeight: 700,
            }}
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #dfe4ea",
  marginTop: "7px",
};
