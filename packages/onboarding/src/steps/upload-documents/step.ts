import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { OnboardingStep } from "../onboarding-step.js";
import { commonStyles } from "../styles.js";

@customElement("upload-documents")
export class UploadDocuments extends OnboardingStep {
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
    console.debug("Saving Documents Step...");
    this.dispatchEvent(
      new CustomEvent("step-saved", { bubbles: true, composed: true })
    );
  }

  render() {
    return html`
      <h2>Documents</h2>
      <p>Under construction.</p>
    `;
  }

  async submit(): Promise<boolean> {
    console.debug("Submitting Documents Step...");
    return true;
  }
}
