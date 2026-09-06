interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: string;
  variant?: "primary" | "danger" | "warning" | "success";
}

const colors: Record<"primary" | "danger" | "warning" | "success", string> = {
  primary: "#003893",
  danger: "#ce1126",
  warning: "#d6a900",
  success: "#198754",
};

export default function StatCard({
  title,
  value,
  description,
  icon,
  variant = "primary",
}: StatCardProps) {
  const color = colors[variant];

  return (
    <article
      className="card"
      aria-label={`${title}: ${value}`}
      style={{
        padding: "22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
        minHeight: "130px",
        boxSizing: "border-box",
      }}
    >
      {/* INFORMACIÓN */}
      <div
        style={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#5f6b7a",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {title}
        </p>

        <h2
          style={{
            margin: "8px 0",
            fontSize: "30px",
            lineHeight: 1.1,
            color,
          }}
        >
          {value}
        </h2>

        {description && (
          <p
            style={{
              margin: 0,
              color: "#6c757d",
              fontSize: "13px",
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* ICONO */}
      <div
        aria-hidden="true"
        style={{
          width: "48px",
          height: "48px",
          minWidth: "48px",
          borderRadius: "12px",
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "23px",
        }}
      >
        {icon}
      </div>
    </article>
  );
}
