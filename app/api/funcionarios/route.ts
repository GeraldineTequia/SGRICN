import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Usuario } from "@/types/usuarios";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET
 * Obtiene únicamente los usuarios cuyo rol sea "funcionario".
 */
export async function GET() {
  try {
    const db = await getDb();

    const funcionarios = await db
      .collection<Usuario>("Usuarios")
      .find(
        { rol: "funcionario" },
        {
          projection: {
            password: 0,
          },
        }
      )
      .sort({
        nombre: 1,
        apellido: 1,
      })
      .toArray();

    return NextResponse.json({
      success: true,
      data: funcionarios,
    });
  } catch (error) {
    console.error("Error obteniendo funcionarios:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No se pudieron cargar los funcionarios.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST
 * Crea un nuevo funcionario dentro de la colección Usuarios.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { nombre, apellido, correo, password, telefono, estado } = body;

    // -----------------------------------------
    // VALIDACIONES
    // -----------------------------------------

    if (!nombre || !apellido || !correo || !password || !telefono) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nombre, apellido, correo, contraseña y teléfono son obligatorios.",
        },
        {
          status: 400,
        }
      );
    }

    const db = await getDb();

    // -----------------------------------------
    // NORMALIZAR CORREO
    // -----------------------------------------

    const correoNormalizado = String(correo).trim().toLowerCase();

    // -----------------------------------------
    // VERIFICAR CORREO DUPLICADO
    // -----------------------------------------

    const usuarioExistente = await db.collection<Usuario>("Usuarios").findOne({
      correo: correoNormalizado,
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

    // -----------------------------------------
    // GENERAR ID DEL FUNCIONARIO
    // -----------------------------------------

    const funcionariosExistentes = await db
      .collection<Usuario>("Usuarios")
      .find({
        rol: "funcionario",
      })
      .toArray();

    const numeroFuncionario = funcionariosExistentes.length + 1;

    const nuevoId = `usr${String(numeroFuncionario).padStart(3, "0")}`;

    // -----------------------------------------
    // ENCRIPTAR CONTRASEÑA
    // -----------------------------------------

    const passwordHash = await bcrypt.hash(String(password), 10);

    // -----------------------------------------
    // FECHAS
    // -----------------------------------------

    const ahora = new Date().toISOString();

    // -----------------------------------------
    // CREAR FUNCIONARIO
    // -----------------------------------------

    const nuevoFuncionario: Usuario = {
      _id: nuevoId,

      nombre: String(nombre).trim(),

      apellido: String(apellido).trim(),

      correo: correoNormalizado,

      password: passwordHash,

      rol: "funcionario",

      estado: estado === "inactivo" ? "inactivo" : "activo",

      telefono: String(telefono).trim(),

      fechaRegistro: ahora,

      ultimaSesion: null,

      createdAt: ahora,

      updatedAt: ahora,
    };

    // -----------------------------------------
    // GUARDAR EN MONGODB
    // -----------------------------------------

    await db.collection<Usuario>("Usuarios").insertOne(nuevoFuncionario);

    // -----------------------------------------
    // PREPARAR RESPUESTA
    // SIN CONTRASEÑA
    // -----------------------------------------

    const { password: _password, ...funcionarioRespuesta } = nuevoFuncionario;

    // -----------------------------------------
    // RESPUESTA
    // -----------------------------------------

    return NextResponse.json(
      {
        success: true,
        message: "Funcionario creado correctamente.",
        data: funcionarioRespuesta,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error creando funcionario:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No se pudo crear el funcionario.",
      },
      {
        status: 500,
      }
    );
  }
}
