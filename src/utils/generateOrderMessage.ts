export const generateOrderMessage = (order: any) => {
  const items = order.items.map((item: any) => {
    const addons = item.addons?.map((addon: any) => `\n   - ${addon.name}`).join('') || '';
    return `\n• ${item.quantity}x ${item.name}${addons}`;
  }).join('');

  const message = `*New Order*\n\nItems:${items}\n\nTotal: ${order.total}\n\nDelivery Details:\n${order.address}\n\nPayment: ${order.paymentMethod}`;
  
  // Encode the message for WhatsApp URL
  const encodedMessage = encodeURIComponent(message);
  
  // Return the complete WhatsApp URL
  return `https://wa.me/${order.storePhone}?text=${encodedMessage}`;
};