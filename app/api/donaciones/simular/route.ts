import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { donacionId, resultado } = body;

    if (!donacionId) {
      return NextResponse.json(
        {
          success: false,
          message: "La donación es obligatoria.",
        },
        { status: 400 }
      );
    }

    if (resultado !== "aprobada" && resultado !== "rechazada") {
      return NextResponse.json(
        {
          success: false,
          message: "El resultado debe ser aprobada o rechazada.",
        },
        { status: 400 }
      );
    }

    const db = await getDb();

    const donacion = await db.collection("Donaciones").findOne({
      _id: donacionId,
    });

    if (!donacion) {
      return NextResponse.json(
        {
          success: false,
          message: "La donación no existe.",
        },
        { status: 404 }
      );
    }

    if (donacion.estado !== "pendiente") {
      return NextResponse.json(
        {
          success: false,
          message: "Esta donación ya tiene un resultado.",
        },
        { status: 400 }
      );
    }

    const ahora = new Date().toISOString();

    await db.collection("Donaciones").updateOne(
      {
        _id: donacionId,
      },
      {
        $set: {
          estado: resultado,
          fechaActualizacion: ahora,
        },
      }
    );

    const donacionActualizada = await db.collection("Donaciones").findOne({
      _id: donacionId,
    });

    return NextResponse.json({
      success: true,
      message:
        resultado === "aprobada"
          ? "Pago aprobado correctamente."
          : "Pago rechazado.",
      data: donacionActualizada,
    });
  } catch (error) {
    console.error("Error simulando el pago:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No se pudo procesar la simulación.",
      },
      { status: 500 }
    );
  }
}
