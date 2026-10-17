import { api } from './apiClient';

export const paymentService = {
  verifyPayment: async (payload) => {
    return api.post('/payments/verify', payload);
  },

  openRazorpayCheckout: ({
    key,
    amount,
    currency = 'INR',
    name = 'Sri Sankara TV',
    description = 'Soora Samhara Pooja Box 2026',
    orderId,
    prefill = {},
    theme = { color: '#2F0A12' },
    onSuccess,
    onDismiss
  }) => {
    if (!window.Razorpay) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    const options = {
      key,
      amount,
      currency,
      name,
      description,
      order_id: orderId,
      prefill: {
        name: prefill.name || '',
        contact: prefill.contact || '',
        email: prefill.email || ''
      },
      theme,
      modal: {
        ondismiss: function () {
          if (onDismiss) onDismiss();
        }
      },
      handler: function (response) {
        if (onSuccess) {
          onSuccess({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    return rzp;
  }
};
