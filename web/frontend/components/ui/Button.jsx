import React from "react";

export function Button({
  children,
  variant = "secondary", // 'primary', 'secondary', 'outline', 'ghost', 'danger'
  size = "md", // 'sm', 'md', 'lg', 'icon'
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = "left",
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const sizeClass = size === "icon" ? "pl-btn-icon-only" : `pl-btn-${size}`;
  const variantClass = `pl-btn-${variant}`;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`pl-btn ${variantClass} ${sizeClass} ${isDisabled ? "disabled" : ""} ${className}`}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="pl-btn-spinner" aria-hidden="true" />
          {typeof children === "string" ? "Saving..." : children}
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && <span className="pl-btn-icon">{icon}</span>}
          {children}
          {icon && iconPosition === "right" && <span className="pl-btn-icon">{icon}</span>}
        </>
      )}
    </button>
  );
}
