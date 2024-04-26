import EventEmitter2 from "eventemitter2";
import {
  CHECKOUT_ENDPOINT_DEV,
  CHECKOUT_ENDPOINT_LOCAL,
  CHECKOUT_ENDPOINT_PROD,
  CHECKOUT_ENDPOINT_SBX,
  CheckoutEvent,
} from "./config.js";

export type Env = "production" | "sandbox" | "development" | "local";

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
  }: {
    checkoutId: string;
    container?: HTMLElement;
    containerId?: string;
    env?: Env;
    url?: string | null;
    small?: boolean;
    height?: string;
    formOnly?: boolean
    walletsOnly?: boolean;
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

    if (this.walletsOnly) this.small = true;
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

    if (this.url) return `${this.url}?style=embedded${this.formOnly ? "&formOnly=true" : ""}`;


    return `${baseUrl}/checkout/${this.checkoutId}/view?style=embedded${this.formOnly ? "&formOnly=true" : ""}`;
  }

  private createIframe(): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    this.iframe = iframe;
    iframe.src = this.getCheckoutUrl();

    iframe.style.border = "none";
    iframe.className = "w-full";
    iframe.allow = "payment *";

    if (!this.small) {
      iframe.style.minWidth = "400px";
      iframe.style.minHeight = "650px";
    } else {
      iframe.style.width = "100%";
      if (this.height) {
        iframe.style.minHeight = this.height;
      } else {
        iframe.style.height = "auto";
      }
    }

    import("iframe-resizer").then(({ iframeResizer: iFrameResize }) => {
      iFrameResize({ checkOrigin: false }, iframe);
    });
    return iframe;
  }

  private handleMessage = (event: MessageEvent): void => {
    if (Object.values(CheckoutEvent).includes(event.data)) {
      if (event.data === CheckoutEvent.ResizeFull) {
        this.resize(CheckoutEvent.ResizeFull);
      } else if (event.data === CheckoutEvent.ResizeReset) {
        this.resize(CheckoutEvent.ResizeReset);
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
    if (this.iframe) {
      this.iframe.contentWindow?.postMessage("fung-submit", "*");
    }
  }
}
