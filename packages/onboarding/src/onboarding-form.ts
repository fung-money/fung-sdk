import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";

import "./steps/business-information/step.js";
import "./steps/related-parties/step.js";
import "./steps/upload-documents/step.js";
import "./steps/identity-verification/step.js";
import "./steps/application-summary/step.js";

import { OnboardingStep } from "./steps/onboarding-step.js";

const STEPS = [
  "business-information",
  "related-parties",
  "upload-documents",
  "identity-verification",
  "application-summary",
];

@customElement("onboarding-form")
export class OnboardingForm extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 900px;
      margin: 2rem auto;
      font-family: sans-serif;
    }

    .onboarding-wrapper {
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 2rem;
      background-color: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .stepper {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 0;
      margin-bottom: 2rem;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      flex-basis: 120px;
      flex-shrink: 0;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      transition: background-color 0.3s, border-color 0.3s, color 0.3s;
      border: 2px solid #ccc;
      background-color: #fff;
      color: #ccc;
    }

    .step-title {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      font-weight: 500;
      color: #6c757d;
      min-height: 2.2em;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step.active .step-number {
      border-color: #007aff;
      background-color: #fff;
      color: #007aff;
    }

    .step.active .step-title {
      color: #007aff;
      font-weight: 600;
    }

    .step.completed .step-number {
      border-color: #007aff;
      background-color: #007aff;
      color: #fff;
    }

    .step.completed .step-title {
      color: #343a40;
    }

    .step-connector {
      flex-grow: 1;
      height: 2px;
      background-color: #ccc;
      transition: background-color 0.3s;
    }

    .step.completed + .step-connector {
      background-color: #007aff;
    }

    .navigation {
      margin-top: 1rem;
      display: flex;
      justify-content: space-between;
    }

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    .nav-btn-secondary {
      background-color: #f0f0f0;
    }

    .error-message {
      padding: 1.5rem;
      background-color: #ffebee;
      color: #c62828;
      border-radius: 8px;
      border: 1px solid #c62828;
    }
  `;

  @property({ type: String })
  public apiKey = "";

  @property({ type: String })
  public apiSecret = "";

  @property({ type: String })
  public baseUrl = "http://localhost:3000/api/v2";

  @property({ type: String })
  public isMocked = false;

  @property({ type: String })
  public accountId = "";

  @property({ type: String })
  public userId = "";

  @state()
  private _currentStep = 0;

  private prevStep() {
    if (this._currentStep > 0) {
      this._currentStep -= 1;
      this.requestUpdate();
    }
  }

  private async nextStep() {
    const currentStepTag = STEPS[this._currentStep];
    const currentStepComponent =
      this.shadowRoot?.querySelector<OnboardingStep>(currentStepTag);

    if (currentStepComponent) {
      currentStepComponent.saveData();
    }
  }

  private _handleStepSaved(event: CustomEvent) {
    console.debug("Event received", event);
    this._currentStep = Math.min(this._currentStep + 1, STEPS.length - 1);
    this.requestUpdate();
  }

  private _saveAndExit() {
    this.dispatchEvent(
      new CustomEvent("save-and-exit", { bubbles: true, composed: true })
    );
  }

  private _formatStepTitle(step: string): string {
    return step
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private _goToStep(index: number) {
    this._currentStep = index;
    this.requestUpdate();
  }

  render() {
    if (!this.apiKey || !this.apiSecret || !this.baseUrl) {
      return html`<p>Please set the API key, API secret, and base URL.</p>`;
    }

    return html`
      <div class="onboarding-wrapper">
        <div class="stepper">
          ${STEPS.map(
            (step, index) => html`
              <div
                class="step ${this._currentStep === index
                  ? "active"
                  : ""} ${this._currentStep > index ? "completed" : ""}"
                @click=${() => this._goToStep(index)}
                style=${"cursor: pointer"}
              >
                <div class="step-number">${index + 1}</div>
                <div class="step-title">${this._formatStepTitle(step)}</div>
              </div>
              ${index < STEPS.length - 1
                ? html`<div class="step-connector"></div>`
                : ""}
            `
          )}
        </div>
        <div class="flow-container" @step-saved=${this._handleStepSaved}>
          ${choose(
            STEPS[this._currentStep],
            [
              [
                "business-information",
                () => html`<business-information
                  .apiKey=${this.apiKey}
                  .apiSecret=${this.apiSecret}
                  .baseUrl=${this.baseUrl}
                  .accountId=${this.accountId}
                  .isMocked=${this.isMocked}
                  .userId=${this.userId}
                ></business-information>`,
              ],
              [
                "related-parties",
                () => html`<related-parties
                  .apiKey=${this.apiKey}
                  .apiSecret=${this.apiSecret}
                  .baseUrl=${this.baseUrl}
                  .accountId=${this.accountId}
                  .isMocked=${this.isMocked}
                ></related-parties>`,
              ],
              [
                "upload-documents",
                () => html`<upload-documents
                  .apiKey=${this.apiKey}
                  .apiSecret=${this.apiSecret}
                  .baseUrl=${this.baseUrl}
                  .isMocked=${this.isMocked}
                ></upload-documents>`,
              ],
              [
                "identity-verification",
                () => html`<identity-verification
                  .apiKey=${this.apiKey}
                  .apiSecret=${this.apiSecret}
                  .baseUrl=${this.baseUrl}
                  .isMocked=${this.isMocked}
                ></identity-verification>`,
              ],
              [
                "application-summary",
                () => html`<application-summary
                  .apiKey=${this.apiKey}
                  .apiSecret=${this.apiSecret}
                  .baseUrl=${this.baseUrl}
                  .accountId=${this.accountId}
                  .isMocked=${this.isMocked}
                ></application-summary>`,
              ],
            ],
            () => html`<p>Something went wrong.</p>`
          )}
        </div>

        <div class="navigation">
          <button class="nav-btn-secondary" @click=${this._saveAndExit}>
            Save & Exit
          </button>
          <div>
            <button
              class="nav-btn-secondary"
              @click=${this.prevStep}
              .disabled=${this._currentStep === 0}
            >
              Back
            </button>
            <button
              @click=${this.nextStep}
              .disabled=${this._currentStep === STEPS.length}
            >
              ${this._currentStep === STEPS.length - 1
                ? "Submit"
                : "Save & Continue"}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
