import { CartItem } from "@/components/CartContext";
import { formatPrice } from "./formatPrice";

interface OrderMessageParams {
  orderId: string;
  items: CartItem[];
  checkoutForm: {
    name: string;
    whatsapp: string;
    deliveryType: "pickup" | "delivery";
    streetAddress?: string;
    unitNumber?: string;
  };
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
}: OrderMessageParams) => {
  const itemsList = items
    .map((item) => {
      const addons = item.addons
        ?.map((addon) => `\n   + ${addon.name} (${formatPrice(addon.price)})`)
        .join('') || '';
      return `\`${item.quantity}x ${item.name} - ${formatPrice(item.price)}\`${addons}`;
    })
    .join('\n');

  const message = 
`*New Order #${orderId.slice(0, 8)}*

> ${checkoutForm.deliveryType.toUpperCase()}

${itemsList}

> Order Summary:
Items: ${formatPrice(subtotal)}
${checkoutForm.deliveryType === 'delivery' ? `Delivery: ${formatPrice(deliveryFee)}\n` : ''}
*Total: ${formatPrice(total)}*

> Customer Details:
Name: ${checkoutForm.name}
WhatsApp: ${checkoutForm.whatsapp}
Service: ${checkoutForm.deliveryType}

${checkoutForm.deliveryType === 'delivery' ? `> Delivery Address:
${checkoutForm.streetAddress}
${checkoutForm.unitNumber ? `Unit ${checkoutForm.unitNumber}\n` : ''}
${selectedZoneName}` : '> Pickup'}

Track your order here: ${trackingUrl}`;

  return message;
};