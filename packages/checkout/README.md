# @fung-sdk/checkout

## Install package
```shell
npm i @fung-sdk/checkout
```

## Render checkout

Create a checkout container
```html
<div id="checkout-container"></div>
```

Initialize and render checkout
```javascript
import { Checkout } from "@fung-sdk/checkout";

const checkout = new Checkout({
  checkoutId: "e606757b-7cd5-4106-9d3b-ff1dfddb73df",
  containerId: "checkout-container",
});
checkout.render();
```
