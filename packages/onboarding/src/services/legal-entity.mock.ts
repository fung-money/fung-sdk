import { LegalEntity } from "../models/legal-entity.js";

export const legalEntityMock: LegalEntity = {
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
  businessRepresentative: {
    legalName: {
      firstName: "John",
      lastName: "Doe",
    },
    dateOfBirth: "1990-01-01",
    jobTitle: "CEO",
    emailAddress: "john.doe@example.com",
    contactNumber: "+447123456789",
    homeAddress: {
      address: "123 Fake St",
      city: "London",
      postalCode: "E1 6AN",
      country: "United Kingdom",
    },
  },
  businessOwners: [
    {
      legalName: {
        firstName: "John",
        lastName: "Doe",
      },
      dateOfBirth: "1990-01-01",
      jobTitle: "CEO",
      emailAddress: "john.doe@example.com",
      contactNumber: "+447123456789",
      homeAddress: {
        address: "123 Fake St",
        city: "London",
        postalCode: "E1 6AN",
        country: "United Kingdom",
      },
      percentOwnership: 50,
    },
  ],
};
