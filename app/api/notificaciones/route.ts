import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Notificacion {
  id: string;
  tipo: "catastrofe" | "necesidad" | "noticia";
  titulo: string;
  descripcion: string;
  fecha: string;
  prioridad: "alta" | "media" | "baja";
  enlace: string;
}

function convertirFecha(valor: unknown): Date | null {
  if (!valor) {
    return null;
  }

  if (valor instanceof Date) {
    return valor;
  }

  if (typeof valor === "string" || typeof valor === "number") {
    const fecha = new Date(valor);

    if (!Number.isNaN(fecha.getTime())) {
      return fecha;
    }
  }

  return null;
}

function fechaISO(valor: unknown): string {
  const fecha = convertirFecha(valor);

  return fecha ? fecha.toISOString() : new Date().toISOString();
}

function obtenerTexto(valor: unknown, fallback = ""): string {
  return typeof valor === "string" ? valor.trim() : fallback;
}

function normalizarTexto(valor: unknown): string {
  return obtenerTexto(valor)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function esCatastrofeActiva(estado: unknown): boolean {
  const estadoNormalizado = normalizarTexto(estado);

  return [
    "activa",
    "activo",
    "en curso",
    "en_curso",
    "en curso",
    "emergencia",
  ].includes(estadoNormalizado);
}

function esNecesidadCritica(necesidad: Record<string, unknown>): boolean {
  const prioridad = normalizarTexto(
    necesidad.prioridad ?? necesidad.nivelPrioridad ?? necesidad.nivel ?? ""
  );

  const estado = normalizarTexto(necesidad.estado ?? "");

  const prioridadCritica = ["critica", "critico", "alta", "urgente"].includes(
    prioridad
  );

  const estadoCerrado = [
    "atendida",
    "atendido",
    "resuelta",
    "resuelto",
    "cerrada",
    "cerrado",
    "finalizada",
    "finalizado",
  ].includes(estado);

  return prioridadCritica && !estadoCerrado;
}

function noticiaPublicada(noticia: Record<string, unknown>): boolean {
  return normalizarTexto(noticia.estado) === "publicada";
}

function obtenerFechaNoticia(noticia: Record<string, unknown>): unknown {
  return (
    noticia.fechaPublicacion ??
    noticia.fechaActualizacion ??
    noticia.updatedAt ??
    noticia.createdAt
  );
}

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "No autenticado.",
        },
        { status: 401 }
      );
    }

    const db = await getDb();

    const [catastrofes, necesidades, noticias] = await Promise.all([
      db
        .collection("Catastrofes")
        .find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray(),

      db
        .collection("Necesidades")
        .find({})
        .sort({ createdAt: -1 })
        .limit(30)
        .toArray(),

      db
        .collection("Noticias")
        .find({})
        .sort({
          fechaPublicacion: -1,
          createdAt: -1,
        })
        .limit(20)
        .toArray(),
    ]);

    const notificaciones: Notificacion[] = [];

    /*
     * =========================================================
     * CATÁSTROFES ACTIVAS
     * =========================================================
     */
    catastrofes
      .filter((catastrofe) => esCatastrofeActiva(catastrofe.estado))
      .slice(0, 5)
      .forEach((catastrofe) => {
        const titulo = obtenerTexto(
          catastrofe.titulo ?? catastrofe.nombre ?? catastrofe.tipo,
          "Catástrofe activa"
        );

        const municipio = obtenerTexto(catastrofe.municipio);

        const departamento = obtenerTexto(catastrofe.departamento);

        let ubicacion = "";

        if (municipio && departamento) {
          ubicacion = `${municipio}, ${departamento}`;
        } else if (municipio) {
          ubicacion = municipio;
        } else if (departamento) {
          ubicacion = departamento;
        }

        const descripcion = ubicacion
          ? `Se registra una emergencia activa en ${ubicacion}.`
          : "Se registra una catástrofe actualmente activa.";

        notificaciones.push({
          id: `catastrofe-${String(catastrofe._id)}`,
          tipo: "catastrofe",
          titulo,
          descripcion,
          fecha: fechaISO(
            catastrofe.fechaInicio ?? catastrofe.fecha ?? catastrofe.createdAt
          ),
          prioridad: "alta",
          enlace: "/catastrofes",
        });
      });

    /*
     * =========================================================
     * NECESIDADES CRÍTICAS
     * =========================================================
     */
    necesidades
      .filter((necesidad) =>
        esNecesidadCritica(necesidad as Record<string, unknown>)
      )
      .slice(0, 5)
      .forEach((necesidad) => {
        const necesidadRecord = necesidad as Record<string, unknown>;

        const titulo = obtenerTexto(
          necesidadRecord.titulo ??
            necesidadRecord.nombre ??
            necesidadRecord.tipoNecesidad,
          "Necesidad crítica"
        );

        const zona = obtenerTexto(
          necesidadRecord.zona ??
            necesidadRecord.municipio ??
            necesidadRecord.ubicacion
        );

        const descripcion = zona
          ? `Se requiere atención prioritaria en ${zona}.`
          : "Existe una necesidad que requiere atención prioritaria.";

        notificaciones.push({
          id: `necesidad-${String(necesidad._id)}`,
          tipo: "necesidad",
          titulo,
          descripcion,
          fecha: fechaISO(necesidadRecord.fecha ?? necesidadRecord.createdAt),
          prioridad: "alta",
          enlace: "/necesidades",
        });
      });

    /*
     * =========================================================
     * NOTICIAS PUBLICADAS RECIENTES
     * =========================================================
     */
    noticias
      .filter((noticia) => noticiaPublicada(noticia as Record<string, unknown>))
      .slice(0, 5)
      .forEach((noticia) => {
        const noticiaRecord = noticia as Record<string, unknown>;

        const titulo = obtenerTexto(noticiaRecord.titulo, "Nueva noticia");

        const resumen = obtenerTexto(
          noticiaRecord.resumen ?? noticiaRecord.contenido,
          "Se ha publicado una nueva noticia en SGRICN."
        );

        notificaciones.push({
          id: `noticia-${String(noticia._id)}`,
          tipo: "noticia",
          titulo,
          descripcion:
            resumen.length > 140 ? `${resumen.substring(0, 137)}...` : resumen,
          fecha: fechaISO(obtenerFechaNoticia(noticiaRecord)),
          prioridad: "baja",
          enlace: "/noticias",
        });
      });

    /*
     * Ordenamos todas las notificaciones por fecha,
     * dejando primero las más recientes.
     */
    notificaciones.sort((a, b) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

    /*
     * El Header solamente necesita las notificaciones
     * recientes. Limitamos la respuesta para no cargar
     * información innecesaria.
     */
    const resultado = notificaciones.slice(0, 10);

    return NextResponse.json({
      success: true,
      data: resultado,
      total: resultado.length,
    });
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible cargar las notificaciones.",
      },
      { status: 500 }
    );
  }
}
