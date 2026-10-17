import dotenv from 'dotenv';
dotenv.config();

import { connectDB, closeDB } from '../config/db.js';
import Product from '../models/Product.js';
import AdminUser from '../models/AdminUser.js';
import Setting from '../models/Setting.js';
import bcrypt from 'bcryptjs';
import { DEFAULT_PRODUCT, ADMIN_ROLES } from '../config/constants.js';

export const seedDatabase = async () => {
  console.log('[Seed] Seeding database...');

  // 1. Seed or update Product
  let product = await Product.findOne({ slug: DEFAULT_PRODUCT.slug });
  const productData = {
    name: 'Soora Samhara Pooja Box',
    slug: DEFAULT_PRODUCT.slug,
    tamilTitle: 'சூரசம்ஹார பூஜை',
    description: 'Six vibhuti from the Arupadai temples, a Murugan keepsake statue, a rudraksh bracelet and chandan. The box travels to all six temples and to the final Yaagam at Thiruttani on 15 November, and comes to you with its authentication certificate.',
    priceInPaise: 250000, // ₹2,500.00
    currency: 'INR',
    minQuantity: 1,
    maxQuantity: 20,
    isActive: true,
    eventDate: new Date('2026-11-15T00:00:00+05:30'),
    eventLocation: 'Thiruttani',
    imageUrl: '/Luxury Maroon Murugan Pooja Kit.png',
    contents: [
      { qty: '6×', title: 'Vibhuti from the Arupadai temples', description: 'One packet from each of the six abodes of Lord Murugan.' },
      { qty: '1×', title: 'Murugan keepsake statue', description: 'Six inches tall, for your home altar.' },
      { qty: '1×', title: 'Rudraksh bracelet', description: 'Rudraksh beads strung as a bracelet.' },
      { qty: '1×', title: 'Chandan', description: 'For tilak and for your daily pooja.' },
      { qty: '1×', title: 'Authentication certificate', description: 'Issued by Sri Sankara TV with your box.' }
    ],
    temples: [
      { ta: 'திருப்பரங்குன்றம்', en: 'Thiruparankundram', where: 'Madurai', isFinal: false, flag: null },
      { ta: 'திருச்செந்தூர்', en: 'Thiruchendur', where: 'Thoothukudi', isFinal: false, flag: null },
      { ta: 'பழனி', en: 'Palani', where: 'Dindigul', isFinal: false, flag: null },
      { ta: 'சுவாமிமலை', en: 'Swamimalai', where: 'Thanjavur', isFinal: false, flag: null },
      { ta: 'பழமுதிர்சோலை', en: 'Pazhamudhirsolai', where: 'Madurai', isFinal: false, flag: null },
      { ta: 'திருத்தணி', en: 'Thiruttani', where: 'Tiruvallur', isFinal: true, flag: 'Final Yaagam · 15 November' }
    ],
    certificateConfig: {
      authority: 'Sri Sankara TV',
      title: 'Authentication Certificate',
      subtitle: 'Soora Samhara Pooja 2026',
      sealText: 'வேல்',
      caption: 'Illustration of the certificate. Final design may differ.',
      verificationPoints: [
        'Vibhuti sourced from the six Arupadai temples',
        'Box taken to the final Yaagam at Thiruttani on 15 November',
        'Certificate issued by Sri Sankara TV, packed inside your box'
      ]
    }
  };

  if (!product) {
    product = new Product(productData);
    await product.save();
    console.log('[Seed] Created default Soora Samhara Pooja Box product.');
  } else {
    console.log('[Seed] Default product already exists.');
  }

  // 2. Seed initial Super Admin
  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@srisankaratv.com').toLowerCase().trim();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'SankaraAdmin2026!';
  const adminName = process.env.INITIAL_ADMIN_NAME || 'Super Admin';

  let adminUser = await AdminUser.findOne({ email: adminEmail });
  if (!adminUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    adminUser = new AdminUser({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: ADMIN_ROLES.SUPER_ADMIN,
      isActive: true
    });
    await adminUser.save();
    console.log(`[Seed] Created initial Super Admin: ${adminEmail}`);
  } else {
    console.log(`[Seed] Super Admin user ${adminEmail} already exists.`);
  }

  // 3. Seed default Settings
  const defaultSettings = [
    { key: 'countdown_target_date', value: '2026-11-15T00:00:00+05:30', category: 'EVENT', description: 'Countdown target date in ISO format', isPublic: true },
    { key: 'order_desk_whatsapp', value: '919840000000', category: 'CONTACT', description: 'WhatsApp order desk number with country code', isPublic: true },
    { key: 'support_phone', value: '+91 44 2498 0000', category: 'CONTACT', description: 'Support helpline phone number', isPublic: true },
    { key: 'support_email', value: 'orders@srisankaratv.com', category: 'CONTACT', description: 'Customer support email address', isPublic: true }
  ];

  for (const s of defaultSettings) {
    const exists = await Setting.findOne({ key: s.key });
    if (!exists) {
      await Setting.create(s);
      console.log(`[Seed] Created setting: ${s.key}`);
    }
  }

  console.log('[Seed] Database seeding completed successfully.');
};

// If run directly via command line
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    }
  })();
}
