import { NextRequest, NextResponse } from "next/server";
import { Filter } from "mongodb";

import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import { forbiddenResponse } from "@/lib/auth/authorization";
import { Noticia } from "@/types/noticias";
import { Usuario } from "@/types/usuarios";
import { Catastrofe } from "@/types/catastrofes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/noticias/[id]
 *
 * ADMIN / FUNCIONARIO:
 * - Pueden consultar cualquier noticia.
 *
 * USUARIO:
 * - Solo puede consultar noticias publicadas.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes iniciar sesión.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "El ID de la noticia es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    const db = await getDb();

    const filtro: Filter<Noticia> =
      session.role === "USUARIO"
        ? {
            _id: id,
            estado: "publicada",
          }
        : {
            _id: id,
          };

    const noticia = await db.collection<Noticia>("Noticias").findOne(filtro);

    if (!noticia) {
      return NextResponse.json(
        {
          success: false,
          message: "Noticia no encontrada.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: noticia,
    });
  } catch (error) {
    console.error("Error obteniendo noticia:", error);

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
 * PUT /api/noticias/[id]
 *
 * Solo ADMIN y FUNCIONARIO pueden editar.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes iniciar sesión.",
        },
        {
          status: 401,
        }
      );
    }

    if (session.role !== "ADMIN" && session.role !== "FUNCIONARIO") {
      return forbiddenResponse();
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "El ID de la noticia es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const db = await getDb();

    const noticiaExistente = await db.collection<Noticia>("Noticias").findOne({
      _id: id,
    });

    if (!noticiaExistente) {
      return NextResponse.json(
        {
          success: false,
          message: "La noticia no existe.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      titulo,
      resumen,
      contenido,
      categoria,
      imagenUrl,
      autorId,
      catastrofeId,
      estado,
      fechaPublicacion,
    } = body;

    /*
     * Validación del título.
     */
    if (
      titulo !== undefined &&
      (typeof titulo !== "string" || titulo.trim().length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "El título no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validación del resumen.
     */
    if (
      resumen !== undefined &&
      (typeof resumen !== "string" || resumen.trim().length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "El resumen no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validación del contenido.
     */
    if (
      contenido !== undefined &&
      (typeof contenido !== "string" || contenido.trim().length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "El contenido no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validación de categoría.
     */
    const categoriasValidas: Noticia["categoria"][] = [
      "emergencia",
      "prevencion",
      "ayuda",
      "institucional",
      "comunidad",
    ];

    if (
      categoria !== undefined &&
      (typeof categoria !== "string" ||
        !categoriasValidas.includes(categoria as Noticia["categoria"]))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "La categoría no es válida.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validación de imagen.
     */
    if (imagenUrl !== undefined && typeof imagenUrl !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "La URL de imagen no es válida.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validación de estado.
     */
    const estadosValidos: Noticia["estado"][] = [
      "borrador",
      "publicada",
      "archivada",
    ];

    if (
      estado !== undefined &&
      (typeof estado !== "string" ||
        !estadosValidos.includes(estado as Noticia["estado"]))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "El estado no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Si se cambia el autor, verificar que exista
     * y que sea ADMIN o FUNCIONARIO.
     */
    if (autorId !== undefined) {
      if (typeof autorId !== "string" || autorId.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "El autor no es válido.",
          },
          {
            status: 400,
          }
        );
      }

      const autor = await db.collection<Usuario>("Usuarios").findOne({
        _id: autorId,
      });

      if (!autor) {
        return NextResponse.json(
          {
            success: false,
            message: "El autor indicado no existe.",
          },
          {
            status: 400,
          }
        );
      }

      if (autor.rol !== "admin" && autor.rol !== "funcionario") {
        return NextResponse.json(
          {
            success: false,
            message: "El autor debe ser administrador o funcionario.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * Si se cambia la catástrofe,
     * verificar que exista.
     */
    if (catastrofeId !== undefined) {
      if (
        typeof catastrofeId !== "string" ||
        catastrofeId.trim().length === 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "La catástrofe no es válida.",
          },
          {
            status: 400,
          }
        );
      }

      const catastrofe = await db
        .collection<Catastrofe>("Catastrofes")
        .findOne({
          _id: catastrofeId,
        });

      if (!catastrofe) {
        return NextResponse.json(
          {
            success: false,
            message: "La catástrofe indicada no existe.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * Construir actualización.
     *
     * Se utiliza Partial<Noticia> para permitir
     * actualizar únicamente los campos enviados.
     */
    const actualizacion: Partial<Noticia> = {};

    if (titulo !== undefined) {
      actualizacion.titulo = titulo.trim();
    }

    if (resumen !== undefined) {
      actualizacion.resumen = resumen.trim();
    }

    if (contenido !== undefined) {
      actualizacion.contenido = contenido.trim();
    }

    if (categoria !== undefined) {
      actualizacion.categoria = categoria as Noticia["categoria"];
    }

    if (imagenUrl !== undefined) {
      actualizacion.imagenUrl = imagenUrl.trim();
    }

    if (autorId !== undefined) {
      actualizacion.autorId = autorId.trim();
    }

    if (catastrofeId !== undefined) {
      actualizacion.catastrofeId = catastrofeId.trim();
    }

    if (estado !== undefined) {
      actualizacion.estado = estado as Noticia["estado"];
    }

    if (fechaPublicacion !== undefined) {
      if (
        typeof fechaPublicacion !== "string" ||
        fechaPublicacion.trim().length === 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "La fecha de publicación no es válida.",
          },
          {
            status: 400,
          }
        );
      }

      actualizacion.fechaPublicacion = fechaPublicacion;
    }

    actualizacion.fechaActualizacion = new Date().toISOString();

    actualizacion.updatedAt = new Date().toISOString();

    await db.collection<Noticia>("Noticias").updateOne(
      {
        _id: id,
      },
      {
        $set: actualizacion,
      }
    );

    const noticiaActualizada = await db
      .collection<Noticia>("Noticias")
      .findOne({
        _id: id,
      });

    return NextResponse.json({
      success: true,
      message: "Noticia actualizada correctamente.",
      data: noticiaActualizada,
    });
  } catch (error) {
    console.error("Error actualizando noticia:", error);

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
 * DELETE /api/noticias/[id]
 *
 * Solo ADMIN y FUNCIONARIO pueden eliminar noticias.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes iniciar sesión.",
        },
        {
          status: 401,
        }
      );
    }

    if (session.role !== "ADMIN" && session.role !== "FUNCIONARIO") {
      return forbiddenResponse();
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "El ID de la noticia es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    const db = await getDb();

    const noticia = await db.collection<Noticia>("Noticias").findOne({
      _id: id,
    });

    if (!noticia) {
      return NextResponse.json(
        {
          success: false,
          message: "La noticia no existe.",
        },
        {
          status: 404,
        }
      );
    }

    await db.collection<Noticia>("Noticias").deleteOne({
      _id: id,
    });

    return NextResponse.json({
      success: true,
      message: "Noticia eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando noticia:", error);

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
