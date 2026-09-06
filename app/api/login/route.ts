import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { comparePassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/session";
import { Usuario } from "@/types/usuarios";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { correo, password } = body;

    /* ================================
       VALIDAR DATOS
       ================================= */

    if (!correo || typeof correo !== "string" || !correo.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "El correo es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "La contraseña es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    /* ================================
       NORMALIZAR CORREO
       ================================= */

    const correoNormalizado = correo.trim().toLowerCase();

    /* ================================
       CONECTAR A MONGODB
       ================================= */

    const db = await getDb();

    /* ================================
       BUSCAR USUARIO
       ================================= */

    const usuario = await db.collection<Usuario>("Usuarios").findOne({
      correo: correoNormalizado,
    });

    /*
     * Por seguridad, no indicamos si el
     * correo existe o no.
     */

    if (!usuario || !usuario.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Correo o contraseña incorrectos.",
        },
        {
          status: 401,
        }
      );
    }

    /* ================================
       VALIDAR ESTADO
       ================================= */

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

    /* ================================
       COMPARAR CONTRASEÑA
       ================================= */

    const passwordCorrecta = await comparePassword(password, usuario.password);

    if (!passwordCorrecta) {
      return NextResponse.json(
        {
          success: false,
          message: "Correo o contraseña incorrectos.",
        },
        {
          status: 401,
        }
      );
    }

    /* ================================
       ACTUALIZAR ÚLTIMA SESIÓN
       ================================= */

    const ahora = new Date().toISOString();

    await db.collection<Usuario>("Usuarios").updateOne(
      {
        _id: usuario._id,
      },
      {
        $set: {
          ultimaSesion: ahora,
          updatedAt: ahora,
        },
      }
    );
    const rolesMapeados = {
      admin: "ADMIN",
      funcionario: "FUNCIONARIO",
      usuario: "USUARIO",
    } as const;

    const role = rolesMapeados[usuario.rol];

    const sessionToken = await createSessionToken({
      userId: usuario._id,
      correo: usuario.correo,
      role,
    });
    /* ================================
       DATOS SEGUROS DEL USUARIO
       ================================= */

    const usuarioSeguro = {
      _id: usuario._id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
      telefono: usuario.telefono,
      fechaRegistro: usuario.fechaRegistro,
      ultimaSesion: ahora,
    };

    /* ================================
       RESPUESTA
       ================================= */

    const response = NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso.",
      data: usuarioSeguro,
    });

    response.cookies.set({
      name: "sgricn_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible iniciar sesión.",
      },
      {
        status: 500,
      }
    );
  }
}
