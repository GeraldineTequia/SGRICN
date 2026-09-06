"use client";

interface PoblacionFiltersProps {
  busqueda: string;
  setBusqueda: (valor: string) => void;

  catastrofeFiltro: string;
  setCatastrofeFiltro: (valor: string) => void;

  catastrofes: {
    _id: string;
    titulo: string;
  }[];
}

export default function PoblacionFilters({
  busqueda,
  setBusqueda,
  catastrofeFiltro,
  setCatastrofeFiltro,
  catastrofes,
}: PoblacionFiltersProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dfe4ea",
        borderRadius: "12px",
        padding: "18px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(250px, 2fr) minmax(220px, 1fr)",
          gap: "14px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#17202a",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            Buscar
          </label>

          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              🔎
            </span>

            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="ID, zona o catástrofe..."
              style={{
                width: "100%",
                padding: "11px 12px 11px 38px",
                border: "1px solid #cfd6df",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#17202a",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#17202a",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            Catástrofe
          </label>

          <select
            value={catastrofeFiltro}
            onChange={(e) => setCatastrofeFiltro(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 12px",
              border: "1px solid #cfd6df",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#17202a",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="todos">Todas las catástrofes</option>

            {catastrofes.map((catastrofe) => (
              <option key={catastrofe._id} value={catastrofe._id}>
                {catastrofe.titulo}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
