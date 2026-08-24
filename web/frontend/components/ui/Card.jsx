import React from "react";

export function Card({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  interactive = false,
  className = "",
  bodyClassName = "",
  onClick,
}) {
  return (
    <div
      className={`pl-card ${interactive ? "pl-card-interactive" : ""} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle || headerAction) && (
        <div className="pl-card-header">
          <div>
            {title && <h3 className="pl-card-title">{title}</h3>}
            {subtitle && <p className="pl-card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div className="pl-card-header-action">{headerAction}</div>}
        </div>
      )}
      <div className={`pl-card-body ${bodyClassName}`}>{children}</div>
      {footer && <div className="pl-card-footer">{footer}</div>}
    </div>
  );
}
