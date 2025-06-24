import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { OnboardingStep } from "../onboarding-step.js";
import { commonStyles } from "../styles.js";
import type { BusinessRepresentative } from "../../models/business-representative.js";
import type { BusinessOwner } from "../../models/business-owners.js";
import { ApiService } from "../../services/api.service.js";
import { LegalEntitySection } from "../../models/legal-entity-section.js";

@customElement("related-parties")
export class RelatedParties extends OnboardingStep {
  static styles = [commonStyles];

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
  private _apiService!: ApiService;

  @state()
  private _isLoading = false;

  @state()
  private _loadingSubtext = "";

  @state()
  private _isRepresentativeABusinessOwner = false;

  @state()
  private _businessRepresentativeOwnership = 0;

  @state()
  private _isBusinessRepresentativeCollapsed = true;

  @state()
  private _collapseStateByIndex: Record<number, boolean> = {};

  @state()
  private _errors: {
    businessRepresentative: Partial<BusinessRepresentative>;
    businessOwners: Partial<BusinessOwner>[];
    representativeOwnership?: string;
  } = {
    businessRepresentative: {},
    businessOwners: [],
    representativeOwnership: "",
  };

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
      this._loadingSubtext = "Loading related parties data...";
      try {
        const legalEntity =
          await this._apiService.getLegalEntityDetailsByAccountId(
            this.accountId
          );
        if (legalEntity) {
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
        // Optionally set an error state here
      } finally {
        this._isLoading = false;
        this._loadingSubtext = "";
      }
    }
  }

  async saveData(): Promise<void> {
    this._isLoading = true;
    this._loadingSubtext = "Validating Related Parties Data...";
    this.requestUpdate("_isLoading");

    if (!this._validate()) {
      console.debug("Error saving Related Parties Data: validation failed");
      this._isLoading = false;
      this._loadingSubtext = "";
      this.dispatchEvent(
        new CustomEvent("validation-error", {
          bubbles: true,
          composed: true,
          detail: { message: "Please correct the errors before proceeding." },
        })
      );
      return;
    }

    this._loadingSubtext = "Saving Related Parties Data...";
    this.requestUpdate("_loadingSubtext");

    try {
      await this._apiService.saveLegalData(
        this.accountId,
        LegalEntitySection.BUSINESS_REPRESENTATIVE,
        this._businessRepresentative
      );

      await this._apiService.saveLegalData(
        this.accountId,
        LegalEntitySection.BUSINESS_OWNERS,
        this._isRepresentativeABusinessOwner
          ? {
              businessOwners: [
                ...this._businessOwners,
                {
                  ...this._businessRepresentative,
                  percentOwnership: this._businessRepresentativeOwnership,
                },
              ],
            }
          : {
              businessOwners: [...this._businessOwners],
            }
      );

      this.dispatchEvent(
        new CustomEvent("step-saved", {
          bubbles: true,
          composed: true,
          detail: {
            businessOwners: this._isRepresentativeABusinessOwner
              ? [...this._businessOwners, this._businessRepresentative]
              : this._businessOwners,
          },
        })
      );
    } catch (error) {
      console.debug("Error saving Related Parties Data:", error);
      this.dispatchEvent(
        new CustomEvent("save-error", {
          bubbles: true,
          composed: true,
          detail: { message: "Failed to save data. Please try again." },
        })
      );
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

  private _validate(): boolean {
    const newErrors: typeof this._errors = {
      businessRepresentative: {},
      businessOwners: this._businessOwners.map(() => ({})),
    };
    let hasError = false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const rep = this._businessRepresentative;
    const repErrors: any = {};
    if (!rep.legalName.firstName) {
      if (!repErrors.legalName) repErrors.legalName = {};
      repErrors.legalName.firstName = "First name is required.";
      hasError = true;
    }
    if (!rep.legalName.lastName) {
      if (!repErrors.legalName) repErrors.legalName = {};
      repErrors.legalName.lastName = "Last name is required.";
      hasError = true;
    }
    if (!rep.emailAddress) {
      repErrors.emailAddress = "Email is required.";
      hasError = true;
    } else if (!emailRegex.test(rep.emailAddress)) {
      repErrors.emailAddress = "Please enter a valid email address.";
      hasError = true;
    }
    if (!rep.dateOfBirth) {
      repErrors.dateOfBirth = "Date of birth is required.";
      hasError = true;
    }
    const repHomeAddress = rep.homeAddress;
    if (!repHomeAddress.address) {
      if (!repErrors.homeAddress) repErrors.homeAddress = {};
      repErrors.homeAddress.address = "Address is required.";
      hasError = true;
    }
    if (!repHomeAddress.city) {
      if (!repErrors.homeAddress) repErrors.homeAddress = {};
      repErrors.homeAddress.city = "City is required.";
      hasError = true;
    }
    if (!repHomeAddress.postalCode) {
      if (!repErrors.homeAddress) repErrors.homeAddress = {};
      repErrors.homeAddress.postalCode = "Postal code is required.";
      hasError = true;
    }
    if (!repHomeAddress.country) {
      if (!repErrors.homeAddress) repErrors.homeAddress = {};
      repErrors.homeAddress.country = "Country is required.";
      hasError = true;
    }
    newErrors.businessRepresentative = repErrors;

    this._businessOwners.forEach((owner, index) => {
      const ownerErrors: any = {};
      if (!owner.legalName.firstName) {
        if (!ownerErrors.legalName) ownerErrors.legalName = {};
        ownerErrors.legalName.firstName = "First name is required.";
        hasError = true;
      }
      if (!owner.legalName.lastName) {
        if (!ownerErrors.legalName) ownerErrors.legalName = {};
        ownerErrors.legalName.lastName = "Last name is required.";
        hasError = true;
      }
      if (!owner.emailAddress) {
        ownerErrors.emailAddress = "Email is required.";
        hasError = true;
      } else if (!emailRegex.test(owner.emailAddress)) {
        ownerErrors.emailAddress = "Please enter a valid email address.";
        hasError = true;
      }
      if (!owner.dateOfBirth) {
        ownerErrors.dateOfBirth = "Date of birth is required.";
        hasError = true;
      }
      if (owner.percentOwnership <= 0 || owner.percentOwnership > 100) {
        ownerErrors.percentOwnership = "Ownership must be between 1 and 100.";
        hasError = true;
      }
      const ownerHomeAddress = owner.homeAddress;
      if (!ownerHomeAddress.address) {
        if (!ownerErrors.homeAddress) ownerErrors.homeAddress = {};
        ownerErrors.homeAddress.address = "Address is required.";
        hasError = true;
      }
      if (!ownerHomeAddress.city) {
        if (!ownerErrors.homeAddress) ownerErrors.homeAddress = {};
        ownerErrors.homeAddress.city = "City is required.";
        hasError = true;
      }
      if (!ownerHomeAddress.postalCode) {
        if (!ownerErrors.homeAddress) ownerErrors.homeAddress = {};
        ownerErrors.homeAddress.postalCode = "Postal code is required.";
        hasError = true;
      }
      if (!ownerHomeAddress.country) {
        if (!ownerErrors.homeAddress) ownerErrors.homeAddress = {};
        ownerErrors.homeAddress.country = "Country is required.";
        hasError = true;
      }
      newErrors.businessOwners[index] = ownerErrors;
    });

    if (this._isRepresentativeABusinessOwner) {
      if (
        this._businessRepresentativeOwnership <= 0 ||
        this._businessRepresentativeOwnership > 100
      ) {
        newErrors.representativeOwnership =
          "Ownership must be between 1 and 100.";
        hasError = true;
      }
    }

    this._errors = newErrors;
    return !hasError;
  }

  private _handleBusinessRepresentativeInput(
    e: Event,
    field: keyof BusinessRepresentative,
    subField?:
      | keyof BusinessRepresentative["legalName"]
      | keyof BusinessRepresentative["homeAddress"]
  ) {
    const target = e?.target as HTMLInputElement;
    const value = target?.value;

    if (field === "legalName" && subField) {
      (this._businessRepresentative.legalName as any)[subField] = value;
    } else if (field === "homeAddress" && subField) {
      (this._businessRepresentative.homeAddress as any)[subField] = value;
    } else if (field !== "legalName" && field !== "homeAddress") {
      this._businessRepresentative[field] = value;
    }
    this.requestUpdate("_businessRepresentative");
  }

  private _handleBusinessOwnerInput(
    e: Event,
    index: number,
    field: keyof BusinessOwner,
    subField?:
      | keyof BusinessOwner["legalName"]
      | keyof BusinessOwner["homeAddress"]
  ) {
    const target = e?.target as HTMLInputElement;
    const value = field === "percentOwnership" ? Number(target?.value) : target?.value;

    const newOwner = this._businessOwners[index];

    if (field === "legalName" && subField) {
      (newOwner.legalName as any)[subField] = value;
    } else if (field === "homeAddress" && subField) {
      (newOwner.homeAddress as any)[subField] = value;
    } else {
      (newOwner as any)[field] = value;
    }

    if (index === this._businessOwners.length) {
      this._businessOwners.push(newOwner);
    } else {
      this._businessOwners[index] = {
        ...this._businessOwners[index],
        ...newOwner,
      };
    }
    this.requestUpdate("_businessOwners");
  }

  private _addNewBusinessOwner() {
    this._businessOwners.push({
      legalName: { firstName: "", lastName: "" },
      emailAddress: "",
      contactNumber: "",
      jobTitle: "",
      dateOfBirth: "",
      homeAddress: {
        address: "",
        city: "",
        postalCode: "",
        country: "",
      },
      percentOwnership: 0,
    });
    this._collapseStateByIndex[this._businessOwners.length - 1] = false;
    this.requestUpdate("_businessOwners");
  }

  private _removeBusinessOwner(ownerToRemove: BusinessOwner) {
    this._businessOwners = this._businessOwners.filter(
      (owner) => owner !== ownerToRemove
    );
    this.requestUpdate("_businessOwners");
  }

  private _handleIsRepresentativeABusinessOwnerChange(e: Event) {
    this._isRepresentativeABusinessOwner = (
      e.target as HTMLInputElement
    ).checked;
    this.requestUpdate("_isRepresentativeABusinessOwner");
  }

  private _toggleOwnerCollapsed(index: number) {
    this._collapseStateByIndex[index] = !this._collapseStateByIndex[index];
    this.requestUpdate("_collapseStateByIndex");
  }

  private _renderError(message?: string) {
    if (!message) return nothing;
    return html`<div class="error-message">${message}</div>`;
  }

  private _renderBusinessRepresentative() {
    return html`
      <div class="form-section">
        <div
          class="collapsible-header"
          @click=${() => {
            this._isBusinessRepresentativeCollapsed =
              !this._isBusinessRepresentativeCollapsed;
            this.requestUpdate("_isBusinessRepresentativeCollapsed");
          }}
        >
          <h3>Business Representative</h3>
          <span class="icon"
            >${this._isBusinessRepresentativeCollapsed ? "▾" : "▸"}</span
          >
        </div>
        ${this._isBusinessRepresentativeCollapsed
          ? html`
              <p>
                Please provide details for the person who will act as the
                primary contact for this account.
              </p>
              <div class="form-grid">
                <div class="form-field">
                  <label for="rep-firstName">First Name</label>
                  <input
                    id="rep-firstName"
                    type="text"
                    class=${this._errors.businessRepresentative?.legalName
                      ?.firstName
                      ? "invalid"
                      : ""}
                    .value=${this._businessRepresentative.legalName.firstName}
                    @input=${(e: Event) =>
                      this._handleBusinessRepresentativeInput(
                        e,
                        "legalName",
                        "firstName"
                      )}
                  />
                  ${this._renderError(
                    this._errors.businessRepresentative?.legalName?.firstName
                  )}
                </div>
                <div class="form-field">
                  <label for="rep-lastName">Last Name</label>
                  <input
                    id="rep-lastName"
                    type="text"
                    class=${this._errors.businessRepresentative?.legalName
                      ?.lastName
                      ? "invalid"
                      : ""}
                    .value=${this._businessRepresentative.legalName.lastName}
                    @input=${(e: Event) =>
                      this._handleBusinessRepresentativeInput(
                        e,
                        "legalName",
                        "lastName"
                      )}
                  />
                  ${this._renderError(
                    this._errors.businessRepresentative?.legalName?.lastName
                  )}
                </div>
                <div class="form-field">
                  <label for="rep-email">Email Address</label>
                  <input
                    id="rep-email"
                    type="email"
                    class=${this._errors.businessRepresentative?.emailAddress
                      ? "invalid"
                      : ""}
                    .value=${this._businessRepresentative.emailAddress}
                    @input=${(e: Event) =>
                      this._handleBusinessRepresentativeInput(
                        e,
                        "emailAddress"
                      )}
                  />
                  ${this._renderError(
                    this._errors.businessRepresentative?.emailAddress
                  )}
                </div>
                <div class="form-field">
                  <label for="rep-dob">Date of Birth</label>
                  <input
                    id="rep-dob"
                    type="date"
                    class=${this._errors.businessRepresentative?.dateOfBirth
                      ? "invalid"
                      : ""}
                    .value=${this._businessRepresentative.dateOfBirth}
                    @input=${(e: Event) =>
                      this._handleBusinessRepresentativeInput(e, "dateOfBirth")}
                  />
                  ${this._renderError(
                    this._errors.businessRepresentative?.dateOfBirth
                  )}
                </div>
                <div class="form-field">
                  <label for="rep-jobTitle">Job Title</label>
                  <input
                    id="rep-jobTitle"
                    type="text"
                    .value=${this._businessRepresentative.jobTitle}
                    @input=${(e: Event) =>
                      this._handleBusinessRepresentativeInput(e, "jobTitle")}
                  />
                </div>
                <div class="form-field">
                  <label for="rep-contactNumber">Contact Number</label>
                  <input
                    id="rep-contactNumber"
                    type="tel"
                    .value=${this._businessRepresentative.contactNumber}
                    @input=${(e: Event) =>
                      this._handleBusinessRepresentativeInput(
                        e,
                        "contactNumber"
                      )}
                  />
                </div>
              </div>
              <h4 class="subsection-header">Home Address</h4>
              <div class="form-grid">
                <div class="form-field full-width">
                  <label for="rep-address">Address</label>
                  <input
                    id="rep-address"
                    type="text"
                    class=${this._errors.businessRepresentative?.homeAddress
                      ?.address
                      ? "invalid"
                      : ""}
                    .value=${this._businessRepresentative.homeAddress.address}
                    @input=${(e: Event) =>
                      this._handleBusinessRepresentativeInput(
                        e,
                        "homeAddress",
                        "address"
                      )}
                  />
                  ${this._renderError(
                    this._errors.businessRepresentative?.homeAddress?.address
                  )}
                </div>
                <div class="form-field">
                  <label for="rep-city">City</label>
                  <input
                    id="rep-city"
                    type="text"
                    class=${this._errors.businessRepresentative?.homeAddress
                      ?.city
                      ? "invalid"
                      : ""}
                    .value=${this._businessRepresentative.homeAddress.city}
                    @input=${(e: Event) =>
                      this._handleBusinessRepresentativeInput(
                        e,
                        "homeAddress",
                        "city"
                      )}
                  />
                  ${this._renderError(
                    this._errors.businessRepresentative?.homeAddress?.city
                  )}
                </div>
                <div class="form-field">
                  <label for="rep-postalCode">Postal Code</label>
                  <input
                    id="rep-postalCode"
                    type="text"
                    class=${this._errors.businessRepresentative?.homeAddress
                      ?.postalCode
                      ? "invalid"
                      : ""}
                    .value=${this._businessRepresentative.homeAddress
                      .postalCode}
                    @input=${(e: Event) =>
                      this._handleBusinessRepresentativeInput(
                        e,
                        "homeAddress",
                        "postalCode"
                      )}
                  />
                  ${this._renderError(
                    this._errors.businessRepresentative?.homeAddress?.postalCode
                  )}
                </div>
                <div class="form-field">
                  <label for="rep-country">Country</label>
                  <input
                    id="rep-country"
                    type="text"
                    class=${this._errors.businessRepresentative?.homeAddress
                      ?.country
                      ? "invalid"
                      : ""}
                    .value=${this._businessRepresentative.homeAddress.country}
                    @input=${(e: Event) =>
                      this._handleBusinessRepresentativeInput(
                        e,
                        "homeAddress",
                        "country"
                      )}
                  />
                  ${this._renderError(
                    this._errors.businessRepresentative?.homeAddress?.country
                  )}
                </div>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderBusinessOwner(owner: BusinessOwner, index: number) {
    return html`
      <div class="form-section">
        <div
          class="collapsible-header"
          @click=${() => this._toggleOwnerCollapsed(index)}
        >
          <h3>
            Business Owner:
            ${owner.legalName.firstName || owner.legalName.lastName
              ? `${owner.legalName.firstName} ${owner.legalName.lastName}`
              : "(new owner)"}
            (${owner.percentOwnership}% ownership)
          </h3>
          <span class="icon"
            >${this._collapseStateByIndex[index] ? "▸" : "▾"}</span
          >
        </div>
        ${!this._collapseStateByIndex[index]
          ? html`
              <div class="form-grid">
                <div class="form-field">
                  <label>First Name</label>
                  <input
                    type="text"
                    class=${this._errors.businessOwners[index]?.legalName
                      ?.firstName
                      ? "invalid"
                      : ""}
                    .value=${owner.legalName.firstName}
                    @input=${(e: Event) =>
                      this._handleBusinessOwnerInput(
                        e,
                        index,
                        "legalName",
                        "firstName"
                      )}
                  />
                  ${this._renderError(
                    this._errors.businessOwners[index]?.legalName?.firstName
                  )}
                </div>
                <div class="form-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    class=${this._errors.businessOwners[index]?.legalName
                      ?.lastName
                      ? "invalid"
                      : ""}
                    .value=${owner.legalName.lastName}
                    @input=${(e: Event) =>
                      this._handleBusinessOwnerInput(
                        e,
                        index,
                        "legalName",
                        "lastName"
                      )}
                  />
                  ${this._renderError(
                    this._errors.businessOwners[index]?.legalName?.lastName
                  )}
                </div>
                <div class="form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    class=${this._errors.businessOwners[index]?.emailAddress
                      ? "invalid"
                      : ""}
                    .value=${owner.emailAddress}
                    @input=${(e: Event) =>
                      this._handleBusinessOwnerInput(e, index, "emailAddress")}
                  />
                  ${this._renderError(
                    this._errors.businessOwners[index]?.emailAddress
                  )}
                </div>
                <div class="form-field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    class=${this._errors.businessOwners[index]?.dateOfBirth
                      ? "invalid"
                      : ""}
                    .value=${owner.dateOfBirth}
                    @input=${(e: Event) =>
                      this._handleBusinessOwnerInput(e, index, "dateOfBirth")}
                  />
                  ${this._renderError(
                    this._errors.businessOwners[index]?.dateOfBirth
                  )}
                </div>
                <div class="form-field">
                  <label>Job Title</label>
                  <input
                    type="text"
                    .value=${owner.jobTitle}
                    @input=${(e: Event) =>
                      this._handleBusinessOwnerInput(e, index, "jobTitle")}
                  />
                </div>
                <div class="form-field">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    .value=${owner.contactNumber}
                    @input=${(e: Event) =>
                      this._handleBusinessOwnerInput(e, index, "contactNumber")}
                  />
                </div>
                <div class="form-field">
                  <label>Ownership (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    class=${this._errors.businessOwners[index]?.percentOwnership
                      ? "invalid"
                      : ""}
                    .value=${owner.percentOwnership}
                    @input=${(e: Event) =>
                      this._handleBusinessOwnerInput(
                        e,
                        index,
                        "percentOwnership"
                      )}
                  />
                  ${this._renderError(
                    String(
                      this._errors.businessOwners[index]?.percentOwnership || ""
                    )
                  )}
                </div>
              </div>
              <h4 class="subsection-header">Home Address</h4>
              <div class="form-grid">
                <div class="form-field full-width">
                  <label>Address</label>
                  <input
                    type="text"
                    class=${this._errors.businessOwners[index]?.homeAddress
                      ?.address
                      ? "invalid"
                      : ""}
                    .value=${owner.homeAddress.address}
                    @input=${(e: Event) =>
                      this._handleBusinessOwnerInput(
                        e,
                        index,
                        "homeAddress",
                        "address"
                      )}
                  />
                  ${this._renderError(
                    this._errors.businessOwners[index]?.homeAddress?.address
                  )}
                </div>
                <div class="form-field">
                  <label>City</label>
                  <input
                    type="text"
                    class=${this._errors.businessOwners[index]?.homeAddress
                      ?.city
                      ? "invalid"
                      : ""}
                    .value=${owner.homeAddress.city}
                    @input=${(e: Event) =>
                      this._handleBusinessOwnerInput(
                        e,
                        index,
                        "homeAddress",
                        "city"
                      )}
                  />
                  ${this._renderError(
                    this._errors.businessOwners[index]?.homeAddress?.city
                  )}
                </div>
                <div class="form-field">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    class=${this._errors.businessOwners[index]?.homeAddress
                      ?.postalCode
                      ? "invalid"
                      : ""}
                    .value=${owner.homeAddress.postalCode}
                    @input=${(e: Event) =>
                      this._handleBusinessOwnerInput(
                        e,
                        index,
                        "homeAddress",
                        "postalCode"
                      )}
                  />
                  ${this._renderError(
                    this._errors.businessOwners[index]?.homeAddress?.postalCode
                  )}
                </div>
                <div class="form-field">
                  <label>Country</label>
                  <input
                    type="text"
                    class=${this._errors.businessOwners[index]?.homeAddress
                      ?.country
                      ? "invalid"
                      : ""}
                    .value=${owner.homeAddress.country}
                    @input=${(e: Event) =>
                      this._handleBusinessOwnerInput(
                        e,
                        index,
                        "homeAddress",
                        "country"
                      )}
                  />
                  ${this._renderError(
                    this._errors.businessOwners[index]?.homeAddress?.country
                  )}
                </div>
              </div>
              <div class="button-group" style="justify-content: flex-end;">
                <button
                  type="button"
                  class="remove-button"
                  @click=${() => this._removeBusinessOwner(owner)}
                >
                  Remove Owner
                </button>
              </div>
            `
          : nothing}
      </div>
    `;
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

        <form>
          ${this._renderBusinessRepresentative()}

          <div class="form-section">
            <h3>Business Owners</h3>
            <p>
              Please list all individuals who own 25% or more of the company.
            </p>
            <div class="checkbox-field">
              <label for="is-rep-owner"
                >Is the Business Representative also a Business Owner?</label
              >
              <input
                id="is-rep-owner"
                type="checkbox"
                .checked=${this._isRepresentativeABusinessOwner}
                @change=${(e: Event) => {
                  this._handleIsRepresentativeABusinessOwnerChange(e);
                }}
              />
            </div>

            ${this._isRepresentativeABusinessOwner
              ? html`
                  <div
                    class="form-field"
                    style="max-width: 240px; margin-top: 1rem;"
                  >
                    <label for="rep-ownership"
                      >Business Representative Ownership (%)</label
                    >
                    <input
                      id="rep-ownership"
                      type="number"
                      min="0"
                      max="100"
                      class=${this._errors.representativeOwnership
                        ? "invalid"
                        : ""}
                      .value=${this._businessRepresentativeOwnership}
                      @input=${(e: Event) => {
                        this._businessRepresentativeOwnership = Number(
                          (e.target as HTMLInputElement).value
                        );
                      }}
                    />
                    ${this._renderError(this._errors.representativeOwnership)}
                  </div>
                `
              : nothing}
          </div>

          ${this._businessOwners.map((owner, index) =>
            this._renderBusinessOwner(owner, index)
          )}

          <div class="button-group">
            <button
              type="button"
              class="confirm-button"
              @click=${this._addNewBusinessOwner}
            >
              Add Business Owner
            </button>
          </div>
        </form>
      </div>
    `;
  }
}
