import iframeResizer from "iframe-resizer";
import assert from "assert";
import EventEmitter2 from "eventemitter2";
import {
  CHECKOUT_ENDPOINT_DEV,
  CHECKOUT_ENDPOINT_PROD,
  CHECKOUT_ENDPOINT_SBX,
  CheckoutEvent,
} from "./config.js";

type Env = "production" | "sandbox" | "development";
export default class Checkout extends EventEmitter2 {
  protected checkoutId: string;

  protected containerId: string;

  protected env: Env;

  constructor({
    checkoutId,
    containerId,
    env = "production",
  }: {
    checkoutId: string;
    containerId: string;
    env?: Env;
  }) {
    super();

    assert(checkoutId, "checkoutId is required");
    assert(containerId, "containerId is required");

    this.checkoutId = checkoutId;
    this.containerId = containerId;
    this.env = env;
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

    const resizer = iframeResizer({ checkOrigin: false }, iframe); // eslint-disable-line no-use-before-define

    return iframe;
  }

  private attactEventListeners(): void {
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
    this.attactEventListeners();
  }
}
