import { JSDOM } from "jsdom";
import Checkout from "./checkout.js";
import { CheckoutEvent } from "./config.js";

jest.mock("iframe-resizer/js/iframeResizer.js", () => jest.fn().mockImplementation(() => ({
  // whatever mock implementation or properties you want here
  close: jest.fn(),
  resize: jest.fn(),
})));

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
    expect(() => checkout.render()).toThrowError(
      "No container with id \"random\" found",
    );
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
    expect(iframe?.src).toContain("http://localhost:3000");
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
});
