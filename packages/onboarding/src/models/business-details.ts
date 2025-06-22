import { RegisteredBusinessAddress } from './registered-business-address.js';

export interface BusinessDetails {
  businessName: string;
  businessCountry: string;
  businessType: string;
  companyRegistrationNumber: string;
  businessTradeName?: string;
  vatNumber: string;
  tinNumber: string;
  registeredBusinessAddress: RegisteredBusinessAddress;
} 