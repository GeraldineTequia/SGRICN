export type MonedaDonacion = "COP";

export type MetodoPagoDonacion =
  | "PSE"
  | "tarjeta"
  | "transferencia"
  | "efectivo";

export type EstadoDonacion =
  | "pendiente"
  | "aprobada"
  | "rechazada"
  | "cancelada";

export interface Donacion {
  _id: string;

  usuarioId: string;

  catastrofeId: string;

  monto: number;

  moneda: MonedaDonacion;

  metodoPago: MetodoPagoDonacion;

  pasarela: string;

  referencia: string;

  transaccionId: string;

  estado: EstadoDonacion;

  descripcion: string;

  fechaCreacion: string;

  fechaActualizacion: string;
}
