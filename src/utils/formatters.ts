/**
 * Format a number as currency (USD)
 * @param value - The value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, decimals = 2): string => {
  // For very large numbers, use compact notation
  if (value >= 1_000_000_000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  
  // For values greater than 1, use standard currency format
  if (value >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  
  // For small values, show more decimal places
  if (value < 0.01) {
    // Find the first non-zero digit
    let places = 6;
    let tempValue = value;
    while (tempValue < 0.1 && places < 8) {
      tempValue *= 10;
      places++;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: places,
      maximumFractionDigits: places,
    }).format(value);
  }
  
  // Default format for values between 0.01 and 1
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format a percentage value
 * @param value - The value to format
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
  }).format(value / 100);
};

/**
 * Format a number with thousands separators
 * @param value - The value to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: value > 1_000_000 ? 'compact' : 'standard',
  }).format(value);
}; 