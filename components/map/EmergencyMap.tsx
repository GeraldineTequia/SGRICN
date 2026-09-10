"use client";

import { useEffect, useRef, useState } from "react";
import type * as LeafletTypes from "leaflet";
import "leaflet/dist/leaflet.css";

let Leaflet: typeof import("leaflet") | null = null;

export interface PuntoMapa {
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

interface EmergencyMapProps {
  catastrofes?: PuntoMapa[];
  zonas?: PuntoMapa[];
  centros?: PuntoMapa[];
  height?: string;
}

const DEFAULT_CENTER: LeafletTypes.LatLngExpression = [4.5709, -74.2973];
const DEFAULT_ZOOM = 6;

/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

function escaparHtml(valor: string | undefined | null): string {
  if (!valor) {
    return "";
  }

  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatearEstado(estado: string): string {
  if (!estado) {
    return "Sin información";
  }

  return estado
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function formatearNivel(nivel: string): string {
  if (!nivel) {
    return "Sin nivel";
  }

  return nivel
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

/* =========================================================
   ICONOS DEL MAPA
========================================================= */

function crearIcono(tipo: PuntoMapa["tipo"]): LeafletTypes.DivIcon {
  if (!Leaflet) {
    throw new Error("Leaflet todavía no está cargado.");
  }

  const configuracion = {
    catastrofe: {
      emoji: "🚨",
      background: "#ce1126",
      border: "#a50e20",
      label: "Catástrofe",
    },

    zona: {
      emoji: "📍",
      background: "#fcd116",
      border: "#c8a900",
      label: "Zona afectada",
    },

    centro: {
      emoji: "🏥",
      background: "#198754",
      border: "#146c43",
      label: "Centro de donación",
    },
  }[tipo];

  return Leaflet.divIcon({
    className: "sgricn-map-marker",

    html: `
      <div
        title="${escaparHtml(configuracion.label)}"
        style="
          width: 38px;
          height: 38px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: ${configuracion.background};
          border: 3px solid #ffffff;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        <span
          style="
            transform: rotate(45deg);
            font-size: 18px;
            line-height: 1;
          "
        >
          ${configuracion.emoji}
        </span>
      </div>
    `,

    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
}

/* =========================================================
   COORDENADAS
========================================================= */

function formatearCoordenadas(
  coordinates: PuntoMapa["coordinates"]
): string {
  if (
    !Array.isArray(coordinates) ||
    coordinates.length < 2 ||
    !Number.isFinite(Number(coordinates[0])) ||
    !Number.isFinite(Number(coordinates[1]))
  ) {
    return "No disponibles";
  }

  /*
   * GeoJSON:
   * [longitud, latitud]
   *
   * Para mostrar:
   * latitud, longitud
   */

  const longitud = Number(coordinates[0]);
  const latitud = Number(coordinates[1]);

  return `${latitud.toFixed(6)}, ${longitud.toFixed(6)}`;
}

/* =========================================================
   POPUP
========================================================= */

function crearPopup(punto: PuntoMapa): string {
  const detalles: string[] = [];

  if (punto.estado) {
    detalles.push(`
      <div style="margin-bottom: 6px;">
        <strong>Estado:</strong>
        ${escaparHtml(formatearEstado(punto.estado))}
      </div>
    `);
  }

  if (punto.nivelEmergencia) {
    detalles.push(`
      <div style="margin-bottom: 6px;">
        <strong>Nivel:</strong>
        ${escaparHtml(formatearNivel(punto.nivelEmergencia))}
      </div>
    `);
  }

  if (punto.departamento) {
    detalles.push(`
      <div style="margin-bottom: 6px;">
        <strong>Departamento:</strong>
        ${escaparHtml(punto.departamento)}
      </div>
    `);
  }

  if (punto.municipio) {
    detalles.push(`
      <div style="margin-bottom: 6px;">
        <strong>Municipio:</strong>
        ${escaparHtml(punto.municipio)}
      </div>
    `);
  }

  if (punto.direccion) {
    detalles.push(`
      <div style="margin-bottom: 6px;">
        <strong>Dirección:</strong>
        ${escaparHtml(punto.direccion)}
      </div>
    `);
  }

  if (punto.telefono) {
    detalles.push(`
      <div style="margin-bottom: 6px;">
        <strong>Teléfono:</strong>
        ${escaparHtml(punto.telefono)}
      </div>
    `);
  }

  if (punto.correo) {
    detalles.push(`
      <div style="margin-bottom: 6px;">
        <strong>Correo:</strong>
        ${escaparHtml(punto.correo)}
      </div>
    `);
  }

  if (punto.horario) {
    detalles.push(`
      <div style="margin-bottom: 6px;">
        <strong>Horario:</strong>
        ${escaparHtml(punto.horario)}
      </div>
    `);
  }

  if (punto.tipoDonacion && punto.tipoDonacion.length > 0) {
    detalles.push(`
      <div style="margin-bottom: 6px;">
        <strong>Donaciones:</strong>
        ${punto.tipoDonacion
          .map((tipo) => escaparHtml(tipo))
          .join(", ")}
      </div>
    `);
  }

  detalles.push(`
    <div
      style="
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #e5e7eb;
      "
    >
      <strong>Coordenadas:</strong>
      ${escaparHtml(formatearCoordenadas(punto.coordinates))}
    </div>
  `);

  return `
    <div
      style="
        min-width: 260px;
        max-width: 340px;
        font-family: Arial, sans-serif;
        color: #344054;
      "
    >

      <div
        style="
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 2px solid #003893;
        "
      >

        <div
          style="
            color: #00245f;
            font-size: 17px;
            font-weight: 700;
            margin-bottom: 3px;
          "
        >
          ${escaparHtml(punto.titulo)}
        </div>

        ${
          punto.subtitulo
            ? `
              <div
                style="
                  color: #667085;
                  font-size: 12px;
                "
              >
                ${escaparHtml(punto.subtitulo)}
              </div>
            `
            : ""
        }

      </div>

      ${
        punto.descripcion
          ? `
            <div
              style="
                margin-bottom: 10px;
                font-size: 13px;
                line-height: 1.45;
              "
            >
              ${escaparHtml(punto.descripcion)}
            </div>
          `
          : ""
      }

      <div
        style="
          font-size: 12px;
          line-height: 1.45;
        "
      >
        ${detalles.join("")}
      </div>

    </div>
  `;
}

/* =========================================================
   VALIDACIÓN DE PUNTOS
========================================================= */

function obtenerPuntosValidos(
  puntos: PuntoMapa[]
): Array<{
  punto: PuntoMapa;
  latitud: number;
  longitud: number;
}> {
  return puntos
    .map((punto) => {
      if (
        !Array.isArray(punto.coordinates) ||
        punto.coordinates.length < 2
      ) {
        return null;
      }

      const longitud = Number(punto.coordinates[0]);
      const latitud = Number(punto.coordinates[1]);

      if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
        return null;
      }

      if (latitud < -90 || latitud > 90) {
        return null;
      }

      if (longitud < -180 || longitud > 180) {
        return null;
      }

      return {
        punto,
        latitud,
        longitud,
      };
    })
    .filter(
      (
        item
      ): item is {
        punto: PuntoMapa;
        latitud: number;
        longitud: number;
      } => item !== null
    );
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function EmergencyMap({
  catastrofes = [],
  zonas = [],
  centros = [],
  height = "650px",
}: EmergencyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<LeafletTypes.Map | null>(null);

  const markersLayerRef =
    useRef<LeafletTypes.LayerGroup | null>(null);

  const [mapReady, setMapReady] = useState(false);

  /* =======================================================
     INICIALIZAR LEAFLET
  ======================================================= */

  useEffect(() => {
    let cancelado = false;

    async function inicializarMapa() {
      if (!mapContainerRef.current) {
        return;
      }

      if (mapRef.current) {
        return;
      }

      try {
        /*
         * Cargar Leaflet únicamente en el navegador.
         * Esto evita problemas durante el build de Vercel.
         */
        if (!Leaflet) {
          Leaflet = await import("leaflet");
        }

        if (cancelado || !mapContainerRef.current) {
          return;
        }

        const mapa = Leaflet.map(mapContainerRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        mapRef.current = mapa;

        Leaflet.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
            maxZoom: 19,
          }
        ).addTo(mapa);

        markersLayerRef.current =
          Leaflet.layerGroup().addTo(mapa);

        /*
         * Muy importante:
         * avisamos que el mapa ya está completamente listo.
         *
         * Esto hace que el segundo useEffect se ejecute
         * nuevamente y pinte los marcadores.
         */
        setMapReady(true);

        const resizeTimer = window.setTimeout(() => {
          mapa.invalidateSize();
        }, 150);

        /*
         * Limpiar el temporizador si el componente
         * se desmonta antes de ejecutarse.
         */
        if (cancelado) {
          window.clearTimeout(resizeTimer);
        }
      } catch (error) {
        console.error(
          "Error inicializando Leaflet:",
          error
        );
      }
    }

    inicializarMapa();

    return () => {
      cancelado = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      markersLayerRef.current = null;

      setMapReady(false);
    };
  }, []);

  /* =======================================================
     ACTUALIZAR MARCADORES
  ======================================================= */

  useEffect(() => {
    const mapa = mapRef.current;
    const markersLayer = markersLayerRef.current;

    /*
     * Si Leaflet todavía no terminó de inicializarse,
     * esperamos a que mapReady cambie a true.
     */
    if (!mapReady || !mapa || !markersLayer || !Leaflet) {
      return;
    }

    markersLayer.clearLayers();

    const puntos = [
      ...catastrofes,
      ...zonas,
      ...centros,
    ];

    const puntosValidos =
      obtenerPuntosValidos(puntos);

    /*
     * No existen puntos válidos.
     */
    if (puntosValidos.length === 0) {
      mapa.setView(
        DEFAULT_CENTER,
        DEFAULT_ZOOM
      );

      const resizeTimer = window.setTimeout(() => {
        mapa.invalidateSize();
      }, 100);

      return () => {
        window.clearTimeout(resizeTimer);
      };
    }

    /*
     * Crear límites para mostrar todos los
     * puntos automáticamente.
     */
    const bounds = Leaflet.latLngBounds([]);

    puntosValidos.forEach(
      ({ punto, latitud, longitud }) => {
        const marker = Leaflet!.marker(
          [latitud, longitud],
          {
            icon: crearIcono(punto.tipo),
            title: punto.titulo,
          }
        );

        marker.bindPopup(
          crearPopup(punto),
          {
            maxWidth: 360,
            minWidth: 260,
            closeButton: true,
            autoPan: true,
          }
        );

        marker.addTo(markersLayer);

        bounds.extend([
          latitud,
          longitud,
        ]);
      }
    );

    /*
     * Si solamente hay un punto,
     * centramos el mapa directamente.
     */
    if (puntosValidos.length === 1) {
      const punto = puntosValidos[0];

      mapa.setView(
        [
          punto.latitud,
          punto.longitud,
        ],
        12
      );
    } else {
      /*
       * Si hay varios puntos,
       * ajustamos el mapa para mostrarlos todos.
       */
      mapa.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 13,
      });
    }

    /*
     * Leaflet necesita recalcular su tamaño
     * después de actualizar el contenedor.
     */
    const resizeTimer = window.setTimeout(() => {
      mapa.invalidateSize();
    }, 100);

    return () => {
      window.clearTimeout(resizeTimer);
    };
  }, [
    mapReady,
    catastrofes,
    zonas,
    centros,
  ]);

  /* =========================================================
     CONTADOR
  ========================================================= */

  const totalPuntos =
    catastrofes.length +
    zonas.length +
    centros.length;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        minHeight: "400px",
        overflow: "hidden",
        borderRadius: "10px",
      }}
    >

      {/* ===================================================
          MAPA
      =================================================== */}

      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "400px",
        }}
      />

      {/* ===================================================
          LEYENDA
      =================================================== */}

      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          top: "14px",
          right: "14px",

          background: "#ffffff",

          borderRadius: "10px",

          padding: "12px 14px",

          boxShadow:
            "0 2px 10px rgba(0,0,0,0.18)",

          fontFamily: "Arial, sans-serif",

          fontSize: "12px",

          minWidth: "175px",
        }}
      >

        <div
          style={{
            color: "#00245f",
            fontSize: "13px",
            fontWeight: 700,
            marginBottom: "9px",
          }}
        >
          Leyenda
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "7px",
          }}
        >
          <span style={{ fontSize: "15px" }}>
            🚨
          </span>

          <span>
            Catástrofe
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "7px",
          }}
        >
          <span style={{ fontSize: "15px" }}>
            📍
          </span>

          <span>
            Zona afectada
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "15px" }}>
            🏥
          </span>

          <span>
            Centro de donación
          </span>
        </div>

      </div>

      {/* ===================================================
          CONTADOR DE PUNTOS
      =================================================== */}

      <div
        style={{
          position: "absolute",
          zIndex: 1000,

          left: "14px",
          bottom: "14px",

          background: "#ffffff",

          borderRadius: "8px",

          padding: "8px 12px",

          boxShadow:
            "0 2px 8px rgba(0,0,0,0.18)",

          color: "#00245f",

          fontFamily: "Arial, sans-serif",

          fontSize: "12px",

          fontWeight: 700,
        }}
      >
        {totalPuntos === 0
          ? "Sin puntos geográficos"
          : `${totalPuntos} punto${
              totalPuntos === 1
                ? ""
                : "s"
            } geográfico${
              totalPuntos === 1
                ? ""
                : "s"
            }`}
      </div>

      {/* ===================================================
          ESTADO VACÍO
      =================================================== */}

      {totalPuntos === 0 && (
        <div
          style={{
            position: "absolute",
            zIndex: 900,

            top: "50%",
            left: "50%",

            transform:
              "translate(-50%, -50%)",

            background:
              "rgba(255,255,255,0.94)",

            borderRadius: "12px",

            padding: "18px 22px",

            boxShadow:
              "0 3px 15px rgba(0,0,0,0.18)",

            textAlign: "center",

            fontFamily: "Arial, sans-serif",

            color: "#5f6b7a",

            pointerEvents: "none",
          }}
        >

          <div
            style={{
              fontSize: "30px",
              marginBottom: "8px",
            }}
          >
            📍
          </div>

          <div
            style={{
              color: "#00245f",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            No hay ubicaciones registradas
          </div>

          <div
            style={{
              fontSize: "12px",
            }}
          >
            Cuando existan registros
            geográficos, aparecerán aquí.
          </div>

        </div>
      )}

    </div>
  );
}
