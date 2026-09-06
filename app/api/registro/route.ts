import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth/password";
import { Usuario } from "@/types/usuarios";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";

    const apellido =
      typeof body.apellido === "string" ? body.apellido.trim() : "";

    const correo =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const password = typeof body.password === "string" ? body.password : "";

    // Validar campos obligatorios
    if (!nombre || !apellido || !correo || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Todos los campos son obligatorios.",
        },
        {
          status: 400,
        }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "La contraseña debe tener mínimo 6 caracteres.",
        },
        {
          status: 400,
        }
      );
    }

    // Validar formato básico del correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(correo)) {
      return NextResponse.json(
        {
          success: false,
          message: "El correo electrónico no tiene un formato válido.",
        },
        {
          status: 400,
        }
      );
    }

    const db = await getDb();

    const usuarios = db.collection<Usuario>("Usuarios");

    // Comprobar si el correo ya existe
    const usuarioExistente = await usuarios.findOne({
      correo,
    });

    if (usuarioExistente) {
      return NextResponse.json(
        {
          success: false,
          message: "Ya existe un usuario registrado con ese correo.",
        },
        {
          status: 409,
        }
      );
    }

    // Obtener el último ID usrNNN
    const ultimoUsuario = await usuarios
      .find({
        _id: {
          $regex: /^usr\d+$/,
        },
      })
      .sort({
        _id: -1,
      })
      .limit(1)
      .next();

    let siguienteNumero = 1;

    if (ultimoUsuario?._id) {
      const numeroActual = Number(ultimoUsuario._id.replace("usr", ""));

      if (!Number.isNaN(numeroActual)) {
        siguienteNumero = numeroActual + 1;
      }
    }

    const nuevoId = `usr${String(siguienteNumero).padStart(3, "0")}`;

    // Encriptar contraseña
    const passwordHash = await hashPassword(password);

    const ahora = new Date().toISOString();

    // Crear usuario
    const nuevoUsuario: Usuario = {
      _id: nuevoId,
      nombre,
      apellido,
      correo,
      password: passwordHash,

      // Los registros públicos siempre
      // comienzan como usuarios normales.
      rol: "usuario",

      estado: "activo",

      telefono: "",

      fechaRegistro: ahora,

      ultimaSesion: null,

      createdAt: ahora,

      updatedAt: ahora,
    };

    await usuarios.insertOne(nuevoUsuario);

    // Nunca devolver la contraseña
    const usuarioSeguro = {
      _id: nuevoUsuario._id,
      nombre: nuevoUsuario.nombre,
      apellido: nuevoUsuario.apellido,
      correo: nuevoUsuario.correo,
      rol: nuevoUsuario.rol,
      estado: nuevoUsuario.estado,
      telefono: nuevoUsuario.telefono,
      fechaRegistro: nuevoUsuario.fechaRegistro,
      ultimaSesion: nuevoUsuario.ultimaSesion,
      createdAt: nuevoUsuario.createdAt,
      updatedAt: nuevoUsuario.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Cuenta creada correctamente.",
        data: usuarioSeguro,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error registrando usuario:", error);

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
