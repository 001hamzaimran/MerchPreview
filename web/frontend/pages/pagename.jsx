import React from "react";
import { Layout, PageHeader, Card } from "../components";

export default function PageName() {
  return (
    <Layout>
      <PageHeader
        title="Page Name"
        subtitle="This is a sample page in MerchPreview."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card title="Section 1" subtitle="Card description">
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
            This is custom card body content.
          </p>
        </Card>
      </div>
    </Layout>
  );
}
