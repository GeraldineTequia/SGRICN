export type TipoReporte =
  | "general"
  | "catastrofes"
  | "poblacion"
  | "necesidades"
  | "donaciones";

export interface ReporteGeneral {
  totalCatastrofes: number;
  catastrofesActivas: number;
  totalZonas: number;
  zonasCriticas: number;
  totalPersonasAfectadas: number;
  totalFamiliasAfectadas: number;
  totalNecesidades: number;
  necesidadesCriticas: number;
  necesidadesAtendidas: number;
  totalDonaciones: number;
  montoDonaciones: number;
  centrosAutorizados: number;
}

export interface ReporteCatastrofe {
  _id: string;
  titulo: string;
  tipo: string;
  estado: string;
  nivelEmergencia: string;
  departamento: string;
  municipio: string;
  fechaInicio: string;
  zonas: number;
  personasAfectadas: number;
  necesidades: number;
}

export interface ReporteZona {
  _id: string;
  nombre: string;
  catastrofeId: string;
  nivelAfectacion: string;
  estado: string;
  departamento: string;
  municipio: string;
  personasAfectadas: number;
  familiasAfectadas: number;
}

export interface ReporteNecesidad {
  _id: string;
  nombre: string;
  categoria: string;
  prioridad: string;
  estado: string;
  cantidadNecesaria: number;
  cantidadRecibida: number;
  cantidadPendiente: number;
  porcentajeAtendido: number;
}

export interface ReporteDonacion {
  _id: string;
  monto: number;
  moneda: string;
  metodoPago: string;
  estado: string;
  referencia: string;
  fechaCreacion: string;
  catastrofeId: string;
}
