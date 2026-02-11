import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { IssueDescription } from '@/store/slices/smeConfigSlice';
import { useAppSelector } from '@/store/store';
import { useDispatch } from 'react-redux';
import { addIssueDescription, updateIssueDescription, deleteIssueDescription } from '@/store/slices/smeConfigSlice';
import {
  createIssueDescription,
  updateIssueDescription as updateIssueDescriptionAPI,
  deleteIssueDescription as deleteIssueDescriptionAPI,
} from '../settingsApiCalls';
import IssueDescriptionDialog from './IssueDescriptionDialog';
import ConfirmationDialog from '@/shared/ConfirmationDialog';

const IssueDescriptionsSection: React.FC = () => {
  const dispatch = useDispatch();
  const issueDescriptions = useAppSelector(state => state.smeConfig.issueDescriptions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingDescription, setEditingDescription] = useState<{ key: string; description: string } | null>(null);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<number | null>(null);

  const handleAdd = () => {
    setEditingDescription(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (description: IssueDescription) => {
    setEditingDescription({ key: description.key, description: description.description });
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: { key: string; description: string }) => {
    try {
      if (editingDescription) {
        const editingDesc = issueDescriptions.find(id => id.key === editingDescription.key);
        if (editingDesc && editingDesc.id) {
          const result = await updateIssueDescriptionAPI(editingDesc.id, formData);
          if (!result) return;
          dispatch(updateIssueDescription(result));
        }
      } else {
        const result = await createIssueDescription(formData);
        if (!result) return;
        dispatch(addIssueDescription(result));
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving issue description:', error);
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
      const success = await deleteIssueDescriptionAPI(selectedIdToDelete);
      if (!success) {
        setIsDeleting(false);
        return;
      }
      dispatch(deleteIssueDescription(selectedIdToDelete));
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedIdToDelete(null);
    } catch (error) {
      console.error('Error deleting issue description:', error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <CardTitle className="text-primary text-lg font-semibold">Issue Descriptions</CardTitle>
            <Button onClick={handleAdd} className="bg-gradient-light text-primary border-0 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Issue Description
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-y">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-3 text-left">Key</TableHead>
                    <TableHead className="pl-3 text-left">Description</TableHead>
                    <TableHead className="w-[15%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issueDescriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground h-24 text-center">
                        No data
                      </TableCell>
                    </TableRow>
                  ) : (
                    issueDescriptions.map(desc => (
                      <TableRow key={desc.id}>
                        <TableCell className="max-w-[200px] text-left break-words whitespace-normal">{desc.key}</TableCell>
                        <TableCell className="max-w-[400px] text-left break-words whitespace-normal">{desc.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(desc)} className="h-8 w-8 p-0">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => desc.id && handleDeleteClick(desc.id)}
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

      <IssueDescriptionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        editingDescription={editingDescription}
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
        title="Delete Issue Description"
        description={
          selectedIdToDelete
            ? `Are you sure you want to delete this issue description? This action cannot be undone.\n\n"${issueDescriptions.find(id => id.id === selectedIdToDelete)?.description.substring(0, 100) || ''}${issueDescriptions.find(id => id.id === selectedIdToDelete)?.description.length && issueDescriptions.find(id => id.id === selectedIdToDelete)!.description.length > 100 ? '...' : ''}"`
            : 'Are you sure you want to delete this issue description? This action cannot be undone.'
        }
        confirmButtonText="Delete"
      />
    </>
  );
};

export default IssueDescriptionsSection;
