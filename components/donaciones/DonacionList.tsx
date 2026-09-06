"use client";

import { Donacion } from "@/types/donaciones";
import DonacionCard from "./DonacionCard";

interface Usuario {
  _id?: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
}

interface Catastrofe {
  _id: string;
  titulo: string;
}

interface DonacionListProps {
  donaciones: Donacion[];
  usuarios?: Usuario[];
  catastrofes?: Catastrofe[];
  onEditar?: (donacion: Donacion) => void;
  onEliminar?: (donacion: Donacion) => void;
}

export default function DonacionList({
  donaciones,
  usuarios = [],
  catastrofes = [],
  onEditar,
  onEliminar,
}: DonacionListProps) {
  // ==========================================
  // ESTADO VACÍO
  // ==========================================

  if (donaciones.length === 0) {
    return (
      <div className="donaciones-empty">
        <div className="donaciones-empty-icon">💰</div>

        <h3>No hay donaciones registradas</h3>

        <p>Actualmente no existen donaciones para mostrar.</p>
      </div>
    );
  }

  // ==========================================
  // BUSCAR NOMBRE DEL USUARIO
  // ==========================================

  function obtenerNombreUsuario(usuarioId: string) {
    const usuario = usuarios.find(
      (item) => String(item._id) === String(usuarioId)
    );

    if (!usuario) {
      return undefined;
    }

    const nombreCompleto = [usuario.nombre, usuario.apellido]
      .filter(Boolean)
      .join(" ");

    return nombreCompleto || usuario.correo || undefined;
  }

  // ==========================================
  // BUSCAR CATÁSTROFE
  // ==========================================

  function obtenerTituloCatastrofe(catastrofeId: string) {
    const catastrofe = catastrofes.find(
      (item) => String(item._id) === String(catastrofeId)
    );

    return catastrofe?.titulo;
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="donaciones-list">
      {donaciones.map((donacion) => (
        <DonacionCard
          key={donacion._id}
          donacion={donacion}
          nombreUsuario={obtenerNombreUsuario(donacion.usuarioId)}
          tituloCatastrofe={obtenerTituloCatastrofe(donacion.catastrofeId)}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}
