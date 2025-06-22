import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { OnboardingStep } from "../onboarding-step.js";
import { commonStyles } from "../styles.js";
import type { BusinessDetails } from "../../models/business-details.js";
import type { BusinessActivity } from "../../models/business-activity.js";
import type { BusinessRepresentative } from "../../models/business-representative.js";
import type { BusinessOwner } from "../../models/business-owners.js";

@customElement("application-summary")
export class ApplicationSummary extends OnboardingStep {
  static styles = [commonStyles];

  @state()
  private _businessDetails: BusinessDetails = {
      businessName: "Dummy Corp",
      businessCountry: "Dummyland",
      businessType: "LLC",
      companyRegistrationNumber: "12345",
      vatNumber: "DL123",
      tinNumber: "DT123",
      registeredBusinessAddress: {
        address: "123 Dummy St",
        city: "Dummytown",
        postalCode: "12345",
        country: "Dummyland",
      },
    };

  @state()
  private _businessActivity: BusinessActivity = {
      website: "https://dummy.com",
      industry: "Dummies",
      explainProducts: "We sell high-quality dummies.",
      deliveryTime: "1-2 weeks",
      estimatedMonthlyRevenue: "1,000,000",
    };

  @state()
  private _businessRepresentative: BusinessRepresentative = {
      legalName: { firstName: "John", lastName: "Doe" },
      emailAddress: "john.doe@dummy.com",
      contactNumber: "555-1234",
      dateOfBirth: "1990-01-01",
      jobTitle: "Chief Dummy",
      homeAddress: {
        address: "456 Dummy Ave",
        city: "Dummytown",
        postalCode: "12345",
        country: "Dummyland",
      },
    };

  @state()
  private _businessOwners: BusinessOwner[] = [
      {
        legalName: { firstName: "Jane", lastName: "Doe" },
        emailAddress: "jane.doe@dummy.com",
        contactNumber: "555-5678",
        jobTitle: "VP of Dummies",
        dateOfBirth: "1992-02-02",
        homeAddress: {
          address: "789 Dummy Blvd",
          city: "Dummytown",
          postalCode: "12345",
          country: "Dummyland",
        },
        percentOwnership: 50,
      },
    ];

  @state()
  private _isRepresentativeOwner = true;

  async saveData(): Promise<void> {
    console.debug("Submitting application...");
    this.dispatchEvent(
      new CustomEvent("application-submitted", { bubbles: true, composed: true }),
    );
  }

  private _renderSummarySection(
    title: string,
    data: Record<string, any> | undefined,
  ) {
    if (!data) return nothing;

    const formatValue = (key: string, value: any) => {
      if (
        (key === "registeredBusinessAddress" || key === "homeAddress")
        && typeof value === "object"
        && value
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
          ${Object.entries(data).map(([key, value]) => (value
    ? html`
                  <div class="summary-item">
                    <span class="summary-key">${this._formatKey(key)}</span>
                    <span class="summary-value"
                      >${formatValue(key, value)}</span
                    >
                  </div>
                `
    : nothing))}
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
      <h3>Application Summary</h3>
      <p>Please review your information before submitting.</p>

      ${this._renderSummarySection(
    "Business Information",
    this._businessDetails,
  )}
      ${this._renderSummarySection("Business Activity", this._businessActivity)}
      ${this._renderSummarySection(
    "Business Representative",
    this._businessRepresentative,
  )}

      <div class="summary-section">
        <h4>Business Owners</h4>
        ${
  this._isRepresentativeOwner
    ? html`<p>The Business Representative is also an owner.</p>`
    : nothing
}
        <div class="summary-grid">
          ${this._businessOwners?.map(
    (owner) => html`
              <div class="summary-item">
                <span class="summary-key"
                  >${owner.legalName.firstName} ${owner.legalName.lastName}</span
                >
                <span class="summary-value"
                  >${owner.percentOwnership}% ownership</span
                >
              </div>
            `,
  )}
        </div>
      </div>
    `;
  }
}
