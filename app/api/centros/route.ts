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

/**
 * GET
 *
 * ADMIN y FUNCIONARIO pueden consultar todos
 * los centros.
 *
 * USUARIO solamente puede consultar centros
 * activos y autorizados.
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

    const filtro =
      session.role === "USUARIO"
        ? {
            estado: "activo" as const,
            autorizado: true,
          }
        : {};

    const centros = await db
      .collection<CentroDonacion>("Centros_donacion")
      .find(filtro)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: centros,
    });
  } catch (error) {
    console.error("Error obteniendo centros de donación:", error);

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
 * crear centros de donación.
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

    const db = await getDb();

    const cantidadExistente = await db
      .collection<CentroDonacion>("Centros_donacion")
      .countDocuments();

    const nuevoId = `cen${String(cantidadExistente + 1).padStart(3, "0")}`;

    const ahora = new Date().toISOString();

    const nuevoCentro: CentroDonacion = {
      _id: nuevoId,
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
      createdAt: ahora,
      updatedAt: ahora,
    };

    await db
      .collection<CentroDonacion>("Centros_donacion")
      .insertOne(nuevoCentro);

    return NextResponse.json(
      {
        success: true,
        message: "Centro de donación creado correctamente.",
        data: nuevoCentro,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando centro de donación:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}
