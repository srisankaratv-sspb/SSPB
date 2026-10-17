import React from 'react';

export const OrderSummary = ({
  productName = 'Soora Samhara Pooja Box',
  quantity = 1,
  unitPrice = 2500,
  className = ''
}) => {
  const lineTotal = quantity * unitPrice;
  const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className={`sum ${className}`} aria-live="polite">
      <div>
        <span>{productName} × <span id="sum-qty">{quantity}</span></span>
        <span id="sum-line">{inr(lineTotal)}</span>
      </div>
      <div className="tot">
        <span>Box total</span>
        <span id="sum-total">{inr(lineTotal)}</span>
      </div>
    </div>
  );
};

export default OrderSummary;
