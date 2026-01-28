import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { IssueRelatedTo } from '@/store/slices/smeConfigSlice';
import { useAppSelector } from '@/store/store';
import { useDispatch } from 'react-redux';
import { addIssueRelatedTo, updateIssueRelatedTo, deleteIssueRelatedTo } from '@/store/slices/smeConfigSlice';
import {
  createIssueRelatedTo,
  updateIssueRelatedTo as updateIssueRelatedToAPI,
  deleteIssueRelatedTo as deleteIssueRelatedToAPI,
} from '../settingsApiCalls';
import IssueRelatedToDialog from './IssueRelatedToDialog';
import ConfirmationDialog from '@/shared/ConfirmationDialog';

const IssueRelatedToSection: React.FC = () => {
  const dispatch = useDispatch();
  const issueRelatedTo = useAppSelector(state => state.smeConfig.issueRelatedTo);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingIssue, setEditingIssue] = useState<IssueRelatedTo | null>(null);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<number | null>(null);

  const handleAdd = () => {
    setEditingIssue(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (issue: IssueRelatedTo) => {
    setEditingIssue(issue);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: { field_id: string; display_name: string }) => {
    try {
      if (editingIssue && editingIssue.id) {
        const result = await updateIssueRelatedToAPI(editingIssue.id, formData);
        if (!result) return;
        dispatch(updateIssueRelatedTo(result));
      } else {
        const result = await createIssueRelatedTo(formData);
        if (!result) return;
        dispatch(addIssueRelatedTo(result));
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving issue related to:', error);
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
      const success = await deleteIssueRelatedToAPI(selectedIdToDelete);
      if (!success) {
        setIsDeleting(false);
        return;
      }
      dispatch(deleteIssueRelatedTo(selectedIdToDelete));
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedIdToDelete(null);
    } catch (error) {
      console.error('Error deleting issue related to:', error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <CardTitle className="text-primary text-lg font-semibold">Issues Related To</CardTitle>
            <Button onClick={handleAdd} className="bg-gradient-light text-primary border-0 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Issue Related To
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-y">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-3 text-left">Field ID</TableHead>
                    <TableHead className="pl-3 text-left">Display Name</TableHead>
                    <TableHead className="w-[15%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issueRelatedTo.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground h-24 text-center">
                        No data
                      </TableCell>
                    </TableRow>
                  ) : (
                    issueRelatedTo.map(issue => (
                      <TableRow key={issue.id}>
                        <TableCell className="text-left">{issue.fieldId}</TableCell>
                        <TableCell className="text-left">{issue.displayName}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(issue)} className="h-8 w-8 p-0">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => issue.id && handleDeleteClick(issue.id)}
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

      <IssueRelatedToDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSave={handleSave} editingIssue={editingIssue} />

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
        title="Delete Issue Related To"
        description={
          selectedIdToDelete
            ? `Are you sure you want to delete "${issueRelatedTo.find(ir => ir.id === selectedIdToDelete)?.displayName || selectedIdToDelete}"? This action cannot be undone.`
            : 'Are you sure you want to delete this issue related to option? This action cannot be undone.'
        }
        confirmButtonText="Delete"
      />
    </>
  );
};

export default IssueRelatedToSection;
