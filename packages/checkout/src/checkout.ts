import EventEmitter2 from "eventemitter2";
import DOMPurify from "dompurify";
import {
  CHECKOUT_ENDPOINT_DEV,
  CHECKOUT_ENDPOINT_LOCAL,
  CHECKOUT_ENDPOINT_PROD,
  CHECKOUT_ENDPOINT_SBX,
  CheckoutEvent,
} from "./config.js";

export type Env = "production" | "sandbox" | "development" | "local";
export type TVariant = "HEADLESS" | "EXPRESS" | "STANDARD";
export type TPaymentMethod = "CARD" | "IDEAL" | "TWINT" | "VIPPS" | "APPLE_PAY" | "GOOGLE_PAY" | "SEPA" | "SEPA_DIRECT_DEBIT" | "OPEN_BANKING";

const WALLETS: TPaymentMethod[] = ["APPLE_PAY", "GOOGLE_PAY"];
const SUPPORTED_PAYMENT_METHODS: TPaymentMethod[] = [
  "CARD",
  "IDEAL",
  "TWINT",
  "VIPPS",
  "SEPA",
  "SEPA_DIRECT_DEBIT",
  "OPEN_BANKING",
  ...WALLETS,
];

interface ITheme {
  accentColor: string;
  accentColorContrast: string;
  borderRadius: string;
  brandColor: string;
  brandColorContrast: string;
  // "Inter" | "Courier New" | "Georgia" | "Helvetica" | "Montserrat" | "Roboto" | "Poppins";
  fontFamily: string;
  logoUrl: string;
}

export default class Checkout extends EventEmitter2 {
  protected checkoutId: string;

  protected container: HTMLElement | null = null;

  protected env: Env;

  protected url: string | null;

  protected iframe: HTMLIFrameElement | null = null;

  protected small: boolean = false;

  protected height: string | undefined = undefined;

  protected formOnly: boolean = false;

  protected walletsOnly: boolean = false;

  protected language: string = "en";

  protected darkMode: boolean = false;

  protected windowProxy: WindowProxy | null = null;

  protected variant: TVariant = "STANDARD";

  protected paymentMethods: TPaymentMethod[] = [];

  paymentMethod: string | undefined;

  protected style = {
    minWidth: "375px",
    minHeight: "max-content",
  };

  constructor({
    checkoutId,
    container,
    containerId,
    env = "production",
    url = null,
    small = false,
    height,
    /**
     * @deprecated Use variant = 'HEADLESS' instead
     */
    formOnly = false,
    /**
     * @deprecated Use variant = 'EXPRESS' instead
     */
    walletsOnly = false,
    variant,
    language = "en",
    darkMode = false,
    paymentMethods,
  }: {
    checkoutId: string;
    container?: HTMLElement;
    containerId?: string;
    env?: Env;
    url?: string | null;
    small?: boolean;
    height?: string;
    /**
     * @deprecated Use variant = 'HEADLESS' instead
     */
    formOnly?: boolean;
    /**
     * @deprecated Use variant = 'EXPRESS' instead
     */
    walletsOnly?: boolean;
    language?: string;
    variant?: TVariant;
    darkMode?: boolean;
    paymentMethods?: TPaymentMethod[];
  }) {
    super();

    if (!checkoutId) {
      throw new Error("checkoutId is required");
    }
    if (!container && !containerId) {
      throw new Error("Either container or containerId is required");
    }

    this.checkoutId = checkoutId;
    this.container = container || document.getElementById(containerId || "");
    this.env = env;
    this.url = url;
    this.small = small;
    this.height = height;
    this.formOnly = formOnly;
    this.walletsOnly = walletsOnly;
    this.language = language;
    this.darkMode = darkMode;

    if (variant) {
      this.variant = variant;
    }

    if (paymentMethods && paymentMethods.length > 0) {
      this.validatePaymentMethods(paymentMethods);
      this.paymentMethods = paymentMethods;
    }

    if (this.walletsOnly) {
      this.small = true;
    }
  }

  private validatePaymentMethods(paymentMethods: TPaymentMethod[]): void {
    if (this.variant === "EXPRESS") {
      // Express only supports wallets
      if (paymentMethods.some((paymentMethod) => !WALLETS.includes(paymentMethod))) {
        throw new Error(`Only ${WALLETS.join(", ")} are supported for ${this.variant} variant`);
      }
    }

    if (this.variant === "HEADLESS") {
      // Headless can not have any wallets
      if (paymentMethods.some((paymentMethod) => WALLETS.includes(paymentMethod))) {
        throw new Error(`${WALLETS.join(", ")} are not supported for ${this.variant} variant`);
      }
    }

    // Throw error if non of the supported payment methods are provided
    if (!paymentMethods
      .some((paymentMethod) => SUPPORTED_PAYMENT_METHODS.includes(paymentMethod))) {
      throw new Error(`Only ${SUPPORTED_PAYMENT_METHODS.join(", ")} are supported`);
    }

    // Standard can have all
  }

  private getQueryParameters(): string {
    const params = new URLSearchParams();
    if (this.url) {
      const url = new URL(this.url);
      url.searchParams.forEach((value, key) => {
        params.append(key, value);
      });
    }

    params.append("style", "embedded");
    params.append("language", this.language);

    if (this.darkMode) params.append("dark", "true");
    if (this.formOnly) params.append("formOnly", "true");

    if (this.variant === "HEADLESS") {
      params.append("variant", this.variant);
      params.delete("formOnly");
    }

    if (this.paymentMethods.length > 0) {
      params.append("paymentMethods", this.paymentMethods.join(","));
    }

    return `?${params.toString()}`;
  }

  private getBaseUrl() {
    let baseUrl;
    switch (this.env) {
      case "production":
        baseUrl = CHECKOUT_ENDPOINT_PROD;
        break;
      case "sandbox":
        baseUrl = CHECKOUT_ENDPOINT_SBX;
        break;
      case "development":
        baseUrl = CHECKOUT_ENDPOINT_DEV;
        break;
      case "local":
        baseUrl = CHECKOUT_ENDPOINT_LOCAL;
        break;
      default:
      // No default, as we assign default in the constructor
    }

    return baseUrl;
  }

  private getCheckoutUrl() {
    const baseUrl = this.getBaseUrl();

    if (this.walletsOnly || this.variant === "EXPRESS") {
      const params = new URLSearchParams();
      const selectedWallets: TPaymentMethod[] = [];

      if (this.paymentMethods.length > 0) {
        this.paymentMethods.forEach((paymentMethod) => {
          if (WALLETS.includes(paymentMethod)) {
            selectedWallets.push(paymentMethod);
          }
        });

        if (selectedWallets.length > 0) {
          params.append("paymentMethods", selectedWallets as any as string);
        }

        if (params.toString() !== "") {
          return `${baseUrl}/checkout/${this.checkoutId}/wallets?${params.toString()}`;
        }
      }

      return `${baseUrl}/checkout/${this.checkoutId}/wallets`;
    }

    if (this.url) return `${this.url}${this.getQueryParameters()}`;

    return `${baseUrl}/checkout/${
      this.checkoutId
    }/view${this.getQueryParameters()}`;
  }

  private createIframe(): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    this.iframe = iframe;
    iframe.src = this.getCheckoutUrl();

    iframe.style.border = "none";
    iframe.className = "w-full";
    iframe.allow = "payment *; encrypted-media *";
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-forms allow-top-navigation allow-top-navigation-by-user-activation",
    );
    iframe.style.width = "100%";

    if (!this.small) {
      iframe.style.minWidth = this.style.minWidth;
      iframe.style.minHeight = this.style.minHeight;
    } else if (this.height) {
      iframe.style.minHeight = this.height;
    } else {
      iframe.style.height = this.style.minHeight;
    }

    import("iframe-resizer").then(({ iframeResizer: iFrameResize }) => {
      iFrameResize({ checkOrigin: false }, iframe);
    });
    return iframe;
  }

  private handleMessage = (event: MessageEvent): void => {
    if (
      Object.values(CheckoutEvent).includes(event.data)
      || Object.values(CheckoutEvent).includes(event.data.type)
    ) {
      if (event.data === CheckoutEvent.ResizeFull && !this.formOnly) {
        this.resize(CheckoutEvent.ResizeFull);
      } else if (event.data === CheckoutEvent.ResizeReset && !this.formOnly) {
        this.resize(CheckoutEvent.ResizeReset);
      } else if (event.data.type === CheckoutEvent.ResizeIframeHeight) {
        this.resizeIframeHeight(event.data.height);
      } else if (event.data === CheckoutEvent.ResetIframeHeight) {
        this.resetIframeHeight();
      } else if (event.data.type === CheckoutEvent.PaymentMethodSelected) {
        this.paymentMethod = event.data.paymentMethod;
      } else if (
        event.data.type === CheckoutEvent.IdealRedirect
        && this.windowProxy?.location
      ) {
        const sanitizedUrl = DOMPurify.sanitize(event.data.url);
        this.windowProxy.location = sanitizedUrl;
      } else if (this.walletsOnly && event.data === CheckoutEvent.HideWallet) {
        this.hideWalletsContainer();
      } else {
        this.emit(event.data);
      }
    }
  };

  private attachEventListeners(): void {
    window.addEventListener("message", this.handleMessage);
  }

  private resizeIframeHeight(height: string): void {
    if (this.iframe) {
      this.iframe.style.minHeight = height;
    }
  }

  private resetIframeHeight(): void {
    if (this.iframe) {
      this.iframe.style.minHeight = this.style.minHeight;
    }
  }

  private resize(event: string): void {
    if (event === CheckoutEvent.ResizeFull && this.iframe !== null) {
      this.iframe.style.width = "100vw";
      this.iframe.style.height = "100vh";
      this.iframe.style.minWidth = "0px";
      this.iframe.style.minHeight = "0px";
      this.iframe.style.border = "none";
      this.iframe.style.position = "absolute";
      this.iframe.style.top = "0";
      this.iframe.style.left = "0";
      this.iframe.style.zIndex = "9999";
    } else if (event === CheckoutEvent.ResizeReset && this.iframe !== null) {
      if (!this.small) {
        this.iframe.style.minWidth = this.style.minWidth;
        this.iframe.style.minHeight = this.style.minHeight;
      }
      this.iframe.style.border = "none";
      this.iframe.style.width = "100%";
      if (this.height) {
        this.iframe.style.minHeight = this.height;
      } else {
        this.iframe.style.height = this.style.minHeight;
      }
      this.iframe.style.position = "relative";
      this.iframe.style.top = "0";
      this.iframe.style.left = "0";
      this.iframe.style.zIndex = "0";
    }
  }

  private hideWalletsContainer(): void {
    if (this.iframe) {
      this.iframe.style.height = "0px";
    }
  }

  dispose(): void {
    if (this.iframe) {
      this.iframe.remove();
    }

    window.removeEventListener("message", this.handleMessage);

    this.removeAllListeners();
  }

  render(): void {
    const iframe = this.createIframe();

    if (!this.container) {
      throw new Error("No container found");
    }

    this.container.innerHTML = "";
    this.container.appendChild(iframe);
    this.attachEventListeners();
  }

  isReadyToSubmit(): boolean {
    return !!this.iframe;
  }

  /**
   * @param preSubmitCallback Function to be called before submitting the payment,
   *                          if pre submit fails, the payment will not be submitted
   * @returns preSubmitCallback value, if any
   */
  async submit(preSubmitCallback?: () => Promise<any>): Promise<any> {
    if (this.paymentMethod === "ideal" && !this.walletsOnly) {
      this.windowProxy = window.parent.open(
        `${this.getBaseUrl()}/processing?language=${this.language}`,
        "_blank",
      );
    }

    let result: any;
    try {
      result = await preSubmitCallback?.();
    } catch (error) {
      this.windowProxy?.close();
      throw error;
    }

    if (this.iframe) {
      this.iframe.contentWindow?.postMessage("fung-submit", "*");
    }

    return result;
  }

  setTheme(theme: ITheme): void {
    if (this.iframe) {
      this.iframe.contentWindow?.postMessage(
        JSON.stringify({ type: CheckoutEvent.Theme, theme }),
        "*",
      );
    }
  }
}
