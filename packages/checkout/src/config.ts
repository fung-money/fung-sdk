export const CHECKOUT_ENDPOINT_SBX = 'https://sbx.fung.money';
export const CHECKOUT_ENDPOINT_PROD = 'https://app.fung.money';

export enum CheckoutEvent {
  Loaded = 'checkout:loaded',
  Invalid = 'checkout:invalid',
  Completed = 'checkout:completed',
  Failed = 'checkout:failed',
}
