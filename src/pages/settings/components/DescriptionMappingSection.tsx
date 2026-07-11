import React, { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/store/store';
import { useDispatch } from 'react-redux';
import {
  addSMETemplate,
  updateSMETemplate,
  deleteSMETemplateSlice,
  type ErrorType,
  type IssueRelatedTo,
  type SMETemplate,
} from '@/store/slices/smeConfigSlice';
import {
  createSMETemplate,
  updateSMETemplate as updateSMETemplateAPI,
  deleteSMETemplate,
  type SMETemplateSaveResult,
} from '../settingsApiCalls';
import DescriptionMappingDialog from './DescriptionMappingDialog';
import ConfirmationDialog from '@/shared/ConfirmationDialog';

const DescriptionMappingSection: React.FC = () => {
  const dispatch = useDispatch();
  const { errorTypes, issueRelatedTo, issueDescriptions, smeTemplates } = useAppSelector(state => state.smeConfig);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingMapping, setEditingMapping] = useState<SMETemplate | null>(null);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<number | null>(null);

  const errorTypeById = useMemo(
    () => new Map<number, ErrorType>(errorTypes.map(errorType => [errorType.id ?? 0, errorType])),
    [errorTypes],
  );
  const issueRelatedToById = useMemo(
    () => new Map<number, IssueRelatedTo>(issueRelatedTo.map(issue => [issue.id ?? 0, issue])),
    [issueRelatedTo],
  );

  const handleAdd = () => {
    setEditingMapping(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (m: SMETemplate) => {
    setEditingMapping(m);
    setIsDialogOpen(true);
  };

  const handleSave = async (payload: {
    error_type_id: number;
    issues_related_to_id: number;
    issue_description_id: number;
    description_id?: string | null;
  }): Promise<SMETemplateSaveResult> => {
    try {
      if (editingMapping?.id) {
        const result = await updateSMETemplateAPI(editingMapping.id, payload);
        if (result.template) {
          dispatch(updateSMETemplate(result.template));
          setIsDialogOpen(false);
        }
        return result;
      } else {
        const result = await createSMETemplate(payload);
        if (result.template) {
          dispatch(addSMETemplate(result.template));
          setIsDialogOpen(false);
        }
        return result;
      }
    } catch (error) {
      console.error('Error saving description mapping:', error);
      return { template: null, errorMessage: 'Failed to save description mapping.' };
    }
  };

  const handleDeleteClick = (id: number) => {
    setSelectedIdToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedIdToDelete) return;
    setIsDeleting(true);
    try {
      const success = await deleteSMETemplate(selectedIdToDelete);
      if (!success) {
        setIsDeleting(false);
        return;
      }
      dispatch(deleteSMETemplateSlice(selectedIdToDelete));
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedIdToDelete(null);
    } catch (error) {
      console.error('Error deleting description mapping:', error);
      setIsDeleting(false);
    }
  };

  const display = useCallback(
    (m: SMETemplate) => {
      const et = errorTypeById.get(m.error_type_id);
      const irt = issueRelatedToById.get(m.issues_related_to_id);
      const id_ = issueDescriptions.find(d => d.id === m.issue_description_id);
      return {
        errorType: et?.displayName ?? `ID ${m.error_type_id}`,
        issueRelatedTo: irt?.displayName ?? `ID ${m.issues_related_to_id}`,
        errorTypePoints: et?.points ?? Number.POSITIVE_INFINITY,
        descriptionId: m.description_id ?? '—',
        issueDescription: id_?.description ?? `ID ${m.issue_description_id}`,
      };
    },
    [errorTypeById, issueDescriptions, issueRelatedToById],
  );

  const toDelete = selectedIdToDelete ? smeTemplates.find(t => t.id === selectedIdToDelete) : null;
  const deleteLabel = toDelete ? display(toDelete).issueDescription : '';
  const sortedMappings = useMemo(
    () =>
      [...smeTemplates].sort((a, b) => {
        const aDisplay = display(a);
        const bDisplay = display(b);

        const issueRelatedToCompare = aDisplay.issueRelatedTo.localeCompare(bDisplay.issueRelatedTo, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
        if (issueRelatedToCompare !== 0) return issueRelatedToCompare;

        if (aDisplay.errorTypePoints !== bDisplay.errorTypePoints) {
          return aDisplay.errorTypePoints - bDisplay.errorTypePoints;
        }

        const descriptionIdCompare = aDisplay.descriptionId.localeCompare(bDisplay.descriptionId, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
        if (descriptionIdCompare !== 0) return descriptionIdCompare;

        return aDisplay.errorType.localeCompare(bDisplay.errorType, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }),
    [display, smeTemplates],
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <CardTitle className="text-primary text-lg font-semibold">Description Mapping</CardTitle>
            <Button onClick={handleAdd} className="bg-gradient-light text-primary border-0 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Mapping
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-y">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-3 text-left">Error Type</TableHead>
                    <TableHead className="pl-3 text-left">Issue Related To</TableHead>
                    <TableHead className="pl-3 text-left">description_id</TableHead>
                    <TableHead className="pl-3 text-left">Issue Description</TableHead>
                    <TableHead className="w-[15%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {smeTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                        No data
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedMappings.map(m => {
                      const d = display(m);
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="text-left">{d.errorType}</TableCell>
                          <TableCell className="text-left">{d.issueRelatedTo}</TableCell>
                          <TableCell className="text-left">{d.descriptionId}</TableCell>
                          <TableCell className="max-w-[320px] truncate text-left">{d.issueDescription}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(m)} className="h-8 w-8 p-0">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(m.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <DescriptionMappingDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        editingMapping={editingMapping}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        isLoading={isDeleting}
        onOpenChange={open => {
          setIsDeleteDialogOpen(open);
          if (!open) setSelectedIdToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Description Mapping"
        description={
          selectedIdToDelete
            ? `Are you sure you want to delete this mapping? This action cannot be undone.${deleteLabel ? `\n\n"${deleteLabel.length > 100 ? deleteLabel.slice(0, 100) + '...' : deleteLabel}"` : ''}`
            : 'Are you sure you want to delete this mapping? This action cannot be undone.'
        }
        confirmButtonText="Delete"
      />
    </>
  );
};

export default DescriptionMappingSection;
