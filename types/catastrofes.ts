export type EstadoCatastrofe = "activa" | "controlada" | "finalizada";

export type NivelEmergencia = "bajo" | "medio" | "alto" | "critico";

export interface Ubicacion {
  type: "Point";
  coordinates: [number, number];
}

export interface Catastrofe {
  _id: string;
  titulo: string;
  tipo: string;
  descripcion: string;
  fechaInicio: string;
  fechaActualizacion: string;
  estado: EstadoCatastrofe;
  nivelEmergencia: NivelEmergencia;
  departamento: string;
  municipio: string;
  direccionReferencia: string;
  ubicacion: Ubicacion;
  fuenteInformacion: string;
  createdAt: string;
  updatedAt: string;
}
