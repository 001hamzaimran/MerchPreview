import React from "react";

export function Input({
  label,
  hint,
  iconLeft,
  iconRight,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  min,
  max,
  step,
  className = "",
  wrapperClassName = "",
  id,
  ...props
}) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <div className={`pl-form-group ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="pl-label">
          {label} {hint && <span className="pl-label-hint">({hint})</span>}
        </label>
      )}
      <div className="pl-input-wrapper">
        {iconLeft && <span className="pl-input-icon-left">{iconLeft}</span>}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`pl-input ${type === "number" ? "pl-input-number" : ""} ${iconLeft ? "has-icon-left" : ""} ${iconRight ? "has-icon-right" : ""} ${className}`}
          {...props}
        />
        {iconRight && <span className="pl-input-icon-right">{iconRight}</span>}
      </div>
    </div>
  );
}
