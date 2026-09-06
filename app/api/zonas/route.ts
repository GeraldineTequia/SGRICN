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

/**
 * GET
 *
 * Todos los usuarios autenticados pueden
 * consultar las zonas afectadas.
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

    const zonas = await db
      .collection<ZonaAfectada>("Zonas_afectadas")
      .find({})
      .sort({
        createdAt: -1,
      })
      .toArray();

    return NextResponse.json({
      success: true,
      data: zonas,
    });
  } catch (error) {
    console.error("Error obteniendo zonas afectadas:", error);

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
 * Solo ADMIN y FUNCIONARIO pueden
 * crear zonas afectadas.
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

    /*
     * Validar catástrofe relacionada.
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
     * Validar ubicación GeoJSON.
     *
     * MongoDB:
     * [longitud, latitud]
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
     * Generar ID:
     *
     * zona001
     * zona002
     * zona003
     */
    const existentes = await db
      .collection<ZonaAfectada>("Zonas_afectadas")
      .find({})
      .toArray();

    const siguienteNumero = existentes.length + 1;

    const nuevoId = `zona${String(siguienteNumero).padStart(3, "0")}`;

    const ahora = new Date().toISOString();

    const nuevaZona: ZonaAfectada = {
      _id: nuevoId,

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

      createdAt: ahora,
      updatedAt: ahora,
    };

    await db.collection<ZonaAfectada>("Zonas_afectadas").insertOne(nuevaZona);

    return NextResponse.json(
      {
        success: true,
        message: "Zona afectada creada correctamente.",
        data: nuevaZona,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error creando zona afectada:", error);

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
