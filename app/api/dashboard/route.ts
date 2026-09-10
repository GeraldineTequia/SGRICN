import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface AlertaDashboard {
  tipo: "emergencia" | "necesidad" | "informacion";
  titulo: string;
  descripcion: string;
  fecha?: string;
}

function convertirFecha(valor: unknown): Date | null {
  if (!valor) {
    return null;
  }

  const fecha = new Date(String(valor));

  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function formatearFecha(valor: unknown): string | undefined {
  const fecha = convertirFecha(valor);

  if (!fecha) {
    return undefined;
  }

  return fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function normalizarTexto(valor: unknown): string {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function esEmergenciaActiva(estado: unknown): boolean {
  const valor = normalizarTexto(estado);

  return (
    valor === "activa" ||
    valor === "activo" ||
    valor === "en curso" ||
    valor === "en_curso"
  );
}

function esNecesidadCritica(necesidad: {
  prioridad?: unknown;
  nivelPrioridad?: unknown;
  urgencia?: unknown;
  estado?: unknown;
}): boolean {
  const prioridad = normalizarTexto(
    necesidad.prioridad ?? necesidad.nivelPrioridad ?? necesidad.urgencia
  );

  const estado = normalizarTexto(necesidad.estado);

  const prioridadCritica =
    prioridad === "critica" || prioridad === "alta" || prioridad === "urgente";

  const atendida =
    estado === "atendida" ||
    estado === "atendido" ||
    estado === "resuelta" ||
    estado === "resuelto" ||
    estado === "cerrada" ||
    estado === "cerrado";

  return prioridadCritica && !atendida;
}

export async function GET() {
  try {
    // =========================================================
    // 1. AUTENTICACIÓN
    // =========================================================

    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "No autenticado.",
        },
        { status: 401 }
      );
    }

    // =========================================================
    // 2. CONEXIÓN A MONGODB
    // =========================================================

    const db = await getDb();

    const esPersonalInstitucional =
      session.role === "ADMIN" || session.role === "FUNCIONARIO";

    // =========================================================
    // 3. CONSULTAS
    // =========================================================

    const [catastrofes, zonas, poblacion, necesidades, usuarios] =
      await Promise.all([
        db.collection("Catastrofes").find({}).toArray(),

        db.collection("Zonas_afectadas").find({}).toArray(),

        db.collection("Poblacion_afectada").find({}).toArray(),

        db.collection("Necesidades").find({}).toArray(),

        esPersonalInstitucional
          ? db.collection("Usuarios").find({}).toArray()
          : Promise.resolve([]),
      ]);

    // =========================================================
    // 4. ESTADÍSTICAS
    // =========================================================

    const emergenciasActivas = catastrofes.filter((catastrofe) =>
      esEmergenciaActiva(catastrofe.estado)
    ).length;

    const zonasAfectadas = zonas.length;

    const poblacionAfectada = poblacion.reduce((total, registro) => {
    const cantidad =
      Number(
        registro.personasAfectadas ??
          registro.cantidadPersonas ??
          registro.numeroPersonas ??
          registro.personas ??
          0
      ) || 0;

  return total + cantidad;
}, 0);

      return total + cantidad;
    }, 0);

    const necesidadesCriticas = necesidades.filter((necesidad) =>
      esNecesidadCritica({
        prioridad: necesidad.prioridad,
        nivelPrioridad: necesidad.nivelPrioridad,
        urgencia: necesidad.urgencia,
        estado: necesidad.estado,
      })
    ).length;

    const funcionariosActivos = esPersonalInstitucional
      ? usuarios.filter((usuario) => {
          const rol = normalizarTexto(usuario.rol);
          const estado = normalizarTexto(usuario.estado);

          return (
            rol === "funcionario" &&
            (estado === "activo" || estado === "activa")
          );
        }).length
      : 0;

    // =========================================================
    // 5. ALERTAS
    // =========================================================

    const alertas: AlertaDashboard[] = [];

    // ---------------------------------------------------------
    // 5.1 EMERGENCIAS ACTIVAS
    // ---------------------------------------------------------

    const catastrofesActivas = catastrofes
      .filter((catastrofe) => esEmergenciaActiva(catastrofe.estado))
      .sort((a, b) => {
        const fechaA =
          convertirFecha(a.fechaInicio ?? a.createdAt)?.getTime() ?? 0;

        const fechaB =
          convertirFecha(b.fechaInicio ?? b.createdAt)?.getTime() ?? 0;

        return fechaB - fechaA;
      })
      .slice(0, 3);

    for (const catastrofe of catastrofesActivas) {
      const titulo = String(
        catastrofe.titulo ?? catastrofe.tipo ?? "Emergencia activa"
      );

      const municipio = String(catastrofe.municipio ?? "").trim();

      const departamento = String(catastrofe.departamento ?? "").trim();

      let ubicacion = "";

      if (municipio && departamento) {
        ubicacion = `${municipio}, ${departamento}`;
      } else {
        ubicacion = municipio || departamento;
      }

      alertas.push({
        tipo: "emergencia",

        titulo: `Emergencia activa: ${titulo}`,

        descripcion: ubicacion
          ? `Se registra una emergencia activa en ${ubicacion}.`
          : "Se registra una emergencia activa en el sistema.",

        fecha: formatearFecha(catastrofe.fechaInicio ?? catastrofe.createdAt),
      });
    }

    // ---------------------------------------------------------
    // 5.2 NECESIDADES CRÍTICAS
    // ---------------------------------------------------------

    const necesidadesUrgentes = necesidades
      .filter((necesidad) =>
        esNecesidadCritica({
          prioridad: necesidad.prioridad,
          nivelPrioridad: necesidad.nivelPrioridad,
          urgencia: necesidad.urgencia,
          estado: necesidad.estado,
        })
      )
      .slice(0, 3);

    for (const necesidad of necesidadesUrgentes) {
      const descripcion = String(
        necesidad.tipo ??
          necesidad.nombre ??
          necesidad.descripcion ??
          "Necesidad prioritaria"
      ).trim();

      alertas.push({
        tipo: "necesidad",

        titulo: "Necesidad crítica",

        descripcion,

        fecha: formatearFecha(
          necesidad.fechaRegistro ?? necesidad.createdAt ?? necesidad.fecha
        ),
      });
    }

    // =========================================================
    // 6. LIMITAR ALERTAS
    // =========================================================

    const alertasFinales = alertas.slice(0, 5);

    // =========================================================
    // 7. RESPUESTA
    // =========================================================

    return NextResponse.json({
    success: true,
    data: {
      stats: {
        emergenciasActivas,
        zonasAfectadas,
        poblacionAfectada,
        necesidadesCriticas,
        funcionariosActivos,
      },
  
      alertas: alertasFinales,
    },
  });
  } catch (error) {
    console.error("Error en GET /api/dashboard:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error interno al cargar la información del dashboard.",
      },
      {
        status: 500,
      }
    );
  }
}
