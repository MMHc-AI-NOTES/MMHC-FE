import { IssueFormValues as LocalIssueFormValues } from '../IssueFormCard';

export interface IssueForm extends Omit<LocalIssueFormValues, 'reviewerName'> {
  id: string;
  _smeIssueId?: number; // Original SME issue ID for version issues
  _isVersionIssue?: boolean; // Flag to identify version issues
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  issues: IssueForm[];
}

export interface ActiveIssueForm {
  reviewId: string;
  issueId: string;
}
