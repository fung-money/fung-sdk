// eslint-disable-next-line import/no-extraneous-dependencies
import jest from 'jest-mock';
import { JSDOM } from 'jsdom';
import Checkout from './checkout.js';

describe('@fung-sdk/checkout', () => {
  beforeEach(() => {
    const dom = new JSDOM();
    global.document = dom.window.document;
    // @ts-expect-error
    global.window = dom.window;

    const container = document.createElement('div');
    container.id = 'xyz';
    document.body.appendChild(container);
  });

  it('should create a checkout object', () => {
    const checkout = new Checkout({
      checkoutId: 'abc',
      containerId: 'xyz',
    });

    expect(checkout).toBeInstanceOf(Checkout);
  });

  it('should throw an error if no container is found', () => {
    const checkout = new Checkout({
      checkoutId: 'abc',
      containerId: 'random',
    });
    expect(() => checkout.render()).toThrowError(
      'No container with id "random" found',
    );
  });

  it('should render a checkout iframe', () => {
    const checkout = new Checkout({
      checkoutId: 'abc',
      containerId: 'xyz',
    });
    checkout.render();

    const iframe = document.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain('abc');
  });

  it('should render a checkout iframe for prod', () => {
    const checkout = new Checkout({
      checkoutId: 'abc',
      containerId: 'xyz',
    });
    checkout.render();

    const iframe = document.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain('https://app.fung.money');
  });

  it('should render a checkout iframe for sandbox', () => {
    const checkout = new Checkout({
      checkoutId: 'abc',
      containerId: 'xyz',
      sandbox: true,
    });
    checkout.render();

    const iframe = document.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain('https://sbx.fung.money');
  });

  it('should dispatch a CHECKOUT_LOADED event', () => {
    const checkout = new Checkout({
      checkoutId: 'abc',
      containerId: 'xyz',
    });
    const mockFn = jest.fn();
    checkout.addEventListener('CHECKOUT_LOADED', mockFn);
    checkout.render();

    const iframe = document.querySelector('iframe');
    expect(iframe).not.toBeNull();

    const event = new window.Event('load');
    iframe?.dispatchEvent(event);

    expect(mockFn).toHaveBeenCalled();
  });
});
