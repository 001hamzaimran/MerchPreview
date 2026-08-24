import React from "react";
import { Card } from "../ui/Card";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Select a product",
      description: "Choose the Shopify product and the image angle you want to personalize.",
    },
    {
      number: "02",
      title: "Define print area",
      description: "Drag and resize the printable bounding area directly on the product image.",
    },
    {
      number: "03",
      title: "Customer previews",
      description: "Customers upload their artwork and preview it scaled in real-time on your store.",
    },
  ];

  return (
    <div className="pl-how-it-works">
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text-main)" }}>
          How MerchPreview Works
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          Three simple steps to launch custom merch personalization
        </p>
      </div>

      <div className="pl-how-grid">
        {steps.map((step) => (
          <div key={step.number} className="pl-how-card">
            <span className="pl-how-number">{step.number}</span>
            <h4 className="pl-how-title">{step.title}</h4>
            <p className="pl-how-desc">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
