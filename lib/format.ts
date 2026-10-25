/** 1615 -> "1,615" without relying on the phone's Intl support. */
export const thousands = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
