"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserRole } from "@/types/auth";

interface SidebarProps {
  role: UserRole;
}

interface MenuItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    label: "Inicio",
    href: "/dashboard",
    icon: "🏠",
    roles: ["ADMIN", "FUNCIONARIO", "USUARIO"],
  },
  {
    label: "Catástrofes",
    href: "/catastrofes",
    icon: "🚨",
    roles: ["ADMIN", "FUNCIONARIO", "USUARIO"],
  },
  {
    label: "Zonas afectadas",
    href: "/zonas",
    icon: "📍",
    roles: ["ADMIN", "FUNCIONARIO", "USUARIO"],
  },
  {
    label: "Población afectada",
    href: "/poblacion",
    icon: "👥",
    roles: ["ADMIN", "FUNCIONARIO", "USUARIO"],
  },
  {
    label: "Necesidades",
    href: "/necesidades",
    icon: "📦",
    roles: ["ADMIN", "FUNCIONARIO", "USUARIO"],
  },
  {
    label: "Centros de donación",
    href: "/centros",
    icon: "🏢",
    roles: ["ADMIN", "FUNCIONARIO", "USUARIO"],
  },
  {
    label: "Donar dinero",
    href: "/donaciones",
    icon: "💰",
    roles: ["ADMIN", "FUNCIONARIO", "USUARIO"],
  },
  {
    label: "Noticias",
    href: "/noticias",
    icon: "📰",
    roles: ["ADMIN", "FUNCIONARIO", "USUARIO"],
  },
  {
    label: "Mapa de emergencias",
    href: "/mapa",
    icon: "🗺️",
    roles: ["ADMIN", "FUNCIONARIO", "USUARIO"],
  },
  {
    label: "Usuarios",
    href: "/usuarios",
    icon: "👥",
    roles: ["ADMIN", "FUNCIONARIO"],
  },
  {
    label: "Funcionarios",
    href: "/funcionarios",
    icon: "👨‍💼",
    roles: ["ADMIN"],
  },
  {
    label: "Reportes",
    href: "/reportes",
    icon: "📊",
    roles: ["ADMIN", "FUNCIONARIO"],
  },
  {
    label: "Configuración",
    href: "/configuracion",
    icon: "⚙️",
    roles: ["ADMIN"],
  },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const itemsVisibles = menuItems.filter((item) => item.roles.includes(role));

  function esRutaActiva(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="dashboard-sidebar">
      {/* ENCABEZADO */}
      <div className="dashboard-sidebar-header">
        <div className="dashboard-sidebar-logo">
          <span className="dashboard-sidebar-logo-icon">🇨🇴</span>

          <div className="dashboard-sidebar-logo-text">
            <strong>SGRICN</strong>

            <span>Sistema de Gestión</span>
          </div>
        </div>
      </div>

      {/* MENÚ */}
      <nav className="dashboard-sidebar-nav" aria-label="Navegación principal">
        <div className="dashboard-sidebar-section-title">MENÚ PRINCIPAL</div>

        <ul className="dashboard-sidebar-menu">
          {itemsVisibles.map((item) => {
            const activo = esRutaActiva(item.href);

            return (
              <li key={item.href} className="dashboard-sidebar-menu-item">
                <Link
                  href={item.href}
                  className={`dashboard-sidebar-link ${
                    activo ? "dashboard-sidebar-link-active" : ""
                  }`}
                  aria-current={activo ? "page" : undefined}
                >
                  <span className="dashboard-sidebar-link-icon">
                    {item.icon}
                  </span>

                  <span className="dashboard-sidebar-link-label">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* INFORMACIÓN DEL SISTEMA */}
      <div className="dashboard-sidebar-footer">
        <div className="dashboard-sidebar-footer-card">
          <span className="dashboard-sidebar-footer-icon">🛡️</span>

          <div>
            <strong>SGRICN</strong>

            <span>Sistema de gestión de emergencias</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
