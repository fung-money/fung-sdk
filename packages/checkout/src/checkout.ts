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

  paymentMethod: string | undefined;

  constructor({
    checkoutId,
    container,
    containerId,
    env = "production",
    url = null,
    small = false,
    height,
    formOnly = false,
    walletsOnly = false,
    language = "en",
    darkMode = false,
  }: {
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
  }) {
    super();

    if (!checkoutId) throw new Error("checkoutId is required");
    if (!container && !containerId) throw new Error("Either container or containerId is required");

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

    if (this.walletsOnly) this.small = true;
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

    return `?${params.toString()}`;
  }

  private getCheckoutUrl() {
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

    if (this.walletsOnly) return `${baseUrl}/checkout/${this.checkoutId}/wallets`;
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
    iframe.allow = "payment *";
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin",
    );

    if (!this.small) {
      iframe.style.minWidth = "375px";
      iframe.style.minHeight = "max-content";
    } else {
      iframe.style.width = "100%";

      if (this.height) {
        iframe.style.minHeight = this.height;
      } else {
        iframe.style.height = "max-content";
      }
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
      if (event.data === CheckoutEvent.ResizeFull) {
        this.resize(CheckoutEvent.ResizeFull);
      } else if (event.data === CheckoutEvent.ResizeReset) {
        this.resize(CheckoutEvent.ResizeReset);
      } else if (event.data.type === CheckoutEvent.PaymentMethodSelected) {
        this.paymentMethod = event.data.paymentMethod;
      } else if (
        event.data.type === CheckoutEvent.IdealRedirect
        && this.windowProxy?.location
      ) {
        const sanitizedUrl = DOMPurify.sanitize(event.data.url);
        this.windowProxy.location = sanitizedUrl;
      } else {
        this.emit(event.data);
      }
    }
  };

  private attachEventListeners(): void {
    window.addEventListener("message", this.handleMessage);
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
        this.iframe.style.minWidth = "400px";
        this.iframe.style.minHeight = "650px";
      }
      this.iframe.style.border = "none";
      this.iframe.style.width = "100%";
      if (this.height) {
        this.iframe.style.minHeight = this.height;
      } else {
        this.iframe.style.height = "auto";
      }
      this.iframe.style.position = "relative";
      this.iframe.style.top = "0";
      this.iframe.style.left = "0";
      this.iframe.style.zIndex = "0";
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

  submit(): void {
    if (this.paymentMethod === "ideal") {
      this.windowProxy = window.parent.open(`https://sbx.pay.fungpayments.com/processing?language=${this.language}`, "_blank");
    }
    if (this.iframe) {
      this.iframe.contentWindow?.postMessage("fung-submit", "*");
    }
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
