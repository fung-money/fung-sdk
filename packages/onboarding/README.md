# @fung-sdk/onboarding

This package provides a framework-agnostic, embeddable web component for the Fung onboarding flow.

## Installation

To install the package, run the following command in your project's directory:

```bash
npm install @fung-sdk/onboarding
```

## Usage

The component is built as a standard Web Component, so it can be used in any HTML-based project, regardless of the framework.

### Vanilla JS

To use the component in a plain JavaScript project, import the package in a script tag with `type="module"`. This will register the `<onboarding-form>` custom element.

Here is an example `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vanilla JS Example</title>
  </head>
  <body>
    <!-- Use the component in your HTML -->
    <onboarding-form
      api-key="YOUR_API_KEY"
      api-secret="YOUR_API_SECRET"
    ></onboarding-form>

    <script type="module">
      // Import the component to register it.
      // Note: Your development server or bundler (like Vite, Webpack, etc.)
      // needs to be configured to resolve imports from node_modules.
      import '@fung-sdk/onboarding';
    </script>
  </body>
</html>
```

### React

Web Components are fully compatible with React. You can use the `<onboarding-form>` element just like any other HTML tag in your JSX.

1.  **Import the component**: Import the package once in your application's main entry point (e.g., `src/index.js` or `src/App.js`) to register the web component.
2.  **Use the component**: Use the kebab-case tag name (`onboarding-form`) in your React components.

Here is an example of a React component:

```jsx
import React from 'react';
import '@fung-sdk/onboarding'; // Import once in your app to register the component

function MyOnboardingPage() {
  const apiKey = 'YOUR_API_KEY';
  const apiSecret = 'YOUR_API_SECRET';

  return (
    <div>
      <h1>Onboarding in React</h1>
      <onboarding-form
        api-key={apiKey}
        api-secret={apiSecret}
      ></onboarding-form>
    </div>
  );
}

export default MyOnboardingPage;
```
