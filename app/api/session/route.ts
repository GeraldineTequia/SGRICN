import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import { Usuario } from "@/types/usuarios";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    /*
     * Obtener la sesión desde la cookie.
     */
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "No hay una sesión activa.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Buscar los datos actuales del usuario
     * en MongoDB.
     */
    const db = await getDb();

    const usuario = await db.collection<Usuario>("Usuarios").findOne(
      {
        _id: session.userId,
      },
      {
        projection: {
          password: 0,
        },
      }
    );

    if (!usuario) {
      return NextResponse.json(
        {
          success: false,
          message: "El usuario de la sesión no existe.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Verificar que el usuario continúe activo.
     */
    if (usuario.estado !== "activo") {
      return NextResponse.json(
        {
          success: false,
          message: "El usuario se encuentra inactivo.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * Devolver únicamente información segura.
     */
    return NextResponse.json({
      success: true,
      data: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol,
        estado: usuario.estado,
      },
    });
  } catch (error) {
    console.error("Error obteniendo la sesión:", error);

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
