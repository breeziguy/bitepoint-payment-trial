export const formatPrice = (price: number) => {
  // Convert to number if it's a string
  const numericPrice = Number(price);
  
  // Check if it's a valid number
  if (isNaN(numericPrice)) {
    return '₦0';
  }

  // Format the number without multiplying by 1000
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(numericPrice);
};