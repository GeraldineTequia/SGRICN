"use client";

import { Usuario } from "@/types/usuarios";
import FuncionarioForm from "./FuncionarioForm";

interface FuncionarioModalProps {
  abierto: boolean;
  funcionario: Usuario | null;
  onCerrar: () => void;
  onGuardado: () => void;
}

export default function FuncionarioModal({
  abierto,
  funcionario,
  onCerrar,
  onGuardado,
}: FuncionarioModalProps) {
  if (!abierto) {
    return null;
  }

  return (
    <div className="funcionario-modal-overlay">
      <div
        className="funcionario-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="funcionario-modal-title"
      >
        <div className="funcionario-modal-header">
          <div>
            <span className="funcionario-modal-eyebrow">ADMINISTRACIÓN</span>

            <h2
              id="funcionario-modal-title"
              className="funcionario-modal-title"
            >
              {funcionario ? "Editar funcionario" : "Nuevo funcionario"}
            </h2>
          </div>

          <button
            type="button"
            className="funcionario-modal-close"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="funcionario-modal-body">
          <FuncionarioForm
            funcionario={funcionario}
            onCancelar={onCerrar}
            onGuardado={onGuardado}
          />
        </div>
      </div>
    </div>
  );
}
