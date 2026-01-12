import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ERROR_TYPES } from '@/constants/common';
import { ErrorType, saveErrorTypes } from '@/types/smeConfig';
import { showToast } from '@/lib/toast';
import ErrorTypeDialog from './ErrorTypeDialog';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
// import { createSMEErrorType, updateSMEErrorType, deleteSMEErrorType } from '../settingsApiCalls';

interface ErrorTypesSectionProps {
  errorTypes: ErrorType[];
  onUpdate: (errorTypes: ErrorType[]) => void;
}

const ErrorTypesSection: React.FC<ErrorTypesSectionProps> = ({ errorTypes, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingErrorType, setEditingErrorType] = useState<ErrorType | null>(null);
  const [selectedValueToDelete, setSelectedValueToDelete] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingErrorType(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (errorType: ErrorType) => {
    setEditingErrorType(errorType);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: ErrorType) => {
    // Check if value already exists (for new items)
    if (!editingErrorType && errorTypes.some(et => et.value === formData.value)) {
      showToast.error('Error type with this value already exists');
      return;
    }

    try {
      // TODO: Uncomment when APIs are ready
      // let updated: ErrorType[];
      // if (editingErrorType) {
      //   const result = await updateSMEErrorType(editingErrorType.value, formData);
      //   if (!result) return;
      //   updated = errorTypes.map(et => (et.value === editingErrorType.value ? result : et));
      // } else {
      //   const result = await createSMEErrorType(formData);
      //   if (!result) return;
      //   updated = [...errorTypes, result];
      // }
      // onUpdate(updated);

      // Using localStorage for now
      let updated: ErrorType[];
      if (editingErrorType) {
        updated = errorTypes.map(et => (et.value === editingErrorType.value ? formData : et));
      } else {
        updated = [...errorTypes, formData];
      }
      saveErrorTypes(updated);
      onUpdate(updated);
      setIsDialogOpen(false);
      setEditingErrorType(null);
      showToast.success(editingErrorType ? 'Error type updated successfully' : 'Error type added successfully');
    } catch (error) {
      console.error('Error saving error type:', error);
      showToast.error('Failed to save error type');
    }
  };

  const handleDeleteClick = (value: string) => {
    setSelectedValueToDelete(value);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedValueToDelete) return;

    setIsDeleting(true);
    try {
      // TODO: Uncomment when APIs are ready
      // const success = await deleteSMEErrorType(selectedValueToDelete);
      // if (!success) {
      //   setIsDeleting(false);
      //   return;
      // }
      // onUpdate(errorTypes.filter(et => et.value !== selectedValueToDelete));

      // Using localStorage for now
      const updated = errorTypes.filter(et => et.value !== selectedValueToDelete);
      saveErrorTypes(updated);
      onUpdate(updated);
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedValueToDelete(null);
      showToast.success('Error type deleted successfully');
    } catch (error) {
      console.error('Error deleting error type:', error);
      showToast.error('Failed to delete error type');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <CardTitle className="text-primary text-lg font-semibold">Error Types</CardTitle>
            <Button onClick={handleAdd} className="bg-gradient-light text-primary border-0 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Error Type
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div>
            <Card className="mx-4 gap-4 px-4 text-sm text-gray-600">
              <p className="font-semibold">Default Error Types:</p>
              <div className="space-y-2">
                {ERROR_TYPES.map(type => (
                  <div key={type.value} className="flex items-center gap-2 text-xs">
                    <span className="font-medium">{type.label}</span>
                    <span className="text-gray-500">({type.points} pts)</span>
                  </div>
                ))}
              </div>
            </Card>

            {errorTypes.length > 0 && (
              <div>
                <p className="my-2 px-4 text-sm font-semibold">Custom Error Types:</p>
                <div className="border-y">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Value</TableHead>
                          <TableHead>Label</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {errorTypes.map(errorType => (
                          <TableRow key={errorType.value}>
                            <TableCell>{errorType.value}</TableCell>
                            <TableCell>{errorType.label}</TableCell>
                            <TableCell>{errorType.points}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(errorType)} className="h-8 w-8 p-0">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(errorType.value)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
            {errorTypes.length === 0 && <p className="py-4 text-center text-sm text-gray-500">No custom error types added yet.</p>}
          </div>
        </CardContent>
      </Card>

      <ErrorTypeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        editingErrorType={editingErrorType}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        isLoading={isDeleting}
        onOpenChange={open => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setSelectedValueToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Error Type"
        description={
          selectedValueToDelete
            ? `Are you sure you want to delete the error type "${errorTypes.find(et => et.value === selectedValueToDelete)?.label || selectedValueToDelete}"? This action cannot be undone.`
            : 'Are you sure you want to delete this error type? This action cannot be undone.'
        }
        confirmButtonText="Delete"
      />
    </>
  );
};

export default ErrorTypesSection;
