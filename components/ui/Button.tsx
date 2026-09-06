"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";

  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary: {
      background: "#003893",
      color: "#ffffff",
      border: "1px solid #003893",
    },

    secondary: {
      background: "#fcd116",
      color: "#17202a",
      border: "1px solid #fcd116",
    },

    danger: {
      background: "#ce1126",
      color: "#ffffff",
      border: "1px solid #ce1126",
    },

    success: {
      background: "#198754",
      color: "#ffffff",
      border: "1px solid #198754",
    },

    outline: {
      background: "#ffffff",
      color: "#003893",
      border: "1px solid #003893",
    },
  };

  return (
    <button
      {...props}
      className={className}
      style={{
        ...variants[variant],
        padding: "10px 18px",
        borderRadius: "8px",
        fontWeight: 600,
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </button>
  );
}
