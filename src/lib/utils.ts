export const formatCurrency = (amount: number | string | undefined | null, showSign: boolean = false) => {
  if (amount === undefined || amount === null) return "U$S 0";
  
  const numericAmount = typeof amount === 'string' 
    ? parseFloat(amount.replace(/[^0-9.-]/g, '')) 
    : amount;
    
  if (isNaN(numericAmount)) return "U$S 0";

  // Using es-AR for dot as thousands separator and comma as decimal
  const formattedNumber = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(numericAmount));

  const sign = showSign ? (numericAmount > 0 ? '+ ' : numericAmount < 0 ? '- ' : '') : (numericAmount < 0 ? '- ' : '');

  return `${sign}U$S ${formattedNumber}`;
};

export const formatNumber = (num: number | string | undefined | null) => {
  if (num === undefined || num === null) return "0";
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return "0";
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
};
