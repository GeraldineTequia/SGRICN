"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";

import FuncionarioList from "@/components/funcionarios/FuncionarioList";
import FuncionarioModal from "@/components/funcionarios/FuncionarioModal";

import { useAuth } from "@/components/auth/AuthProvider";
import { Usuario } from "@/types/usuarios";

export default function FuncionariosPage() {
  const { role, loading: cargandoSesion } = useAuth();

  const [funcionarios, setFuncionarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);

  const [funcionarioSeleccionado, setFuncionarioSeleccionado] =
    useState<Usuario | null>(null);

  /**
   * Solo ADMIN puede gestionar funcionarios.
   *
   * FUNCIONARIO y USUARIO no deben acceder
   * al módulo administrativo de funcionarios.
   */
  const puedeGestionar = role === "ADMIN";

  /**
   * Carga únicamente los usuarios cuyo rol
   * sea funcionario.
   */
  async function cargarFuncionarios() {
    if (!puedeGestionar) {
      return;
    }

    try {
      setCargando(true);

      const response = await fetch("/api/usuarios", {
        cache: "no-store",
      });

      const resultado = await response.json();

      if (!response.ok || !resultado.success) {
        throw new Error(
          resultado.message || "No fue posible cargar los funcionarios."
        );
      }

      const usuarios: Usuario[] = resultado.data || [];

      const funcionariosFiltrados = usuarios.filter(
        (usuario) => usuario.rol === "funcionario"
      );

      setFuncionarios(funcionariosFiltrados);
    } catch (error) {
      console.error("Error cargando funcionarios:", error);

      setFuncionarios([]);
    } finally {
      setCargando(false);
    }
  }

  /**
   * Carga los funcionarios únicamente
   * cuando la sesión corresponde a ADMIN.
   */
  useEffect(() => {
    if (cargandoSesion) {
      return;
    }

    if (!puedeGestionar) {
      setCargando(false);
      return;
    }

    cargarFuncionarios();
  }, [cargandoSesion, puedeGestionar]);

  /**
   * Abre el modal para crear un funcionario.
   */
  function abrirCrear() {
    if (!puedeGestionar) {
      return;
    }

    setFuncionarioSeleccionado(null);
    setModalAbierto(true);
  }

  /**
   * Abre el modal para editar un funcionario.
   */
  function abrirEditar(funcionario: Usuario) {
    if (!puedeGestionar) {
      return;
    }

    setFuncionarioSeleccionado(funcionario);
    setModalAbierto(true);
  }

  /**
   * Elimina un funcionario.
   */
  async function eliminarFuncionario(funcionario: Usuario) {
    if (!puedeGestionar) {
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de eliminar al funcionario ${funcionario.nombre} ${funcionario.apellido}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(`/api/usuarios/${funcionario._id}`, {
        method: "DELETE",
      });

      const resultado = await response.json();

      if (!response.ok || !resultado.success) {
        throw new Error(
          resultado.message || "No fue posible eliminar el funcionario."
        );
      }

      await cargarFuncionarios();
    } catch (error) {
      console.error("Error eliminando funcionario:", error);

      alert(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar el funcionario."
      );
    }
  }

  /**
   * Se ejecuta después de guardar un funcionario.
   */
  async function guardarFuncionario() {
    if (!puedeGestionar) {
      return;
    }

    setModalAbierto(false);
    setFuncionarioSeleccionado(null);

    await cargarFuncionarios();
  }

  /**
   * Mientras AuthProvider determina la sesión.
   */
  if (cargandoSesion) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner">Cargando...</div>
      </div>
    );
  }

  /**
   * Solo ADMIN puede acceder a este módulo.
   *
   * La protección real también está en la API.
   */
  if (!puedeGestionar) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="funcionarios-page">
        <div className="funcionarios-header">
          <div>
            <span className="funcionarios-eyebrow">ADMINISTRACIÓN</span>

            <h1 className="funcionarios-title">Funcionarios</h1>

            <p className="funcionarios-description">
              Administra los funcionarios responsables de la gestión y atención
              de emergencias del sistema SGRICN.
            </p>
          </div>

          <button
            type="button"
            className="funcionarios-primary-button"
            onClick={abrirCrear}
          >
            <span>＋</span>
            Nuevo funcionario
          </button>
        </div>

        <div className="funcionarios-info">
          <div className="funcionarios-info-icon">👨‍💼</div>

          <div>
            <strong>Gestión de funcionarios</strong>

            <p>
              Los funcionarios se almacenan en la colección{" "}
              <strong>Usuarios</strong> con el rol <strong>funcionario</strong>.
            </p>
          </div>
        </div>

        <FuncionarioList
          funcionarios={funcionarios}
          cargando={cargando}
          onEditar={abrirEditar}
          onEliminar={eliminarFuncionario}
        />

        <FuncionarioModal
          abierto={modalAbierto}
          funcionario={funcionarioSeleccionado}
          onCerrar={() => {
            setModalAbierto(false);
            setFuncionarioSeleccionado(null);
          }}
          onGuardado={guardarFuncionario}
        />
      </div>
    </DashboardLayout>
  );
}
