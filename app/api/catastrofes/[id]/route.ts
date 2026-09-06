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

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET
 *
 * Todos los usuarios autenticados pueden
 * consultar una catástrofe específica.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return unauthorizedResponse();
    }

    if (!requireRole(session, ["ADMIN", "FUNCIONARIO", "USUARIO"])) {
      return forbiddenResponse();
    }

    const { id } = await context.params;

    const db = await getDb();

    const catastrofe = await db.collection<Catastrofe>("Catastrofes").findOne({
      _id: String(id),
    });

    if (!catastrofe) {
      return NextResponse.json(
        {
          success: false,
          message: "La catástrofe no existe.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: catastrofe,
    });
  } catch (error) {
    console.error("Error obteniendo catástrofe:", error);

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
 * PUT
 *
 * Solo ADMIN y FUNCIONARIO pueden
 * modificar una catástrofe.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return unauthorizedResponse();
    }

    if (!requireRole(session, ["ADMIN", "FUNCIONARIO"])) {
      return forbiddenResponse();
    }

    const { id } = await context.params;

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

    const db = await getDb();

    const catastrofeExistente = await db
      .collection<Catastrofe>("Catastrofes")
      .findOne({
        _id: String(id),
      });

    if (!catastrofeExistente) {
      return NextResponse.json(
        {
          success: false,
          message: "La catástrofe no existe.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Validaciones.
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

    const ahora = new Date().toISOString();

    const actualizacion: Partial<Catastrofe> = {
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
      updatedAt: ahora,
    };

    await db.collection<Catastrofe>("Catastrofes").updateOne(
      {
        _id: String(id),
      },
      {
        $set: actualizacion,
      }
    );

    const catastrofeActualizada = await db
      .collection<Catastrofe>("Catastrofes")
      .findOne({
        _id: String(id),
      });

    return NextResponse.json({
      success: true,
      message: "Catástrofe actualizada correctamente.",
      data: catastrofeActualizada,
    });
  } catch (error) {
    console.error("Error actualizando catástrofe:", error);

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
 * DELETE
 *
 * Solo ADMIN y FUNCIONARIO pueden
 * eliminar una catástrofe.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return unauthorizedResponse();
    }

    if (!requireRole(session, ["ADMIN", "FUNCIONARIO"])) {
      return forbiddenResponse();
    }

    const { id } = await context.params;

    const db = await getDb();

    const resultado = await db.collection<Catastrofe>("Catastrofes").deleteOne({
      _id: String(id),
    });

    if (resultado.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "La catástrofe no existe.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Catástrofe eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando catástrofe:", error);

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
