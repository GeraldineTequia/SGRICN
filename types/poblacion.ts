export interface PoblacionAfectada {
  _id: string;

  zonaId: string;
  catastrofeId: string;

  familiasAfectadas: number;
  personasAfectadas: number;

  personasHeridas: number;
  personasFallecidas: number;
  personasDesaparecidas: number;

  niños: number;
  adultos: number;
  adultosMayores: number;

  personasDiscapacidad: number;

  personasEvacuadas: number;
  personasAlbergadas: number;
  personasPendientesAtencion: number;

  createdAt?: string;
  updatedAt?: string;
}
