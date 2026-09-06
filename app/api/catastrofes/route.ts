import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import {
  forbiddenResponse,
  unauthorizedResponse,
  requireRole,
} from "@/lib/auth/authorization";

import { Catastrofe } from "@/types/catastrofes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET
 *
 * Todos los usuarios autenticados pueden consultar
 * las catástrofes registradas.
 *
 * Roles:
 * ADMIN
 * FUNCIONARIO
 * USUARIO
 */
export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return unauthorizedResponse();
    }

    if (!requireRole(session, ["ADMIN", "FUNCIONARIO", "USUARIO"])) {
      return forbiddenResponse();
    }

    const db = await getDb();

    const catastrofes = await db
      .collection<Catastrofe>("Catastrofes")
      .find({})
      .sort({
        fechaInicio: -1,
      })
      .toArray();

    return NextResponse.json({
      success: true,
      data: catastrofes,
    });
  } catch (error) {
    console.error("Error obteniendo catástrofes:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST
 *
 * Solo ADMIN y FUNCIONARIO pueden crear
 * nuevas catástrofes.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return unauthorizedResponse();
    }

    if (!requireRole(session, ["ADMIN", "FUNCIONARIO"])) {
      return forbiddenResponse();
    }

    const body = await request.json();

    const {
      titulo,
      tipo,
      descripcion,
      fechaInicio,
      fechaActualizacion,
      estado,
      nivelEmergencia,
      departamento,
      municipio,
      direccionReferencia,
      ubicacion,
      fuenteInformacion,
    } = body;

    /*
     * Validaciones básicas.
     */
    if (typeof titulo !== "string" || titulo.trim().length < 5) {
      return NextResponse.json(
        {
          success: false,
          message: "El título debe tener al menos 5 caracteres.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof tipo !== "string" || tipo.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "El tipo de catástrofe es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof descripcion !== "string" || descripcion.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "La descripción debe tener al menos 10 caracteres.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof fechaInicio !== "string" || fechaInicio.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "La fecha de inicio es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof fechaActualizacion !== "string" ||
      fechaActualizacion.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "La fecha de actualización es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    const estadosValidos = ["activa", "controlada", "finalizada"];

    if (typeof estado !== "string" || !estadosValidos.includes(estado)) {
      return NextResponse.json(
        {
          success: false,
          message: "El estado de la catástrofe no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    const nivelesValidos = ["bajo", "medio", "alto", "critico"];

    if (
      typeof nivelEmergencia !== "string" ||
      !nivelesValidos.includes(nivelEmergencia)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "El nivel de emergencia no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof departamento !== "string" || departamento.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "El departamento es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof municipio !== "string" || municipio.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "El municipio es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof direccionReferencia !== "string" ||
      direccionReferencia.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "La dirección de referencia es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof fuenteInformacion !== "string" ||
      fuenteInformacion.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "La fuente de información es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validación de ubicación GeoJSON.
     *
     * MongoDB utiliza:
     *
     * coordinates: [longitud, latitud]
     */
    if (
      !ubicacion ||
      ubicacion.type !== "Point" ||
      !Array.isArray(ubicacion.coordinates) ||
      ubicacion.coordinates.length !== 2
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "La ubicación debe ser un punto GeoJSON válido.",
        },
        {
          status: 400,
        }
      );
    }

    const [longitud, latitud] = ubicacion.coordinates;

    if (typeof longitud !== "number" || typeof latitud !== "number") {
      return NextResponse.json(
        {
          success: false,
          message: "La longitud y la latitud deben ser números.",
        },
        {
          status: 400,
        }
      );
    }

    if (longitud < -180 || longitud > 180) {
      return NextResponse.json(
        {
          success: false,
          message: "La longitud debe estar entre -180 y 180.",
        },
        {
          status: 400,
        }
      );
    }

    if (latitud < -90 || latitud > 90) {
      return NextResponse.json(
        {
          success: false,
          message: "La latitud debe estar entre -90 y 90.",
        },
        {
          status: 400,
        }
      );
    }

    const db = await getDb();

    /*
     * Generación del identificador.
     *
     * Mantiene el formato:
     * cat001
     * cat002
     * cat003
     */
    const existentes = await db
      .collection<Catastrofe>("Catastrofes")
      .find({})
      .toArray();

    const siguienteNumero = existentes.length + 1;

    const nuevoId = `cat${String(siguienteNumero).padStart(3, "0")}`;

    const ahora = new Date().toISOString();

    const nuevaCatastrofe: Catastrofe = {
      _id: nuevoId,
      titulo: titulo.trim(),
      tipo: tipo.trim(),
      descripcion: descripcion.trim(),
      fechaInicio: fechaInicio.trim(),
      fechaActualizacion: fechaActualizacion.trim(),
      estado: estado as Catastrofe["estado"],
      nivelEmergencia: nivelEmergencia as Catastrofe["nivelEmergencia"],
      departamento: departamento.trim(),
      municipio: municipio.trim(),
      direccionReferencia: direccionReferencia.trim(),
      ubicacion: {
        type: "Point",
        coordinates: [longitud, latitud],
      },
      fuenteInformacion: fuenteInformacion.trim(),
      createdAt: ahora,
      updatedAt: ahora,
    };

    await db.collection<Catastrofe>("Catastrofes").insertOne(nuevaCatastrofe);

    return NextResponse.json(
      {
        success: true,
        message: "Catástrofe creada correctamente.",
        data: nuevaCatastrofe,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error creando catástrofe:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor.",
      },
      {
        status: 500,
      }
    );
  }
}
