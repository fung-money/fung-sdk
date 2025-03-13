export const CHECKOUT_ENDPOINT_SBX = "https://sbx.pay.fungpayments.com";
export const CHECKOUT_ENDPOINT_DEV = "https://dev.pay.fungpayments.com";
export const CHECKOUT_ENDPOINT_PROD = "https://pay.fungpayments.com";

export const CHECKOUT_ENDPOINT_LOCAL = "http://localhost:4200";

export enum CheckoutEvent {
  Loaded = "checkout:loaded",
  Invalid = "checkout:invalid",
  Completed = "checkout:completed",
  Failed = "checkout:failed",
  ResizeFull = "resize:full",
  ResizeReset = "resize:reset",
  Theme = "checkout:theme",
  IdealRedirect = "checkout:ideal-redirect",
  PaymentMethodSelected = "checkout:payment-method-selected",
  ResizeIframeHeight = "resize:iframe-height",
  ResetIframeHeight = "reset:iframe-height",
  HideWallet = "resize:hide-wallets",
}
