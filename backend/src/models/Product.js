import mongoose from 'mongoose';

const ProductContentSchema = new mongoose.Schema({
  qty: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const TempleSchema = new mongoose.Schema({
  ta: { type: String, required: true },
  en: { type: String, required: true },
  where: { type: String, required: true },
  isFinal: { type: Boolean, default: false },
  flag: { type: String, default: null }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  tamilTitle: { type: String, default: 'சூரசம்ஹார பூஜை' },
  description: { type: String, required: true },
  priceInPaise: { type: Number, required: true, min: 0 }, // e.g. 250000 = ₹2,500.00
  currency: { type: String, default: 'INR', uppercase: true },
  minQuantity: { type: Number, default: 1, min: 1 },
  maxQuantity: { type: Number, default: 20, max: 100 },
  isActive: { type: Boolean, default: true, index: true },
  stockCapacity: { type: Number, default: null }, // null = unlimited
  reservedCount: { type: Number, default: 0 },
  eventDate: { type: Date, default: new Date('2026-11-15T00:00:00+05:30') },
  eventLocation: { type: String, default: 'Thiruttani' },
  imageUrl: { type: String, default: '/Luxury Maroon Murugan Pooja Kit.png' },
  contents: [ProductContentSchema],
  temples: [TempleSchema],
  certificateConfig: {
    authority: { type: String, default: 'Sri Sankara TV' },
    title: { type: String, default: 'Authentication Certificate' },
    subtitle: { type: String, default: 'Soora Samhara Pooja 2026' },
    sealText: { type: String, default: 'வேல்' },
    caption: { type: String, default: 'Illustration of the certificate. Final design may differ.' },
    verificationPoints: {
      type: [String],
      default: [
        'Vibhuti sourced from the six Arupadai temples',
        'Box taken to the final Yaagam at Thiruttani on 15 November',
        'Certificate issued by Sri Sankara TV, packed inside your box'
      ]
    }
  }
}, {
  timestamps: true
});

ProductSchema.virtual('priceInRupees').get(function () {
  return this.priceInPaise / 100;
});

export default mongoose.model('Product', ProductSchema);
