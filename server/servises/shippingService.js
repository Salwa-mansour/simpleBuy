import { Shippo } from 'shippo';
import Product from '../models/Product.js';

const shippo = new Shippo({ apiKeyHeader: process.env.SHIPPO_API_KEY });

/**
 * Calculates package dimensions and weight for an array of cart items.
 */
export const calculatePackageSize = async (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return {
      weight: 0,
      weightUnit: undefined,
      dimensions: { length: 0, width: 0, height: 0, unit: undefined }
    };
  }

  let totalWeight = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let totalStackedHeight = 0;

  let weightUnit;
  let dimensionUnit;

  for (const item of cartItems) {
    let product = item.product;

    if (typeof product === 'string' || product?.constructor?.name === 'ObjectId') {
      product = await Product.findById(product).lean();
    }

    if (!product) continue;

    if (product.weight?.unit) {
      weightUnit = product.weight.unit;
    }
    if (product.dimensions?.unit) {
      dimensionUnit = product.dimensions.unit;
    }

    const qty = Number(item.quantity) || 1;

    const itemWeight = product.weight?.value || 0;
    totalWeight += itemWeight * qty;

    const itemLength = product.dimensions?.length || 0;
    const itemWidth = product.dimensions?.width || 0;
    const itemHeight = product.dimensions?.height || 0;

    if (itemLength > maxLength) maxLength = itemLength;
    if (itemWidth > maxWidth) maxWidth = itemWidth;

    totalStackedHeight += itemHeight * qty;
  }

  return {
    weight: Number(totalWeight.toFixed(2)),
    weightUnit: weightUnit,
    dimensions: {
      length: Number(maxLength.toFixed(2)),
      width: Number(maxWidth.toFixed(2)),
      height: Number(totalStackedHeight.toFixed(2)),
      unit: dimensionUnit
    }
  };
};

/**
 * Helper to normalize country names to 2-letter ISO codes for Shippo
 */
const formatCountryCode = (country) => {
  if (!country) return 'US';
  if (country.toLowerCase() === 'united states' || country.toLowerCase() === 'usa') return 'US';
  return country.length === 2 ? country.toUpperCase() : country;
};

/**
 * Fetches available shipping options from Shippo.
 */
export const getShippingOptions = async (addressData, packageDetails) => {
  console.log("Address Data:", addressData);

  // 1. Destination Address
  const addressTo = {
    name: addressData.fullName?.trim() || `${addressData.firstName || ''} ${addressData.lastName || ''}`.trim(),
    street1: addressData.addressLine1 || addressData.address || addressData.street1,
    street2: addressData.street2 || addressData.addressLine2 || '',
    city: addressData.city,
    state: addressData.state || addressData.province,
    zip: addressData.zip || addressData.postalCode,
    country: formatCountryCode(addressData.country),
    phone: addressData.phone || '',
    email: addressData.email || ''
  };

  // 2. Origin Address (REQUIRED: Must include email)
  const addressFrom = {
    name: process.env.STORE_NAME || 'SimpleBuy Store',
    street1: process.env.STORE_STREET || '123 Main St',
    city: process.env.STORE_CITY || 'Austin',
    state: process.env.STORE_STATE || 'TX',
    zip: process.env.STORE_ZIP || '78701',
    country: formatCountryCode(process.env.STORE_COUNTRY) || 'US',
    phone: process.env.STORE_PHONE || '5555555555',
    email: process.env.STORE_EMAIL || 'support@simplebuy.com' // <--- CRITICAL FIX FOR USPS
  };

  // 3. Parcel specs
  const parcel = {
    length: String(packageDetails.dimensions.length),
    width: String(packageDetails.dimensions.width),
    height: String(packageDetails.dimensions.height),
    distanceUnit: packageDetails.dimensions.unit || 'in',
    weight: String(packageDetails.weight),
    massUnit: packageDetails.weightUnit || 'lb'
  };

  // 4. Create Shipment in Shippo
  const shipment = await shippo.shipments.create({
    addressFrom,
    addressTo,
    parcels: [parcel],
    async: false
  });

  console.log("addressFrom:", addressFrom);
  console.log("addressTo:", addressTo);

  // 5. Normalize rates for frontend
  const shippingOptions = shipment.rates.map((rate) => ({
    id: rate.objectId,
    carrier: rate.provider,
    service: rate.servicelevel?.name,
    rate: Number(rate.amount),
    currency: rate.currency || 'USD',
    estimatedDays: rate.estimatedDays || null,
    durationTerms: rate.durationTerms || null,
    shipmentId: shipment.objectId
  }));

  return shippingOptions.sort((a, b) => a.rate - b.rate);
};

/**
 * Purchases and generates a shipping label using the rate ID.
 */
export const generateShippingLabel = async (rateId) => {
  if (!rateId) {
    throw new Error('Rate ID is required to generate a shipping label.');
  }

  const transaction = await shippo.transactions.create({
    rate: rateId,
    labelFileType: 'PDF',
    async: false,
  });

  console.log('Shippo Transaction Response:', transaction);

  if (transaction.status !== 'SUCCESS') {
    const errorMessage = transaction.messages?.[0]?.text || transaction.messages?.[0]?.message || 'Shippo failed to purchase label.';
    throw new Error(`Label Generation Error: ${errorMessage}`);
  }

  return {
    transactionId: transaction.objectId || transaction.object_id,
    trackingNumber: transaction.trackingNumber || transaction.tracking_number,
    trackingUrl: transaction.trackingUrlProvider || transaction.tracking_url_provider,
    labelUrl: transaction.labelUrl || transaction.label_url,
    qrCodeUrl: transaction.qrCodeUrl || transaction.qr_code_url || null,
    provider: transaction.provider || 'USPS',
    purchasedAt: new Date()
  };
};