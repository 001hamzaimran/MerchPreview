import React from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Card, EmptyState, LayersIcon } from "../components";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Layout>
      <Card>
        <EmptyState
          title="Page Not Found"
          description="The page you are looking for does not exist or has been moved."
          actionLabel="Back to Dashboard"
          onAction={() => navigate("/")}
          icon={<LayersIcon size={36} />}
        />
      </Card>
    </Layout>
  );
}
