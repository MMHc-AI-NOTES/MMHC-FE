import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ErrorType } from '@/store/slices/smeConfigSlice';
import { useAppSelector } from '@/store/store';
import { useDispatch } from 'react-redux';
import { addErrorType, updateErrorType, deleteErrorType } from '@/store/slices/smeConfigSlice';
import { createErrorType, updateErrorType as updateErrorTypeAPI, deleteErrorType as deleteErrorTypeAPI } from '../settingsApiCalls';
import ErrorTypeDialog from './ErrorTypeDialog';
import ConfirmationDialog from '@/shared/ConfirmationDialog';

const ErrorTypesSection: React.FC = () => {
  const dispatch = useDispatch();
  const errorTypes = useAppSelector(state => state.smeConfig.errorTypes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingErrorType, setEditingErrorType] = useState<ErrorType | null>(null);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<number | null>(null);

  const handleAdd = () => {
    setEditingErrorType(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (errorType: ErrorType) => {
    setEditingErrorType(errorType);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: { name: string; display_name: string; points: number }) => {
    try {
      if (editingErrorType && editingErrorType.id) {
        const result = await updateErrorTypeAPI(editingErrorType.id, formData);
        if (!result) return;
        dispatch(updateErrorType(result));
      } else {
        const result = await createErrorType(formData);
        if (!result) return;
        dispatch(addErrorType(result));
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving error type:', error);
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
      const success = await deleteErrorTypeAPI(selectedIdToDelete);
      if (!success) {
        setIsDeleting(false);
        return;
      }
      dispatch(deleteErrorType(selectedIdToDelete));
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedIdToDelete(null);
    } catch (error) {
      console.error('Error deleting error type:', error);
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
          <div className="border-y">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead className="w-[15%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground h-24 text-center">
                        No data
                      </TableCell>
                    </TableRow>
                  ) : (
                    errorTypes.map(errorType => (
                      <TableRow key={errorType.id}>
                        <TableCell>{errorType.name}</TableCell>
                        <TableCell>{errorType.displayName}</TableCell>
                        <TableCell>{errorType.points < 0 ? errorType.points : -errorType.points}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(errorType)} className="h-8 w-8 p-0">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => errorType.id && handleDeleteClick(errorType.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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
            setSelectedIdToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Error Type"
        description={
          selectedIdToDelete
            ? `Are you sure you want to delete the error type "${errorTypes.find(et => et.id === selectedIdToDelete)?.displayName || selectedIdToDelete}"? This action cannot be undone.`
            : 'Are you sure you want to delete this error type? This action cannot be undone.'
        }
        confirmButtonText="Delete"
      />
    </>
  );
};

export default ErrorTypesSection;
