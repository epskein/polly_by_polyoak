export interface IODReview {
  reviewDate: string;
  actionCompletionDate: string;
  daysToReview: number;
  stopPress: boolean;
  category: "MTC" | "FAC" | "LTI" | "RWC";
  unsafeCondition: "environment" | "act";
  reviewStatus:
    | "COMPLETED"
    | "INVESTIGATION NOT DONE"
    | "INVESTIGATION DONE - ACTION REQUIRED"
    | "RE-OPENED NCQR/COID"
    | "UNDER REVIEW"
    | "NEW";
  updatedAt: string;
}

export interface IODIncident {
  id: string;
  employeeName: string;
  ncqrNo: number;
  injuryDetails: string;
  injuredBodyPart: string;
  department: string;
  division: string;
  incidentNo: number;
  incidentDate: string;
  createdAt: string;
  employeeBookedOff: boolean;
  returnToWorkDate?: string;
  daysBookedOff?: number;
  review: IODReview;
} 