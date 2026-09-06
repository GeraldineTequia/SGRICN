"use client";

import { Usuario } from "@/types/usuarios";
import FuncionarioCard from "./FuncionarioCard";

interface FuncionarioListProps {
  funcionarios: Usuario[];
  cargando: boolean;
  onEditar?: (funcionario: Usuario) => void;
  onEliminar?: (funcionario: Usuario) => void;
}

export default function FuncionarioList({
  funcionarios,
  cargando,
  onEditar,
  onEliminar,
}: FuncionarioListProps) {
  if (cargando) {
    return (
      <div className="funcionarios-loading">
        <div className="funcionarios-loading-spinner">
          Cargando funcionarios...
        </div>
      </div>
    );
  }

  if (funcionarios.length === 0) {
    return (
      <div className="funcionarios-empty">
        <div className="funcionarios-empty-icon">👨‍💼</div>

        <h3>No hay funcionarios registrados</h3>

        <p>Actualmente no existen funcionarios registrados en el sistema.</p>
      </div>
    );
  }

  return (
    <div className="funcionarios-grid">
      {funcionarios.map((funcionario) => (
        <FuncionarioCard
          key={funcionario._id}
          funcionario={funcionario}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}
