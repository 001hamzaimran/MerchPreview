import React from "react";
import { Link } from "react-router-dom";
import { PlusIcon, HelpCircleIcon } from "../ui/Icons";
import { Button } from "../ui/Button";

export function WelcomeBanner({ onLearnMore }) {
  return (
    <div className="pl-welcome-banner">
      <div>
        <h2 className="pl-welcome-heading">Welcome to MerchPreview 👋</h2>
        <p className="pl-welcome-text">
          Create personalized product experiences by defining exactly where your
          customer&apos;s artwork should appear on your products.
        </p>
      </div>
      <div className="pl-welcome-actions">
        <Link to="/configuration" style={{ textDecoration: "none" }}>
          <Button variant="primary" size="lg" icon={<PlusIcon size={18} />}>
            Configure a Product
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="lg"
          icon={<HelpCircleIcon size={18} />}
          onClick={onLearnMore}
        >
          Learn how it works
        </Button>
      </div>
    </div>
  );
}
