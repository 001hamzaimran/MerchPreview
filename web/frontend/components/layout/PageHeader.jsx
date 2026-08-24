import React from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
  children,
  className = "",
}) {
  return (
    <div className={`pl-page-header ${className}`}>
      <div className="pl-page-header-title-group">
        <h1 className="pl-page-header-title">{title}</h1>
        {subtitle && <p className="pl-page-header-subtitle">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="pl-page-header-actions">{actions}</div>}
    </div>
  );
}
