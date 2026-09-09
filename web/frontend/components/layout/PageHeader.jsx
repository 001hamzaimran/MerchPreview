import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "../ui/Icons";

export function PageHeader({
  title,
  subtitle,
  backAction,
  actions,
  children,
  className = "",
}) {
  return (
    <div className={`pl-page-header ${className}`}>
      <div className="pl-page-header-title-group">
        {backAction && (
          <div className="pl-page-header-breadcrumb">
            {backAction.url ? (
              <Link to={backAction.url} className="pl-breadcrumb-link">
                <ArrowLeftIcon size={14} />
                <span>{backAction.content || "Back"}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={backAction.onAction}
                className="pl-breadcrumb-link pl-breadcrumb-btn"
              >
                <ArrowLeftIcon size={14} />
                <span>{backAction.content || "Back"}</span>
              </button>
            )}
          </div>
        )}
        <h1 className="pl-page-header-title">{title}</h1>
        {subtitle && <p className="pl-page-header-subtitle">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="pl-page-header-actions">{actions}</div>}
    </div>
  );
}
