import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import { hashPassword } from "@/lib/auth/password";
import { Usuario } from "@/types/usuarios";

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
 * ADMIN y FUNCIONARIO:
 * - Pueden consultar un usuario específico.
 *
 * USUARIO:
 * - No tiene acceso.
 *
 * La contraseña nunca se devuelve.
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes iniciar sesión para consultar este usuario.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN" && session.role !== "FUNCIONARIO") {
      return NextResponse.json(
        {
          success: false,
          message: "No tienes permisos para consultar usuarios.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "El ID del usuario es obligatorio.",
        },
        { status: 400 }
      );
    }

    const db = await getDb();

    const usuario = await db.collection<Usuario>("Usuarios").findOne(
      {
        _id: id,
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
          message: "Usuario no encontrado.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    console.error("Error obteniendo usuario:", error);

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
 * Solo ADMIN puede modificar usuarios.
 *
 * Si password no viene o viene vacía:
 * - Se conserva la contraseña actual.
 *
 * Si password tiene contenido:
 * - Se genera un nuevo hash.
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes iniciar sesión para modificar usuarios.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Solo un administrador puede modificar usuarios.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "El ID del usuario es obligatorio.",
        },
        { status: 400 }
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "El cuerpo de la solicitud no es válido.",
        },
        { status: 400 }
      );
    }

    const db = await getDb();

    const coleccion = db.collection<Usuario>("Usuarios");

    const usuarioExistente = await coleccion.findOne({
      _id: id,
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuario no encontrado.",
        },
        { status: 404 }
      );
    }

    const updateData: Partial<Usuario> = {};

    // -----------------------------------------
    // NOMBRE
    // -----------------------------------------

    if (typeof body.nombre === "string") {
      const nombre = body.nombre.trim();

      if (!nombre) {
        return NextResponse.json(
          {
            success: false,
            message: "El nombre no puede estar vacío.",
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

      updateData.nombre = nombre;
    }

    // -----------------------------------------
    // APELLIDO
    // -----------------------------------------

    if (typeof body.apellido === "string") {
      const apellido = body.apellido.trim();

      if (!apellido) {
        return NextResponse.json(
          {
            success: false,
            message: "El apellido no puede estar vacío.",
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

      updateData.apellido = apellido;
    }

    // -----------------------------------------
    // CORREO
    // -----------------------------------------

    if (typeof body.correo === "string") {
      const correo = body.correo.trim().toLowerCase();

      if (!correo) {
        return NextResponse.json(
          {
            success: false,
            message: "El correo no puede estar vacío.",
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

      const correoEnUso = await coleccion.findOne({
        correo,
        _id: {
          $ne: id,
        },
      });

      if (correoEnUso) {
        return NextResponse.json(
          {
            success: false,
            message: "Ya existe otro usuario con ese correo.",
          },
          { status: 409 }
        );
      }

      updateData.correo = correo;
    }

    // -----------------------------------------
    // CONTRASEÑA
    // -----------------------------------------

    if (typeof body.password === "string") {
      const password = body.password;

      /*
       * Campo vacío:
       * conservar contraseña existente.
       */
      if (password.trim() !== "") {
        if (password.length < 6) {
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

        updateData.password = await hashPassword(password);
      }
    }

    // -----------------------------------------
    // ROL
    // -----------------------------------------

    if (typeof body.rol === "string") {
      const rol = body.rol.toLowerCase();

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

      updateData.rol = rol as Usuario["rol"];
    }

    // -----------------------------------------
    // ESTADO
    // -----------------------------------------

    if (typeof body.estado === "string") {
      const estado = body.estado.toLowerCase();

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

      updateData.estado = estado as Usuario["estado"];
    }

    // -----------------------------------------
    // TELÉFONO
    // -----------------------------------------

    if (typeof body.telefono === "string") {
      const telefono = body.telefono.trim();

      if (!telefono) {
        return NextResponse.json(
          {
            success: false,
            message: "El teléfono no puede estar vacío.",
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

      updateData.telefono = telefono;
    }

    // -----------------------------------------
    // FECHA DE ACTUALIZACIÓN
    // -----------------------------------------

    updateData.updatedAt = new Date().toISOString();

    // -----------------------------------------
    // ACTUALIZAR
    // -----------------------------------------

    await coleccion.updateOne(
      {
        _id: id,
      },
      {
        $set: updateData,
      }
    );

    // -----------------------------------------
    // OBTENER USUARIO ACTUALIZADO
    // SIN PASSWORD
    // -----------------------------------------

    const usuarioActualizado = await coleccion.findOne(
      {
        _id: id,
      },
      {
        projection: {
          password: 0,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado correctamente.",
      data: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error actualizando usuario:", error);

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
 * Solo ADMIN puede eliminar usuarios.
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes iniciar sesión para eliminar usuarios.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Solo un administrador puede eliminar usuarios.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "El ID del usuario es obligatorio.",
        },
        { status: 400 }
      );
    }

    const db = await getDb();

    const coleccion = db.collection<Usuario>("Usuarios");

    const usuario = await coleccion.findOne({
      _id: id,
    });

    if (!usuario) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuario no encontrado.",
        },
        { status: 404 }
      );
    }

    await coleccion.deleteOne({
      _id: id,
    });

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando usuario:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}
