"use client";

interface ReporteStatCardProps {
  titulo: string;
  valor: string | number;
  descripcion: string;
  icono: string;
  variante: "primary" | "success" | "warning" | "danger";
}

export default function ReporteStatCard({
  titulo,
  valor,
  descripcion,
  icono,
  variante,
}: ReporteStatCardProps) {
  const valorMostrado =
    typeof valor === "number" ? valor.toLocaleString("es-CO") : valor || "0";

  return (
    <article
      className={`reporte-stat-card reporte-stat-card-${variante}`}
      aria-label={`${titulo}: ${valorMostrado}`}
    >
      <div className="reporte-stat-card-header">
        <div className="reporte-stat-card-icon" aria-hidden="true">
          {icono}
        </div>
      </div>

      <div className="reporte-stat-card-content">
        <span className="reporte-stat-card-title">{titulo}</span>

        <strong className="reporte-stat-card-value">{valorMostrado}</strong>

        <span className="reporte-stat-card-description">{descripcion}</span>
      </div>
    </article>
  );
}
