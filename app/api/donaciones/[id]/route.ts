import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import {
  forbiddenResponse,
  unauthorizedResponse,
  requireRole,
} from "@/lib/auth/authorization";
import { Donacion } from "@/types/donaciones";

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
 * ADMIN y FUNCIONARIO pueden consultar
 * cualquier donación.
 *
 * USUARIO solamente puede consultar
 * sus propias donaciones.
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

    const filtro =
      session.role === "USUARIO"
        ? {
            _id: id,
            usuarioId: session.userId,
          }
        : {
            _id: id,
          };

    const donacion = await db
      .collection<Donacion>("Donaciones")
      .findOne(filtro);

    if (!donacion) {
      return NextResponse.json(
        {
          success: false,
          message:
            "La donación no existe o no tienes permiso para consultarla.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: donacion,
    });
  } catch (error) {
    console.error("Error obteniendo donación:", error);

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
 * Las donaciones no pueden ser modificadas
 * directamente desde la aplicación.
 *
 * Esto protege el historial financiero.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getCurrentSession();

  if (!session) {
    return unauthorizedResponse();
  }

  return forbiddenResponse();
}

/**
 * DELETE
 *
 * Las donaciones no pueden eliminarse
 * directamente desde la aplicación.
 *
 * Esto conserva la trazabilidad financiera.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getCurrentSession();

  if (!session) {
    return unauthorizedResponse();
  }

  return forbiddenResponse();
}
