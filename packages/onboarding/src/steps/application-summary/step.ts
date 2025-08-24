import { html, nothing } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import { OnboardingStep } from "../onboarding-step.js";
import { commonStyles } from "../styles.js";
import type { BusinessDetails } from "../../models/business-details.js";
import type { BusinessActivity } from "../../models/business-activity.js";
import type { BusinessRepresentative } from "../../models/business-representative.js";
import type { BusinessOwner } from "../../models/business-owners.js";
import { ApiService } from "../../services/api.service.js";

@customElement("application-summary")
export class ApplicationSummary extends OnboardingStep {
  static styles = [commonStyles];

  @property({ type: String })
  public apiKey = "";

  @property({ type: String })
  public apiSecret = "";

  @property({ type: String })
  public baseUrl = "";

  @property({ type: String })
  public accountId = "";

  @property({ type: Boolean })
  public isMocked = false;

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
    estimatedMonthlyRevenue: "",
  };

  @state()
  private _businessRepresentative: BusinessRepresentative = {
    legalName: { firstName: "", lastName: "" },
    emailAddress: "",
    contactNumber: "",
    dateOfBirth: "",
    jobTitle: "",
    homeAddress: {
      address: "",
      city: "",
      postalCode: "",
      country: "",
    },
  };

  @state()
  private _businessOwners: BusinessOwner[] = [];

  @state()
  private _isRepresentativeOwner = true;

  @state()
  private _apiService!: ApiService;

  @state()
  private _isLoading = false;

  @state()
  private _loadingSubtext = "";

  @state()
  private _apiError: string | null = null;

  @state()
  private _hasLoadedLegalEntity = false;

  public async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this._fetchLegalEntityDetails();
  }

  protected async updated(): Promise<void> {
    if (!this._apiService && this.apiKey && this.apiSecret && this.baseUrl) {
      this._apiService = new ApiService(
        this.apiKey,
        this.apiSecret,
        this.baseUrl,
        this.isMocked
      );
      this.requestUpdate("_apiService");
    }
    if (this._apiService && this.accountId && !this._hasLoadedLegalEntity) {
      await this._fetchLegalEntityDetails();
    }
  }

  private async _fetchLegalEntityDetails(): Promise<void> {
    if (
      this.apiKey &&
      this.apiSecret &&
      this.baseUrl &&
      this.accountId &&
      !this._hasLoadedLegalEntity
    ) {
      if (!this._apiService) {
        this._apiService = new ApiService(
          this.apiKey,
          this.apiSecret,
          this.baseUrl,
          this.isMocked
        );
      }
      this._isLoading = true;
      this._loadingSubtext = "Loading application summary...";
      this._apiError = null;
      try {
        const legalEntity =
          await this._apiService.getLegalEntityDetailsByAccountId(
            this.accountId
          );
        if (legalEntity) {
          if (legalEntity.businessDetails) {
            this._businessDetails = legalEntity.businessDetails;
          }
          if (legalEntity.businessActivity) {
            this._businessActivity = legalEntity.businessActivity;
          }
          if (legalEntity.businessRepresentative) {
            this._businessRepresentative = legalEntity.businessRepresentative;
          }
          if (legalEntity.businessOwners) {
            this._businessOwners = Array.isArray(legalEntity.businessOwners)
              ? legalEntity.businessOwners
              : [];
          }
          this._hasLoadedLegalEntity = true;
          this.requestUpdate();
        }
      } catch (err) {
        this._apiError =
          err instanceof Error
            ? err.message
            : "Failed to load application summary";
        this.dispatchEvent(
          new CustomEvent("step-load-error", {
            bubbles: true,
            composed: true,
            detail: {
              businessDetails: this._businessDetails,
              businessActivity: this._businessActivity,
            },
          })
        );
      } finally {
        this._isLoading = false;
        this._loadingSubtext = "";
        this.requestUpdate();
      }
    }
  }

  async saveData(): Promise<void> {
    console.debug("Submitting application...");
    this._isLoading = true;
    this._loadingSubtext = "Submitting application...";
    this.requestUpdate();

    try {
      await this._apiService.submitOnboardingApplication(this.accountId);
      console.debug("Application submitted");
      this.dispatchEvent(
        new CustomEvent("application-submitted", {
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      console.debug("Failed to submit application");
      this._isLoading = false;
      this._loadingSubtext = "";
      this.requestUpdate();
      throw error;
    } finally {
      this._isLoading = false;
      this._loadingSubtext = "";
      this.requestUpdate();
    }
  }

  private _renderSummarySection(
    title: string,
    data: Record<string, any> | undefined
  ) {
    if (!data) return nothing;

    const formatValue = (key: string, value: any) => {
      if (
        (key === "registeredBusinessAddress" || key === "homeAddress") &&
        typeof value === "object" &&
        value
      ) {
        return `${value.address}, ${value.city}, ${value.postalCode}, ${value.country}`;
      }
      if (key === "legalName" && typeof value === "object" && value) {
        return `${value.firstName} ${value.lastName}`;
      }
      if (typeof value === "object" && value) {
        return JSON.stringify(value, null, 2);
      }
      return value;
    };

    return html`
      <div class="summary-section">
        <h4>${title}</h4>
        <div class="summary-grid">
          ${Object.entries(data).map(([key, value]) =>
            value
              ? html`
                  <div class="summary-item">
                    <span class="summary-key">${this._formatKey(key)}</span>
                    <span class="summary-value"
                      >${formatValue(key, value)}</span
                    >
                  </div>
                `
              : nothing
          )}
        </div>
      </div>
    `;
  }

  private _formatKey(key: string) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  }

  render() {
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

        <h3>Application Summary</h3>
        <p>Please review your information before submitting.</p>

        ${this._renderSummarySection(
          "Business Information",
          this._businessDetails
        )}
        ${this._renderSummarySection(
          "Business Activity",
          this._businessActivity
        )}
        ${this._renderSummarySection(
          "Business Representative",
          this._businessRepresentative
        )}

        <div class="summary-section">
          <h4>Business Owners</h4>
          ${this._isRepresentativeOwner
            ? html`<p>The Business Representative is also an owner.</p>`
            : nothing}
          <div class="summary-grid">
            ${this._businessOwners?.map(
              (owner) => html`
                <div class="summary-item">
                  <span class="summary-key"
                    >${owner.legalName.firstName}
                    ${owner.legalName.lastName}</span
                  >
                  <span class="summary-value"
                    >${owner.percentOwnership}% ownership</span
                  >
                </div>
              `
            )}
          </div>
        </div>
      </div>
    `;
  }
}
