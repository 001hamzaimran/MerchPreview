import React from "react";

export function StatusBadge({ status = "Active", className = "" }) {
  const getBadgeClass = (statusStr) => {
    const s = (statusStr || "").toLowerCase();
    if (s.includes("active") || s.includes("ready") || s.includes("published")) {
      return "pl-badge-success";
    }
    if (s.includes("draft") || s.includes("pending") || s.includes("progress")) {
      return "pl-badge-warning";
    }
    if (s.includes("primary") || s.includes("set")) {
      return "pl-badge-primary";
    }
    return "pl-badge-neutral";
  };

  return (
    <span className={`pl-badge ${getBadgeClass(status)} ${className}`}>
      {status}
    </span>
  );
}
