import type { Product } from "@/lib/data";
import { getDiscountedPrice } from "@/lib/pricing";

export const PUBLIC_PURCHASE_MODE: "preorder" | "standard" =
  process.env.NEXT_PUBLIC_PURCHASE_MODE === "standard"
    ? "standard"
    : "preorder";

const DEFAULT_DEPOSIT_PERCENT = 25;
const DEFAULT_INVENTORY_LIMIT = 100;

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const isPreorderMode = () => PUBLIC_PURCHASE_MODE === "preorder";

export const isPreorderProduct = (product: Product) =>
  isPreorderMode() && product.preorder_enabled !== false;

export const getPreorderPrice = (product: Product) =>
  product.preorder_price ?? getDiscountedPrice(product);

export const getPreorderDepositPercent = (product: Product) =>
  product.preorder_deposit_percent ?? DEFAULT_DEPOSIT_PERCENT;

export const getPreorderDepositAmount = (product: Product) =>
  product.preorder_deposit_amount ??
  Math.ceil((getPreorderPrice(product) * getPreorderDepositPercent(product)) / 100);

export const getPreorderInventoryLimit = (product: Product) =>
  product.preorder_inventory_limit ?? product.stock_quantity ?? DEFAULT_INVENTORY_LIMIT;

export const getPreorderReservedQuantity = (product: Product) =>
  product.preorder_reserved_quantity ?? 0;

export const getPreorderRemainingQuantity = (product: Product) =>
  Math.max(getPreorderInventoryLimit(product) - getPreorderReservedQuantity(product), 0);

export const getPreorderShipBy = (product: Product) =>
  product.preorder_ship_by ?? addDays(28);

export const getPreorderDeadline = (product: Product) =>
  product.preorder_deadline ?? addDays(10);

export const getPreorderFullPaymentDue = (product: Product) =>
  product.preorder_full_payment_due ?? addDays(18);

export const formatPreorderDate = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "To be announced";

export const getPreorderCancellationPolicy = (product: Product) =>
  product.preorder_cancellation_policy ??
  "Cancel before the full payment due date for a full deposit refund. After that, cancellation is reviewed against packing status.";

export const getPreorderRefundPolicy = (product: Product) =>
  product.preorder_refund_policy ??
  "Deposits are refundable until the payment due date. Failed fulfillment receives a full refund to the original payment method.";

export const getPreorderTerms = (product: Product) =>
  product.preorder_terms ??
  "Your pre-order reserves limited harvest stock. The deposit is collected today and the remaining balance is requested before dispatch.";

export const getPreorderLinePricing = (item: Product & { quantity: number }) => {
  const preorderPrice = getPreorderPrice(item);
  const depositAmount = getPreorderDepositAmount(item);
  const lineTotal = preorderPrice * item.quantity;
  const depositDue = depositAmount * item.quantity;

  return {
    preorderPrice,
    depositAmount,
    lineTotal,
    depositDue,
    balanceDue: Math.max(lineTotal - depositDue, 0),
  };
};

export const calculatePreorderCart = <T extends Product & { quantity: number }>(
  items: T[],
) => {
  return items.reduce(
    (summary, item) => {
      const line = getPreorderLinePricing(item);
      return {
        preorderSubtotal: summary.preorderSubtotal + line.lineTotal,
        preorderDepositDue: summary.preorderDepositDue + line.depositDue,
        preorderBalanceDue: summary.preorderBalanceDue + line.balanceDue,
      };
    },
    {
      preorderSubtotal: 0,
      preorderDepositDue: 0,
      preorderBalanceDue: 0,
    },
  );
};

export const isShippingEligibleForPreorder = (zipCode?: string) =>
  /^\d{6}$/.test((zipCode ?? "").trim());
