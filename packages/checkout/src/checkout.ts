import assert from "assert";
import EventEmitter2 from "eventemitter2";
import {
  CHECKOUT_ENDPOINT_DEV, CHECKOUT_ENDPOINT_LOCAL,
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

  constructor({
    checkoutId,
    containerId,
    env = "production",
    url = null,
  }: {
    checkoutId: string;
    containerId: string;
    env?: Env;
    url?: string | null;
  }) {
    super();

    assert(checkoutId, "checkoutId is required");
    assert(containerId, "containerId is required");

    this.checkoutId = checkoutId;
    this.containerId = containerId;
    this.env = env;
    this.url = url;
  }

  private getCheckoutUrl() {
    if (this.url) return this.url;

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
    iframe.src = this.getCheckoutUrl();
    iframe.style.minWidth = "400px";
    iframe.style.minHeight = "650px";
    iframe.style.border = "none";
    iframe.className = "w-full";

    import("iframe-resizer").then(({ iframeResizer: iFrameResize }) => {
      iFrameResize({ checkOrigin: false }, iframe);
    });

    return iframe;
  }

  private attachEventListeners(): void {
    window.addEventListener("message", (event) => {
      if (Object.values(CheckoutEvent).includes(event.data)) {
        this.emit(event.data);
      }
    });
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
