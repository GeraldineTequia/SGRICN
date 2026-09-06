import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ==========================================
    // AUTENTICACIÓN
    // ==========================================

    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "No autenticado.",
        },
        {
          status: 401,
        }
      );
    }

    const db = await getDb();

    // ==========================================
    // CATÁSTROFES
    // ==========================================

    const catastrofes = await db.collection("Catastrofes").find({}).toArray();

    // ==========================================
    // ZONAS AFECTADAS
    // ==========================================

    const zonas = await db.collection("Zonas_afectadas").find({}).toArray();

    // ==========================================
    // CENTROS DE DONACIÓN
    // ==========================================

    const centros = await db
      .collection("Centros_donacion")
      .find({
        estado: "activo",
      })
      .toArray();

    // ==========================================
    // PREPARAR CATÁSTROFES
    // ==========================================

    const catastrofesMapa = catastrofes
      .filter(
        (catastrofe) =>
          catastrofe.ubicacion &&
          Array.isArray(catastrofe.ubicacion.coordinates) &&
          catastrofe.ubicacion.coordinates.length >= 2
      )
      .map((catastrofe) => ({
        _id: String(catastrofe._id),

        tipo: "catastrofe" as const,

        titulo: String(catastrofe.titulo ?? "Sin título"),

        subtitulo: String(catastrofe.tipo ?? "Emergencia"),

        descripcion: String(catastrofe.descripcion ?? ""),

        estado: String(catastrofe.estado ?? ""),

        nivelEmergencia: String(catastrofe.nivelEmergencia ?? ""),

        departamento: String(catastrofe.departamento ?? ""),

        municipio: String(catastrofe.municipio ?? ""),

        direccion: String(catastrofe.direccionReferencia ?? ""),

        coordinates: [
          Number(catastrofe.ubicacion.coordinates[0]),
          Number(catastrofe.ubicacion.coordinates[1]),
        ] as [number, number],
      }));

    // ==========================================
    // PREPARAR ZONAS
    // ==========================================

    const zonasMapa = zonas
      .filter(
        (zona) =>
          zona.ubicacion &&
          Array.isArray(zona.ubicacion.coordinates) &&
          zona.ubicacion.coordinates.length >= 2
      )
      .map((zona) => ({
        _id: String(zona._id),

        tipo: "zona" as const,

        titulo: String(zona.nombre ?? zona.titulo ?? "Zona afectada"),

        subtitulo: "Zona afectada",

        descripcion: String(zona.descripcion ?? ""),

        estado: String(zona.estado ?? ""),

        nivelEmergencia: String(zona.nivelEmergencia ?? ""),

        departamento: String(zona.departamento ?? ""),

        municipio: String(zona.municipio ?? ""),

        direccion: String(zona.direccion ?? zona.direccionReferencia ?? ""),

        coordinates: [
          Number(zona.ubicacion.coordinates[0]),
          Number(zona.ubicacion.coordinates[1]),
        ] as [number, number],

        catastrofeId: zona.catastrofeId ? String(zona.catastrofeId) : "",
      }));

    // ==========================================
    // PREPARAR CENTROS
    // ==========================================

    const centrosMapa = centros
      .filter(
        (centro) =>
          centro.ubicacion &&
          Array.isArray(centro.ubicacion.coordinates) &&
          centro.ubicacion.coordinates.length >= 2
      )
      .map((centro) => ({
        _id: String(centro._id),

        tipo: "centro" as const,

        titulo: String(centro.nombre ?? "Centro de donación"),

        subtitulo: "Centro de donación autorizado",

        descripcion: String(
          centro.responsable ? `Responsable: ${centro.responsable}` : ""
        ),

        estado: String(centro.estado ?? ""),

        nivelEmergencia: "",

        departamento: String(centro.departamento ?? ""),

        municipio: String(centro.municipio ?? ""),

        direccion: String(centro.direccion ?? ""),

        coordinates: [
          Number(centro.ubicacion.coordinates[0]),
          Number(centro.ubicacion.coordinates[1]),
        ] as [number, number],

        telefono: String(centro.telefono ?? ""),

        correo: String(centro.correo ?? ""),

        horario: String(centro.horario ?? ""),

        tipoDonacion: Array.isArray(centro.tipoDonacion)
          ? centro.tipoDonacion.map(String)
          : [],
      }));

    // ==========================================
    // RESPUESTA
    // ==========================================

    return NextResponse.json({
      success: true,

      data: {
        catastrofes: catastrofesMapa,

        zonas: zonasMapa,

        centros: centrosMapa,
      },
    });
  } catch (error) {
    console.error("Error cargando información del mapa:", error);

    return NextResponse.json(
      {
        success: false,

        message: "No se pudo cargar la información del mapa.",
      },
      {
        status: 500,
      }
    );
  }
}
