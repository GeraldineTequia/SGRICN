import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import {
  forbiddenResponse,
  unauthorizedResponse,
  requireRole,
} from "@/lib/auth/authorization";

import { ZonaAfectada } from "@/types/zonas";

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
 * consultar una zona específica.
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

    const zona = await db.collection<ZonaAfectada>("Zonas_afectadas").findOne({
      _id: String(id),
    });

    if (!zona) {
      return NextResponse.json(
        {
          success: false,
          message: "La zona afectada no existe.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: zona,
    });
  } catch (error) {
    console.error("Error obteniendo zona afectada:", error);

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
 * modificar zonas afectadas.
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
      catastrofeId,
      nombre,
      descripcion,
      departamento,
      municipio,
      direccionReferencia,
      ubicacion,
      nivelAfectacion,
      estado,
    } = body;

    const db = await getDb();

    /*
     * Buscar zona existente.
     */
    const zonaExistente = await db
      .collection<ZonaAfectada>("Zonas_afectadas")
      .findOne({
        _id: String(id),
      });

    if (!zonaExistente) {
      return NextResponse.json(
        {
          success: false,
          message: "La zona afectada no existe.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Validar catástrofe.
     */
    if (typeof catastrofeId !== "string" || catastrofeId.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "La catástrofe asociada es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Comprobar que la catástrofe exista.
     */
    const catastrofe = await db
      .collection<{ _id: string }>("Catastrofes")
      .findOne({
        _id: catastrofeId.trim(),
      });

    if (!catastrofe) {
      return NextResponse.json(
        {
          success: false,
          message: "La catástrofe asociada no existe.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Validar nombre.
     */
    if (typeof nombre !== "string" || nombre.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "El nombre de la zona debe tener al menos 3 caracteres.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validar descripción.
     */
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

    /*
     * Validar departamento.
     */
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

    /*
     * Validar municipio.
     */
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

    /*
     * Validar dirección.
     */
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

    /*
     * Validar nivel de afectación.
     */
    const nivelesValidos = ["bajo", "medio", "alto", "critico"];

    if (
      typeof nivelAfectacion !== "string" ||
      !nivelesValidos.includes(nivelAfectacion)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "El nivel de afectación no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validar estado.
     */
    const estadosValidos = ["activa", "controlada", "finalizada"];

    if (typeof estado !== "string" || !estadosValidos.includes(estado)) {
      return NextResponse.json(
        {
          success: false,
          message: "El estado de la zona no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validar ubicación.
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

    const actualizacion: Partial<ZonaAfectada> = {
      catastrofeId: catastrofeId.trim(),

      nombre: nombre.trim(),

      descripcion: descripcion.trim(),

      departamento: departamento.trim(),

      municipio: municipio.trim(),

      direccionReferencia: direccionReferencia.trim(),

      ubicacion: {
        type: "Point",
        coordinates: [longitud, latitud],
      },

      nivelAfectacion: nivelAfectacion as ZonaAfectada["nivelAfectacion"],

      estado: estado as ZonaAfectada["estado"],

      updatedAt: ahora,
    };

    await db.collection<ZonaAfectada>("Zonas_afectadas").updateOne(
      {
        _id: String(id),
      },
      {
        $set: actualizacion,
      }
    );

    const zonaActualizada = await db
      .collection<ZonaAfectada>("Zonas_afectadas")
      .findOne({
        _id: String(id),
      });

    return NextResponse.json({
      success: true,
      message: "Zona afectada actualizada correctamente.",
      data: zonaActualizada,
    });
  } catch (error) {
    console.error("Error actualizando zona afectada:", error);

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
 * eliminar zonas afectadas.
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

    const resultado = await db
      .collection<ZonaAfectada>("Zonas_afectadas")
      .deleteOne({
        _id: String(id),
      });

    if (resultado.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "La zona afectada no existe.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Zona afectada eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando zona afectada:", error);

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
