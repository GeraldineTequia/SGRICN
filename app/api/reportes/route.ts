import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";

import {
  ReporteCatastrofe,
  ReporteDonacion,
  ReporteGeneral,
  ReporteNecesidad,
  ReporteZona,
} from "@/types/reportes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/reportes
 *
 * Genera los reportes directamente desde MongoDB.
 *
 * Acceso:
 * - ADMIN
 * - FUNCIONARIO
 *
 * USUARIO:
 * - 403 Forbidden
 *
 * No existe una colección independiente de reportes.
 */
export async function GET() {
  try {
    /* ============================================
       SESIÓN Y AUTORIZACIÓN
    ============================================ */

    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes iniciar sesión para consultar los reportes.",
        },
        {
          status: 401,
        }
      );
    }

    if (session.role !== "ADMIN" && session.role !== "FUNCIONARIO") {
      return NextResponse.json(
        {
          success: false,
          message: "No tienes permisos para consultar los reportes.",
        },
        {
          status: 403,
        }
      );
    }

    /* ============================================
       CONEXIÓN A MONGODB
    ============================================ */

    const db = await getDb();

    /* ============================================
       CONSULTAS
    ============================================ */

    const [catastrofes, zonas, poblacion, necesidades, donaciones, centros] =
      await Promise.all([
        db
          .collection("Catastrofes")
          .find({})
          .sort({ fechaInicio: -1 })
          .toArray(),

        db.collection("Zonas_afectadas").find({}).toArray(),

        db.collection("Poblacion_afectada").find({}).toArray(),

        db.collection("Necesidades").find({}).toArray(),

        db.collection("Donaciones").find({}).toArray(),

        db.collection("Centros_donacion").find({}).toArray(),
      ]);

    /* ============================================
       MAPAS DE APOYO
       
       Se utilizan para evitar realizar múltiples
       búsquedas sobre los mismos arreglos.
    ============================================ */

    const zonasPorCatastrofe = new Map<string, typeof zonas>();

    for (const zona of zonas) {
      const catastrofeId = String(zona.catastrofeId ?? "");

      if (!zonasPorCatastrofe.has(catastrofeId)) {
        zonasPorCatastrofe.set(catastrofeId, []);
      }

      zonasPorCatastrofe.get(catastrofeId)!.push(zona);
    }

    const poblacionPorCatastrofe = new Map<string, typeof poblacion>();

    const poblacionPorZona = new Map<string, typeof poblacion>();

    for (const registro of poblacion) {
      const catastrofeId = String(registro.catastrofeId ?? "");

      const zonaId = String(registro.zonaId ?? "");

      if (!poblacionPorCatastrofe.has(catastrofeId)) {
        poblacionPorCatastrofe.set(catastrofeId, []);
      }

      poblacionPorCatastrofe.get(catastrofeId)!.push(registro);

      if (!poblacionPorZona.has(zonaId)) {
        poblacionPorZona.set(zonaId, []);
      }

      poblacionPorZona.get(zonaId)!.push(registro);
    }

    const necesidadesPorCatastrofe = new Map<string, typeof necesidades>();

    for (const necesidad of necesidades) {
      const catastrofeId = String(necesidad.catastrofeId ?? "");

      if (!necesidadesPorCatastrofe.has(catastrofeId)) {
        necesidadesPorCatastrofe.set(catastrofeId, []);
      }

      necesidadesPorCatastrofe.get(catastrofeId)!.push(necesidad);
    }

    /* ============================================
       REPORTE GENERAL
    ============================================ */

    const totalCatastrofes = catastrofes.length;

    const catastrofesActivas = catastrofes.filter(
      (catastrofe) => String(catastrofe.estado).toLowerCase() === "activa"
    ).length;

    const totalZonas = zonas.length;

    const zonasCriticas = zonas.filter(
      (zona) => String(zona.nivelAfectacion).toLowerCase() === "critico"
    ).length;

    const totalPersonasAfectadas = poblacion.reduce(
      (total, registro) => total + Number(registro.personasAfectadas ?? 0),
      0
    );

    const totalFamiliasAfectadas = poblacion.reduce(
      (total, registro) => total + Number(registro.familiasAfectadas ?? 0),
      0
    );

    const totalNecesidades = necesidades.length;

    const necesidadesCriticas = necesidades.filter(
      (necesidad) => String(necesidad.prioridad).toLowerCase() === "critica"
    ).length;

    const necesidadesAtendidas = necesidades.filter(
      (necesidad) => String(necesidad.estado).toLowerCase() === "atendida"
    ).length;

    const donacionesAprobadas = donaciones.filter(
      (donacion) => String(donacion.estado).toLowerCase() === "aprobada"
    );

    const totalDonaciones = donacionesAprobadas.length;

    const montoDonaciones = donacionesAprobadas.reduce(
      (total, donacion) => total + Number(donacion.monto ?? 0),
      0
    );

    const centrosAutorizados = centros.filter(
      (centro) =>
        centro.autorizado === true &&
        String(centro.estado).toLowerCase() === "activo"
    ).length;

    const general: ReporteGeneral = {
      totalCatastrofes,
      catastrofesActivas,
      totalZonas,
      zonasCriticas,
      totalPersonasAfectadas,
      totalFamiliasAfectadas,
      totalNecesidades,
      necesidadesCriticas,
      necesidadesAtendidas,
      totalDonaciones,
      montoDonaciones,
      centrosAutorizados,
    };

    /* ============================================
       REPORTE DE CATÁSTROFES
    ============================================ */

    const reporteCatastrofes: ReporteCatastrofe[] = catastrofes.map(
      (catastrofe) => {
        const catastrofeId = String(catastrofe._id);

        const zonasCatastrofe = zonasPorCatastrofe.get(catastrofeId) ?? [];

        const poblacionCatastrofe =
          poblacionPorCatastrofe.get(catastrofeId) ?? [];

        const necesidadesCatastrofe =
          necesidadesPorCatastrofe.get(catastrofeId) ?? [];

        const personasAfectadas = poblacionCatastrofe.reduce(
          (total, registro) => total + Number(registro.personasAfectadas ?? 0),
          0
        );

        return {
          _id: catastrofeId,

          titulo: String(catastrofe.titulo ?? ""),

          tipo: String(catastrofe.tipo ?? ""),

          estado: String(catastrofe.estado ?? ""),

          nivelEmergencia: String(catastrofe.nivelEmergencia ?? ""),

          departamento: String(catastrofe.departamento ?? ""),

          municipio: String(catastrofe.municipio ?? ""),

          fechaInicio: String(catastrofe.fechaInicio ?? ""),

          zonas: zonasCatastrofe.length,

          personasAfectadas,

          necesidades: necesidadesCatastrofe.length,
        };
      }
    );

    /* ============================================
       REPORTE DE ZONAS / POBLACIÓN
    ============================================ */

    const reporteZonas: ReporteZona[] = zonas.map((zona) => {
      const zonaId = String(zona._id);

      const registrosPoblacion = poblacionPorZona.get(zonaId) ?? [];

      const personasAfectadas = registrosPoblacion.reduce(
        (total, registro) => total + Number(registro.personasAfectadas ?? 0),
        0
      );

      const familiasAfectadas = registrosPoblacion.reduce(
        (total, registro) => total + Number(registro.familiasAfectadas ?? 0),
        0
      );

      return {
        _id: zonaId,

        nombre: String(zona.nombre ?? ""),

        catastrofeId: String(zona.catastrofeId ?? ""),

        nivelAfectacion: String(zona.nivelAfectacion ?? ""),

        estado: String(zona.estado ?? ""),

        departamento: String(zona.departamento ?? ""),

        municipio: String(zona.municipio ?? ""),

        personasAfectadas,

        familiasAfectadas,
      };
    });

    /* ============================================
       REPORTE DE NECESIDADES
    ============================================ */

    const reporteNecesidades: ReporteNecesidad[] = necesidades.map(
      (necesidad) => ({
        _id: String(necesidad._id),

        nombre: String(necesidad.nombre ?? ""),

        categoria: String(necesidad.categoria ?? ""),

        prioridad: String(necesidad.prioridad ?? ""),

        estado: String(necesidad.estado ?? ""),

        cantidadNecesaria: Number(necesidad.cantidadNecesaria ?? 0),

        cantidadRecibida: Number(necesidad.cantidadRecibida ?? 0),

        cantidadPendiente: Number(necesidad.cantidadPendiente ?? 0),

        porcentajeAtendido: Number(necesidad.porcentajeAtendido ?? 0),
      })
    );

    /* ============================================
       REPORTE DE DONACIONES
    ============================================ */

    const reporteDonaciones: ReporteDonacion[] = donaciones.map((donacion) => ({
      _id: String(donacion._id),

      monto: Number(donacion.monto ?? 0),

      moneda: String(donacion.moneda ?? "COP"),

      metodoPago: String(donacion.metodoPago ?? ""),

      estado: String(donacion.estado ?? ""),

      referencia: String(donacion.referencia ?? ""),

      fechaCreacion: String(donacion.fechaCreacion ?? ""),

      catastrofeId: String(donacion.catastrofeId ?? ""),
    }));

    /* ============================================
       RESPUESTA
    ============================================ */

    return NextResponse.json({
      success: true,

      data: {
        general,

        catastrofes: reporteCatastrofes,

        zonas: reporteZonas,

        necesidades: reporteNecesidades,

        donaciones: reporteDonaciones,
      },
    });
  } catch (error) {
    console.error("Error generando reportes:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible generar los reportes.",
      },
      {
        status: 500,
      }
    );
  }
}
