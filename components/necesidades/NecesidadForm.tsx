"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Catastrofe } from "@/types/catastrofes";
import { ZonaAfectada } from "@/types/zonas";
import { Necesidad, PrioridadNecesidad } from "@/types/necesidades";

interface NecesidadFormProps {
  necesidad?: Necesidad | null;

  catastrofes: Catastrofe[];
  zonas: ZonaAfectada[];

  onGuardado: (necesidad: Necesidad) => void;

  onCancelar: () => void;
}

interface FormularioNecesidad {
  catastrofeId: string;
  zonaId: string;
  categoria: string;
  nombre: string;
  descripcion: string;
  unidad: string;
  cantidadNecesaria: string;
  cantidadRecibida: string;
  prioridad: PrioridadNecesidad;
}

const formularioInicial: FormularioNecesidad = {
  catastrofeId: "",
  zonaId: "",
  categoria: "",
  nombre: "",
  descripcion: "",
  unidad: "",
  cantidadNecesaria: "",
  cantidadRecibida: "0",
  prioridad: "media",
};

export default function NecesidadForm({
  necesidad,
  catastrofes,
  zonas,
  onGuardado,
  onCancelar,
}: NecesidadFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioNecesidad>(formularioInicial);

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  const esEdicion = Boolean(necesidad);

  /*
   * Cargar los datos cuando se está
   * editando una necesidad.
   */
  useEffect(() => {
    if (necesidad) {
      setFormulario({
        catastrofeId: necesidad.catastrofeId,
        zonaId: necesidad.zonaId,
        categoria: necesidad.categoria,
        nombre: necesidad.nombre,
        descripcion: necesidad.descripcion,
        unidad: necesidad.unidad,
        cantidadNecesaria: String(necesidad.cantidadNecesaria),
        cantidadRecibida: String(necesidad.cantidadRecibida),
        prioridad: necesidad.prioridad,
      });
    } else {
      setFormulario(formularioInicial);
    }

    setError("");
  }, [necesidad]);

  /*
   * Mostrar únicamente las zonas
   * que pertenecen a la catástrofe
   * seleccionada.
   */
  const zonasDisponibles = useMemo(() => {
    if (!formulario.catastrofeId) {
      return [];
    }

    return zonas.filter(
      (zona) => zona.catastrofeId === formulario.catastrofeId
    );
  }, [zonas, formulario.catastrofeId]);

  /*
   * Cuando cambia la catástrofe,
   * reiniciamos la zona seleccionada.
   */
  const cambiarCatastrofe = (valor: string) => {
    setFormulario((anterior) => ({
      ...anterior,
      catastrofeId: valor,
      zonaId: "",
    }));
  };

  /*
   * Actualizar cualquier campo
   * del formulario.
   */
  const cambiarCampo = (campo: keyof FormularioNecesidad, valor: string) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  /*
   * Guardar necesidad
   */
  const manejarSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    /*
     * Validaciones básicas
     */
    if (!formulario.catastrofeId) {
      setError("Debes seleccionar una catástrofe.");
      return;
    }

    if (!formulario.zonaId) {
      setError("Debes seleccionar una zona afectada.");
      return;
    }

    if (!formulario.categoria.trim()) {
      setError("Debes seleccionar o escribir una categoría.");
      return;
    }

    if (!formulario.nombre.trim()) {
      setError("El nombre de la necesidad es obligatorio.");
      return;
    }

    if (!formulario.descripcion.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }

    if (!formulario.unidad.trim()) {
      setError("La unidad de medida es obligatoria.");
      return;
    }

    const cantidadNecesaria = Number(formulario.cantidadNecesaria);

    const cantidadRecibida = Number(formulario.cantidadRecibida);

    if (!Number.isFinite(cantidadNecesaria) || cantidadNecesaria < 0) {
      setError(
        "La cantidad necesaria debe ser un número mayor o igual a cero."
      );
      return;
    }

    if (!Number.isFinite(cantidadRecibida) || cantidadRecibida < 0) {
      setError("La cantidad recibida debe ser un número mayor o igual a cero.");
      return;
    }

    if (cantidadRecibida > cantidadNecesaria) {
      setError(
        "La cantidad recibida no puede ser mayor que la cantidad necesaria."
      );
      return;
    }

    /*
     * Verificar que la zona realmente
     * pertenezca a la catástrofe.
     */
    const zonaValida = zonasDisponibles.some(
      (zona) => zona._id === formulario.zonaId
    );

    if (!zonaValida) {
      setError("La zona seleccionada no pertenece a la catástrofe indicada.");
      return;
    }

    try {
      setGuardando(true);

      /*
       * Datos que enviaremos a la API.
       */
      const datos = {
        catastrofeId: formulario.catastrofeId,

        zonaId: formulario.zonaId,

        categoria: formulario.categoria.trim(),

        nombre: formulario.nombre.trim(),

        descripcion: formulario.descripcion.trim(),

        unidad: formulario.unidad.trim(),

        cantidadNecesaria,

        cantidadRecibida,

        prioridad: formulario.prioridad,
      };

      /*
       * Determinar si hacemos POST
       * o PUT.
       */
      const url = necesidad
        ? `/api/necesidades/${necesidad._id}`
        : "/api/necesidades";

      const metodo = necesidad ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.success) {
        throw new Error(
          resultado.message || "No fue posible guardar la necesidad."
        );
      }

      /*
       * Informar a la página que
       * la operación terminó correctamente.
       */
      onGuardado(resultado.data);
    } catch (error) {
      console.error("Error guardando necesidad:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar la necesidad."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form id="form-necesidad" onSubmit={manejarSubmit}>
      {/* Mensaje de error */}
      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 15px",
            borderRadius: "8px",
            background: "#fdeaea",
            border: "1px solid #f5b5b5",
            color: "#ce1126",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Información de ubicación */}
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            margin: "0 0 15px",
            color: "#00245f",
            fontSize: "17px",
            borderBottom: "2px solid #fcd116",
            paddingBottom: "8px",
          }}
        >
          📍 Ubicación de la necesidad
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Catástrofe */}
          <div>
            <label
              htmlFor="necesidad-catastrofe"
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#17202a",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Catástrofe *
            </label>

            <select
              id="necesidad-catastrofe"
              value={formulario.catastrofeId}
              onChange={(event) => cambiarCatastrofe(event.target.value)}
              required
              style={{
                width: "100%",
                padding: "11px 12px",
                border: "1px solid #cfd6df",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#17202a",
              }}
            >
              <option value="">Seleccionar catástrofe</option>

              {catastrofes.map((catastrofe) => (
                <option key={catastrofe._id} value={catastrofe._id}>
                  {catastrofe.titulo}
                </option>
              ))}
            </select>
          </div>

          {/* Zona */}
          <div>
            <label
              htmlFor="necesidad-zona"
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#17202a",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Zona afectada *
            </label>

            <select
              id="necesidad-zona"
              value={formulario.zonaId}
              onChange={(event) => cambiarCampo("zonaId", event.target.value)}
              required
              disabled={!formulario.catastrofeId}
              style={{
                width: "100%",
                padding: "11px 12px",
                border: "1px solid #cfd6df",
                borderRadius: "8px",
                background: formulario.catastrofeId ? "#ffffff" : "#f1f3f5",
                color: "#17202a",
              }}
            >
              <option value="">
                {formulario.catastrofeId
                  ? "Seleccionar zona"
                  : "Selecciona primero una catástrofe"}
              </option>

              {zonasDisponibles.map((zona) => (
                <option key={zona._id} value={zona._id}>
                  {zona.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Información de la necesidad */}
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            margin: "0 0 15px",
            color: "#00245f",
            fontSize: "17px",
            borderBottom: "2px solid #fcd116",
            paddingBottom: "8px",
          }}
        >
          📦 Información de la necesidad
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Categoría */}
          <div>
            <label
              htmlFor="necesidad-categoria"
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#17202a",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Categoría *
            </label>

            <select
              id="necesidad-categoria"
              value={formulario.categoria}
              onChange={(event) =>
                cambiarCampo("categoria", event.target.value)
              }
              required
              style={{
                width: "100%",
                padding: "11px 12px",
                border: "1px solid #cfd6df",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#17202a",
              }}
            >
              <option value="">Seleccionar categoría</option>

              <option value="Alimentos">Alimentos</option>

              <option value="Agua">Agua</option>

              <option value="Medicamentos">Medicamentos</option>

              <option value="Higiene">Higiene</option>

              <option value="Ropa">Ropa</option>

              <option value="Vivienda">Vivienda</option>

              <option value="Transporte">Transporte</option>

              <option value="Servicios básicos">Servicios básicos</option>

              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Nombre */}
          <div>
            <label
              htmlFor="necesidad-nombre"
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#17202a",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Nombre de la necesidad *
            </label>

            <input
              id="necesidad-nombre"
              type="text"
              value={formulario.nombre}
              onChange={(event) => cambiarCampo("nombre", event.target.value)}
              placeholder="Ej. Agua potable"
              required
              style={{
                width: "100%",
                padding: "11px 12px",
                border: "1px solid #cfd6df",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#17202a",
              }}
            />
          </div>

          {/* Unidad */}
          <div>
            <label
              htmlFor="necesidad-unidad"
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#17202a",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Unidad de medida *
            </label>

            <input
              id="necesidad-unidad"
              type="text"
              value={formulario.unidad}
              onChange={(event) => cambiarCampo("unidad", event.target.value)}
              placeholder="Ej. litros, kits, unidades"
              required
              style={{
                width: "100%",
                padding: "11px 12px",
                border: "1px solid #cfd6df",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#17202a",
              }}
            />
          </div>

          {/* Prioridad */}
          <div>
            <label
              htmlFor="necesidad-prioridad"
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#17202a",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Prioridad *
            </label>

            <select
              id="necesidad-prioridad"
              value={formulario.prioridad}
              onChange={(event) =>
                cambiarCampo("prioridad", event.target.value)
              }
              required
              style={{
                width: "100%",
                padding: "11px 12px",
                border: "1px solid #cfd6df",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#17202a",
              }}
            >
              <option value="critica">🔴 Crítica</option>

              <option value="alta">🟠 Alta</option>

              <option value="media">🟡 Media</option>

              <option value="baja">🟢 Baja</option>
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div
          style={{
            marginTop: "16px",
          }}
        >
          <label
            htmlFor="necesidad-descripcion"
            style={{
              display: "block",
              marginBottom: "6px",
              color: "#17202a",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Descripción *
          </label>

          <textarea
            id="necesidad-descripcion"
            value={formulario.descripcion}
            onChange={(event) =>
              cambiarCampo("descripcion", event.target.value)
            }
            placeholder="Describe detalladamente la necesidad de la zona afectada..."
            rows={4}
            required
            style={{
              width: "100%",
              padding: "11px 12px",
              border: "1px solid #cfd6df",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#17202a",
              resize: "vertical",
            }}
          />
        </div>
      </div>

      {/* Cantidades */}
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            margin: "0 0 15px",
            color: "#00245f",
            fontSize: "17px",
            borderBottom: "2px solid #fcd116",
            paddingBottom: "8px",
          }}
        >
          📊 Cantidades
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Cantidad necesaria */}
          <div>
            <label
              htmlFor="necesidad-cantidad-necesaria"
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#17202a",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Cantidad necesaria *
            </label>

            <input
              id="necesidad-cantidad-necesaria"
              type="number"
              min="0"
              step="1"
              value={formulario.cantidadNecesaria}
              onChange={(event) =>
                cambiarCampo("cantidadNecesaria", event.target.value)
              }
              placeholder="0"
              required
              style={{
                width: "100%",
                padding: "11px 12px",
                border: "1px solid #cfd6df",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#17202a",
              }}
            />
          </div>

          {/* Cantidad recibida */}
          <div>
            <label
              htmlFor="necesidad-cantidad-recibida"
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#17202a",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Cantidad recibida
            </label>

            <input
              id="necesidad-cantidad-recibida"
              type="number"
              min="0"
              step="1"
              value={formulario.cantidadRecibida}
              onChange={(event) =>
                cambiarCampo("cantidadRecibida", event.target.value)
              }
              placeholder="0"
              style={{
                width: "100%",
                padding: "11px 12px",
                border: "1px solid #cfd6df",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#17202a",
              }}
            />
          </div>
        </div>

        {/* Información automática */}
        <div
          style={{
            marginTop: "15px",
            padding: "12px 15px",
            borderRadius: "8px",
            background: "#eef5ff",
            border: "1px solid #c9dcf5",
            color: "#003893",
            fontSize: "13px",
          }}
        >
          💡 <strong>Importante:</strong> la cantidad pendiente, el porcentaje
          atendido y el estado se calculan automáticamente al guardar.
        </div>
      </div>

      {/* Botones internos */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          style={{
            border: "1px solid #cfd6df",
            borderRadius: "8px",
            padding: "10px 18px",
            background: "#ffffff",
            color: "#17202a",
            fontWeight: 600,
            cursor: guardando ? "not-allowed" : "pointer",
            opacity: guardando ? 0.6 : 1,
          }}
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={guardando}
          style={{
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            background: guardando ? "#7a94bd" : "#003893",
            color: "#ffffff",
            fontWeight: 600,
            cursor: guardando ? "not-allowed" : "pointer",
          }}
        >
          {guardando
            ? "⏳ Guardando..."
            : esEdicion
            ? "💾 Actualizar necesidad"
            : "💾 Crear necesidad"}
        </button>
      </div>
    </form>
  );
}
