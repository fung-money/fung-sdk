import { Env } from "./checkout";
import { CheckoutEvent } from "./config";

export interface ITheme {
  accentColor: string;
  accentColorContrast: string;
  borderRadius: string;
  brandColor: string;
  brandColorContrast: string;
  // "Inter" | "Courier New" | "Georgia" | "Helvetica" | "Montserrat" | "Roboto" | "Poppins";
  fontFamily: string;
  logoUrl: string;
}

export interface IConstructor {
  checkoutId: string;
  container?: HTMLElement;
  containerId?: string;
  env?: Env;
  url?: string | null;
  small?: boolean;
  height?: string;
  formOnly?: boolean;
  walletsOnly?: boolean;
  language?: string;
  darkMode?: boolean;
}

export interface IDefaultStyle {
  height: string;
  maxWidth: string;
  minWidth: string;
}

// Creating type safe messages + data for the handleMessage method
interface IBaseMessage {
  type: CheckoutEvent;
}

interface IResizeIframeHeightMessage extends IBaseMessage {
  type: CheckoutEvent.ResizeIframeHeight;
  height: string;
}

interface IResetIframeHeightMessage extends IBaseMessage {
  type: CheckoutEvent.ResetIframeHeight;
}

interface IResizeFullMessage extends IBaseMessage {
  type: CheckoutEvent.ResizeFull;
}

interface IResizeResetMessage extends IBaseMessage {
  type: CheckoutEvent.ResizeReset;
}

interface IPaymentMethodSelectedMessage extends IBaseMessage {
  type: CheckoutEvent.PaymentMethodSelected;
  paymentMethod: string;
}

interface IIdealRedirectMessage extends IBaseMessage {
  type: CheckoutEvent.IdealRedirect;
  url: string;
}

export type TCheckoutMessage =
  | IResizeIframeHeightMessage
  | IPaymentMethodSelectedMessage
  | IIdealRedirectMessage
  | IResetIframeHeightMessage
  | IResizeFullMessage
  | IResizeResetMessage;
