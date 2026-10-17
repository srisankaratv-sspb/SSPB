import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Button from '../components/atoms/Button';
import FormField from '../components/molecules/FormField';
import { Save } from 'lucide-react';

export const ProductsPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [priceInRupees, setPriceInRupees] = useState(2500);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await adminService.getProducts();
      if (res.success && res.data && res.data.length > 0) {
        const prod = res.data[0];
        setProduct(prod);
        setPriceInRupees(prod.priceInPaise / 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    setMessage('');
    try {
      const updatedPaise = Math.round(Number(priceInRupees) * 100);
      const res = await adminService.updateProduct(product._id, {
        name: product.name,
        description: product.description,
        priceInPaise: updatedPaise,
        isActive: product.isActive,
        eventLocation: product.eventLocation,
        eventDate: product.eventDate
      });

      if (res.success) {
        setMessage('Product settings saved successfully.');
        setProduct(res.data);
      }
    } catch (err) {
      alert('Error updating product: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading product configuration...</div>;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.85rem' }}>
          Product Catalog & Pricing
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
          Manage product pricing, sales capacity, descriptions, and pilgrimage details.
        </p>
      </div>

      {message && (
        <div style={{ padding: 12, background: '#DCFCE7', color: '#166534', borderRadius: 4, marginBottom: 20 }}>
          {message}
        </div>
      )}

      {product && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 680 }} className="admin-card">
          <div style={{ display: 'grid', gap: 16 }}>
            <FormField
              id="prod-name"
              label="Product Title"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Unit Price (INR ₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={priceInRupees}
                  onChange={(e) => setPriceInRupees(e.target.value)}
                  className="admin-input"
                  style={{ width: '100%' }}
                  required
                />
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Equivalent to {Math.round(Number(priceInRupees) * 100)} integer paise
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Sales Status
                </label>
                <select
                  value={product.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setProduct({ ...product, isActive: e.target.value === 'active' })}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="active">Active (Reservations Open)</option>
                  <option value="inactive">Disabled (Reservations Closed)</option>
                </select>
              </div>
            </div>

            <FormField
              id="prod-desc"
              label="Product Description"
              as="textarea"
              rows={4}
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FormField
                id="event-location"
                label="Final Yaagam Destination"
                value={product.eventLocation}
                onChange={(e) => setProduct({ ...product, eventLocation: e.target.value })}
                required
              />

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Event Date
                </label>
                <input
                  type="date"
                  value={product.eventDate ? new Date(product.eventDate).toISOString().split('T')[0] : '2026-11-15'}
                  onChange={(e) => setProduct({ ...product, eventDate: new Date(e.target.value).toISOString() })}
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <Button type="submit" loading={saving} style={{ width: 'max-content', marginTop: 8 }}>
              <Save size={16} style={{ marginRight: 6 }} /> Save Product Changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductsPage;
