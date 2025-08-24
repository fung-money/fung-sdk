import { HomeAddress } from "./home-address.js";
import { LegalName } from "./legal-name.js";

export interface BusinessOwner {
  legalName: LegalName;
  emailAddress: string;
  contactNumber: string;
  jobTitle: string;
  dateOfBirth: string;
  homeAddress: HomeAddress;
  percentOwnership: number;
}

export interface BusinessOwners {
  businessOwners: BusinessOwner[];
}
