"use client";

interface ConfiguracionCardProps {
  titulo: string;
  valor: string;
  descripcion: string;
  icono: string;
}

export default function ConfiguracionCard({
  titulo,
  valor,
  descripcion,
  icono,
}: ConfiguracionCardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dfe4ea",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          minWidth: "44px",
          borderRadius: "10px",
          background: "#eaf1fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "21px",
        }}
      >
        {icono}
      </div>

      <div>
        <p
          style={{
            margin: 0,
            color: "#5f6b7a",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {titulo}
        </p>

        <p
          style={{
            margin: "5px 0",
            color: "#00245f",
            fontSize: "18px",
            fontWeight: 700,
          }}
        >
          {valor}
        </p>

        <p
          style={{
            margin: 0,
            color: "#5f6b7a",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          {descripcion}
        </p>
      </div>
    </div>
  );
}
