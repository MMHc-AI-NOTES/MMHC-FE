import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ISSUE_RELATED_TO_OPTIONS } from '@/constants/common';
import { IssueRelatedTo, saveIssueRelatedTo } from '@/types/smeConfig';
import { showToast } from '@/lib/toast';
import IssueRelatedToDialog from './IssueRelatedToDialog';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
// import { createSMEIssueRelatedTo, updateSMEIssueRelatedTo, deleteSMEIssueRelatedTo } from '../settingsApiCalls';

interface IssueRelatedToSectionProps {
  issueRelatedTo: IssueRelatedTo[];
  onUpdate: (issueRelatedTo: IssueRelatedTo[]) => void;
}

const IssueRelatedToSection: React.FC<IssueRelatedToSectionProps> = ({ issueRelatedTo, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingIssue, setEditingIssue] = useState<IssueRelatedTo | null>(null);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingIssue(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (issue: IssueRelatedTo) => {
    setEditingIssue(issue);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: IssueRelatedTo) => {
    // Check if id already exists (for new items)
    if (!editingIssue && issueRelatedTo.some(ir => ir.id === formData.id)) {
      showToast.error('Issue related to with this ID already exists');
      return;
    }

    try {
      // TODO: Uncomment when APIs are ready
      // let updated: IssueRelatedTo[];
      // if (editingIssue) {
      //   const result = await updateSMEIssueRelatedTo(editingIssue.id, formData);
      //   if (!result) return;
      //   updated = issueRelatedTo.map(ir => (ir.id === editingIssue.id ? result : ir));
      // } else {
      //   const result = await createSMEIssueRelatedTo(formData);
      //   if (!result) return;
      //   updated = [...issueRelatedTo, result];
      // }
      // onUpdate(updated);

      // Using localStorage for now
      let updated: IssueRelatedTo[];
      if (editingIssue) {
        updated = issueRelatedTo.map(ir => (ir.id === editingIssue.id ? formData : ir));
      } else {
        updated = [...issueRelatedTo, formData];
      }
      saveIssueRelatedTo(updated);
      onUpdate(updated);
      setIsDialogOpen(false);
      setEditingIssue(null);
      showToast.success(editingIssue ? 'Issue related to updated successfully' : 'Issue related to added successfully');
    } catch (error) {
      console.error('Error saving issue related to:', error);
      showToast.error('Failed to save issue related to');
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedIdToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedIdToDelete) return;

    setIsDeleting(true);
    try {
      // TODO: Uncomment when APIs are ready
      // const success = await deleteSMEIssueRelatedTo(selectedIdToDelete);
      // if (!success) {
      //   setIsDeleting(false);
      //   return;
      // }
      // onUpdate(issueRelatedTo.filter(ir => ir.id !== selectedIdToDelete));

      // Using localStorage for now
      const updated = issueRelatedTo.filter(ir => ir.id !== selectedIdToDelete);
      saveIssueRelatedTo(updated);
      onUpdate(updated);
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedIdToDelete(null);
      showToast.success('Issue related to deleted successfully');
    } catch (error) {
      console.error('Error deleting issue related to:', error);
      showToast.error('Failed to delete issue related to');
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
          <div className="space-y-4">
            <Card className="mx-4 gap-4 px-4 text-sm text-gray-600">
              <p className="font-semibold">Default Options:</p>
              <div className="space-y-1">
                {ISSUE_RELATED_TO_OPTIONS.map(option => (
                  <div key={option.id} className="text-xs">
                    <span className="font-medium">{option.id}:</span> {option.name}
                  </div>
                ))}
              </div>
            </Card>
            {issueRelatedTo.length > 0 && (
              <div>
                <p className="mb-2 px-4 text-sm font-semibold">Custom Options:</p>
                <div className="border-y">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {issueRelatedTo.map(issue => (
                          <TableRow key={issue.id}>
                            <TableCell>{issue.id}</TableCell>
                            <TableCell>{issue.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(issue)} className="h-8 w-8 p-0">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(issue.id)}
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
            {issueRelatedTo.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">No custom issues related to added yet.</p>
            )}
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
            ? `Are you sure you want to delete "${issueRelatedTo.find(ir => ir.id === selectedIdToDelete)?.name || selectedIdToDelete}"? This action cannot be undone.`
            : 'Are you sure you want to delete this issue related to option? This action cannot be undone.'
        }
        confirmButtonText="Delete"
      />
    </>
  );
};

export default IssueRelatedToSection;
