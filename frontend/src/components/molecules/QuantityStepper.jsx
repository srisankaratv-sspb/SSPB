import React from 'react';

export const QuantityStepper = ({
  value = 1,
  onChange,
  min = 1,
  max = 20,
  disabled = false
}) => {
  const handleDecrement = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  return (
    <div className="stepper" role="group" aria-label="Box quantity selection">
      <button
        type="button"
        id="qty-minus"
        aria-label="One fewer box"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
      >
        −
      </button>
      <input
        id="f-qty"
        type="text"
        inputMode="numeric"
        value={value}
        readOnly
        aria-live="polite"
        aria-label="Current quantity"
      />
      <button
        type="button"
        id="qty-plus"
        aria-label="One more box"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
      >
        +
      </button>
    </div>
  );
};

export default QuantityStepper;
