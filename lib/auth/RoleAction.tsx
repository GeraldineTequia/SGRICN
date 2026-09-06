"use client";

import { ReactNode, useEffect, useState } from "react";
import { UserRole } from "@/types/auth";

interface RoleActionProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export default function RoleAction({
  allowedRoles,
  children,
}: RoleActionProps) {
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    async function cargarSesion() {
      try {
        const response = await fetch("/api/session", {
          cache: "no-store",
        });

        if (!response.ok) {
          setAutorizado(false);
          return;
        }

        const data = await response.json();

        if (!data.success || !data.data?.rol) {
          setAutorizado(false);
          return;
        }

        const rolesMapeados: Record<string, UserRole> = {
          admin: "ADMIN",
          funcionario: "FUNCIONARIO",
          usuario: "USUARIO",
        };

        const rol: UserRole = rolesMapeados[data.data.rol] ?? data.data.rol;

        setAutorizado(allowedRoles.includes(rol));
      } catch (error) {
        console.error("Error verificando permisos visuales:", error);

        setAutorizado(false);
      }
    }

    cargarSesion();
  }, [allowedRoles]);

  if (!autorizado) {
    return null;
  }

  return <>{children}</>;
}
