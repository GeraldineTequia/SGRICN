export type EstadoCentro = "activo" | "inactivo";

export interface UbicacionCentro {
  type: "Point";
  coordinates: [number, number];
}

export interface CentroDonacion {
  _id: string;

  nombre: string;

  direccion: string;

  departamento: string;

  municipio: string;

  ubicacion: UbicacionCentro;

  telefono: string;

  correo: string;

  horario: string;

  tipoDonacion: string[];

  estado: EstadoCentro;

  autorizado: boolean;

  responsable: string;

  createdAt: string;

  updatedAt: string;
}
