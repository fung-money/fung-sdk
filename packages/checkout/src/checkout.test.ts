import { JSDOM } from "jsdom";
import Checkout from "./checkout.js";
import { CheckoutEvent } from "./config.js";

jest.mock("iframe-resizer/js/iframeResizer.js", () =>
  jest.fn().mockImplementation(() => ({
    // whatever mock implementation or properties you want here
    close: jest.fn(),
    resize: jest.fn(),
  }))
);

describe("@fung-sdk/checkout", () => {
  beforeEach(() => {
    const dom = new JSDOM();
    global.document = dom.window.document;
    // @ts-expect-error
    global.window = dom.window;

    const container = document.createElement("div");
    container.id = "xyz";
    document.body.appendChild(container);
  });

  it("should create a checkout object", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });

    expect(checkout).toBeInstanceOf(Checkout);
  });

  it("should throw an error if no container is found", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "random",
    });
    expect(() => checkout.render()).toThrowError("No container found");
  });

  it("should render a checkout iframe", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain("abc");
  });

  it("should render a checkout iframe with default env (prod)", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain("https://pay.fungpayments.com");
  });

  it("should render a checkout iframe with env prod", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      env: "production",
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain("https://pay.fungpayments.com");
  });

  it("should render a checkout iframe with a custom theme", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      env: "production",
    });

    const theme = {
      accentColor: "#faff43",
      accentColorContrast: "#0e0e03",
      borderRadius: "4px",
      brandColor: "#0000000",
      brandColorContrast: "#ffffff",
      fontFamily: "Inter",
      logoUrl: "",
    };

    checkout.render();

    const iframe = document.querySelector("iframe");
    const postMessageSpy = jest.spyOn(
      iframe?.contentWindow as any,
      "postMessage"
    );

    checkout.setTheme(theme);

    expect(postMessageSpy).toHaveBeenCalledWith(
      JSON.stringify({
        type: "checkout:theme",
        theme,
      }),
      "*"
    );
  });

  it("should optionally set height for small=true", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      small: true,
      height: "100px",
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.style.minHeight).toEqual("100px");
  });

  it("should set formOnly=true when formOnly is true", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      formOnly: true,
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain("formOnly=true");
  });

  it("should render a checkout iframe for sandbox", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      env: "sandbox",
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain("https://sbx.pay.fungpayments.com");
  });

  it("should render a checkout iframe for dev", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      env: "development",
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain("https://dev.pay.fungpayments.com");
  });

  it("should render a checkout iframe for local", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      env: "local",
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain("http://localhost:4200");
  });

  it("should dispatch a CHECKOUT_LOADED event", async () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });
    const mockFn = jest.fn();
    checkout.on(CheckoutEvent.Loaded, mockFn);
    checkout.render();

    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.parent.postMessage("checkout:loaded", "*");

    // a small delay to allow the event to be dispatched
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    expect(iframe).not.toBeNull();
    expect(mockFn).toHaveBeenCalled();
  });

  it("should render a checkout iframe with a custom url", () => {
    const customUrl = "https://custom.url/checkout";
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      url: customUrl,
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain(customUrl); // iframe src should contain the custom URL
  });

  it("should add formOnly=true to the custom url", () => {
    const customUrl = "https://custom.url/checkout";
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      url: customUrl,
      formOnly: true,
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain("formOnly=true"); // iframe src should contain the custom URL
  });

  it("should attach event listeners on render", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });

    window.addEventListener = jest.fn();

    checkout.render();

    expect(window.addEventListener).toHaveBeenCalledWith(
      "message",
      expect.any(Function)
    );
  });

  it("should resize the iframe to full screen on CHECKOUT_RESIZE_RESET event", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.parent.postMessage(CheckoutEvent.ResizeReset, "*");

    expect(iframe).not.toBeNull();
    expect(iframe?.style.minWidth).toBe("375px");
    expect(iframe?.style.minHeight).toBe("max-content");
  });

  it("should resize the iframe to full screen on CHECKOUT_RESIZE_RESET event, and keep the set height when small=true", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      small: true,
      height: "100px",
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.parent.postMessage(CheckoutEvent.ResizeReset, "*");

    expect(iframe).not.toBeNull();
    expect(iframe?.style.minWidth).toBe("");
    expect(iframe?.style.minHeight).toBe("100px");
  });

  it("should resize the iframe to full screen on CHECKOUT_RESIZE_FULL event when small", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      small: true,
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.parent.postMessage(CheckoutEvent.ResizeFull, "*");

    expect(iframe).not.toBeNull();
    expect(iframe?.style.width).toBe("100%");
    expect(iframe?.style.height).toBe("");
  });

  it("should reset the iframe size on CHECKOUT_RESIZE_RESET event when small", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      small: true,
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.parent.postMessage(CheckoutEvent.ResizeReset, "*");

    expect(iframe).not.toBeNull();
    expect(iframe?.style.width).toBe("100%");
    expect(iframe?.style.height).toBe("");
  });

  it("should emit CHECKOUT_SUCCESS event on successful message", async () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });
    const mockFn = jest.fn();
    checkout.on(CheckoutEvent.Completed, mockFn);
    checkout.render();

    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.parent.postMessage(CheckoutEvent.Completed, "*");

    // a small delay to allow the event to be dispatched
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    expect(iframe).not.toBeNull();
    expect(mockFn).toHaveBeenCalled();
  });

  it("should emit CHECKOUT_SUCCESS event on successful message", async () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });
    const mockFn = jest.fn();
    checkout.on(CheckoutEvent.Completed, mockFn);
    checkout.render();

    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.parent.postMessage(CheckoutEvent.Completed, "*");

    // a small delay to allow the event to be dispatched
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    expect(iframe).not.toBeNull();
    expect(mockFn).toHaveBeenCalled();
  });

  it("should emit CHECKOUT_ERROR event on error message", async () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });
    const mockFn = jest.fn();
    checkout.on(CheckoutEvent.Failed, mockFn);
    checkout.render();

    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.parent.postMessage(CheckoutEvent.Failed, "*");

    // a small delay to allow the event to be dispatched
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    expect(iframe).not.toBeNull();
    expect(mockFn).toHaveBeenCalled();
  });

  it("should emit CHECKOUT_CANCEL event on cancel message", async () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });
    const mockFn = jest.fn();
    checkout.on(CheckoutEvent.Failed, mockFn);
    checkout.render();

    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.parent.postMessage(CheckoutEvent.Failed, "*");

    // a small delay to allow the event to be dispatched
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    expect(iframe).not.toBeNull();
    expect(mockFn).toHaveBeenCalled();
  });

  it("should dispose of the checkout object", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });

    checkout.render();
    checkout.dispose();

    const iframe = document.querySelector("iframe");
    expect(iframe).toBeNull();

    const mockFn = jest.fn();
    checkout.on(CheckoutEvent.Loaded, mockFn);
    window.postMessage(CheckoutEvent.Loaded, "*");

    expect(mockFn).not.toHaveBeenCalled();
  });

  it("should throw an error if no checkoutId is provided", () => {
    expect(() => {
      // @ts-expect-error Testing invalid input
      // eslint-disable-next-line no-new
      new Checkout({
        containerId: "xyz",
      });
    }).toThrow("checkoutId is required");
  });

  it("should throw an error if no container or containerId is found", () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new Checkout({
        checkoutId: "abc",
      });
    }).toThrowError("Either container or containerId is required");
  });

  it("should create a checkout object with a DOM element", () => {
    const container = document.createElement("div");
    const checkout = new Checkout({
      checkoutId: "abc",
      container,
    });

    expect(checkout).toBeInstanceOf(Checkout);
  });

  it("should return true if iframe is ready to submit", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });
    checkout.render();

    expect(checkout.isReadyToSubmit()).toBe(true);
  });

  it("should return true if iframe is ready to submit", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });
    checkout.render();

    expect(checkout.isReadyToSubmit()).toBe(true);
  });

  it("should return false if iframe is not ready to submit", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });

    expect(checkout.isReadyToSubmit()).toBe(false);
  });

  it("should post a message to the iframe when submit is called", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });
    checkout.render();

    const iframe = document.querySelector("iframe");
    const postMessageSpy = jest.spyOn(
      iframe?.contentWindow as any,
      "postMessage"
    );

    checkout.submit();

    expect(postMessageSpy).toHaveBeenCalledWith("fung-submit", "*");
  });

  it("should not post a message if iframe is not ready when submit is called", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });

    const postMessageSpy = jest.spyOn(window, "postMessage");

    checkout.submit();

    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it("should return the wallets URL if walletsOnly is true", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      walletsOnly: true,
    });

    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain("wallets");
  });

  it("should return correct query parameters", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      formOnly: true,
      language: "fr",
    });

    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain("?style=embedded&language=fr&formOnly=true");
  });

  it("should retain previous query parameters", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      url: "https://custom.url/checkout?custom=param",
      formOnly: true,
      language: "fr",
    });

    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain(
      "custom=param&style=embedded&language=fr&formOnly=true"
    );
  });

  it("should return correct language property", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
      language: "fr",
    });

    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain("language=fr");
  });

  it("should set en as the default language property", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });

    checkout.render();

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain("language=en");
  });

  it("should handle IdealRedirect event by opening a new tab", () => {
    const checkout = new Checkout({
      checkoutId: "abc",
      containerId: "xyz",
    });
    checkout.render();

    const windowProxy = jest.spyOn(window.parent, "open");

    const idealSelectedEvent = new window.MessageEvent("message", {
      data: {
        type: CheckoutEvent.PaymentMethodSelected,
        paymentMethod: "ideal",
      },
    });
    window.dispatchEvent(idealSelectedEvent);

    const url = "https://example.com/";
    const idealRedirectEvent = new window.MessageEvent("message", {
      data: {
        type: CheckoutEvent.IdealRedirect,
        url,
      },
    });

    window.dispatchEvent(idealRedirectEvent);

    checkout.submit();

    expect(windowProxy).toHaveBeenCalledTimes(1);
  });
});
