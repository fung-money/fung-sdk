export const CHECKOUT_ENDPOINT_SBX = "https://sbx.pay.fungpayments.com";
export const CHECKOUT_ENDPOINT_DEV = "https://dev.pay.fungpayments.com";
export const CHECKOUT_ENDPOINT_PROD = "https://pay.fungpayments.com";

export enum CheckoutEvent {
  Loaded = "checkout:loaded",
  Invalid = "checkout:invalid",
  Completed = "checkout:completed",
  Failed = "checkout:failed",
}
