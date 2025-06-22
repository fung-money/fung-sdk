import { LegalEntitySection } from "../models/legal-entity-section.js";
import { BusinessDetails } from "../models/business-details.js";
import { BusinessActivity } from "../models/business-activity.js";
import { BusinessRepresentative } from "../models/business-representative.js";
import { BusinessOwners } from "../models/business-owners.js";

export class ApiService {
  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string,
    private readonly baseUrl: string,
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

    console.debug("ApiService initialized");
  }

  public async saveLegalData(
    type: LegalEntitySection,
    data:
    | BusinessDetails
    | BusinessActivity
    | BusinessRepresentative
    | BusinessOwners,
  ): Promise<void> {
    console.debug(`Submitting section ${type} with data:`, data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  public async getBusinessRegistersData(
    country: string,
    businessRegistrationNumber: string,
  ): Promise<{
      businessDetails: BusinessDetails;
      businessActivity: BusinessActivity;
    }> {
    console.debug(
      `Looking up company ${businessRegistrationNumber} in ${country}...`,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      businessDetails: {
        businessName: "Test Company",
        businessCountry: "United Kingdom",
        businessType: "Limited Company",
        companyRegistrationNumber: "12345678",
        vatNumber: "GB123456789",
        tinNumber: "987654321",
        registeredBusinessAddress: {
          address: "123 Fake St",
          city: "London",
          postalCode: "E1 6AN",
          country: "United Kingdom",
        },
      },
      businessActivity: {
        website: "https://www.testcompany.com",
        industry: "Technology",
        explainProducts: "We make software for businesses.",
        deliveryTime: "1 week",
        estimatedMonthlyRevenue: "100000",
      },
    };
  }

  public async searchBusiness(partialBusinessName: string): Promise<string[]> {
    console.debug(
      `Searching for companies with partial name: ${partialBusinessName}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [
      "Test Company - 123123123",
      "Test Company 2 - 123123123",
    ];
  }
}
