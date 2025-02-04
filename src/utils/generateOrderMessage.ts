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
      return `\n• ${item.quantity}x ${item.name}${addons}`;
    })
    .join('');

  const deliveryDetails = checkoutForm.deliveryType === 'delivery'
    ? `${checkoutForm.streetAddress}${checkoutForm.unitNumber ? `, Unit ${checkoutForm.unitNumber}` : ''}\n${selectedZoneName}`
    : 'Pickup';

  const message = 
`*New Order #${orderId}*

Customer Details:
Name: ${checkoutForm.name}
Phone: ${checkoutForm.whatsapp}

Items:${itemsList}

Order Summary:
Subtotal: ${formatPrice(subtotal)}
${checkoutForm.deliveryType === 'delivery' ? `Delivery Fee: ${formatPrice(deliveryFee)}\n` : ''}Total: ${formatPrice(total)}

Delivery Method: ${checkoutForm.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
${checkoutForm.deliveryType === 'delivery' ? `Delivery Zone: ${selectedZoneName}` : ''}
Address: ${deliveryDetails}

Track Order: ${trackingUrl}`;

  return message;
};