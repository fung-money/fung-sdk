import { LegalName } from "./legal-name.js";
import { HomeAddress } from "./home-address.js";

export interface BusinessRepresentative {
  legalName: LegalName;
  emailAddress: string;
  contactNumber: string;
  dateOfBirth: string;
  jobTitle: string;
  homeAddress: HomeAddress;
}
