import Product from '../models/Product.js';
import AuditLog from '../models/AuditLog.js';
import { DEFAULT_PRODUCT } from '../config/constants.js';

export const getPublicProduct = async (req, res) => {
  try {
    let product = await Product.findOne({ isActive: true });
    if (!product) {
      // Return default configuration if not yet seeded
      return res.status(200).json({
        success: true,
        data: {
          name: DEFAULT_PRODUCT.name,
          slug: DEFAULT_PRODUCT.slug,
          tamilTitle: DEFAULT_PRODUCT.eventTamilTitle,
          description: 'Six vibhuti from the Arupadai temples, a Murugan keepsake statue, a rudraksh bracelet and chandan. The box travels to all six temples and to the final Yaagam at Thiruttani on 15 November, and comes to you with its authentication certificate.',
          priceInPaise: DEFAULT_PRODUCT.priceInPaise,
          priceInRupees: DEFAULT_PRODUCT.priceInPaise / 100,
          currency: DEFAULT_PRODUCT.currency,
          eventDate: DEFAULT_PRODUCT.eventDate,
          eventLocation: DEFAULT_PRODUCT.eventLocation,
          minQuantity: 1,
          maxQuantity: 20
        }
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, priceInPaise, isActive, eventDate, eventLocation, stockCapacity, certificateConfig } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousData = product.toObject();

    if (name) product.name = name;
    if (description) product.description = description;
    if (priceInPaise !== undefined) product.priceInPaise = Number(priceInPaise);
    if (isActive !== undefined) product.isActive = Boolean(isActive);
    if (eventDate) product.eventDate = new Date(eventDate);
    if (eventLocation) product.eventLocation = eventLocation;
    if (stockCapacity !== undefined) product.stockCapacity = stockCapacity;
    if (certificateConfig) product.certificateConfig = { ...product.certificateConfig, ...certificateConfig };

    await product.save();

    // Audit log
    await AuditLog.create({
      adminUserId: req.adminUser._id,
      adminEmail: req.adminUser.email,
      action: 'UPDATE_PRODUCT',
      resourceType: 'PRODUCT',
      resourceId: product._id.toString(),
      changes: { previous: previousData, updated: product.toObject() },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
