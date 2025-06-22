import { css } from "lit";

export const commonStyles = css`
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
    --primary-color: #007aff;
    --primary-color-hover: #005ec4;
    --secondary-color: #6c757d;
    --border-color: #ced4da;
    --background-color: #f8f9fa;
    --error-color: #dc3545;
    --success-color: #28a745;
    --input-background: #fff;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .form-section {
    background-color: var(--input-background);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: opacity 0.3s ease-in-out;
  }

  .form-section h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    color: #333;
  }

  .form-section p {
    margin: 0 0 1rem 0;
    color: var(--secondary-color);
    font-size: 0.9rem;
  }

  .disabled-section {
    opacity: 0.6;
    background-color: var(--background-color);
    pointer-events: none;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .row {
    display: flex;
    gap: 1.5rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .form-field {
    flex: 1;
    min-width: 180px;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .form-field.full-width {
    flex-basis: 100%;
  }

  label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #343a40;
    font-size: 0.875rem;
  }

  input,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    background-color: var(--input-background);
    box-sizing: border-box; /* Important for padding and width */
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }

  input:disabled,
  textarea:disabled {
    background-color: var(--background-color);
    cursor: not-allowed;
  }

  .form-field input.invalid,
  .form-field select.invalid,
  .form-field textarea.invalid {
    border-color: #e53e3e;
    background-color: #fff5f5;
  }

  .form-field input.invalid:focus,
  .form-field select.invalid:focus,
  .form-field textarea.invalid:focus {
    border-color: #c53030;
    box-shadow: 0 0 0 1px #c53030;
  }

  .error-message {
    color: #c53030;
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-top: 1rem;
  }

  .confirm-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: background-color 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .confirm-button:hover:not(:disabled) {
    background-color: var(--primary-color-hover);
  }

  .confirm-button:disabled {
    background-color: var(--secondary-color);
    opacity: 0.7;
    cursor: not-allowed;
  }

  .secondary-button {
    background-color: transparent;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
  }

  .secondary-button:hover:not(:disabled) {
    background-color: rgba(0, 123, 255, 0.1);
  }

  .suggestions-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin-top: 4px;
    list-style: none;
    padding: 0;
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .suggestions-list li {
    padding: 0.75rem;
    cursor: pointer;
  }

  .suggestions-list li:hover {
    background-color: var(--background-color);
  }

  .collapsible-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }

  .collapsible-header .icon {
    font-size: 1.5rem;
    transition: transform 0.2s;
  }

  .subsection-header {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: #333;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
  }

  .checkbox-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--background-color);
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid var(--border-color);

    input {
      margin: 0;
      width: auto;
    }

    label {
      margin-bottom: 0;
    }
  }

  .owner-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .owner-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
  }

  .owner-item .ownership {
    color: var(--secondary-color);
  }

  .remove-button {
    background: none;
    border: none;
    color: var(--error-color);
    cursor: pointer;
    font-size: 0.8rem;
  }

  .summary-section {
    margin-bottom: 2rem;
  }

  .summary-section h4 {
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
  }

  .summary-key {
    font-weight: 500;
    color: var(--secondary-color);
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .summary-value {
    font-size: 1rem;
    white-space: pre-wrap;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 20;
    backdrop-filter: blur(4px);
  }

  .loader {
    border: 5px solid #f3f3f3;
    border-top: 5px solid var(--primary-color);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
  }

  .loader-subtext {
    margin-top: 1rem;
    color: var(--secondary-color);
    font-size: 0.9rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
