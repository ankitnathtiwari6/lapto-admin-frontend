import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Product } from "../services/productService";

interface SelectedProduct {
  productId: string;
  productName: string;
  sku?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
}

interface ProductSectionProps {
  selectedProducts: SelectedProduct[];
  productSuggestions: Product[];
  showProductDropdown: boolean;
  searchingProducts: boolean;
  onProductSearchChange: (query: string) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProductField: (productId: string, field: string, value: any) => void;
  onRemoveProduct: (productId: string) => void;
  onAddCustomProduct?: (name: string, price: number, sku?: string) => void;
  additionalDiscount?: number;
  onAdditionalDiscountChange?: (value: number) => void;
  paidAmount?: number;
  onPaidAmountChange?: (value: number) => void;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  selectedProducts,
  productSuggestions,
  showProductDropdown,
  searchingProducts,
  onProductSearchChange,
  onAddProduct,
  onUpdateProductField,
  onRemoveProduct,
  onAddCustomProduct,
  additionalDiscount = 0,
  onAdditionalDiscountChange,
  paidAmount = 0,
  onPaidAmountChange,
}) => {
  const [customProductName, setCustomProductName] = useState("");
  const [customProductSKU, setCustomProductSKU] = useState("");
  const [customProductPrice, setCustomProductPrice] = useState<number>(0);

  const handleAddProductOrCustom = () => {
    if (!customProductName.trim()) {
      alert("Please enter a product name");
      return;
    }

    // Check if there's a matching product in suggestions
    // Ensure productSuggestions is an array before calling .find()
    const matchingProduct = Array.isArray(productSuggestions)
      ? productSuggestions.find(
          (p) => p.name.toLowerCase() === customProductName.toLowerCase()
        )
      : null;

    if (matchingProduct) {
      // Add predefined product
      onAddProduct(matchingProduct);
    } else {
      // Add custom product
      if (onAddCustomProduct) {
        onAddCustomProduct(
          customProductName,
          customProductPrice,
          customProductSKU
        );
      }
    }

    // Reset form
    setCustomProductName("");
    setCustomProductSKU("");
    setCustomProductPrice(0);
    onProductSearchChange(""); // Clear search to hide dropdown
  };

  const handleProductSelect = (product: Product) => {
    onAddProduct(product);
    // Clear all fields and search query to hide dropdown
    setCustomProductName("");
    setCustomProductSKU("");
    setCustomProductPrice(0);
    onProductSearchChange(""); // This will hide the dropdown
  };

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Add Products
      </h2>

      {/* Unified Product Search and Add Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">Add Product</p>
        <div className="relative">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-5 relative">
              <input
                type="text"
                value={customProductName}
                onChange={(e) => {
                  setCustomProductName(e.target.value);
                  onProductSearchChange(e.target.value);
                }}
                className="w-full input-field"
                placeholder="Search or enter product name..."
              />

              {/* Product Suggestions Dropdown */}
              {showProductDropdown && productSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {productSuggestions.map((product) => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => handleProductSelect(product)}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b last:border-b-0 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                          {product.sku && (
                            <div className="text-xs text-gray-500">
                              SKU: {product.sku}
                            </div>
                          )}
                          {product.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {product.description}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-semibold text-gray-900">
                            ₹{product.unitPrice}
                          </div>
                          <div className="text-xs text-gray-500">
                            Stock: {product.stock}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchingProducts && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <input
              type="text"
              value={customProductSKU}
              onChange={(e) => setCustomProductSKU(e.target.value)}
              className="col-span-3 input-field"
              placeholder="SKU (optional)..."
            />

            <div className="relative col-span-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                ₹
              </span>
              <input
                type="number"
                value={customProductPrice}
                onChange={(e) => setCustomProductPrice(Number(e.target.value))}
                className="w-full input-field pl-7"
                placeholder="Price"
              />
            </div>

            <button
              type="button"
              onClick={handleAddProductOrCustom}
              className="col-span-1 btn-primary whitespace-nowrap px-4"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {customProductName.length >= 2 &&
            productSuggestions.length === 0 &&
            !searchingProducts && (
              <p className="text-xs text-gray-500 mt-2">
                No matching products found. Enter SKU (optional) and price, then
                click + to add as custom product.
              </p>
            )}
        </div>
      </div>

      {/* Selected Products Table */}
      {selectedProducts.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className=" from-purple-50 to-indigo-50 border-b-2 border-purple-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">
                  Product
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-800 w-20">
                  Qty
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-800 w-28">
                  Price (₹)
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-800 w-28">
                  Disc. (₹)
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-800 w-24">
                  GST (%)
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-800 w-32">
                  Amount (₹)
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-800 w-32">
                  Total + GST (₹)
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {selectedProducts.map((product, index) => {
                const itemAmount =
                  product.quantity * product.unitPrice - product.discount;
                const gstAmount = (itemAmount * product.taxRate) / 100;
                const totalWithGst = itemAmount + gstAmount;
                return (
                  <tr
                    key={product.productId}
                    className={`transition-colors hover:bg-purple-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-3 px-4 text-gray-900">
                      <div className="font-medium">{product.productName}</div>
                      {product.sku && (
                        <div className="text-xs text-gray-500">
                          SKU: {product.sku}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) =>
                          onUpdateProductField(
                            product.productId,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full px-2 py-1.5 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.unitPrice}
                        onChange={(e) =>
                          onUpdateProductField(
                            product.productId,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1.5 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.discount}
                        onChange={(e) =>
                          onUpdateProductField(
                            product.productId,
                            "discount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1.5 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={product.taxRate}
                        onChange={(e) =>
                          onUpdateProductField(
                            product.productId,
                            "taxRate",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1.5 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow bg-white"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      ₹{itemAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-purple-600 bg-purple-50/50">
                      ₹{totalWithGst.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveProduct(product.productId)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                        title="Remove product"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals Footer */}
            <tfoot className="bg-gray-100 border-t-2 border-gray-300">
              <tr>
                <td
                  colSpan={5}
                  className="py-3 px-4 text-right font-semibold text-gray-800"
                >
                  Subtotal:
                </td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900">
                  ₹
                  {selectedProducts
                    .reduce(
                      (sum, p) => sum + (p.quantity * p.unitPrice - p.discount),
                      0
                    )
                    .toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-purple-600">
                  ₹
                  {selectedProducts
                    .reduce((sum, p) => {
                      const itemAmount = p.quantity * p.unitPrice - p.discount;
                      const gstAmount = (itemAmount * p.taxRate) / 100;
                      return sum + itemAmount + gstAmount;
                    }, 0)
                    .toFixed(2)}
                </td>
                <td className="py-3 px-4"></td>
              </tr>
              {onAdditionalDiscountChange && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-2 px-4 text-right text-sm text-gray-700"
                  >
                    Additional Discount (₹):
                  </td>
                  <td colSpan={2} className="py-2 px-4">
                    <input
                      type="number"
                      value={additionalDiscount}
                      onChange={(e) =>
                        onAdditionalDiscountChange(Number(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="py-2 px-4"></td>
                </tr>
              )}
              {onPaidAmountChange && (
                <>
                  <tr>
                    <td
                      colSpan={5}
                      className="py-2 px-4 text-right text-sm text-gray-700"
                    >
                      Paid Amount (₹):
                    </td>
                    <td colSpan={2} className="py-2 px-4">
                      <input
                        type="number"
                        value={paidAmount}
                        onChange={(e) =>
                          onPaidAmountChange(Number(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 px-4"></td>
                  </tr>
                  <tr className="bg-purple-50">
                    <td
                      colSpan={5}
                      className="py-3 px-4 text-right font-semibold text-gray-800"
                    >
                      Balance/Remaining Amount (₹):
                    </td>
                    <td
                      colSpan={2}
                      className="py-3 px-4 text-right font-bold text-lg"
                    >
                      <span
                        className={`${(() => {
                          const total = selectedProducts.reduce((sum, p) => {
                            const itemAmount =
                              p.quantity * p.unitPrice - p.discount;
                            const gstAmount = (itemAmount * p.taxRate) / 100;
                            return sum + itemAmount + gstAmount;
                          }, 0);
                          const balance =
                            total - additionalDiscount - paidAmount;
                          return balance <= 0
                            ? "text-green-600"
                            : "text-orange-600";
                        })()}`}
                      >
                        ₹
                        {(() => {
                          const total = selectedProducts.reduce((sum, p) => {
                            const itemAmount =
                              p.quantity * p.unitPrice - p.discount;
                            const gstAmount = (itemAmount * p.taxRate) / 100;
                            return sum + itemAmount + gstAmount;
                          }, 0);
                          const balance =
                            total - additionalDiscount - paidAmount;
                          return balance.toFixed(2);
                        })()}
                      </span>
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </>
              )}
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductSection;
