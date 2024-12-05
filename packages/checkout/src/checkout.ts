import DOMPurify from "dompurify";
import EventEmitter2 from "eventemitter2";
import {
  CHECKOUT_ENDPOINT_DEV,
  CHECKOUT_ENDPOINT_LOCAL,
  CHECKOUT_ENDPOINT_PROD,
  CHECKOUT_ENDPOINT_SBX,
  CheckoutEvent,
} from "./config.js";
import {
  IConstructor,
  IDefaultStyle,
  ITheme,
  TCheckoutMessage,
} from "./types.js";

export type Env = "production" | "sandbox" | "development" | "local";

export default class Checkout extends EventEmitter2 {
  protected checkoutId: string;

  protected container: HTMLElement | null = null;

  protected env: Env;

  protected url: string | null;

  protected iframe: HTMLIFrameElement | null = null;

  protected small: boolean = false;

  protected height: string;

  protected formOnly: boolean = false;

  protected walletsOnly: boolean = false;

  protected language: string = "en";

  protected darkMode: boolean = false;

  protected windowProxy: WindowProxy | null = null;

  paymentMethod: string | undefined;

  protected defaultStyle: IDefaultStyle = {
    height: "600px",
    maxWidth: "425px",
    minWidth: "375px",
  };

  constructor({
    checkoutId,
    container,
    containerId,
    env = "production",
    url = null,
    height,
    formOnly = false,
    walletsOnly = false,
    language = "en",
    darkMode = false,
  }: IConstructor) {
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
    this.height = height || this.defaultStyle.height;
    this.formOnly = formOnly;
    this.walletsOnly = walletsOnly;
    this.language = language;
    this.darkMode = darkMode;
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

    if (this.walletsOnly)
      return `${baseUrl}/checkout/${this.checkoutId}/wallets`;
    if (this.url) return `${this.url}${this.getQueryParameters()}`;

    return `${baseUrl}/checkout/${
      this.checkoutId
    }/view${this.getQueryParameters()}`;
  }

  private createIframe(): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    this.iframe = iframe;
    iframe.src = this.getCheckoutUrl();

    // set iframe styles
    iframe.style.border = "none";
    iframe.allow = "payment *; encrypted-media *";
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-forms"
    );
    iframe.style.width = "100%";
    iframe.style.minWidth = this.defaultStyle.minWidth;
    iframe.style.height = this.height || this.defaultStyle.height;
    iframe.style.maxWidth = this.formOnly
      ? "unset"
      : this.defaultStyle.maxWidth;

    import("iframe-resizer").then(({ iframeResizer: iFrameResize }) => {
      iFrameResize(
        {
          checkOrigin: false,
        },
        iframe
      );
    });
    return iframe;
  }

  private handleMessage = (event: MessageEvent<TCheckoutMessage>): void => {
    if (!Object.values(CheckoutEvent).includes(event.data.type)) return;

    switch (event.data.type) {
      case CheckoutEvent.ResizeFull:
        this.resize(CheckoutEvent.ResizeFull);
        break;

      case CheckoutEvent.ResizeReset:
        this.resize(CheckoutEvent.ResizeReset);
        break;

      case CheckoutEvent.ResizeIframeHeight:
        this.resizeIframeHeight(event.data.height);
        break;

      case CheckoutEvent.ResetIframeHeight:
        this.resetIframeHeight();
        break;

      case CheckoutEvent.PaymentMethodSelected:
        this.paymentMethod = event.data.paymentMethod;
        break;

      case CheckoutEvent.IdealRedirect:
        if (this.windowProxy?.location) {
          const sanitizedUrl = DOMPurify.sanitize(event.data.url);
          this.windowProxy.location = sanitizedUrl;
        }
        break;

      default:
        this.emit(event.data);
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
    this.resizeIframeHeight(this.defaultStyle.height);
  }

  private resize(event: string): void {
    if (this.iframe === null) return;

    if (event === CheckoutEvent.ResizeFull) {
      this.iframe.style.width = "100vw";
      this.iframe.style.height = "100vh";
      this.iframe.style.minWidth = "0px";
      this.iframe.style.minHeight = "0px";
      this.iframe.style.border = "none";
      this.iframe.style.position = "absolute";
      this.iframe.style.top = "0";
      this.iframe.style.left = "0";
      this.iframe.style.zIndex = "9999";
    }

    if (event === CheckoutEvent.ResizeReset) {
      this.iframe.style.border = "none";
      this.iframe.style.width = "100%";
      this.iframe.style.height = this.defaultStyle.height;
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

  /**
   * @param preSubmitCallback Function to be called before submitting the payment,
   *                          if pre submit fails, the payment will not be submitted
   * @returns preSubmitCallback value, if any
   */
  async submit(preSubmitCallback?: () => Promise<any>): Promise<any> {
    if (this.paymentMethod === "ideal") {
      this.windowProxy = window.parent.open(
        `${this.getBaseUrl()}/processing?language=${this.language}`,
        "_blank"
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
      this.iframe.contentWindow?.postMessage(
        {
          type: "fung-submit",
          paymentMethod: this.paymentMethod,
        },
        "*"
      );
    }

    return result;
  }

  setTheme(theme: ITheme): void {
    if (this.iframe) {
      this.iframe.contentWindow?.postMessage(
        JSON.stringify({ type: CheckoutEvent.Theme, theme }),
        "*"
      );
    }
  }
}
