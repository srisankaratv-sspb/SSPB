import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eyebrow, Title, Lede } from '../atoms/Typography';
import { OrderSummary } from '../molecules/OrderSummary';
import { QuantityStepper } from '../molecules/QuantityStepper';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export const OrderForm = ({ product, settings }) => {
  const navigate = useNavigate();
  const { customer, isAuthenticated, openAuthModal, logout } = useCustomerAuth();
  const unitPrice = product?.priceInPaise ? product.priceInPaise / 100 : 2500;

  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: ''
  });

  useEffect(() => {
    if (customer) {
      setFormData((prev) => {
        const lastAddr = customer.addresses && customer.addresses.length > 0
          ? customer.addresses[customer.addresses.length - 1]
          : null;
        return {
          ...prev,
          name: customer.name || prev.name,
          phone: customer.phone || prev.phone,
          email: customer.email || prev.email,
          address: prev.address || lastAddr?.address || '',
          city: prev.city || lastAddr?.city || '',
          state: prev.state || lastAddr?.state || 'Tamil Nadu',
          pincode: prev.pincode || lastAddr?.pincode || ''
        };
      });
    }
  }, [customer]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [orderResponse, setOrderResponse] = useState(null);
  const [resultText, setResultText] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

  const validate = () => {
    const errs = {};
    const name = formData.name.trim();
    const phone = formData.phone.trim().replace(/[\s-]/g, '');
    const addr = formData.address.trim();
    const city = formData.city.trim();
    const state = formData.state.trim();
    const pin = formData.pincode.trim();

    if (name.length < 2) {
      errs.name = 'Enter your full name.';
    }
    if (!/^(?:\+?91)?[6-9]\d{9}$/.test(phone)) {
      errs.phone = 'Enter a 10-digit Indian mobile number.';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    if (addr.length < 8) {
      errs.address = 'Enter your full delivery address.';
    }
    if (city.length < 2) {
      errs.city = 'Enter your city.';
    }
    if (state.length < 2) {
      errs.state = 'Enter your state.';
    }
    if (!/^\d{6}$/.test(pin)) {
      errs.pincode = 'Enter a 6-digit pincode.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const buildMessage = (orderNum = '') => {
    const lines = [
      'Soora Samhara Pooja Box – order request',
      orderNum ? `Order Reference: ${orderNum}` : '',
      `Boxes: ${quantity}`,
      `Box total: ${inr(quantity * unitPrice)}`,
      `Name: ${formData.name.trim()}`,
      `Mobile: ${formData.phone.trim()}`,
      formData.email ? `Email: ${formData.email.trim()}` : '',
      `Address: ${formData.address.trim().replace(/\s*\n\s*/g, ', ')}, ${formData.city.trim()}, ${formData.state.trim()} – ${formData.pincode.trim()}`
    ].filter(Boolean);
    return lines.join('\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await orderService.createOrder({
        productSlug: product?.slug || 'soora-samhara-pooja-box-2026',
        quantity,
        customer: formData
      });

      if (res.success && res.data) {
        setOrderResponse(res.data);
        const text = buildMessage(res.data.orderNumber);
        setResultText(text);

        try {
          localStorage.setItem('ssk_devotee_session', JSON.stringify({
            phone: formData.phone.trim(),
            email: formData.email?.trim() || '',
            name: formData.name.trim(),
            lastOrderNumber: res.data.orderNumber
          }));
        } catch (e) {
          console.warn('Could not save session', e);
        }

        // Scroll result into view
        setTimeout(() => {
          const el = document.getElementById('result');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (err) {
      if (err.status === 401 || err.message?.includes('sign in')) {
        openAuthModal('login');
      }
      setErrorMessage(err.message || 'Failed to place order request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayNow = () => {
    if (!orderResponse) return;

    setIsPaying(true);
    setErrorMessage('');

    paymentService.openRazorpayCheckout({
      key: orderResponse.keyId,
      amount: orderResponse.amountInPaise,
      currency: orderResponse.currency || 'INR',
      name: 'Sri Sankara TV',
      description: `Soora Samhara Pooja Box (${quantity} box${quantity > 1 ? 'es' : ''})`,
      orderId: orderResponse.razorpayOrderId,
      prefill: {
        name: formData.name,
        contact: formData.phone,
        email: formData.email
      },
      theme: { color: '#2F0A12' },
      onSuccess: async (paymentDetails) => {
        try {
          const verifyRes = await paymentService.verifyPayment({
            orderNumber: orderResponse.orderNumber,
            razorpayOrderId: paymentDetails.razorpayOrderId,
            razorpayPaymentId: paymentDetails.razorpayPaymentId,
            razorpaySignature: paymentDetails.razorpaySignature,
            orderToken: orderResponse.orderToken,
            customer: formData,
            quantity
          });

          if (verifyRes.success) {
            navigate(`/payment-result?orderNumber=${orderResponse.orderNumber}&status=success`);
          }
        } catch (err) {
          navigate(`/payment-result?orderNumber=${orderResponse.orderNumber}&status=failed&error=${encodeURIComponent(err.message)}`);
        } finally {
          setIsPaying(false);
        }
      },
      onDismiss: () => {
        setIsPaying(false);
      }
    });
  };

  const handleCopy = () => {
    if (!navigator.clipboard) {
      setCopyStatus('Select and copy the text above.');
      return;
    }

    navigator.clipboard.writeText(resultText).then(
      () => setCopyStatus('Order details copied.'),
      () => setCopyStatus('Select and copy the text above.')
    );
  };

  const whatsappNumber = settings?.order_desk_whatsapp || '919840000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(resultText)}`;

  return (
    <section className="band order" id="order">
      <div className="wrap order-grid">
        <div>
          <Eyebrow>Reserve your box</Eyebrow>
          <Title>One box, {inr(unitPrice)}</Title>
          <Lede>
            Choose how many boxes you want and share your delivery details. One standard box for every devotee, with the same contents.
          </Lede>
          <OrderSummary
            productName={product?.name || 'Soora Samhara Pooja Box'}
            quantity={quantity}
            unitPrice={unitPrice}
          />
          <p className="small">Price shown is for the box. Delivery details are confirmed when your order is processed.</p>
        </div>

        <div style={{ minWidth: 0 }}>
          {errorMessage && (
            <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 4, marginBottom: 16 }}>
              {errorMessage}
            </div>
          )}

          {!isAuthenticated ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 24px', background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(228, 182, 85, 0.15)',
                border: '1px solid var(--gold)',
                margin: '0 auto 16px',
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.8rem'
              }}>
                🙏
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--head)', fontSize: '1.45rem', margin: '0 0 8px' }}>
                Devotee Sign In Required
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', maxWidth: '44ch', margin: '0 auto 24px', lineHeight: 1.6 }}>
                Lord Murugan’s Soora Samhara Pooja Box is blessed in your name. Please sign in or create an account with your mobile number, email, and password to place your order.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                <Button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  style={{ minWidth: 160 }}
                >
                  Sign In to Order
                </Button>
                <button
                  type="button"
                  className="btn alt"
                  onClick={() => openAuthModal('register')}
                  style={{ minWidth: 160 }}
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : !orderResponse ? (
            <form className="card" id="order-form" onSubmit={handleSubmit} noValidate>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(228, 182, 85, 0.1)',
                border: '1px solid rgba(228, 182, 85, 0.3)',
                borderRadius: 4,
                padding: '10px 14px',
                marginBottom: 10
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Authenticated Devotee
                  </span>
                  <strong style={{ color: 'var(--head)', fontSize: '0.95rem' }}>{customer?.name}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)', marginLeft: 8 }}>({customer?.phone})</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  style={{ background: 'none', border: 'none', color: 'var(--saffron)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Switch account
                </button>
              </div>
              <div className="fld">
                <label htmlFor="f-qty">Number of boxes</label>
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={product?.maxQuantity || 20}
                  disabled={isSubmitting}
                />
              </div>

              <div className="two">
                <FormField
                  id="name"
                  label="Full name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={errors.name}
                  autoComplete="name"
                  required
                />
                <FormField
                  id="phone"
                  label="Mobile number"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  error={errors.phone}
                  autoComplete="tel-national"
                  required
                />
              </div>

              <FormField
                id="email"
                label="Email address (optional, for receipt & updates)"
                type="email"
                placeholder="devotee@example.com"
                value={formData.email}
                onChange={handleChange('email')}
                error={errors.email}
                autoComplete="email"
              />

              <FormField
                id="addr"
                label="Delivery address"
                as="textarea"
                value={formData.address}
                onChange={handleChange('address')}
                error={errors.address}
                autoComplete="street-address"
                required
              />

              <div className="two">
                <FormField
                  id="city"
                  label="City"
                  value={formData.city}
                  onChange={handleChange('city')}
                  error={errors.city}
                  autoComplete="address-level2"
                  required
                />
                <FormField
                  id="state"
                  label="State"
                  value={formData.state}
                  onChange={handleChange('state')}
                  error={errors.state}
                  autoComplete="address-level1"
                  required
                />
              </div>

              <FormField
                id="pin"
                label="Pincode"
                inputMode="numeric"
                placeholder="6 digits"
                value={formData.pincode}
                onChange={handleChange('pincode')}
                error={errors.pincode}
                autoComplete="postal-code"
                required
                style={{ maxWidth: 220 }}
              />

              <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                Place order request
              </Button>
            </form>
          ) : (
            <div className="result" id="result">
              <h3>Your order request is ready</h3>
              <p id="result-note">
                Check the details below, then continue to complete your order via Razorpay secure checkout.
              </p>
              <textarea
                id="result-text"
                readOnly
                aria-label="Order details"
                value={resultText}
                rows={8}
              />
              <div className="actions">
                <Button onClick={handlePayNow} loading={isPaying} disabled={isPaying}>
                  Pay with Razorpay ({inr(quantity * unitPrice)})
                </Button>
                <Button variant="alt" onClick={handleCopy}>
                  Copy order details
                </Button>
                {whatsappNumber && (
                  <Button
                    variant="alt"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Send on WhatsApp
                  </Button>
                )}
                <Button
                  variant="alt"
                  onClick={() => navigate(`/profile?phone=${encodeURIComponent(formData.phone.trim())}`)}
                >
                  View in My Profile
                </Button>
                <Button
                  variant="alt"
                  onClick={() => setOrderResponse(null)}
                  disabled={isPaying}
                >
                  Edit details
                </Button>
              </div>
              {copyStatus && (
                <p className="small" id="copy-status" role="status">
                  {copyStatus}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderForm;
