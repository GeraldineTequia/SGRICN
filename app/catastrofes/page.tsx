import { getDb } from "@/lib/mongodb";
import CatastrofePageClient from "./CatastrofePageClient";
import { Catastrofe } from "@/types/catastrofes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CatastrofesPage() {
  let catastrofes: Catastrofe[] = [];

  try {
    const db = await getDb();

    const registros = await db
      .collection<Catastrofe>("Catastrofes")
      .find({})
      .sort({
        fechaInicio: -1,
      })
      .toArray();

    catastrofes = registros;
  } catch (error) {
    console.error("Error cargando catástrofes:", error);
  }

  return <CatastrofePageClient catastrofesIniciales={catastrofes} />;
}
