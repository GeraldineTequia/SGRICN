import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import {
  forbiddenResponse,
  unauthorizedResponse,
  requireRole,
} from "@/lib/auth/authorization";
import { PoblacionAfectada } from "@/types/poblacion";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET
 *
 * ADMIN, FUNCIONARIO y USUARIO pueden consultar
 * la población afectada.
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

    const poblacion = await db
      .collection<PoblacionAfectada>("Poblacion_afectada")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: poblacion,
    });
  } catch (error) {
    console.error("Error obteniendo población afectada:", error);

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
 * registrar población afectada.
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
      zonaId,
      catastrofeId,
      familiasAfectadas,
      personasAfectadas,
      personasHeridas,
      personasFallecidas,
      personasDesaparecidas,
      niños,
      adultos,
      adultosMayores,
      personasDiscapacidad,
      personasEvacuadas,
      personasAlbergadas,
      personasPendientesAtencion,
    } = body;

    if (typeof zonaId !== "string" || !zonaId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "La zona afectada es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof catastrofeId !== "string" || !catastrofeId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "La catástrofe es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Todos los valores de población deben ser
     * números enteros mayores o iguales a cero.
     */
    const valores = [
      {
        nombre: "familiasAfectadas",
        valor: familiasAfectadas,
      },
      {
        nombre: "personasAfectadas",
        valor: personasAfectadas,
      },
      {
        nombre: "personasHeridas",
        valor: personasHeridas,
      },
      {
        nombre: "personasFallecidas",
        valor: personasFallecidas,
      },
      {
        nombre: "personasDesaparecidas",
        valor: personasDesaparecidas,
      },
      {
        nombre: "niños",
        valor: niños,
      },
      {
        nombre: "adultos",
        valor: adultos,
      },
      {
        nombre: "adultosMayores",
        valor: adultosMayores,
      },
      {
        nombre: "personasDiscapacidad",
        valor: personasDiscapacidad,
      },
      {
        nombre: "personasEvacuadas",
        valor: personasEvacuadas,
      },
      {
        nombre: "personasAlbergadas",
        valor: personasAlbergadas,
      },
      {
        nombre: "personasPendientesAtencion",
        valor: personasPendientesAtencion,
      },
    ];

    for (const item of valores) {
      if (
        typeof item.valor !== "number" ||
        !Number.isInteger(item.valor) ||
        item.valor < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `El campo ${item.nombre} debe ser un número entero mayor o igual a cero.`,
          },
          {
            status: 400,
          }
        );
      }
    }

    const db = await getDb();

    /**
     * Verificar que la zona exista.
     */
    const zona = await db
      .collection<{
        _id: string;
        catastrofeId: string;
      }>("Zonas_afectadas")
      .findOne({
        _id: zonaId.trim(),
      });

    if (!zona) {
      return NextResponse.json(
        {
          success: false,
          message: "La zona afectada indicada no existe.",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * Verificar que la catástrofe exista.
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
          message: "La catástrofe indicada no existe.",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * Verificar que la zona pertenezca
     * a la catástrofe seleccionada.
     */
    if (zona.catastrofeId !== catastrofeId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "La zona seleccionada no pertenece a la catástrofe indicada.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Generar identificador.
     */
    const cantidadExistente = await db
      .collection<PoblacionAfectada>("Poblacion_afectada")
      .countDocuments();

    const nuevoId = `pob${String(cantidadExistente + 1).padStart(3, "0")}`;

    const ahora = new Date().toISOString();

    const nuevaPoblacion: PoblacionAfectada = {
      _id: nuevoId,
      zonaId: zonaId.trim(),
      catastrofeId: catastrofeId.trim(),
      familiasAfectadas,
      personasAfectadas,
      heridos,
      fallecidos,
      desaparecidos,
      niños,
      adultos,
      adultosMayores,
      personasDiscapacidad,
      personasEvacuadas,
      personasAlbergadas,
      personasPendientesAtencion,
      createdAt: ahora,
      updatedAt: ahora,
    };

    await db
      .collection<PoblacionAfectada>("Poblacion_afectada")
      .insertOne(nuevaPoblacion);

    return NextResponse.json(
      {
        success: true,
        message: "Registro de población afectada creado correctamente.",
        data: nuevaPoblacion,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error creando población afectada:", error);

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
