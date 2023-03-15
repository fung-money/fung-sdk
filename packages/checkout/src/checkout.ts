import assert from 'assert';
import { CHECKOUT_ENDPOINT_PROD, CHECKOUT_ENDPOINT_SBX, CHECKOUT_EVENTS } from './config.js';

export default class Checkout extends EventTarget {
  protected checkoutId: string;

  protected containerId: string;

  protected sandbox: boolean;

  constructor({
    checkoutId,
    containerId,
    sandbox = false,
  }: {
    checkoutId: string
    containerId: string
    sandbox?: boolean
  }) {
    super();

    assert(checkoutId, 'checkoutId is required');
    assert(containerId, 'containerId is required');

    this.checkoutId = checkoutId;
    this.containerId = containerId;
    this.sandbox = sandbox;
  }

  private getCheckoutUrl() {
    const baseUrl = this.sandbox ? CHECKOUT_ENDPOINT_SBX : CHECKOUT_ENDPOINT_PROD;
    return `${baseUrl}/checkout/${this.checkoutId}/view?iframe=true`;
  }

  private createIframe(): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.src = this.getCheckoutUrl();
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    return iframe;
  }

  private attactEventListeners(): void {
    window.addEventListener('message', (event) => {
      if (CHECKOUT_EVENTS.includes(event.data)) {
        this.dispatchEvent(new Event(event.data));
      }
    });
  }

  render(): void {
    const iframe = this.createIframe();
    const container = document.getElementById(this.containerId);

    if (container == null) {
      throw new Error(`No container with id "${this.containerId}" found`);
    }

    container.appendChild(iframe);
    this.attactEventListeners();
  }
}
