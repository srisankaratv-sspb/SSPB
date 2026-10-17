import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { CheckCircle2, XCircle, Printer, ArrowRight } from 'lucide-react';
import { Button } from '../components/atoms/Button';

export const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const status = searchParams.get('status') || 'success';
  const errorMessage = searchParams.get('error');

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderNumber));

  useEffect(() => {
    if (orderNumber) {
      orderService.getOrderStatus(orderNumber)
        .then((res) => {
          if (res.success && res.data) {
            setOrderDetails(res.data);
          }
        })
        .catch((err) => console.warn(err))
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  const isSuccess = status === 'success';

  return (
    <div className="band" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="wrap" style={{ maxWidth: 680 }}>
        <div
          className="card"
          style={{
            border: `2px solid ${isSuccess ? 'var(--gold)' : 'var(--err)'}`,
            background: 'var(--surface)',
            padding: '36px 30px',
            textAlign: 'center'
          }}
        >
          {isSuccess ? (
            <>
              <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: 'rgba(22, 163, 74, 0.1)', color: '#16A34A', marginBottom: 16 }}>
                <CheckCircle2 size={48} />
              </div>
              <p className="eyebrow" style={{ color: 'var(--gold)' }}>Payment Confirmed</p>
              <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--head)', fontSize: '2rem', marginTop: 8 }}>
                Vetrivel Muruganukku Harohara
              </h1>
              <p className="lede" style={{ margin: '14px auto 24px', maxWidth: 480 }}>
                Thank you for reserving the sacred <strong>Soora Samhara Pooja Box 2026</strong>. Your transaction has been verified.
              </p>

              {orderDetails && (
                <div
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    padding: 20,
                    borderRadius: 4,
                    textAlign: 'left',
                    margin: '20px 0',
                    fontSize: '0.95rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 10, marginBottom: 10 }}>
                    <span style={{ color: 'var(--muted)' }}>Order Reference:</span>
                    <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--head)' }}>{orderDetails.orderNumber}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 10, marginBottom: 10 }}>
                    <span style={{ color: 'var(--muted)' }}>Devotee Name:</span>
                    <strong>{orderDetails.customerName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 10, marginBottom: 10 }}>
                    <span style={{ color: 'var(--muted)' }}>Quantity:</span>
                    <strong>{orderDetails.quantity} box(es)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 10, marginBottom: 10 }}>
                    <span style={{ color: 'var(--muted)' }}>Amount Paid:</span>
                    <strong style={{ color: 'var(--head)', fontSize: '1.1rem' }}>₹{orderDetails.totalAmountInRupees?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Destination:</span>
                    <span>{orderDetails.deliveryCity}, {orderDetails.deliveryState}</span>
                  </div>
                </div>
              )}

              <p style={{ fontSize: '0.92rem', color: 'var(--muted)', marginBottom: 28 }}>
                The pooja box will travel to all six Arupadai temples and the final Yaagam at Thiruttani on 15 November 2026, and will be dispatched to your address along with the official Sri Sankara TV certificate.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                <Button onClick={() => window.print()} variant="alt">
                  <Printer size={16} style={{ marginRight: 6 }} /> Print / Save Receipt
                </Button>
                <Link to="/profile" className="btn alt">
                  View in My Profile
                </Link>
                <Link to="/" className="btn">
                  Back to Homepage <ArrowRight size={16} style={{ marginLeft: 6 }} />
                </Link>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: 'rgba(220, 38, 38, 0.1)', color: 'var(--err)', marginBottom: 16 }}>
                <XCircle size={48} />
              </div>
              <p className="eyebrow" style={{ color: 'var(--err)' }}>Payment Unsuccessful</p>
              <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--head)', fontSize: '2rem', marginTop: 8 }}>
                Transaction Incomplete
              </h1>
              <p className="lede" style={{ margin: '14px auto 24px', maxWidth: 480 }}>
                {errorMessage || 'The payment could not be confirmed. If money was debited from your bank account, it will be automatically reconciled or refunded by your bank.'}
              </p>
              {orderNumber && (
                <p style={{ fontSize: '0.92rem', marginBottom: 24 }}>
                  Order Number: <strong>{orderNumber}</strong>
                </p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                <Link to="/#order" className="btn">
                  Try Again
                </Link>
                <Link to="/" className="btn alt">
                  Return to Homepage
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
