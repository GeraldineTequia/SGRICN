import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import { hashPassword } from "@/lib/auth/password";
import { Usuario } from "@/types/usuarios";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET
 *
 * ADMIN:
 * - Puede consultar todos los usuarios.
 *
 * FUNCIONARIO:
 * - Puede consultar todos los usuarios.
 *
 * USUARIO:
 * - No tiene acceso.
 *
 * La contraseña nunca se devuelve.
 */
export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes iniciar sesión para consultar los usuarios.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN" && session.role !== "FUNCIONARIO") {
      return NextResponse.json(
        {
          success: false,
          message: "No tienes permisos para consultar los usuarios.",
        },
        { status: 403 }
      );
    }

    const db = await getDb();

    const usuarios = await db
      .collection<Usuario>("Usuarios")
      .find(
        {},
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
      data: usuarios,
    });
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);

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
 * POST
 *
 * Solo ADMIN puede crear usuarios.
 */
export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes iniciar sesión para crear usuarios.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Solo un administrador puede crear usuarios.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";

    const apellido =
      typeof body.apellido === "string" ? body.apellido.trim() : "";

    const correo =
      typeof body.correo === "string" ? body.correo.trim().toLowerCase() : "";

    const password = typeof body.password === "string" ? body.password : "";

    const rol = typeof body.rol === "string" ? body.rol.toLowerCase() : "";

    const estado =
      typeof body.estado === "string" ? body.estado.toLowerCase() : "";

    const telefono =
      typeof body.telefono === "string" ? body.telefono.trim() : "";

    // -----------------------------------------
    // VALIDACIONES
    // -----------------------------------------

    if (!nombre) {
      return NextResponse.json(
        {
          success: false,
          message: "El nombre es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (nombre.length < 2 || nombre.length > 80) {
      return NextResponse.json(
        {
          success: false,
          message: "El nombre debe tener entre 2 y 80 caracteres.",
        },
        { status: 400 }
      );
    }

    if (!apellido) {
      return NextResponse.json(
        {
          success: false,
          message: "El apellido es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (apellido.length < 2 || apellido.length > 80) {
      return NextResponse.json(
        {
          success: false,
          message: "El apellido debe tener entre 2 y 80 caracteres.",
        },
        { status: 400 }
      );
    }

    if (!correo) {
      return NextResponse.json(
        {
          success: false,
          message: "El correo es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return NextResponse.json(
        {
          success: false,
          message: "Ingresa un correo electrónico válido.",
        },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "La contraseña debe tener mínimo 6 caracteres.",
        },
        { status: 400 }
      );
    }

    if (password.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "La contraseña no puede superar los 100 caracteres.",
        },
        { status: 400 }
      );
    }

    if (!telefono) {
      return NextResponse.json(
        {
          success: false,
          message: "El teléfono es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (!/^[0-9+\s()-]{7,20}$/.test(telefono)) {
      return NextResponse.json(
        {
          success: false,
          message: "Ingresa un número de teléfono válido.",
        },
        { status: 400 }
      );
    }

    const rolesValidos = ["admin", "funcionario", "usuario"];

    if (!rolesValidos.includes(rol)) {
      return NextResponse.json(
        {
          success: false,
          message: "El rol seleccionado no es válido.",
        },
        { status: 400 }
      );
    }

    const estadosValidos = ["activo", "inactivo"];

    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        {
          success: false,
          message: "El estado seleccionado no es válido.",
        },
        { status: 400 }
      );
    }

    const db = await getDb();

    const coleccion = db.collection<Usuario>("Usuarios");

    // -----------------------------------------
    // VALIDAR CORREO DUPLICADO
    // -----------------------------------------

    const usuarioExistente = await coleccion.findOne({
      correo,
    });

    if (usuarioExistente) {
      return NextResponse.json(
        {
          success: false,
          message: "Ya existe un usuario registrado con ese correo.",
        },
        { status: 409 }
      );
    }

    // -----------------------------------------
    // GENERAR ID usr001, usr002, ...
    // -----------------------------------------

    const usuariosExistentes = await coleccion
      .find(
        {
          _id: {
            $regex: /^usr\d+$/,
          },
        },
        {
          projection: {
            _id: 1,
          },
        }
      )
      .toArray();

    let siguienteNumero = 1;

    for (const usuario of usuariosExistentes) {
      const coincidencia = usuario._id.match(/^usr(\d+)$/);

      if (coincidencia) {
        const numero = Number(coincidencia[1]);

        if (Number.isFinite(numero) && numero >= siguienteNumero) {
          siguienteNumero = numero + 1;
        }
      }
    }

    let nuevoId = `usr${String(siguienteNumero).padStart(3, "0")}`;

    // Evitar colisiones por si existen registros
    // inesperados con el mismo identificador.
    while (await coleccion.findOne({ _id: nuevoId })) {
      siguienteNumero += 1;

      nuevoId = `usr${String(siguienteNumero).padStart(3, "0")}`;
    }

    // -----------------------------------------
    // CONTRASEÑA
    // -----------------------------------------

    const passwordHash = await hashPassword(password);

    const ahora = new Date().toISOString();

    // -----------------------------------------
    // CREAR USUARIO
    // -----------------------------------------

    const nuevoUsuario: Usuario = {
      _id: nuevoId,
      nombre,
      apellido,
      correo,
      password: passwordHash,
      rol: rol as Usuario["rol"],
      estado: estado as Usuario["estado"],
      telefono,
      fechaRegistro: ahora,
      ultimaSesion: null,
      createdAt: ahora,
      updatedAt: ahora,
    };

    await coleccion.insertOne(nuevoUsuario);

    // -----------------------------------------
    // RESPUESTA SIN PASSWORD
    // -----------------------------------------

    const usuarioRespuesta = {
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
        message: "Usuario creado correctamente.",
        data: usuarioRespuesta,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando usuario:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}
