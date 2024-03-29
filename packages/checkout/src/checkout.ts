import assert from "assert";
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

  protected containerId: string;

  protected env: Env;

  protected url: string | null;

  protected iframe: HTMLIFrameElement | null = null;

  protected small: boolean = false;

  protected height: string | undefined = undefined;

  constructor({
    checkoutId,
    containerId,
    env = "production",
    url = null,
    small = false,
    height,
  }: {
    checkoutId: string;
    containerId: string;
    env?: Env;
    url?: string | null;
    small?: boolean;
    height?: string;
  }) {
    super();

    assert(checkoutId, "checkoutId is required");
    assert(containerId, "containerId is required");

    this.checkoutId = checkoutId;
    this.containerId = containerId;
    this.env = env;
    this.url = url;
    this.small = small;
    this.height = height;
  }

  private getCheckoutUrl() {
    if (this.url) return `${this.url}?style=embedded`;

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

    return `${baseUrl}/checkout/${this.checkoutId}/view?style=embedded`;
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

  private attachEventListeners(): void {
    window.addEventListener("message", (event) => {
      if (Object.values(CheckoutEvent).includes(event.data)) {
        if (event.data === CheckoutEvent.ResizeFull) {
          this.resize(CheckoutEvent.ResizeFull);
        } else if (event.data === CheckoutEvent.ResizeReset) {
          this.resize(CheckoutEvent.ResizeReset);
        } else {
          this.emit(event.data);
        }
      }
    });
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

  render(): void {
    const iframe = this.createIframe();
    const container = document.getElementById(this.containerId);

    if (container == null) {
      throw new Error(`No container with id "${this.containerId}" found`);
    }

    container.innerHTML = "";
    container.appendChild(iframe);
    this.attachEventListeners();
  }
}
