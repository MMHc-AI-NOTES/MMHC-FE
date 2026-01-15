import { useFormik } from 'formik';
import * as yup from 'yup';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Save, CircleHelp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppSelector } from '@/store/store';
import { getMergedErrorTypes, getMergedIssueRelatedTo, getMergedIssueDescriptions } from '@/constants/common';

export interface IssueFormValues {
  reviewerName: string;
  errorType: string;
  issueRelatedTo: string;
  issueDescription: string;
}

// Validation schema factory (reviewerName is optional if hidden)
const createIssueValidationSchema = (requireReviewer: boolean) =>
  yup.object({
    reviewerName: requireReviewer
      ? yup.string().required('Reviewer name is required').notOneOf(['none', ''], 'Please select a reviewer')
      : yup.string(),
    errorType: yup.string().required('Error type is required'),
    issueRelatedTo: yup.string().required('Issue related to is required'),
    issueDescription: yup.string().required('Issue description is required'),
  });

interface IssueFormCardProps {
  issue: {
    id: string;
    reviewerName: string;
    errorType: string;
    issueRelatedTo: string;
    issueDescription: string;
  };
  index: number;
  onSave: (values: IssueFormValues) => void;
  onCancelEdit?: () => void;
  isSaving?: boolean;
  isEditMode?: boolean;
  hideReviewerField?: boolean;
}

const IssueFormCard = ({ issue, onSave, onCancelEdit, isSaving = false, hideReviewerField = false }: IssueFormCardProps) => {
  const { practitioners } = useAppSelector(state => state.filterOptions);

  const formik = useFormik<IssueFormValues>({
    initialValues: {
      reviewerName: issue.reviewerName || '',
      errorType: issue.errorType || '',
      issueRelatedTo: issue.issueRelatedTo || '',
      issueDescription: issue.issueDescription || '',
    },
    validationSchema: createIssueValidationSchema(!hideReviewerField),
    enableReinitialize: true,
    onSubmit: async values => {
      await onSave(values);
    },
  });

  const mergedErrorTypes = getMergedErrorTypes();
  const mergedIssueRelatedTo = getMergedIssueRelatedTo();
  const errorTypeLabel = mergedErrorTypes.find(type => type.value === formik.values.errorType)?.label || '';
  const issueRelatedToLabel = mergedIssueRelatedTo.find(opt => opt.id === formik.values.issueRelatedTo)?.name || '';

  return (
    <Card className="p-0 shadow-none">
      <CardContent className="space-y-4 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {formik.values.errorType && (
              <Badge
                className={`px-2 py-0.5 text-xs font-semibold text-white ${
                  formik.values.errorType === 'critical'
                    ? 'bg-gradient-red'
                    : formik.values.errorType === 'moderate'
                      ? 'bg-gradient-severity-moderate'
                      : 'bg-gradient-severity-minor'
                }`}
              >
                {errorTypeLabel}
              </Badge>
            )}
            {formik.values.issueRelatedTo && (
              <Badge className="bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">{issueRelatedToLabel}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onCancelEdit}>
            <X />
          </Button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Reviewer Name Field - Hidden if hideReviewerField is true */}
          {!hideReviewerField && (
            <div className="w-full">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-700">
                  Reviewer Name <span className="text-red-500">*</span>
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleHelp className="h-4 w-4 cursor-help text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Your name is required when overriding or escalating an AI decision. This will be logged in the audit history for
                        accountability.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={formik.values.reviewerName} onValueChange={value => formik.setFieldValue('reviewerName', value)}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="Select a reviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a reviewer</SelectItem>
                  {practitioners.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.reviewerName && formik.errors.reviewerName && (
                <p className="mt-1 text-xs text-red-600">{formik.errors.reviewerName}</p>
              )}
            </div>
          )}

          {/* Error Type Field */}
          <div className="space-y-2">
            <Label htmlFor={`errorType-${issue.id}`} className="text-sm font-medium">
              Error type <span className="text-red-500">*</span>
            </Label>
            <Select value={formik.values.errorType} onValueChange={value => formik.setFieldValue('errorType', value)}>
              <SelectTrigger className="w-full" id={`errorType-${issue.id}`}>
                <SelectValue placeholder="Select error type" />
              </SelectTrigger>
              <SelectContent>
                {mergedErrorTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.errorType && formik.errors.errorType && <p className="text-xs text-red-600">{formik.errors.errorType}</p>}
          </div>

          {/* Issue Related To Field */}
          <div className="space-y-2">
            <Label htmlFor={`issueRelatedTo-${issue.id}`} className="text-sm font-medium">
              Issue related to <span className="text-red-500">*</span>
            </Label>
            <Select value={formik.values.issueRelatedTo} onValueChange={value => formik.setFieldValue('issueRelatedTo', value)}>
              <SelectTrigger className="w-full" id={`issueRelatedTo-${issue.id}`}>
                <SelectValue placeholder="Find an option" />
              </SelectTrigger>
              <SelectContent>
                {mergedIssueRelatedTo.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.id}: {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.issueRelatedTo && formik.errors.issueRelatedTo && (
              <p className="text-xs text-red-600">{formik.errors.issueRelatedTo}</p>
            )}
          </div>

          {/* Issue Description Field */}
          <div className="space-y-2">
            <Label htmlFor={`issueDescription-${issue.id}`} className="text-sm font-medium">
              Issue description <span className="text-red-500">*</span>
            </Label>
            <Select value={formik.values.issueDescription} onValueChange={value => formik.setFieldValue('issueDescription', value)}>
              <SelectTrigger className="w-full" id={`issueDescription-${issue.id}`}>
                <SelectValue placeholder="Select issue description" className="line-clamp-2" />
              </SelectTrigger>
              <SelectContent className="max-w-lg">
                {getMergedIssueDescriptions().map((description, idx) => (
                  <SelectItem
                    key={idx}
                    value={description}
                    className="py-2.5 pr-8 break-words whitespace-normal [&>span]:block [&>span]:whitespace-normal"
                  >
                    {description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.issueDescription && formik.errors.issueDescription && (
              <p className="text-xs text-red-600">{formik.errors.issueDescription}</p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-2">
            <Button variant="outline" onClick={onCancelEdit}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-light text-primary border-0 shadow-sm" disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IssueFormCard;
