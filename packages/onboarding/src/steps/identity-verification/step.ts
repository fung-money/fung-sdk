import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { OnboardingStep } from "../onboarding-step.js";

@customElement("identity-verification")
export class IdentityVerification extends OnboardingStep {
  static styles = css`
    :host {
      display: block;
    }
  `;

  async saveData(): Promise<void> {
    console.log("Saving Legal Data...");
    this.dispatchEvent(
      new CustomEvent("step-saved", { bubbles: true, composed: true })
    );
    return;
  }

  render() {
    return html`
      <h2>Identity Verification</h2>
      <p>Under construction.</p>
    `;
  }

  async submit(): Promise<boolean> {
    console.log("Submitting Identity Verification Step...");
    return true;
  }
}
