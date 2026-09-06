import { Catastrofe } from "@/types/catastrofes";
import CatastrofeCard from "./CatastrofeCard";

interface CatastrofeListProps {
  catastrofes: Catastrofe[];
  onView?: (catastrofe: Catastrofe) => void;
}

export default function CatastrofeList({
  catastrofes,
  onView,
}: CatastrofeListProps) {
  /*
   * Si no existen registros después de aplicar
   * los filtros, mostramos un mensaje informativo.
   */

  if (catastrofes.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "40px",
            marginBottom: "12px",
          }}
        >
          🔎
        </div>

        <h3
          style={{
            margin: "0 0 8px",
            color: "#003893",
          }}
        >
          No se encontraron catástrofes
        </h3>

        <p
          style={{
            margin: 0,
            color: "#6c757d",
          }}
        >
          No hay registros que coincidan con los filtros seleccionados.
        </p>
      </div>
    );
  }

  /*
   * Cuando existen catástrofes,
   * creamos una tarjeta por cada registro.
   */

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
        gap: "20px",
      }}
    >
      {catastrofes.map((catastrofe) => (
        <CatastrofeCard
          key={catastrofe._id}
          catastrofe={catastrofe}
          onView={onView}
        />
      ))}
    </div>
  );
}
