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

/**
 * GET /api/noticias
 *
 * ADMIN / FUNCIONARIO:
 * - Pueden consultar todas las noticias.
 *
 * USUARIO:
 * - Solo puede consultar noticias publicadas.
 */
export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes iniciar sesión para consultar las noticias.",
        },
        {
          status: 401,
        }
      );
    }

    const db = await getDb();

    const filtro: Filter<Noticia> =
      session.role === "USUARIO"
        ? {
            estado: "publicada",
          }
        : {};

    const noticias = await db
      .collection<Noticia>("Noticias")
      .find(filtro)
      .sort({
        fechaPublicacion: -1,
        createdAt: -1,
      })
      .toArray();

    return NextResponse.json({
      success: true,
      data: noticias,
    });
  } catch (error) {
    console.error("Error obteniendo noticias:", error);

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
 * POST /api/noticias
 *
 * Solo ADMIN y FUNCIONARIO pueden crear noticias.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes iniciar sesión para crear una noticia.",
        },
        {
          status: 401,
        }
      );
    }

    if (session.role !== "ADMIN" && session.role !== "FUNCIONARIO") {
      return forbiddenResponse();
    }

    const body = await request.json();

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

    if (typeof titulo !== "string" || titulo.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "El título de la noticia es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof resumen !== "string" || resumen.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "El resumen de la noticia es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof contenido !== "string" || contenido.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "El contenido de la noticia es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    const categoriasValidas: Noticia["categoria"][] = [
      "emergencia",
      "prevencion",
      "ayuda",
      "institucional",
      "comunidad",
    ];

    if (
      typeof categoria !== "string" ||
      !categoriasValidas.includes(categoria as Noticia["categoria"])
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "La categoría de la noticia no es válida.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof imagenUrl !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "La URL de la imagen debe ser un texto válido.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof autorId !== "string" || autorId.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "El autor de la noticia es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof catastrofeId !== "string" || catastrofeId.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "La catástrofe asociada es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    const estadosValidos: Noticia["estado"][] = [
      "borrador",
      "publicada",
      "archivada",
    ];

    if (
      typeof estado !== "string" ||
      !estadosValidos.includes(estado as Noticia["estado"])
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "El estado de la noticia no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    const db = await getDb();

    /*
     * Verificar que el autor exista.
     */
    const autor = await db.collection<Usuario>("Usuarios").findOne({
      _id: autorId,
    });

    if (!autor) {
      return NextResponse.json(
        {
          success: false,
          message: "El usuario indicado como autor no existe.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * El autor debe ser ADMIN o FUNCIONARIO.
     */
    if (autor.rol !== "admin" && autor.rol !== "funcionario") {
      return NextResponse.json(
        {
          success: false,
          message:
            "El autor de una noticia debe ser administrador o funcionario.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Verificar que la catástrofe exista.
     */
    const catastrofe = await db.collection<Catastrofe>("Catastrofes").findOne({
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

    /*
     * Generar ID not001, not002, etc.
     */
    const ultimaNoticia = await db
      .collection<Noticia>("Noticias")
      .find({})
      .sort({
        _id: -1,
      })
      .limit(1)
      .next();

    let siguienteNumero = 1;

    if (ultimaNoticia?._id) {
      const numeroActual = Number(ultimaNoticia._id.replace("not", ""));

      if (!Number.isNaN(numeroActual)) {
        siguienteNumero = numeroActual + 1;
      }
    }

    const nuevoId = `not${String(siguienteNumero).padStart(3, "0")}`;

    const ahora = new Date().toISOString();

    const nuevaNoticia: Noticia = {
      _id: nuevoId,
      titulo: titulo.trim(),
      resumen: resumen.trim(),
      contenido: contenido.trim(),
      categoria: categoria as Noticia["categoria"],
      imagenUrl: imagenUrl.trim(),
      autorId: autorId.trim(),
      catastrofeId: catastrofeId.trim(),
      estado: estado as Noticia["estado"],
      fechaPublicacion:
        typeof fechaPublicacion === "string" &&
        fechaPublicacion.trim().length > 0
          ? fechaPublicacion
          : ahora,
      fechaActualizacion: ahora,
      createdAt: ahora,
      updatedAt: ahora,
    };

    await db.collection<Noticia>("Noticias").insertOne(nuevaNoticia);

    return NextResponse.json(
      {
        success: true,
        message: "Noticia creada correctamente.",
        data: nuevaNoticia,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error creando noticia:", error);

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
