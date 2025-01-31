import { CartItem } from "@/components/CartContext";
import { CheckoutFormData } from "@/components/CheckoutForm";
import { formatPrice } from "./formatPrice";

interface GenerateOrderMessageParams {
  orderId: string;
  items: CartItem[];
  checkoutForm: CheckoutFormData;
  selectedZoneName: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  trackingUrl: string;
  calculateItemTotal: (item: CartItem) => number;
}

export const generateOrderMessage = ({
  orderId,
  items,
  checkoutForm,
  selectedZoneName,
  subtotal,
  deliveryFee,
  total,
  trackingUrl,
  calculateItemTotal,
}: GenerateOrderMessageParams) => {
  return `
*New Order #${orderId.slice(0, 8)}*
> ${checkoutForm.deliveryType === "pickup" ? "*PICKUP*" : `*DELIVERY - ${selectedZoneName}*`}

${items
  .map(
    (item) =>
      `\`${item.quantity}x ${item.name} - ${formatPrice(calculateItemTotal(item))}\`${
        item.addons && item.addons.length > 0
          ? `\n${item.addons.map((addon) => `  + ${addon.name}`).join("\n")}`
          : ""
      }`
  )
  .join("\n")}

> Order Summary:
Items: ${formatPrice(subtotal)}
${checkoutForm.deliveryType === "delivery" ? `Delivery (${selectedZoneName}): ${formatPrice(deliveryFee)}\n` : ""}
*Total: ${formatPrice(total)}*

> Customer Details:
Name: ${checkoutForm.name}
WhatsApp: ${checkoutForm.whatsapp}
Service: ${checkoutForm.deliveryType}

${
  checkoutForm.deliveryType === "delivery"
    ? `> Delivery Address:
${checkoutForm.streetAddress}
${checkoutForm.unitNumber ? `${checkoutForm.unitNumber}\n` : ""}
Zone: ${selectedZoneName}`
    : ""
}

> Track Your Order:
${trackingUrl}`;
};