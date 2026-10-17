import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Button from '../components/atoms/Button';
import FormField from '../components/molecules/FormField';
import { Save, Plus, Trash2 } from 'lucide-react';

export const ContentPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await adminService.getContent();
      if (res.success && res.data) {
        setContent(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content?.product) return;

    setSaving(true);
    setMessage('');
    try {
      const res = await adminService.updateContent({
        productUpdates: {
          name: content.product.name,
          tamilTitle: content.product.tamilTitle,
          description: content.product.description,
          eventLocation: content.product.eventLocation,
          contents: content.product.contents,
          temples: content.product.temples,
          certificateConfig: content.product.certificateConfig
        }
      });

      if (res.success) {
        setMessage('Website content updated successfully! Public storefront updated.');
      }
    } catch (err) {
      alert('Error updating content: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateContentItem = (index, field, value) => {
    const newItems = [...content.product.contents];
    newItems[index][field] = value;
    setContent({
      ...content,
      product: { ...content.product, contents: newItems }
    });
  };

  const updateTempleItem = (index, field, value) => {
    const newTemples = [...content.product.temples];
    newTemples[index][field] = value;
    setContent({
      ...content,
      product: { ...content.product, temples: newTemples }
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading content editor...</div>;

  const product = content?.product;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.85rem' }}>
          Website Content & Section Editor
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
          Live configuration for Hero headings, Tamil titles, blessed contents, temples, and certificate details.
        </p>
      </div>

      {message && (
        <div style={{ padding: 12, background: '#DCFCE7', color: '#166534', borderRadius: 4, marginBottom: 20 }}>
          {message}
        </div>
      )}

      {product && (
        <form onSubmit={handleSave} style={{ display: 'grid', gap: 24, maxWidth: 860 }}>
          {/* Hero Section Content */}
          <div className="admin-card">
            <h3>Hero Section Headings</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField
                  id="tamil-title"
                  label="Tamil Title (lang='ta')"
                  value={product.tamilTitle || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, tamilTitle: e.target.value } })}
                  required
                />
                <FormField
                  id="main-title"
                  label="Main Heading"
                  value={product.name || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, name: e.target.value } })}
                  required
                />
              </div>

              <FormField
                id="hero-desc"
                label="Product Hero Story Description"
                as="textarea"
                rows={3}
                value={product.description || ''}
                onChange={(e) => setContent({ ...content, product: { ...product, description: e.target.value } })}
                required
              />
            </div>
          </div>

          {/* Product Contents Section */}
          <div className="admin-card">
            <h3>Inside the Box: 5 Blessed Items</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              {product.contents?.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 1.2fr 2fr', gap: 10, alignItems: 'center', background: '#F8FAFC', padding: 10, borderRadius: 6 }}>
                  <input
                    type="text"
                    value={item.qty}
                    onChange={(e) => updateContentItem(idx, 'qty', e.target.value)}
                    className="admin-input"
                    placeholder="Qty (6×)"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateContentItem(idx, 'title', e.target.value)}
                    className="admin-input"
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateContentItem(idx, 'description', e.target.value)}
                    className="admin-input"
                    placeholder="Description"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Six Temple Journey */}
          <div className="admin-card">
            <h3>Six-Temple Pilgrimage Cards</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {product.temples?.map((temple, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr', gap: 10, alignItems: 'center', background: '#F8FAFC', padding: 10, borderRadius: 6 }}>
                  <input
                    type="text"
                    value={temple.ta}
                    onChange={(e) => updateTempleItem(idx, 'ta', e.target.value)}
                    className="admin-input"
                    placeholder="Tamil Name"
                  />
                  <input
                    type="text"
                    value={temple.en}
                    onChange={(e) => updateTempleItem(idx, 'en', e.target.value)}
                    className="admin-input"
                    placeholder="English Name"
                  />
                  <input
                    type="text"
                    value={temple.where}
                    onChange={(e) => updateTempleItem(idx, 'where', e.target.value)}
                    className="admin-input"
                    placeholder="Location / District"
                  />
                  <input
                    type="text"
                    value={temple.flag || ''}
                    onChange={(e) => updateTempleItem(idx, 'flag', e.target.value)}
                    className="admin-input"
                    placeholder="Flag text (if final)"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Authentication Certificate */}
          <div className="admin-card">
            <h3>Authentication Certificate Details</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FormField
                  id="cert-auth"
                  label="Certificate Authority"
                  value={product.certificateConfig?.authority || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, certificateConfig: { ...product.certificateConfig, authority: e.target.value } } })}
                />
                <FormField
                  id="cert-title"
                  label="Certificate Title"
                  value={product.certificateConfig?.title || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, certificateConfig: { ...product.certificateConfig, title: e.target.value } } })}
                />
                <FormField
                  id="cert-seal"
                  label="Seal Tamil Text"
                  value={product.certificateConfig?.sealText || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, certificateConfig: { ...product.certificateConfig, sealText: e.target.value } } })}
                />
              </div>
            </div>
          </div>

          <Button type="submit" loading={saving} style={{ width: 'max-content' }}>
            <Save size={16} style={{ marginRight: 6 }} /> Publish Content Changes
          </Button>
        </form>
      )}
    </div>
  );
};

export default ContentPage;
