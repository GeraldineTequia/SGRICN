export type EstadoZona = "activa" | "controlada" | "finalizada";

export type NivelAfectacion = "bajo" | "medio" | "alto" | "critico";

export interface UbicacionZona {
  type: "Point";
  coordinates: [number, number];
}

export interface ZonaAfectada {
  _id: string;

  catastrofeId: string;

  nombre: string;

  descripcion: string;

  departamento: string;

  municipio: string;

  direccionReferencia: string;

  ubicacion: UbicacionZona;

  nivelAfectacion: NivelAfectacion;

  estado: EstadoZona;

  createdAt: string;

  updatedAt: string;
}
