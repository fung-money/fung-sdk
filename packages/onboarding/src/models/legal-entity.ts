import { BusinessActivity } from "./business-activity.js";
import { BusinessDetails } from "./business-details.js";
import { BusinessOwner } from "./business-owners.js";
import { BusinessRepresentative } from "./business-representative.js";

export interface LegalEntity {
  businessDetails: BusinessDetails;
  businessActivity: BusinessActivity;
  businessRepresentative: BusinessRepresentative;
  businessOwners: BusinessOwner[];
}
