import React from "react";

export function StatCard({ label, value, subtext, icon }) {
  return (
    <div className="pl-stat-card">
      <div className="pl-stat-header">
        <span className="pl-stat-label">{label}</span>
        {icon && <div className="pl-stat-icon">{icon}</div>}
      </div>
      <div className="pl-stat-value">{value}</div>
      {subtext && <div className="pl-stat-subtext">{subtext}</div>}
    </div>
  );
}
