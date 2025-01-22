import DOMPurify from "dompurify";
import EventEmitter2 from "eventemitter2";
import {
  CHECKOUT_ENDPOINT_DEV,
  CHECKOUT_ENDPOINT_LOCAL,
  CHECKOUT_ENDPOINT_PROD,
  CHECKOUT_ENDPOINT_SBX,
  CheckoutEvent,
} from "./config.js";
import { IConstructor, IDefaultStyle, ITheme } from "./types.js";
import { constructEventV2, isValidCheckoutEventMessage } from "./helper.js";

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
    embeddedHeight: "655px", // This is based off the combined height of the card payment including email field and wallet component since its the biggest
    formOnlyHeight: "326px", // this is based off the card payment height
    maxWidth: "450px",
    minWidth: "375px",
    minHeight: "200px",
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

    const defaultHeight = formOnly
      ? this.defaultStyle.formOnlyHeight
      : this.defaultStyle.embeddedHeight;

    this.checkoutId = checkoutId;
    this.container = container || document.getElementById(containerId || "");
    this.env = env;
    this.url = url;
    this.height = height || defaultHeight;
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
    iframe.style.height = this.height;
    iframe.style.minHeight = this.defaultStyle.minHeight;
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

  // Once this is is published we can update the MessageEvent type to MessageEvent<TCheckoutMessage>
  private handleCheckoutMessage = (event: MessageEvent): void => {
    if (!isValidCheckoutEventMessage(event)) return;

    const eventV2 = constructEventV2(event);

    //TODO: remove all these console.logs when tested
    switch (eventV2.data.type) {
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
    window.addEventListener("message", this.handleCheckoutMessage);
  }

  private resizeIframeHeight(height: string): void {
    if (this.iframe) {
      this.iframe.style.minHeight = height;
    }
  }

  private resetIframeHeight(): void {
    this.resizeIframeHeight(this.height);
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
      this.iframe.style.height = this.height;
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

    window.removeEventListener("message", this.handleCheckoutMessage);

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
      this.iframe.contentWindow?.postMessage("fung-submit", "*");
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
