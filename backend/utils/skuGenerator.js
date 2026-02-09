// SKU Generator Utility
// Generates unique SKUs for product variants

/**
 * Generate SKU from product title, color, and size
 * Format: XXX-COLOR-SIZE (e.g., TSH-BLK-M)
 */
export const generateSKU = (productTitle, color, size) => {
    // Get first 3 letters from title
    const prefix = productTitle
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 3) || 'PRD';

    // Get first 3 letters of color
    const colorCode = color.slice(0, 3).toUpperCase();

    // Size code
    const sizeCode = size.toUpperCase();

    return `${prefix}-${colorCode}-${sizeCode}`;
};

/**
 * Ensure SKU is unique by checking database
 * Append number if duplicate (TSH-BLK-M-2)
 */
export const ensureUniqueSKU = async (baseSKU, productModel) => {
    let sku = baseSKU;
    let counter = 1;

    // Check if SKU exists
    while (await skuExists(sku, productModel)) {
        counter++;
        sku = `${baseSKU}-${counter}`;
    }

    return sku;
};

/**
 * Check if SKU already exists in database
 */
const skuExists = async (sku, productModel) => {
    const product = await productModel.findOne({ 'variants.sku': sku });
    return product !== null;
};
