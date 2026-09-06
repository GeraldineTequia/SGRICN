import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Rutas públicas de la aplicación.
   */
  const rutasPublicas = [
    "/login",
    "/registro",
    "/api/login",
    "/api/registro",
    "/api/logout",
    "/api/session",
  ];

  const esRutaPublica = rutasPublicas.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  );

  if (esRutaPublica) {
    return NextResponse.next();
  }

  /*
   * Recursos internos y archivos estáticos.
   */
  const esRecursoInterno =
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".");

  if (esRecursoInterno) {
    return NextResponse.next();
  }

  /*
   * Buscar la sesión almacenada en la cookie.
   */
  const sessionToken = request.cookies.get("sgricn_session")?.value;

  /*
   * Si no existe sesión, enviar al login.
   */
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  /*
   * Verificar que el JWT sea válido
   * y que no haya expirado.
   */
  const session = await verifySessionToken(sessionToken);

  /*
   * Si la sesión no es válida,
   * eliminar la cookie y volver al login.
   */
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete("sgricn_session");

    return response;
  }

  /*
   * La sesión es válida.
   */
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
