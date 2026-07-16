import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector } from '@/store/store';
import type { SMETemplate, SMETemplateSaveResult } from '../settingsApiCalls';

export interface DescriptionMappingFormValues {
  error_type_id: number | '';
  issues_related_to_id: number | '';
  issue_description_id: number | '';
  description_id: string;
}

interface DescriptionMappingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    error_type_id: number;
    issues_related_to_id: number;
    issue_description_id: number;
    description_id?: string | null;
  }) => Promise<SMETemplateSaveResult> | SMETemplateSaveResult;
  editingMapping: SMETemplate | null;
}

const validationSchema = yup.object({
  error_type_id: yup
    .mixed<number | ''>()
    .required('Error type is required')
    .test('valid-id', 'Please select an error type', v => typeof v === 'number' && v >= 1),
  issues_related_to_id: yup
    .mixed<number | ''>()
    .required('Issue related to is required')
    .test('valid-id', 'Please select issue related to', v => typeof v === 'number' && v >= 1),
  issue_description_id: yup
    .mixed<number | ''>()
    .required('Issue description is required')
    .test('valid-id', 'Please select an issue description', v => typeof v === 'number' && v >= 1),
  description_id: yup.string().max(50, 'Description ID must be 50 characters or less'),
});

const DescriptionMappingDialog: React.FC<DescriptionMappingDialogProps> = ({ isOpen, onClose, onSave, editingMapping }) => {
  const { errorTypes, issueRelatedTo, issueDescriptions } = useAppSelector(state => state.smeConfig);
  const errorTypeOptions = errorTypes.filter((et): et is typeof et & { id: number } => et.id != null);
  const issueRelatedToOptions = issueRelatedTo.filter((irt): irt is typeof irt & { id: number } => irt.id != null);
  const issueDescriptionOptions = issueDescriptions.filter((d): d is typeof d & { id: number } => d.id != null);

  const formik = useFormik<DescriptionMappingFormValues>({
    initialValues: editingMapping
      ? {
          error_type_id: editingMapping.error_type_id ?? '',
          issues_related_to_id: editingMapping.issues_related_to_id ?? '',
          issue_description_id: editingMapping.issue_description_id ?? '',
          description_id: editingMapping.description_id ?? '',
        }
      : { error_type_id: '', issues_related_to_id: '', issue_description_id: '', description_id: '' },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      if (
        typeof values.error_type_id === 'number' &&
        typeof values.issues_related_to_id === 'number' &&
        typeof values.issue_description_id === 'number'
      ) {
        const descriptionId = values.description_id.trim();
        const result = await onSave({
          error_type_id: values.error_type_id,
          issues_related_to_id: values.issues_related_to_id,
          issue_description_id: values.issue_description_id,
          ...(descriptionId ? { description_id: descriptionId } : {}),
        });
        if (result?.template) {
          formik.resetForm();
        }
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const setId = (field: keyof DescriptionMappingFormValues) => (value: string) => {
    if (!value) {
      formik.setFieldValue(field, '');
      return;
    }
    const num = parseInt(value, 10);
    formik.setFieldValue(field, Number.isNaN(num) ? '' : num);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent aria-describedby="" className="max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle>{editingMapping ? 'Edit Description Mapping' : 'Add Description Mapping'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="min-w-0 space-y-4 py-4">
          <div className="min-w-0">
            <Label htmlFor="error-type">Error Type *</Label>
            <Select
              value={formik.values.error_type_id === '' ? '' : String(formik.values.error_type_id)}
              onValueChange={setId('error_type_id')}
            >
              <SelectTrigger id="error-type" className="mt-1 w-full max-w-full min-w-0">
                <SelectValue placeholder="Select error type" />
              </SelectTrigger>
              <SelectContent>
                {errorTypeOptions.map(et => (
                  <SelectItem key={et.id} value={String(et.id)}>
                    {et.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.submitCount > 0 && formik.errors.error_type_id && (
              <p className="mt-1 text-xs text-red-600">{formik.errors.error_type_id}</p>
            )}
          </div>
          <div className="min-w-0">
            <Label htmlFor="issue-related-to">Issue Related To *</Label>
            <Select
              value={formik.values.issues_related_to_id === '' ? '' : String(formik.values.issues_related_to_id)}
              onValueChange={setId('issues_related_to_id')}
            >
              <SelectTrigger id="issue-related-to" className="mt-1 w-full max-w-full min-w-0">
                <SelectValue placeholder="Select issue related to" />
              </SelectTrigger>
              <SelectContent>
                {issueRelatedToOptions.map(irt => (
                  <SelectItem key={irt.id} value={String(irt.id)}>
                    {irt.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.submitCount > 0 && formik.errors.issues_related_to_id && (
              <p className="mt-1 text-xs text-red-600">{formik.errors.issues_related_to_id}</p>
            )}
          </div>
          <div className="min-w-0">
            <Label htmlFor="issue-description">Issue Description *</Label>
            <Select
              value={formik.values.issue_description_id === '' ? '' : String(formik.values.issue_description_id)}
              onValueChange={setId('issue_description_id')}
            >
              <SelectTrigger id="issue-description" className="mt-1 w-full max-w-full min-w-0">
                <SelectValue placeholder="Select issue description" />
              </SelectTrigger>
              <SelectContent className="max-w-lg">
                {issueDescriptionOptions.map(d => (
                  <SelectItem
                    key={d.id}
                    value={String(d.id)}
                    className="py-2.5 pr-8 break-words whitespace-normal [&>span]:block [&>span]:whitespace-normal"
                  >
                    {d.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.submitCount > 0 && formik.errors.issue_description_id && (
              <p className="mt-1 text-xs text-red-600">{formik.errors.issue_description_id}</p>
            )}
          </div>
          <div className="min-w-0">
            <Label htmlFor="description-id">description_id</Label>
            <Input
              id="description-id"
              value={formik.values.description_id}
              onChange={e => formik.setFieldValue('description_id', e.target.value)}
              onBlur={formik.handleBlur}
              placeholder="e.g. sub_1"
              maxLength={50}
            />

            {formik.submitCount > 0 && formik.errors.description_id && (
              <p className="mt-1 text-xs text-red-600">{formik.errors.description_id}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-light text-primary border-0" disabled={formik.isSubmitting}>
              <Save className="h-4 w-4" />
              {formik.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DescriptionMappingDialog;
