export interface PoblacionAfectada {
  _id: string;

  zonaId: string;
  catastrofeId: string;

  familiasAfectadas: number;
  personasAfectadas: number;

  heridos: number;
  fallecidos: number;
  desaparecidos: number;

  niños: number;
  adultos: number;
  adultosMayores: number;

  personasDiscapacidad: number;

  personasEvacuadas: number;
  personasAlbergadas: number;
  personasPendientesAtencion: number;

  createdAt: string;
  updatedAt: string;
}
