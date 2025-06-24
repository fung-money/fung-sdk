import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { OnboardingStep } from "../onboarding-step.js";
import { commonStyles } from "../styles.js";

@customElement("identity-verification")
export class IdentityVerification extends OnboardingStep {
  static styles = [commonStyles];

  @property({ type: String })
  public apiKey = "";

  @property({ type: String })
  public apiSecret = "";

  @property({ type: String })
  public baseUrl = "";

  @property({ type: Boolean })
  public isMocked = false;

  async saveData(): Promise<void> {
    console.debug("Saving Identity Verification Data...");
    this.dispatchEvent(
      new CustomEvent("step-saved", { bubbles: true, composed: true })
    );
  }

  render() {
    return html`
      <h2>Identity Verification</h2>
      <p>Under construction.</p>
    `;
  }

  async submit(): Promise<boolean> {
    console.debug("Submitting Identity Verification Step...");
    return true;
  }
}
