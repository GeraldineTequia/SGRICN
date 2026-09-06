export type PrioridadNecesidad = "baja" | "media" | "alta" | "critica";

export type EstadoNecesidad = "pendiente" | "en_atencion" | "atendida";

export interface Necesidad {
  _id: string;

  catastrofeId: string;
  zonaId: string;

  categoria: string;
  nombre: string;
  descripcion: string;

  unidad: string;

  cantidadNecesaria: number;
  cantidadRecibida: number;
  cantidadPendiente: number;

  porcentajeAtendido: number;

  prioridad: PrioridadNecesidad;
  estado: EstadoNecesidad;

  createdAt: string;
  updatedAt: string;
}
