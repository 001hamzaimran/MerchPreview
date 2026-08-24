import React from "react";
import { AppHeader } from "./AppHeader";

export function Layout({ children, className = "" }) {
  return (
    <div className="pl-app-container">
      <AppHeader />
      <main className={`pl-main-content ${className}`}>{children}</main>
    </div>
  );
}
