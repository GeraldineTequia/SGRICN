import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import {
  forbiddenResponse,
  unauthorizedResponse,
  requireRole,
} from "@/lib/auth/authorization";
import {
  Donacion,
  MetodoPagoDonacion,
  EstadoDonacion,
} from "@/types/donaciones";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET
 *
 * ADMIN y FUNCIONARIO pueden consultar
 * todas las donaciones.
 *
 * USUARIO solamente puede consultar
 * sus propias donaciones.
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
            usuarioId: session.userId,
          }
        : {};

    const donaciones = await db
      .collection<Donacion>("Donaciones")
      .find(filtro)
      .sort({ fechaCreacion: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: donaciones,
    });
  } catch (error) {
    console.error("Error obteniendo donaciones:", error);

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
 * USUARIO puede crear donaciones.
 *
 * El usuarioId se obtiene directamente
 * de la sesión y NO del body.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return unauthorizedResponse();
    }

    if (!requireRole(session, ["USUARIO"])) {
      return forbiddenResponse();
    }

    const body = await request.json();

    const {
      catastrofeId,
      monto,
      moneda,
      metodoPago,
      pasarela,
      referencia,
      transaccionId,
      estado,
      descripcion,
    } = body;

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

    if (typeof monto !== "number" || !Number.isFinite(monto) || monto <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "El monto debe ser mayor que cero.",
        },
        {
          status: 400,
        }
      );
    }

    if (monto > 1000000000) {
      return NextResponse.json(
        {
          success: false,
          message: "El monto supera el límite permitido.",
        },
        {
          status: 400,
        }
      );
    }

    if (moneda !== "COP") {
      return NextResponse.json(
        {
          success: false,
          message: "La moneda debe ser COP.",
        },
        {
          status: 400,
        }
      );
    }

    const metodosValidos: MetodoPagoDonacion[] = [
      "PSE",
      "tarjeta",
      "transferencia",
      "efectivo",
    ];

    if (!metodosValidos.includes(metodoPago)) {
      return NextResponse.json(
        {
          success: false,
          message: "El método de pago no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof pasarela !== "string" || !pasarela.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "La pasarela de pago es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof referencia !== "string" || !referencia.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "La referencia es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof transaccionId !== "string" || !transaccionId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "El identificador de transacción es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    const estadosValidos: EstadoDonacion[] = [
      "pendiente",
      "aprobada",
      "rechazada",
      "cancelada",
    ];

    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        {
          success: false,
          message: "El estado de la donación no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof descripcion !== "string" || descripcion.trim().length < 5) {
      return NextResponse.json(
        {
          success: false,
          message: "La descripción debe tener al menos 5 caracteres.",
        },
        {
          status: 400,
        }
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
        {
          status: 404,
        }
      );
    }

    /**
     * Verificar que el usuario de la sesión
     * siga existiendo y esté activo.
     */
    const usuario = await db
      .collection<{
        _id: string;
        estado: string;
      }>("Usuarios")
      .findOne({
        _id: session.userId,
      });

    if (!usuario) {
      return unauthorizedResponse();
    }

    if (usuario.estado !== "activo") {
      return forbiddenResponse();
    }

    /**
     * Generar identificador de donación.
     */
    const cantidadExistente = await db
      .collection<Donacion>("Donaciones")
      .countDocuments();

    const nuevoId = `don${String(cantidadExistente + 1).padStart(3, "0")}`;

    const ahora = new Date().toISOString();

    const nuevaDonacion: Donacion = {
      _id: nuevoId,

      /**
       * MUY IMPORTANTE:
       * este valor proviene de la sesión.
       */
      usuarioId: session.userId,

      catastrofeId: catastrofeId.trim(),

      monto,

      moneda: "COP",

      metodoPago,

      pasarela: pasarela.trim(),

      referencia: referencia.trim(),

      transaccionId: transaccionId.trim(),

      estado,

      descripcion: descripcion.trim(),

      fechaCreacion: ahora,

      fechaActualizacion: ahora,
    };

    await db.collection<Donacion>("Donaciones").insertOne(nuevaDonacion);

    return NextResponse.json(
      {
        success: true,
        message: "Donación registrada correctamente.",
        data: nuevaDonacion,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error creando donación:", error);

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
