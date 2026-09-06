"use client";

import React from "react";

import { Usuario } from "@/types/usuarios";
import UsuarioCard from "./UsuarioCard";

interface UsuarioListProps {
  usuarios: Usuario[];
  onEditar: (usuario: Usuario) => void;
  onEliminar: (id: string) => void;
}

export default function UsuarioList({
  usuarios,
  onEditar,
  onEliminar,
}: UsuarioListProps) {
  if (usuarios.length === 0) {
    return (
      <div className="usuarios-empty">
        <div className="usuarios-empty-icon">👥</div>

        <h3>No hay usuarios registrados</h3>

        <p>
          No se encontraron usuarios que coincidan con los criterios de
          búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="usuarios-grid">
      {usuarios.map((usuario) => (
        <UsuarioCard
          key={usuario._id}
          usuario={usuario}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}
