import React from "react";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { SlidersIcon, RefreshCwIcon } from "../ui/Icons";

export function PrintAreaControls({
  printArea,
  onChangePrintArea,
}) {
  const x = Math.round((printArea?.x ?? 0.25) * 100);
  const y = Math.round((printArea?.y ?? 0.20) * 100);
  const width = Math.round((printArea?.width ?? 0.50) * 100);
  const height = Math.round((printArea?.height ?? 0.40) * 100);

  const handleNumericChange = (key, rawValue) => {
    let val = parseFloat(rawValue);
    if (isNaN(val)) val = 0;

    const current = {
      x: (printArea?.x ?? 0.25) * 100,
      y: (printArea?.y ?? 0.20) * 100,
      width: (printArea?.width ?? 0.50) * 100,
      height: (printArea?.height ?? 0.40) * 100,
    };

    if (key === "x") {
      val = Math.max(0, Math.min(val, 100 - current.width));
      current.x = val;
    } else if (key === "y") {
      val = Math.max(0, Math.min(val, 100 - current.height));
      current.y = val;
    } else if (key === "width") {
      val = Math.max(5, Math.min(val, 100 - current.x));
      current.width = val;
    } else if (key === "height") {
      val = Math.max(5, Math.min(val, 100 - current.y));
      current.height = val;
    }

    onChangePrintArea({
      x: Math.round((current.x / 100) * 1000) / 1000,
      y: Math.round((current.y / 100) * 1000) / 1000,
      width: Math.round((current.width / 100) * 1000) / 1000,
      height: Math.round((current.height / 100) * 1000) / 1000,
    });
  };

  const setPreset = (preset) => {
    switch (preset) {
      case "center":
        onChangePrintArea({ x: 0.25, y: 0.25, width: 0.50, height: 0.50 });
        break;
      case "top-center":
        onChangePrintArea({ x: 0.25, y: 0.15, width: 0.50, height: 0.40 });
        break;
      case "chest-pocket":
        onChangePrintArea({ x: 0.55, y: 0.20, width: 0.25, height: 0.25 });
        break;
      case "fit-max":
        onChangePrintArea({ x: 0.08, y: 0.08, width: 0.84, height: 0.84 });
        break;
      case "square":
        onChangePrintArea({ x: 0.30, y: 0.30, width: 0.40, height: 0.40 });
        break;
      case "reset":
      default:
        onChangePrintArea({ x: 0.25, y: 0.20, width: 0.50, height: 0.40 });
        break;
    }
  };

  return (
    <Card
      title="Print Area Settings"
      subtitle="Fine-tune position and dimension percentages"
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCwIcon size={12} />}
          onClick={() => setPreset("reset")}
        >
          Reset Area
        </Button>
      }
    >
      <div className="pl-controls-grid">
        <Input
          label="Position X"
          hint="%"
          type="number"
          min="0"
          max="95"
          value={x}
          onChange={(e) => handleNumericChange("x", e.target.value)}
        />
        <Input
          label="Position Y"
          hint="%"
          type="number"
          min="0"
          max="95"
          value={y}
          onChange={(e) => handleNumericChange("y", e.target.value)}
        />
        <Input
          label="Width"
          hint="%"
          type="number"
          min="5"
          max="100"
          value={width}
          onChange={(e) => handleNumericChange("width", e.target.value)}
        />
        <Input
          label="Height"
          hint="%"
          type="number"
          min="5"
          max="100"
          value={height}
          onChange={(e) => handleNumericChange("height", e.target.value)}
        />
      </div>

      {/* Alignment Presets Bar */}
      <div className="pl-presets-bar">
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginRight: "4px" }}>
          Quick Align:
        </span>
        <Button variant="secondary" size="sm" onClick={() => setPreset("center")}>
          Center
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setPreset("top-center")}>
          Top Center
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setPreset("chest-pocket")}>
          Chest Pocket
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setPreset("fit-max")}>
          Full Print
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setPreset("square")}>
          1:1 Square
        </Button>
      </div>
    </Card>
  );
}
