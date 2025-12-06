import React from "react";
import ServiceSection from "./ServiceSection";
import ProductSection from "./ProductSection";
import type { ServiceType } from "../types";
import type { Product } from "../services/productService";

interface SelectedService {
  serviceTypeId: string;
  serviceTypeName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  estimatedCost: number;
  isCustom?: boolean;
}

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

interface OrderItemsSectionProps {
  orderType: "service" | "product" | "mixed";

  // Service props
  selectedServices: SelectedService[];
  serviceTypes: ServiceType[];
  customServiceName: string;
  customServicePrice: number;
  onAddService: (serviceType: ServiceType) => void;
  onAddCustomService: () => void;
  onUpdateServiceField: (serviceTypeId: string, field: string, value: any) => void;
  onRemoveService: (serviceTypeId: string) => void;
  onCustomServiceNameChange: (name: string) => void;
  onCustomServicePriceChange: (price: number) => void;

  // Product props
  selectedProducts: SelectedProduct[];
  productSuggestions: Product[];
  showProductDropdown: boolean;
  searchingProducts: boolean;
  onProductSearchChange: (query: string) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProductField: (productId: string, field: string, value: any) => void;
  onRemoveProduct: (productId: string) => void;
  onAddCustomProduct?: (name: string, price: number, sku?: string) => void;

  // Common props
  invoiceAmounts: {
    subtotal: number;
    totalDiscount: number;
    taxableAmount: number;
    cgst: number;
    sgst: number;
    totalTax: number;
    totalAmount: number;
    roundOff: number;
    finalAmount: number;
    balance: number;
  };
  taxRate: number;
  additionalDiscount?: number;
  onAdditionalDiscountChange?: (value: number) => void;
  paidAmount?: number;
  onPaidAmountChange?: (value: number) => void;
}

const OrderItemsSection: React.FC<OrderItemsSectionProps> = ({
  orderType,
  selectedServices,
  serviceTypes,
  customServiceName,
  customServicePrice,
  onAddService,
  onAddCustomService,
  onUpdateServiceField,
  onRemoveService,
  onCustomServiceNameChange,
  onCustomServicePriceChange,
  selectedProducts,
  productSuggestions,
  showProductDropdown,
  searchingProducts,
  onProductSearchChange,
  onAddProduct,
  onUpdateProductField,
  onRemoveProduct,
  onAddCustomProduct,
  invoiceAmounts,
  taxRate,
  additionalDiscount,
  onAdditionalDiscountChange,
  paidAmount,
  onPaidAmountChange,
}) => {
  // Show services section for service and mixed orders
  const showServices = orderType === "service" || orderType === "mixed";

  // Show products section for product and mixed orders
  const showProducts = orderType === "product" || orderType === "mixed";

  return (
    <>
      {showServices && (
        <ServiceSection
          selectedServices={selectedServices}
          serviceTypes={serviceTypes}
          customServiceName={customServiceName}
          customServicePrice={customServicePrice}
          onAddService={onAddService}
          onAddCustomService={onAddCustomService}
          onUpdateServiceField={onUpdateServiceField}
          onRemoveService={onRemoveService}
          onCustomServiceNameChange={onCustomServiceNameChange}
          onCustomServicePriceChange={onCustomServicePriceChange}
          invoiceAmounts={invoiceAmounts}
          taxRate={taxRate}
          additionalDiscount={additionalDiscount}
          onAdditionalDiscountChange={onAdditionalDiscountChange}
          paidAmount={paidAmount}
          onPaidAmountChange={onPaidAmountChange}
        />
      )}

      {showProducts && (
        <ProductSection
          selectedProducts={selectedProducts}
          productSuggestions={productSuggestions}
          showProductDropdown={showProductDropdown}
          searchingProducts={searchingProducts}
          onProductSearchChange={onProductSearchChange}
          onAddProduct={onAddProduct}
          onUpdateProductField={onUpdateProductField}
          onRemoveProduct={onRemoveProduct}
          onAddCustomProduct={onAddCustomProduct}
          additionalDiscount={additionalDiscount}
          onAdditionalDiscountChange={onAdditionalDiscountChange}
          paidAmount={paidAmount}
          onPaidAmountChange={onPaidAmountChange}
        />
      )}
    </>
  );
};

export default OrderItemsSection;
