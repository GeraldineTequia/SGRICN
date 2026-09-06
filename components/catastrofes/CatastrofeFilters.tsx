"use client";

interface CatastrofeFiltersProps {
  busqueda: string;
  setBusqueda: (valor: string) => void;

  estadoFiltro: string;
  setEstadoFiltro: (valor: string) => void;

  nivelFiltro: string;
  setNivelFiltro: (valor: string) => void;
}

export default function CatastrofeFilters({
  busqueda,
  setBusqueda,
  estadoFiltro,
  setEstadoFiltro,
  nivelFiltro,
  setNivelFiltro,
}: CatastrofeFiltersProps) {
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
          gridTemplateColumns:
            "minmax(250px, 2fr) repeat(2, minmax(180px, 1fr))",
          gap: "14px",
        }}
      >
        {/* BÚSQUEDA */}

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

          <div
            style={{
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "15px",
              }}
            >
              🔎
            </span>

            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Título, tipo, municipio..."
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

        {/* ESTADO */}

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
            Estado
          </label>

          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 12px",
              border: "1px solid #cfd6df",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#17202a",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="todos">Todos</option>

            <option value="activa">Activa</option>

            <option value="controlada">Controlada</option>

            <option value="finalizada">Finalizada</option>
          </select>
        </div>

        {/* NIVEL */}

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
            Nivel de emergencia
          </label>

          <select
            value={nivelFiltro}
            onChange={(e) => setNivelFiltro(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 12px",
              border: "1px solid #cfd6df",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#17202a",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="todos">Todos</option>

            <option value="bajo">Bajo</option>

            <option value="medio">Medio</option>

            <option value="alto">Alto</option>

            <option value="critico">Crítico</option>
          </select>
        </div>
      </div>
    </div>
  );
}
