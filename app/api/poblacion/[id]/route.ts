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

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET
 *
 * ADMIN, FUNCIONARIO y USUARIO pueden
 * consultar un registro específico.
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

    const poblacion = await db
      .collection<PoblacionAfectada>("Poblacion_afectada")
      .findOne({
        _id: id,
      });

    if (!poblacion) {
      return NextResponse.json(
        {
          success: false,
          message: "El registro de población afectada no existe.",
        },
        {
          status: 404,
        }
      );
    }

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
 * PUT
 *
 * Solo ADMIN y FUNCIONARIO pueden
 * modificar población afectada.
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

    const db = await getDb();

    /**
     * Verificar que el registro exista.
     */
    const poblacionActual = await db
      .collection<PoblacionAfectada>("Poblacion_afectada")
      .findOne({
        _id: id,
      });

    if (!poblacionActual) {
      return NextResponse.json(
        {
          success: false,
          message: "El registro de población afectada no existe.",
        },
        {
          status: 404,
        }
      );
    }

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
     * Validar todos los valores numéricos.
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
     * Verificar la relación:
     *
     * Población → Zona → Catástrofe
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

    const ahora = new Date().toISOString();

    await db.collection<PoblacionAfectada>("Poblacion_afectada").updateOne(
      {
        _id: id,
      },
      {
        $set: {
          zonaId: zonaId.trim(),
          catastrofeId: catastrofeId.trim(),
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
          updatedAt: ahora,
        },
      }
    );

    const poblacionActualizada = await db
      .collection<PoblacionAfectada>("Poblacion_afectada")
      .findOne({
        _id: id,
      });

    return NextResponse.json({
      success: true,
      message: "Registro de población afectada actualizado correctamente.",
      data: poblacionActualizada,
    });
  } catch (error) {
    console.error("Error actualizando población afectada:", error);

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
 * eliminar registros.
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
      .collection<PoblacionAfectada>("Poblacion_afectada")
      .deleteOne({
        _id: id,
      });

    if (resultado.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "El registro de población afectada no existe.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registro de población afectada eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando población afectada:", error);

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
