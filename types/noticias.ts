export type EstadoNoticia = "borrador" | "publicada" | "archivada";

export type CategoriaNoticia =
  | "emergencia"
  | "prevencion"
  | "ayuda"
  | "institucional"
  | "comunidad";

export interface Noticia {
  _id: string;

  titulo: string;

  resumen: string;

  contenido: string;

  categoria: CategoriaNoticia;

  imagenUrl: string;

  autorId: string;

  catastrofeId: string;

  estado: EstadoNoticia;

  fechaPublicacion: string;

  fechaActualizacion: string;

  createdAt: string;

  updatedAt: string;
}
