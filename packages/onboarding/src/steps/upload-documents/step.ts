import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { OnboardingStep } from "../onboarding-step.js";
import { commonStyles } from "../styles.js";

@customElement("upload-documents")
export class UploadDocuments extends OnboardingStep {
  static styles = [commonStyles];

  async saveData(): Promise<void> {
    console.debug("Saving Documents Step...");
    this.dispatchEvent(
      new CustomEvent("step-saved", { bubbles: true, composed: true }),
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
