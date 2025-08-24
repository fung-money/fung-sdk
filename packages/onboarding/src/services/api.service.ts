import { LegalEntitySection } from "../models/legal-entity-section.js";
import { BusinessDetails } from "../models/business-details.js";
import { BusinessActivity } from "../models/business-activity.js";
import { BusinessRepresentative } from "../models/business-representative.js";
import { BusinessOwners } from "../models/business-owners.js";
import { LegalEntity } from "../models/legal-entity.js";
import { legalEntityMock } from "./legal-entity.mock.js";

export class ApiService {
  private apiKey: string;

  private apiSecret: string;

  private baseUrl: string;

  private isMocked: boolean;

  constructor(
    apiKey: string,
    apiSecret: string,
    baseUrl: string,
    isMocked?: boolean
  ) {
    if (!apiKey) {
      throw new Error("API key is required to use the ApiService.");
    }
    if (!apiSecret) {
      throw new Error("API secret is required to use the ApiService.");
    }
    if (!baseUrl) {
      throw new Error("Base URL is required to use the ApiService.");
    }

    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = baseUrl;
    this.isMocked = !!isMocked;

    console.debug("ApiService initialized");
  }

  public async initiateOnboarding(
    accountId: string,
    userId: string,
    organizationName: string,
    country: string
  ): Promise<void> {
    console.debug(`Initiating onboarding for account ${accountId}`);

    if (this.isMocked) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.debug("Initiated onboarding");

      return;
    }

    try {
      const basicAuth = btoa(`${this.apiKey}:${this.apiSecret}`);

      const response = await fetch(
        `${this.baseUrl}/legal-onboarding/initiateOnboarding`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId,
            userId,
            organizationName,
            country,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to retrieve legal entity details: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.statusCode >= 400) {
        throw new Error(
          data.details.message?.[0] || "Failed to initiate onboarding"
        );
      }

      console.debug("Initiated onboarding");
    } catch (error) {
      console.error("Error initiating onboarding");
      throw error;
    }
  }

  public async getLegalEntityDetailsByAccountId(
    accountId: string
  ): Promise<LegalEntity> {
    console.debug(`Retrieving legal entity details for account ${accountId}`);

    if (this.isMocked) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.debug("Retrieved legal entity details", legalEntityMock);

      return legalEntityMock;
    }

    try {
      const basicAuth = btoa(`${this.apiKey}:${this.apiSecret}`);

      const response = await fetch(
        `${this.baseUrl}/legal-entity/getLegalEntityDetailsByAccountId/${accountId}`,
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to retrieve legal entity details: ${response.statusText}`
        );
      }

      const data = await response.json();

      console.debug("Retrieved legal entity details", data);

      return data;
    } catch (error) {
      console.error("Error retrieving legal entity details", error);
      throw error;
    }
  }

  public async saveLegalData(
    accountId: string,
    type: LegalEntitySection,
    data:
      | BusinessDetails
      | BusinessActivity
      | BusinessRepresentative
      | BusinessOwners
  ): Promise<void> {
    console.debug(`Submitting section ${type} with data:`, data);
    if (this.isMocked) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.debug("Mocked saveLegalData complete");
      return;
    }
    try {
      const basicAuth = btoa(`${this.apiKey}:${this.apiSecret}`);
      const response = await fetch(
        `${this.baseUrl}/legal-onboarding/submitLegalData`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accountId, type, data }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to save legal data: ${response.status}`);
      }
      if (response.status >= 400) {
        throw new Error(`Failed to save legal data: ${response.status}`);
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (error) {
        // silent error
      }

      if (responseData?.statusCode >= 400) {
        throw new Error(
          responseData.details.message?.[0] || "Failed to save legal data"
        );
      }

      console.debug("Successfully saved legal data");
    } catch (error) {
      console.error("Error saving legal data");
      throw error;
    }
  }

  public async getBusinessRegistersData(
    country: string,
    businessRegistrationNumber: string
  ): Promise<{
    businessDetails: BusinessDetails;
    businessActivity: BusinessActivity;
  }> {
    console.debug(
      `Looking up company ${businessRegistrationNumber} in ${country}...`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      businessDetails: legalEntityMock.businessDetails,
      businessActivity: legalEntityMock.businessActivity,
    };
  }

  public async searchBusiness(partialBusinessName: string): Promise<string[]> {
    console.debug(
      `Searching for companies with partial name: ${partialBusinessName}`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return ["Test Company - 123123123", "Test Company 2 - 123123123"];
  }

  public async submitOnboardingApplication(
    accountId: string
  ): Promise<LegalEntity> {
    console.debug(`Submitting application for account ${accountId}`);
    if (this.isMocked) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return legalEntityMock;
    }
    try {
      const basicAuth = btoa(`${this.apiKey}:${this.apiSecret}`);
      const response = await fetch(
        `${
          this.baseUrl
        }/legal-onboarding/submitOnboardingApplication?accountId=${encodeURIComponent(
          accountId
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to submit onboarding application: ${response.status}`
        );
      }
      const data = await response.json();
      console.debug("Successfully submitted onboarding application", data);
      return data;
    } catch (error) {
      console.error("Error submitting onboarding application", error);
      throw error;
    }
  }
}
