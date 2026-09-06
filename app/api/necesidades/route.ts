import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import {
  forbiddenResponse,
  unauthorizedResponse,
  requireRole,
} from "@/lib/auth/authorization";
import {
  Necesidad,
  PrioridadNecesidad,
  EstadoNecesidad,
} from "@/types/necesidades";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET
 *
 * ADMIN, FUNCIONARIO y USUARIO pueden consultar
 * las necesidades registradas.
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

    const necesidades = await db
      .collection<Necesidad>("Necesidades")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: necesidades,
    });
  } catch (error) {
    console.error("Error obteniendo necesidades:", error);

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
 * necesidades.
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
      zonaId,
      categoria,
      nombre,
      descripcion,
      unidad,
      cantidadNecesaria,
      cantidadRecibida,
      prioridad,
      estado,
    } = body;

    if (typeof catastrofeId !== "string" || !catastrofeId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "La catástrofe es obligatoria.",
        },
        { status: 400 }
      );
    }

    if (typeof zonaId !== "string" || !zonaId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "La zona afectada es obligatoria.",
        },
        { status: 400 }
      );
    }

    if (typeof categoria !== "string" || !categoria.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "La categoría es obligatoria.",
        },
        { status: 400 }
      );
    }

    if (typeof nombre !== "string" || nombre.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          message:
            "El nombre de la necesidad debe tener al menos 3 caracteres.",
        },
        { status: 400 }
      );
    }

    if (typeof descripcion !== "string" || descripcion.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "La descripción debe tener al menos 10 caracteres.",
        },
        { status: 400 }
      );
    }

    if (typeof unidad !== "string" || !unidad.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "La unidad es obligatoria.",
        },
        { status: 400 }
      );
    }

    if (
      typeof cantidadNecesaria !== "number" ||
      !Number.isFinite(cantidadNecesaria) ||
      cantidadNecesaria < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "La cantidad necesaria debe ser un número mayor o igual a cero.",
        },
        { status: 400 }
      );
    }

    if (
      typeof cantidadRecibida !== "number" ||
      !Number.isFinite(cantidadRecibida) ||
      cantidadRecibida < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "La cantidad recibida debe ser un número mayor o igual a cero.",
        },
        { status: 400 }
      );
    }

    if (cantidadRecibida > cantidadNecesaria) {
      return NextResponse.json(
        {
          success: false,
          message:
            "La cantidad recibida no puede ser mayor que la cantidad necesaria.",
        },
        { status: 400 }
      );
    }

    const prioridadesValidas: PrioridadNecesidad[] = [
      "baja",
      "media",
      "alta",
      "critica",
    ];

    if (!prioridadesValidas.includes(prioridad)) {
      return NextResponse.json(
        {
          success: false,
          message: "La prioridad indicada no es válida.",
        },
        { status: 400 }
      );
    }

    const estadosValidos: EstadoNecesidad[] = [
      "pendiente",
      "en_atencion",
      "atendida",
    ];

    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        {
          success: false,
          message: "El estado indicado no es válido.",
        },
        { status: 400 }
      );
    }

    const db = await getDb();

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
        { status: 404 }
      );
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
        { status: 404 }
      );
    }

    /**
     * Verificar la relación:
     *
     * Necesidad → Zona → Catástrofe
     */
    if (zona.catastrofeId !== catastrofeId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "La zona seleccionada no pertenece a la catástrofe indicada.",
        },
        { status: 400 }
      );
    }

    const cantidadPendiente = Math.max(cantidadNecesaria - cantidadRecibida, 0);

    const porcentajeAtendido =
      cantidadNecesaria === 0
        ? 0
        : Math.min(
            100,
            Math.round((cantidadRecibida / cantidadNecesaria) * 100)
          );

    const ahora = new Date().toISOString();

    const cantidadExistente = await db
      .collection<Necesidad>("Necesidades")
      .countDocuments();

    const nuevoId = `nec${String(cantidadExistente + 1).padStart(3, "0")}`;

    const nuevaNecesidad: Necesidad = {
      _id: nuevoId,
      catastrofeId: catastrofeId.trim(),
      zonaId: zonaId.trim(),
      categoria: categoria.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      unidad: unidad.trim(),
      cantidadNecesaria,
      cantidadRecibida,
      cantidadPendiente,
      porcentajeAtendido,
      prioridad,
      estado,
      createdAt: ahora,
      updatedAt: ahora,
    };

    await db.collection<Necesidad>("Necesidades").insertOne(nuevaNecesidad);

    return NextResponse.json(
      {
        success: true,
        message: "Necesidad creada correctamente.",
        data: nuevaNecesidad,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando necesidad:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}
