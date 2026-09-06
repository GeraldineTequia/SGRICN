import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import {
  forbiddenResponse,
  unauthorizedResponse,
  requireRole,
} from "@/lib/auth/authorization";
import { CentroDonacion } from "@/types/centros";

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
 * cualquier centro.
 *
 * USUARIO solamente puede consultar
 * centros activos y autorizados.
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
            estado: "activo" as const,
            autorizado: true,
          }
        : {
            _id: id,
          };

    const centro = await db
      .collection<CentroDonacion>("Centros_donacion")
      .findOne(filtro);

    if (!centro) {
      return NextResponse.json(
        {
          success: false,
          message: "El centro de donación no existe o no está disponible.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: centro,
    });
  } catch (error) {
    console.error("Error obteniendo centro de donación:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT
 *
 * Solo ADMIN y FUNCIONARIO pueden
 * modificar centros.
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
      nombre,
      direccion,
      departamento,
      municipio,
      ubicacion,
      telefono,
      correo,
      horario,
      tipoDonacion,
      estado,
      autorizado,
      responsable,
    } = body;

    const db = await getDb();

    const centroActual = await db
      .collection<CentroDonacion>("Centros_donacion")
      .findOne({
        _id: id,
      });

    if (!centroActual) {
      return NextResponse.json(
        {
          success: false,
          message: "El centro de donación no existe.",
        },
        { status: 404 }
      );
    }

    if (typeof nombre !== "string" || nombre.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "El nombre debe tener al menos 3 caracteres.",
        },
        { status: 400 }
      );
    }

    if (typeof direccion !== "string" || !direccion.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "La dirección es obligatoria.",
        },
        { status: 400 }
      );
    }

    if (typeof departamento !== "string" || !departamento.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "El departamento es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (typeof municipio !== "string" || !municipio.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "El municipio es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (
      !ubicacion ||
      typeof ubicacion !== "object" ||
      ubicacion.type !== "Point" ||
      !Array.isArray(ubicacion.coordinates) ||
      ubicacion.coordinates.length !== 2
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "La ubicación debe ser un punto geográfico válido.",
        },
        { status: 400 }
      );
    }

    const [longitud, latitud] = ubicacion.coordinates;

    if (
      typeof longitud !== "number" ||
      typeof latitud !== "number" ||
      !Number.isFinite(longitud) ||
      !Number.isFinite(latitud) ||
      longitud < -180 ||
      longitud > 180 ||
      latitud < -90 ||
      latitud > 90
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Las coordenadas geográficas no son válidas.",
        },
        { status: 400 }
      );
    }

    if (typeof telefono !== "string" || !telefono.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "El teléfono es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (typeof correo !== "string" || !correo.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "El correo es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (typeof horario !== "string" || !horario.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "El horario es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(tipoDonacion) ||
      tipoDonacion.length === 0 ||
      tipoDonacion.some(
        (tipo: unknown) => typeof tipo !== "string" || !tipo.trim()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Debe indicar al menos un tipo de donación.",
        },
        { status: 400 }
      );
    }

    if (estado !== "activo" && estado !== "inactivo") {
      return NextResponse.json(
        {
          success: false,
          message: "El estado indicado no es válido.",
        },
        { status: 400 }
      );
    }

    if (typeof autorizado !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "El campo autorizado debe ser verdadero o falso.",
        },
        { status: 400 }
      );
    }

    if (typeof responsable !== "string" || !responsable.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "El responsable es obligatorio.",
        },
        { status: 400 }
      );
    }

    const ahora = new Date().toISOString();

    await db.collection<CentroDonacion>("Centros_donacion").updateOne(
      {
        _id: id,
      },
      {
        $set: {
          nombre: nombre.trim(),
          direccion: direccion.trim(),
          departamento: departamento.trim(),
          municipio: municipio.trim(),
          ubicacion: {
            type: "Point",
            coordinates: [longitud, latitud],
          },
          telefono: telefono.trim(),
          correo: correo.trim(),
          horario: horario.trim(),
          tipoDonacion: tipoDonacion.map((tipo: string) => tipo.trim()),
          estado,
          autorizado,
          responsable: responsable.trim(),
          updatedAt: ahora,
        },
      }
    );

    const centroActualizado = await db
      .collection<CentroDonacion>("Centros_donacion")
      .findOne({
        _id: id,
      });

    return NextResponse.json({
      success: true,
      message: "Centro de donación actualizado correctamente.",
      data: centroActualizado,
    });
  } catch (error) {
    console.error("Error actualizando centro de donación:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE
 *
 * Solo ADMIN y FUNCIONARIO pueden
 * eliminar centros.
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
      .collection<CentroDonacion>("Centros_donacion")
      .deleteOne({
        _id: id,
      });

    if (resultado.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "El centro de donación no existe.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Centro de donación eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando centro de donación:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}
