import React from 'react';

const SizeSelectionModal = ({ isOpen, onClose, sizes, productData, onSelectSize }) => {
    if (!isOpen) return null;

    const handleSizeClick = (size) => {
        onSelectSize(size);
        onClose();
    };

    const getStockForSize = (size) => {
        if (!productData) return null;

        // Check if product uses variants
        if (productData.variants && productData.variants.length > 0) {
            // For variants, check if ANY color has stock for this size
            const sizeVariants = productData.variants.filter(v => v.size === size);
            const totalStock = sizeVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
            const maxStock = Math.max(...sizeVariants.map(v => v.stock || 0));
            return { total: totalStock, max: maxStock, isOutOfStock: totalStock === 0 };
        }

        return null;
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8 transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                        Please Select Product Size
                    </h2>
                    <p className="text-sm text-gray-500">
                        Choose your preferred size to add to cart
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 justify-center mb-6">
                    {sizes && sizes.map((size, index) => {
                        const stockInfo = getStockForSize(size);
                        const isOutOfStock = stockInfo?.isOutOfStock;

                        return (
                            <button
                                key={index}
                                onClick={() => !isOutOfStock && handleSizeClick(size)}
                                disabled={isOutOfStock}
                                className={`
                  relative min-w-[60px] px-4 py-3 border-2 rounded-md font-medium transition-all
                  ${isOutOfStock
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                                        : 'bg-white text-gray-800 border-gray-300 hover:border-orange-500 hover:bg-orange-50 active:scale-95'
                                    }
                `}
                            >
                                {size}
                                {stockInfo && stockInfo.max > 0 && stockInfo.max < 5 && (
                                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                        {stockInfo.max}
                                    </span>
                                )}
                                {isOutOfStock && (
                                    <span className="text-xs block mt-1">Out</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={onClose}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default SizeSelectionModal;
