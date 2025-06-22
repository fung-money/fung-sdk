import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { OnboardingStep } from "../onboarding-step.js";
import { commonStyles } from "../styles.js";

import type { BusinessDetails } from "../../models/business-details.js";
import type { BusinessActivity } from "../../models/business-activity.js";
import { LegalEntitySection } from "../../models/legal-entity-section.js";
import { ApiService } from "../../services/api.service.js";

@customElement("business-information")
export class BusinessInformation extends OnboardingStep {
  constructor() {
    super();
    console.log("BusinessInformation initialized");
  }

  static styles = [commonStyles];

  @state()
  private _businessDetails: BusinessDetails = {
    businessName: "",
    businessCountry: "",
    businessType: "",
    companyRegistrationNumber: "",
    vatNumber: "",
    tinNumber: "",
    registeredBusinessAddress: {
      address: "",
      city: "",
      postalCode: "",
      country: "",
    },
  };

  @state()
  private _businessActivity: BusinessActivity = {
    website: "",
    industry: "",
    explainProducts: "",
    deliveryTime: "",
    estimatedMonthlyRevenue: "",
  };

  @property({ type: String })
  public apiKey = "";
  @property({ type: String })
  public apiSecret = "";
  @property({ type: String })
  public baseUrl = "";

  @state()
  private _apiService!: ApiService;

  @state()
  private _isLoading = false;

  @state()
  private _loadingSubtext = "";

  @state()
  private _businessSuggestions: string[] = [];

  @state()
  private _showSuggestions = false;

  @state()
  private _businessDataFetchedFromRegisters = false;

  @state()
  private _businessDataManualInput = false;

  @state()
  private _apiError: string | null = null;

  @state()
  private _validationErrors: Record<string, boolean> = {};

  updated() {
    if (this.apiKey && this.apiSecret && this.baseUrl && !this._apiService) {
      this._apiService = new ApiService(
        this.apiKey,
        this.apiSecret,
        this.baseUrl
      );
      this.requestUpdate("_apiService");
    }
  }

  async saveData(): Promise<void> {
    this._isLoading = true;
    this._loadingSubtext = "Validating data...";

    const isValid = this._validate();
    if (!isValid) {
      this._isLoading = false;
      return;
    }

    this._loadingSubtext = "Saving data...";

    try {
      await this._apiService.saveLegalData(
        LegalEntitySection.BUSINESS_DETAILS,
        this._businessDetails
      );
      await this._apiService.saveLegalData(
        LegalEntitySection.BUSINESS_ACTIVITY,
        this._businessActivity
      );
      this.dispatchEvent(
        new CustomEvent("step-saved", {
          bubbles: true,
          composed: true,
          detail: {
            businessDetails: this._businessDetails,
            businessActivity: this._businessActivity,
          },
        })
      );
    } catch (error) {
      console.error("Failed to save data", error);
    } finally {
      this._isLoading = false;
      this._loadingSubtext = "";
    }
  }

  private async _handleBusinessDetailsInput(
    e: Event,
    field: keyof BusinessDetails,
    subField?: keyof BusinessDetails["registeredBusinessAddress"]
  ) {
    e.preventDefault();
    const target = e.target as HTMLInputElement;
    const value = target.value;
    if (
      field === "registeredBusinessAddress" &&
      subField &&
      this._businessDetails[field][subField]
    ) {
      this._businessDetails[field][subField] = value;
    } else if (field !== "registeredBusinessAddress") {
      this._businessDetails[field] = value;
    } else {
      throw new Error("Invalid field or subfield");
    }
    this.requestUpdate("_businessDetails");
  }

  private async _handleBusinessActivityInput(
    e: Event,
    field: keyof BusinessActivity
  ) {
    e.preventDefault();
    const target = e.target as HTMLInputElement;
    const value = target.value;
    this._businessActivity[field] = value;
    this.requestUpdate("_businessActivity");
  }

  private async _handleSuggestionClick(suggestion: string) {
    this._businessDetails.businessName = suggestion.split(" - ")[0];
    this._businessDetails.companyRegistrationNumber =
      suggestion.split(" - ")[1];
    this._getBusinessRegistersData();
    this._showSuggestions = false;
    this.requestUpdate("_businessDetails");
    this.requestUpdate("_showSuggestions");
  }

  private async _searchBusiness(businessName: string) {
    this._businessSuggestions = await this._apiService.searchBusiness(
      businessName
    );
    this.requestUpdate("_businessSuggestions");
  }

  private async _getBusinessRegistersData() {
    this._isLoading = true;
    this._loadingSubtext = "Fetching company data...";
    if (
      this._businessDetails.businessCountry &&
      this._businessDetails.companyRegistrationNumber
    ) {
      const data = await this._apiService.getBusinessRegistersData(
        this._businessDetails.businessCountry,
        this._businessDetails.companyRegistrationNumber
      );
      this._businessDetails = data.businessDetails;
      this._businessActivity = data.businessActivity;
      this._businessDataFetchedFromRegisters = true;
      this.requestUpdate("_businessDetails");
      this.requestUpdate("_businessActivity");
      this.requestUpdate("_businessDataFetchedFromRegisters");
    }
    this._isLoading = false;
    this._loadingSubtext = "";
  }

  private _validate(): boolean {
    this._validationErrors = {};

    const requiredBusinessDetails: (keyof Omit<
      BusinessDetails,
      "registeredBusinessAddress" | "businessTradeName"
    >)[] = [
      "businessName",
      "businessCountry",
      "businessType",
      "companyRegistrationNumber",
      "vatNumber",
      "tinNumber",
    ];

    const requiredAddressDetails: (keyof BusinessDetails["registeredBusinessAddress"])[] =
      ["address", "city", "postalCode", "country"];

    const requiredActivityDetails: (keyof Omit<
      BusinessActivity,
      "deliveryTime"
    >)[] = [
      "website",
      "industry",
      "explainProducts",
      "estimatedMonthlyRevenue",
    ];

    for (const field of requiredBusinessDetails) {
      if (!this._businessDetails[field]) {
        this._validationErrors[field] = true;
      }
    }

    for (const field of requiredAddressDetails) {
      if (!this._businessDetails.registeredBusinessAddress[field]) {
        this._validationErrors[`registeredBusinessAddress.${field}`] = true;
      }
    }

    for (const field of requiredActivityDetails) {
      if (!this._businessActivity[field]) {
        this._validationErrors[field] = true;
      }
    }

    this.requestUpdate("_validationErrors");
    return Object.keys(this._validationErrors).length === 0;
  }

  private _renderBusinessDetailsForm() {
    return html`
      <div class="list">
        <div class="row">
          <div class="form-field">
            <label for="businessCountry">Business Country</label>
            <input
              type="text"
              id="businessCountry"
              name="businessCountry"
              .value=${this._businessDetails.businessCountry || ""}
              @input=${(e: Event) =>
                this._handleBusinessDetailsInput(e, "businessCountry")}
              required
              ?disabled=${this._businessDataFetchedFromRegisters}
            />
            ${this._validationErrors.businessCountry
              ? html`<span class="error-message">
                  Business country is required
                </span>`
              : ""}
          </div>
          <div class="form-field">
            <label for="businessName">Company Name</label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              .value=${this._businessDetails.businessName}
              @input=${(e: Event) => {
                this._handleBusinessDetailsInput(e, "businessName");
                this._searchBusiness((e.target as HTMLInputElement).value);
                this._showSuggestions = true;
              }}
              required
              ?disabled=${!this._businessDetails.businessCountry ||
              this._businessDataFetchedFromRegisters}
            />
            ${this._showSuggestions && this._businessSuggestions.length > 0
              ? html`
                  <ul class="suggestions-list">
                    ${this._businessSuggestions.map(
                      (suggestion) =>
                        html`
                          <li
                            @click=${() =>
                              this._handleSuggestionClick(suggestion)}
                          >
                            ${suggestion}
                          </li>
                        `
                    )}
                  </ul>
                `
              : ""}
            ${this._validationErrors.businessName
              ? html`<span class="error-message">
                  Business name is required
                </span>`
              : ""}
          </div>
          <div class="form-field">
            <label for="companyRegistrationNumber"
              >Company Registration Number</label
            >
            <input
              type="text"
              id="companyRegistrationNumber"
              name="companyRegistrationNumber"
              .value=${this._businessDetails.companyRegistrationNumber || ""}
              @input=${(e: Event) =>
                this._handleBusinessDetailsInput(
                  e,
                  "companyRegistrationNumber"
                )}
              required
              ?disabled=${this._businessDataFetchedFromRegisters}
            />
            ${this._validationErrors.companyRegistrationNumber
              ? html`<span class="error-message">
                  Company registration number is required
                </span>`
              : ""}
          </div>
        </div>

        <div class="row">
          <div class="button-group">
            <button
              type="button"
              @click=${() => this._getBusinessRegistersData()}
              class="confirm-button"
              ?disabled=${!this._businessDetails.businessCountry ||
              !this._businessDetails.companyRegistrationNumber}
            >
              Search Company Data
            </button>
            <button
              type="button"
              class="confirm-button secondary-button"
              @click=${() => (this._businessDataManualInput = true)}
              ?disabled=${!this._businessDetails.businessCountry ||
              !this._businessDetails.businessName}
            >
              Enter Manually
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderBusinessRegisteredAddress() {
    return html`
      <div class="list">
        <div class="row">
          <div class="form-field">
            <label for="registeredBusinessAddress.address">Address</label>
            <input
              type="text"
              id="registeredBusinessAddress.address"
              name="registeredBusinessAddress.address"
              .value=${this._businessDetails.registeredBusinessAddress.address}
              @input=${(e: Event) =>
                this._handleBusinessDetailsInput(
                  e,
                  "registeredBusinessAddress",
                  "address"
                )}
              required
            />
          </div>
        </div>
        <div class="row">
          <div class="form-field">
            <label for="registeredBusinessAddress.city">City</label>
            <input
              type="text"
              id="registeredBusinessAddress.city"
              name="registeredBusinessAddress.city"
              .value=${this._businessDetails.registeredBusinessAddress.city}
              @input=${(e: Event) =>
                this._handleBusinessDetailsInput(
                  e,
                  "registeredBusinessAddress",
                  "city"
                )}
              required
            />
          </div>
          <div class="form-field">
            <label for="registeredBusinessAddress.postalCode"
              >Postal Code</label
            >
            <input
              type="text"
              id="registeredBusinessAddress.postalCode"
              name="registeredBusinessAddress.postalCode"
              .value=${this._businessDetails.registeredBusinessAddress
                .postalCode}
              @input=${(e: Event) =>
                this._handleBusinessDetailsInput(
                  e,
                  "registeredBusinessAddress",
                  "postalCode"
                )}
              required
            />
          </div>
          <div class="form-field">
            <label for="registeredBusinessAddress.country">Country</label>
            <input
              type="text"
              id="registeredBusinessAddress.country"
              name="registeredBusinessAddress.country"
              .value=${this._businessDetails.registeredBusinessAddress.country}
              @input=${(e: Event) =>
                this._handleBusinessDetailsInput(
                  e,
                  "registeredBusinessAddress",
                  "country"
                )}
              required
            />
          </div>
        </div>
      </div>
    `;
  }

  private _renderBusinessActivity() {
    return html`
      <div class="list">
        <div class="row">
          <div class="form-field">
            <label for="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              .value=${this._businessActivity.website || ""}
              @input=${(e: Event) =>
                this._handleBusinessActivityInput(e, "website")}
              required
            />
            ${this._validationErrors.website
              ? html`<div class="error-message">
                  ${this._validationErrors.website}
                </div>`
              : ""}
          </div>
          <div class="form-field">
            <label for="industry">Industry</label>
            <input
              type="text"
              id="industry"
              name="industry"
              .value=${this._businessActivity.industry || ""}
              @input=${(e: Event) =>
                this._handleBusinessActivityInput(e, "industry")}
              required
            />
            ${this._validationErrors.industry
              ? html`<span class="error-message"> Industry is required </span>`
              : ""}
          </div>
        </div>
        <div class="row">
          <div class="form-field full-width">
            <label for="explainProducts">Explain your products</label>
            <textarea
              id="explainProducts"
              name="explainProducts"
              .value=${this._businessActivity.explainProducts || ""}
              @input=${(e: Event) =>
                this._handleBusinessActivityInput(e, "explainProducts")}
              required
            ></textarea>
            ${this._validationErrors.explainProducts
              ? html`<span class="error-message">
                  Explain your products is required
                </span>`
              : ""}
          </div>
        </div>
        <div class="row">
          <div class="form-field">
            <label for="deliveryTime">Delivery Time (Optional)</label>
            <input
              type="text"
              id="deliveryTime"
              name="deliveryTime"
              .value=${this._businessActivity.deliveryTime || ""}
              @input=${(e: Event) =>
                this._handleBusinessActivityInput(e, "deliveryTime")}
            />
          </div>
          <div class="form-field">
            <label for="estimatedMonthlyRevenue"
              >Estimated Monthly Revenue</label
            >
            <input
              type="text"
              id="estimatedMonthlyRevenue"
              name="estimatedMonthlyRevenue"
              .value=${this._businessActivity.estimatedMonthlyRevenue || ""}
              @input=${(e: Event) =>
                this._handleBusinessActivityInput(e, "estimatedMonthlyRevenue")}
              required
            />
            ${this._validationErrors.estimatedMonthlyRevenue
              ? html`<span class="error-message">
                  Estimated monthly revenue is required
                </span>`
              : ""}
          </div>
        </div>
      </div>
    `;
  }

  protected render() {
    return html`
      <div style="position: relative;">
        ${this._isLoading
          ? html`
              <div class="loading-overlay">
                <div class="loader"></div>
                <div class="loader-subtext">${this._loadingSubtext}</div>
              </div>
            `
          : ""}
        <form>
          <div
            class="form-section ${this._businessDataFetchedFromRegisters
              ? "disabled-section"
              : ""}"
          >
            <h3>Business Information</h3>
            <p>
              Please enter your business information to help us verify your
              company.
            </p>
            ${this._renderBusinessDetailsForm()}
          </div>

          ${this._businessDataFetchedFromRegisters ||
          this._businessDataManualInput
            ? html`<div class="form-section">
                <h3>Registered Address</h3>
                ${this._renderBusinessRegisteredAddress()}
              </div>`
            : ""}
          ${this._businessDataFetchedFromRegisters ||
          this._businessDataManualInput
            ? html`<div class="form-section">
                <h3>Business Activity</h3>
                <p>
                  Tell us more about what your business does. This helps us
                  tailor our services for you.
                </p>
                ${this._renderBusinessActivity()}
              </div>`
            : ""}
        </form>
      </div>
    `;
  }
}
